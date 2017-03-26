---
title: Continuous integration with Drone
slug: continuous-integration-with-drone
summary: |
  A step-by-step guide to setting up a Hugo static site for automated
  deployment using Drone CI.
date: 2016-02-17 15:36:50
tags:
  - drone
  - deployment
  - continuous integration
  - docker
  - rancher
---

Recently I've had the pleasure of working with
[Drone](http://readme.drone.io/usage/overview/) to experiment with a new
continuous integration process for some of the services we're building.
There are, of course, many CI applications out there, but I like the
simplicity of Drone and its tight integration with
[Docker](https://www.docker.com/).

### Automated deployment for the DStvDM Tech Blog
The aim of the exercise here was to allow for automated deployment of
[this](https://tech.dstv.com)
blog, so that a push to the `master` branch of the private repository
holding the blog content results in build and deployment of the
freshly built blog to our staging environment. This process can, of course,
be generalised to construct builds for pretty much any type of application.
(In a planned future post, I aim to talk about CI with Drone for some
Spring Boot-based applications we've built).

#### Step 1: Establish your CI process
You'll first need to think about how you're going to go about what your strategy
looks like to automatically build and deploy your system. For the blog, it was
relatively straightforward. The sequence of events should be as follows:

1. Kick off the process when someone commits to the repo's `master` branch.
2. Build the repo using [Hugo](http://gohugo.io). This just builds the site
   from templates into a simple static web site, easily served by any
   generic web server.
3. Generate a self-contained Docker container that will serve the statically
   generated content through `nginx`.
4. Automatically deploy the newly built container to the staging environment.
   We use [Rancher](http://rancher.com/) in some of the experimental
   environments at the moment, so we needed to integrate here with the
   Rancher API.

The next few steps will show you how we actually accomplished this.

#### Step 2: Webhooks integration
Set up your [remote drivers](http://readme.drone.io/setup/remotes/) for
Drone, based on whichever version control system you're using. Usually your
VCS will require the creation of some kind of API key that will allow Drone
to create the relevant webhooks for your repository/repositories. This,
as per the Drone docs, needs to be configured in your environment variables:

```
REMOTE_DRIVER=<driver_name>
REMOTE_CONFIG=<driver_url>
```

#### Step 3: Custom plugin configuration
I didn't really like how limiting the
[Rancher API](http://readme.drone.io/plugins/rancher/) plugin was, as it only
allows for a very limited subset of the Rancher API functionality, so I wrote
a [custom Rancher Compose plugin](https://github.com/thanethomson/drone-rancher-compose)
for just this purpose. As per the [Drone docs](http://readme.drone.io/devs/plugins/#custom-plugins:dce8ed91d073f65a191aa58c2338afcb),
to use this plugin you need to set up the container environment variable
to allow your Drone instance to use the plugin.

```
PLUGIN_FILTER=plugins/* registry:5001/labs/*
```

#### Step 4: Database container configuration
Drone links to a database backend to keep track of various kinds of information,
so we fired up a PostgreSQL container (we tried SQLite, but it tended to
give issues).

```bash
sudo docker pull postgres:9.4
```

> **Note**: We fire up containers through Rancher's web-based GUI.

Then set up the relevant environment variable for Drone to connect to the
database (assuming you've called your running PostgreSQL container
`postgres`):

```
DATABASE_DRIVER=postgres
DATABASE_CONFIG=postgres://postgres:<postgres_password>@postgres:5432/postgres?sslmode=disable
```

#### Step 5: Launch your Drone instance
Make sure you have a publicly accessible host/server from which you'd like to
serve your Drone instance. It needs to be publicly accessible if you're using
GitHub or BitBucket to store the code for your application (so that your VCS
can reach your Drone instance for web hooks). Also, make sure
you're running Docker on your server (your Drone container will mount the
Docker socket from the host machine to be able to spawn containers for your
builds).

> **Note**: Beware the version differences between different Docker versions.
> We did encounter some issues when the host Docker version didn't match the
> version of Docker used within the Drone container.

As per the
[Drone Setup instructions](http://readme.drone.io/setup/overview/), grab hold
of the latest version of Drone (from wherever you're going to be running
your Drone container):

```bash
sudo docker pull drone/drone:0.4
```

> **Note**: We fire up containers through Rancher's web-based GUI.

#### Step 6: Activate your repository
Navigate your web browser to your fresh new Drone instance's login page, and
log in and authorise your Drone instance to use your relevant version control
system. After this you should see a listing of all of the repos to which you
have access in your VCS.

Select the repo for which you want to enable CI and click on the
"Activate" button for it. This should automatically create the relevant web
hooks with your VCS.

#### Step 7: Dockerise your application
For our blog, it was a simple exercise to set up a `Dockerfile` in the
root of our repository:

```
FROM        alpine:3.3
MAINTAINER  Thane Thomson <thane.thomson@dstvdm.com>

# Install nginx
RUN         apk add --update nginx && rm -rf /var/cache/apk/*

# Copy the configuration files
COPY        deployment/config/nginx.conf   /etc/nginx/nginx.conf
COPY        deployment/config/blog.conf /etc/nginx/conf.d/blog.conf
# Copy our Hugo-built static content
COPY        public/ /usr/share/nginx/html

# Persist nginx logs
VOLUME      /var/log/nginx

# Expose our HTTP port
EXPOSE      80

# Run nginx in the foreground
CMD         ["nginx", "-g", "daemon off;"]
```

> **Note**: We use a private Docker registry within the organisation for all
> of our containers. When we refer to `registry:5001`, we are referring to that
> private registry.

#### Step 8: Create your Docker Compose file for your repo
In the root folder of your repository, create your Docker Compose file
(called `docker-compose.yml`):

```yaml
TechBlogQA:
  image: registry:5001/dstvdm/techblog:latest
  labels:
    io.rancher.scheduler.affinity:host_label: cat=apps
    io.rancher.scheduler.affinity:host_label_ne: sys=lb
```

As you can see, we've got some labels for the QA site that tell Rancher to
schedule the execution of the Docker container on hosts with the label
`cat` = `apps` (our application servers), and without the label `sys` = `lb`
(our load balancers).

#### Step 9: Set up your Drone configuration file for your repo
Also in the root folder of your repository, create your Drone configuration
file (called `.drone.yml`):

```yaml
# This builds our site with the default parameters in the public/ folder
# of where the repo's been checked out.
build:
  image: registry:5001/labs/hugo-build:0.15
  commands:
    - hugo

# Build a docker image for the blog and tag it with "latest" and the
# build number (generated by Drone).
publish:
  docker:
    registry: registry:5001
    insecure: true
    repo:     dstvdm/techblog
    tag:      latest
    file:     Dockerfile

# Deploy the fresh new image to our Rancher environment for QA.
# This creates the containers in the "TechBlog" stack in our environment.
deploy:
  rancher-compose:
    image: registry:5001/labs/drone-rancher-compose:0.1.0-alpha.9
    commands:
      - "--url <RANCHER_URL> --access-key <RANCHER_ACCESS_KEY> --secret-key <RANCHER_SECRET_KEY> -p TechBlog create"
      - "--url <RANCHER_URL> --access-key <RANCHER_ACCESS_KEY> --secret-key <RANCHER_SECRET_KEY> -p TechBlog up --upgrade -d"
```

<br />

#### Step 10: Commit to `master` and test!
Now, for the moment of truth: commit and push all of your new configuration
files to your repository to your `master` branch. If everything's working
well, the following should happen in the background:

1. Drone should be notified by your VCS of the new commit and should
   automatically kick off a process to handle the event.
2. Drone will check out your repository and look for the `.drone.yml` file,
   from which it will take its configuration for the build.
3. It will then kick off the various phases of the automatic deployment for
   your application. You should be able to monitor this process through the
   Drone web interface.

Once it's done, you should see something similar to the following image.

![Drone build history](/assets/blog/images/posts/drone-status-history-ui.png)

And that's it!
