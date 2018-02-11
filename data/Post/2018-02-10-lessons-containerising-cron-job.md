---
title: Lessons in Containerising a Cron Job
slug: lessons-containerising-cron-job
summary: >
  It's a really bad idea in general, and there are much better ways of
  Dockerising an application that needs to run at regular intervals, but there's
  something to be said for dirty hacks that buy you some time to do things better.
  Especially so when there's uncertainty around what you're building. Rapid prototyping,
  in such instances, followed by one or more iterations of productionising effort,
  can yield great results.
date: "2018-02-10 15:30"
tags:
  - software
  - docker
  - containers
  - dirtyhacks
---

Recently I've been experimenting with a rapid prototyping approach to system construction,
where one starts off with a really hacky, messy,
[high-WTF-per-minute](https://blog.codinghorror.com/whos-your-coding-buddy/) prototype,
and progressively productionise it over time. The focus here is getting as much business
value as possible within the first week or two, followed by significant time and effort to
iteratively [clean](http://a.co/cwCLJ5U) it up. Each iteration seems to provide more
business value to the solution, albeit with diminishing returns over time.

Practically, I applied this to a recent data ingest project I was working on, and it had
some pretty good results. In this post, I'll talk a little about the project, the cron jobs
and how I containerised them, as well as learnings I took from this process.

_**TL;DR:** See the [Dockerfile](#the-dockerfile) and [the scripts](#the-scripts)._

## Background
I recently built a prototype for a data ingest project that was made up
of Python 3 and BASH scripts that were executed once a day.
I slapped these scripts together in under 2 weeks, got them up and running on my laptop in my
office (running Ubuntu) and ran the BASH scripts as cron jobs. The BASH scripts did a variety
of things, including activating Python virtual environments, configuring some environment
variables for the Python scripts, running those Python scripts, moving files around, and
running commands like `sftp`. The Python scripts write their results to a PostgreSQL database
running in our container environment.

The prototype came together really well - too well, in fact. People started incorporating the
data from our PostgreSQL database into production applications before we could finish
the next iteration of the system (largely due to staff churn and reshuffling in the company).
This meant that we were forced to get the cron jobs on my laptop into a more reliable
running environment (i.e. our orchestrated container environment) while we continued to
work on the next iteration of the system.

## Disclaimer: This is a Bad Idea
Before I show you how I did it, I have to give the disclaimer that I would definitely
**not** recommend using this approach for a production system. I'll talk about better
approaches later on in the post, and why I'd consider them to be better (in the sense that
the other approaches will save you a variety of headaches later on in the project's
lifetime, especially when it comes to monitoring).

## The Dockerfile
Since I'm not really allowed to share the actual code I used, I'll share something similar
that illustrates the mechanics. We'll start with the `Dockerfile` for the project:

```dockerfile
FROM python:3.6-slim-stretch

# We need cron, sshpass (to specify SSH passwords from files) and sftp
RUN apt-get update && \
    apt-get -y install cron sshpass openssh-client

# Base directory into which to put our scripts
ENV SCRIPT_DIR="/opt/ingest"
# By default, the ingest's cron job will run at 8am every day (server time)
ENV CRON_INGEST_SPEC="0 8 * * *"
# Send out a mail at 08h30 (server time) with the last few hundred lines of
# the ingest log. We played around with this number a bit, because this e-mail
# job needs to run once the ingest is complete. Generally our ingest wouldn't
# take more than about 4 or 5 minutes, so we gave it 30 minutes to be on the
# safe side.
ENV CRON_EMAIL_SPEC="30 8 * * *"
# Which folder to use to save the logs
ENV LOG_DIR="/var/log/ingest"
# The ingest's log file
ENV LOG_FILE="${LOG_DIR}/ingest.log"

WORKDIR ${SCRIPT_DIR}
# Copy all of our scripts into the container to /opt/ingest
COPY src/* ./

# Configure SSH access for SFTP (so it doesn't ask to manually authorise
# the host when connecting for the first time)
RUN mkdir -p /root/.ssh
COPY known_hosts /root/.ssh/known_hosts

# Install Python dependencies and make log directory/file available
RUN pip install -r requirements.txt && \
    mkdir -p ${LOG_DIR} && \
    touch ${LOG_FILE}

# We'll be storing data in /opt/ingest/data, and we want the logs to be saved
# across container restarts/recreation
VOLUME [ "${SCRIPT_DIR}/data", "${LOG_DIR}" ]

# We need to inject environment variables, since the cron job seems to ignore
# any environment variables that are set by Docker
ENTRYPOINT [ "/opt/ingest/entrypoint.sh" ]

# Fires up cron as a background process, and makes the tail process the one
# that keeps the container alive
CMD cron && tail -f ${LOG_FILE}
```

The final `CMD` configuration comes from
[this StackOverflow answer](https://stackoverflow.com/a/37458519/1156132). I personally couldn't
get [this one](https://stackoverflow.com/a/46220104/1156132) to work. As per that StackOverflow
thread, the `tail -f` command isn't a great idea because it gives absolutely no indication as
to whether or not something's gone wrong in your cron jobs. It does, however, do the job
for a quick 'n dirty hack.

Building the image is pretty straightforward, as per most Docker images:

```shell
$ docker build -t ingest:0.1.0 .
```

## The Scripts
A variety of scripts were used to achieve our desired outcome. This is because of having some
trouble getting our cron jobs to pick up our desired environment variables (one of the
"best practices" for configuring Docker containers).

### Directory Structure
We had the following file/directory structure where we kept our `Dockerfile`:

* `Dockerfile`
* `known_hosts` - See
  [this article](https://www.techrepublic.com/article/how-to-easily-add-an-ssh-fingerprint-to-your-knownhosts-file-in-linux/).
  For us, this file contained the SSH fingerprints of the target SFTP server to which we
  had to push some processed data.
* `src/email_file.py` - A custom Python utility to e-mail a file to us.
* `src/email_logs.sh` - The script that is called by a secondary cron job to execute the
  `email_file.py` script with appropriate parameters/environment variables, so we get a
  daily log of how the cron job is faring.
* `src/entrypoint.sh` - The Docker entry point. See
  [this StackOverflow post](https://stackoverflow.com/questions/21553353/what-is-the-difference-between-cmd-and-entrypoint-in-a-dockerfile).
  We used this to take our Docker container environment variables and inject them into the
  system in such a way that the cron job could easily access them.
* `src/ingest.sh` - The BASH script that would be run by our primary cron job.
* `src/ingest.py` - The data ingest script.
* `src/requirements.txt` - A list of the Python libraries on which our Python scripts depends.

### `entrypoint.sh`
I'll start with the `entrypoint.sh` script, as it provides a useful glimpse into how we
inject our environment variables into the cron jobs. This script basically gets executed
once as the container starts up, and it, in turn, executes our `CMD` commands.

```bash
#!/bin/bash
set -e
# Where to put the file that contains our environment variables
ENV_SCRIPT="${SCRIPT_DIR}/env-vars"

# Write out our SFTP password to a file
echo "${SFTP_PASSWORD}" > ".sftp-password"

# Write our environment variables script - the ${VARNAME:-defaultvalue} allows
# us to configure a default value for an environment variable if it was not
# injected into the container.
# NB: It's NEVER a good idea to commit passwords to your VCS. Don't store any
#     sensitive passwords in here. Rather configure them as environment
#     variables for such prototypes (and then later look into software like
#     Hashicorp's Vault as an alternative to this approach).
echo "DB_HOST=${DB_HOST:-postgres}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-somedbname}
DB_USER=${DB_USER:-somedbuser}
DB_PASSWORD=${DB_PASSWORD:-somedbpassword}
SFTP_HOST=${SFTP_HOST:-sftp.somehost.com}
SFTP_USER=${SFTP_USER:-sftpuser}
SFTP_PORT=${SFTP_PORT:-2222}
SFTP_PASSWORD_FILE=${SFTP_PASSWORD_FILE:-\".sftp-password\"}
EMAIL_RECIPIENTS=${EMAIL_RECIPIENTS:-\"sucker4@monitoring.com\"}
EMAIL_SUBJECT=${EMAIL_SUBJECT:-\"Daily Ingest Log\"}
EMAIL_LINES=${EMAIL_LINES:-300}
LOG_FILE=${LOG_FILE:-\"/var/log/ingest/ingest.log\"}
" > ${ENV_SCRIPT}

# Activate the environment variables (just for printing, basically)
source ${ENV_SCRIPT}

# If we need to add another known host to the /etc/.ssh/known_hosts file
if [ -n "${KNOWN_HOST}"]; then
    echo "${KNOWN_HOST}" >> /root/.ssh/known_hosts
fi

# Write out our crontab to a file
echo "
${CRON_INGEST_SPEC} SCRIPT_DIR=${SCRIPT_DIR} ${SCRIPT_DIR}/ingest.sh >> ${LOG_FILE} 2>&1
${CRON_EMAIL_SPEC} SCRIPT_DIR=${SCRIPT_DIR} ${SCRIPT_DIR}/email-logs.sh >> ${LOG_FILE} 2>&1
" > ${SCRIPT_DIR}/crontab
# Install the crontab for root
crontab -u root ${SCRIPT_DIR}/crontab

# For debugging purposes, to make sure the crontab's been set up properly and
# all of our parameters have been configured correctly (NOTE: I haven't echo'd
# out any passwords here, for good reason: we don't know who has access to our
# logs, and our logs are going to be e-mailed around).
echo "Crontab for root:"
crontab -l
echo ""
echo "Parameters:"
echo "  - SFTP target   : sftp://$SFTP_USER@$SFTP_HOST:$SFTP_PORT"
echo "  - Database      : postgres://$DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
echo "  - Email logs to : $EMAIL_RECIPIENTS (last $EMAIL_LINES lines)"
echo ""

# Execute the container's CMD commands
exec "$@"
```

### `ingest.sh`
This script runs our primary ingest script, but first takes in the environment variables
configured by our `entrypoint.sh` file and outputs a bunch of verbose logging to `stdout`
(which, in turn, gets redirected to our log file, as per the cron job configuration).

```bash
#!/bin/bash
set -e
# Set our working directory
cd $SCRIPT_DIR
# Set our environment variables (configured by entrypoint.sh)
source env-vars

# Configure all of our parameters
TODAY=`date +%Y-%m-%d`
DATE_PATH=`date +%Y/%m/%d`
DATA_PATH="data"
PROCESSED_PATH="$DATA_PATH/processed/$DATE_PATH"
FLAGGED_PATH="$DATA_PATH/flagged/$DATE_PATH"
BACKUP_PATH="$DATA_PATH/backup"
PROCESSED_BACKUP_PATH="$BACKUP_PATH/processed/$DATE_PATH"
PROCESSED_BACKUP_BASE_PATH=`dirname $PROCESSED_BACKUP_PATH`

#                       YYYY-mm-dd
echo "-----------------------------"
echo " Daily ingest for $TODAY"
echo "-----------------------------"
echo "Parameters:"
echo "  - SFTP target : sftp://$SFTP_USER@$SFTP_HOST:$SFTP_PORT"
echo "  - Database    : postgres://$DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
echo ""

mkdir -p $PROCESSED_PATH
mkdir -p $FLAGGED_PATH
mkdir -p $BACKUP_PATH
mkdir -p $PROCESSED_BACKUP_BASE_PATH

echo "Fetching data..."
./ingest.py \
    --backup-folder=$BACKUP_PATH \
    --db-host="${DB_HOST}" --db-port=$DB_PORT --db-name="${DB_NAME}" \
    --db-user="${DB_USER}" --db-password="${DB_PASSWORD}" \
    "$PROCESSED_PATH" \
    "$FLAGGED_PATH"
echo ""

echo "Copying data to SFTP server..."
sshpass -f $SFTP_PASSWORD_FILE \
    sftp -P $SFTP_PORT "${SFTP_USER}@${SFTP_HOST}" <<EOF
cd processedfiles
put -r $PROCESSED_PATH/* .
EOF
echo ""

echo "Cleaning up..."
mv $PROCESSED_PATH $PROCESSED_BACKUP_PATH

echo "Done."
```

### `email_logs.sh`
This script just sources our environment variables and then runs the Python script that
e-mails us the last few hundred lines of our log file every day (quick 'n dirty
babysitting-style monitoring):

```bash
#!/bin/bash
set -e
cd $SCRIPT_DIR
source env-vars
./email_file.py \
    --subject "${EMAIL_SUBJECT}" \
    --max-lines ${EMAIL_LINES} \
    "${EMAIL_RECIPIENTS}" \
    ${LOG_FILE}
```

### `email_file.py`
Here's a Python script whose source I can actually share, since it has nothing to do with
the business logic. **Note**: This assumes no authentication against your SMTP server.
To configure authentication, see the
[relevant Python documentation](https://docs.python.org/3.6/library/smtplib.html).

```python
#!/usr/local/bin/python
# -*- coding: utf-8 -*-

import argparse
import smtplib
from email.message import EmailMessage


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "recipients",
        help="Comma-separated list of recipient e-mail addresses"
    )
    parser.add_argument(
        "filename",
        help="The file to attach to the e-mail when sending"
    )
    parser.add_argument(
        "--subject",
        default="Here's a file",
        help="The subject of the e-mail when sending"
    )
    parser.add_argument(
        "--smtp-host",
        default="smtp.mycompany.com",
        help="The SMTP server to use for sending mail"
    )
    parser.add_argument(
        "--max-lines",
        type=int,
        help="The maximum number of lines to include from the end of the file"
    )
    args = parser.parse_args()

    recipients = args.recipients.split(",")
    filename = args.filename
    subject = args.subject
    smtp_host = args.smtp_host
    max_lines = args.max_lines

    # first read the contents of the file
    with open(filename, "rt", encoding="utf-8") as f:
        file_contents = f.read()

    print("Sending e-mail to %s..." % ", ".join(recipients))

    if max_lines:
        lines = [line for line in file_contents.split("\n") if line.strip()]
        if len(lines) > max_lines:
            file_contents = ("Last %d lines of file:\n\n" % max_lines) + \
                "\n".join(lines[-max_lines:])

    msg = EmailMessage()
    msg['Subject'] = subject
    msg['To'] = ', '.join(recipients)
    msg['From'] = 'NoReply <no-reply@mycompany.com>'
    msg.set_content(file_contents)

    with smtplib.SMTP(smtp_host) as s:
        s.send_message(msg)
    
    print("E-mail sent")

    
if __name__ == "__main__":
    main()
```

## A Better Approach to Cron Jobs
As hinted to earlier, I've found that a far better approach to containerising an application
that runs on a regular basis is to build it in such a way that:

1. **Running it involves the execution of a long-running script or application.** No cron
   jobs here: just your application that gets executed and runs forever, or until a severe
   error occurs that kills the program, thus terminating the container and possibly
   informing your container orchestration software to send alerts and restart the application.
2. **Your application provides an API of sorts for monitoring.** This way, your orchestration
   and/or monitoring software can regularly ping your application to see if everything's
   healthy, and send out alerts if not. Also, other applications that depend on your
   application can also ping the health check endpoints to see what's going on.

Our next iteration of our project was built using a variety of components from the
[Spring Framework](https://spring.io/) (such as
[Spring Boot](https://projects.spring.io/spring-boot/),
[Spring Data](https://projects.spring.io/spring-data/),
[Spring Integration](https://projects.spring.io/spring-integration/), and
[Spring Actuator](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#production-ready)).
Spring Integration and Spring Data provided us with the relevant ingest machinery we needed, where
Spring Boot and Spring Actuator provided us with the RESTful API endpoints we needed to
facilitate proper health checks and get insight into what's going on in the container.

If, however, I was to build the next iteration in Python, I would most certainly build it
as a [Flask](http://flask.pocoo.org/) application (to provide the web status API) that
uses something like [schedule](https://schedule.readthedocs.io/en/stable/) to regularly
run specific tasks.

## Learnings
Like anything in life, this quick-'n-dirty-first approach has pros and cons to it.
The pros are clear in terms of their value-add, but if you ignore the cons and don't budget time
for dealing with them systematically, you can really run into some trouble, and you may
even tank your entire project quite spectacularly.

### Pros
1. **People could start getting a qualitative feel for the data itself.** We didn't have much
   sample data to go on in the beginning, so having new data being imported every day really
   helped us think about what we could do with the data.
2. **People could query the data in a variety of ways.** Since it was being imported into
   PostgreSQL, we could pull out meaningful statistics and identify potential problems in the
   data, helping us iron out some of the minimum quality assurances between us and our data
   provider.
3. **It helped us think more clearly about a better architecture for the production system.**
   If I'd just started with the production system from the beginning, I would've probably
   had to go back to the drawing board several times when we discovered what we did from
   points 1 and 2 above.
4. **It saved us longer-term and larger-scale waste by making the system more pliable up-front,
   concentrating the waste in the prototype, which was easier to modify than the final envisaged
   production system would be.** This may seem intuitive, but you'd be surprised
   at how hard it is to get bureaucratic organisations to buy into this approach. This
   is especially hard in organisations that insist on having tomes of architectural documentation,
   as well as a fully planned-out [Gantt chart](https://en.wikipedia.org/wiki/Gantt_chart),
   prior to writing a single line of code.

### Cons
1. **What if something happens to me and someone else has to take over the prototype?**
   If a system has a clearly defined architectural vision, is well-documented and the code
   thus far is clean, it's relatively easy for someone else to take it over. Unfortunately,
   these sorts of hacky prototypes are filled with all sorts of esoteric tricks to get them
   to work. For example, since I know Python quite well, I used many
   [Pythonic](https://stackoverflow.com/questions/25011078/what-does-pythonic-mean) tricks in
   the ingest script,
   where someone who doesn't know Python so well (or at all) would really struggle to understand
   what I was doing. Similarly with the BASH tricks I had to apply to get the various
   technologies to play nicely together in a relatively flexible way. (One way of mitigating
   this is to include links to the various StackOverflow/GitHub discussions on particular
   approaches to solving the problem at key points in your code, so someone reading your
   code doesn't have to reinvent the wheel.)
2. **It ran on my laptop.** This is a troubling one, and somewhat overlaps with the previous
   point. Oftentimes, getting something running in a virtualised environment takes a lot of
   effort. For this particular project, I didn't
   have access to any simple virtual machines where I could get my cron jobs up and running
   (I had a container orchestration environment). Interestingly enough, my Ubuntu-based laptop
   ran the cron jobs successfully every day for 4 months, without ever needing to be restarted.
   It did pose a problem, however, since the next iteration in the productionising effort
   started taking a significant amount of time, and people started depending on the results of
   those scripts running on that laptop.
3. **The prototype often needs to be thrown away in its entirety, and you need to be okay
   with that.** In certain environments (like large corporates), there are constraints when
   building systems. Such constraints include the fact that sustainability of the solution
   is often more important than using cool technology to solve the problem. For example,
   in the environment in which this project was being built, hardly anyone else knows the Python
   programming language, and most people are far more comfortable with Java. This makes a
   Python solution great for getting all the pros in the previous section, but completely
   inappropriate for a long-term solution that others in the organisation might have to
   maintain. Some people rebel against such overtly wasteful approaches, but my argument still
   remains that, had I started with the full-blown Spring/Java solution from the beginning, I
   would have created far more waste and it would've taken far longer to show business value.
4. **Deploying new features into the prototype is a heavily manual process.** This touches
   on point 2 above to a certain degree. Even if I was running the scripts on a VM, what if
   there was data loss somewhere and we had to recreate the VM from scratch? I didn't have
   any automated deployment scripts/pipelines at this point, as there just wasn't time
   during prototyping for this. Worse still, what if *someone else* had to recreate the
   VM on my behalf, not having any clue as to what I did on the original VM?
   Tools like [Ansible](https://www.ansible.com/) are excellent
   for automating deployment to VMs, but it takes additional time and discipline to rather
   make changes to Ansible playbooks as opposed to just SSH'ing into the VM and making the
   changes manually. I find that at this point, there needs to be a decision made on the
   tradeoff between adding new features to, and documenting, the prototype and investing in the
   next iteration of the productionising effort, because at a point, you start getting
   diminishing returns from the addition of features to the quick 'n dirty hack.
5. **Few or no tests at all.** Many people will consider code without tests to be broken.
   To be honest, I did write a few unit tests for the prototype, but nothing to the extent
   that we wrote for the next iteration of the system. What the prototype did show us is
   the many ways in which the system *could* break, which was incredibly useful for informing the
   testing in the next iteration. This, however, requires that one babysit the prototype
   a lot more than one would a production system.
6. **Little to no coherent initial project plan or timelines.** Again, in certain
   environments, like large corporates, they employ project managers whose performance
   (through no fault of their own, usually) is measured by way of
   how well they manage and facilitate the achievement of timelines. In essence, they seem
   to be rewarded for being able to predict the future, and then control the flow of project
   events to conform to their initial predictions. Despite the patent absurdity of this
   approach in the face of uncertainty, many companies still seem to somehow see value in this
   view of the world. This makes it really difficult to convince them to give you space for a few
   weeks to **learn** (which is usually the primary goal of prototyping) so that you can give
   them a better idea as to the effort involved in building the next iteration of the system.

## Conclusion
While containerising a cron job-based prototype is possibly a good iteration towards a better
production system (it's at least better than running the cron jobs on your local machine or
on a VM without configuration management), it's still not a great idea for building a production
system.

At a higher level, however, the approach of **rapid prototyping** in projects with even
a moderate amount of uncertainty can yield really quick results, as long as one budgets for
the additional iteration(s) it will take to produce a production system of reasonable,
sustainable quality.
