---
title: Enterprise Security with Spring and Vault
slug: enterprise-security-spring-vault
summary: >
  Spring Framework is an incredibly powerful framework, and Spring Boot
  lets you get up and running with Spring in next to no time. What
  happens when Spring meets Hashicorp's Vault for enterprise-level
  secrets management?
date: 2017-06-06T13:00:00
tags:
  - software
  - security
  - java
  - spring
  - vault
  - enterprise
show-toc: true
---

[Spring](https://spring.io/) is an incredible enterprise-oriented
Java framework and collection of team- and community-contributed
projects[^1]. From my experience with it over the past 2 years, it's
really outshone any other Java-based frameworks (like the
[Play Framework](https://playframework.com/)), and is probably the
closest framework in terms of functionality to my personal favourite
framework [Django](https://www.djangoproject.com/)[^2].

One of the biggest barriers to entry in getting into Spring is just
getting started - this can be an incredibly daunting process, which
I think is why the [Spring team](https://spring.io/team) came up
with [Spring Boot](http://projects.spring.io/spring-boot/). Spring
Boot allows you to rapidly get your Spring-based project up and running
with a minimum amount of configuration and coding by taking a
*convention-over-configuration* approach. It simultaneously allows you,
if you want, to selectively dive deeply into the vast configurability of
the Spring Framework. I really like this adherence to the age-old
UX philosophy of **make the simple things easy, and the difficult
things possible**.

In this post, I'll take some time to discuss some of the thinking
I've been exposed to recently around enterprise-level information
security, how Hashicorp's Vault fits into that, practically how to
get Vault up and running, and building a simple Spring-based
application to integrate with Vault and a data source to illustrate
some of the power of Vault.

**Note**: This is a *really* long post. I've considered breaking it
up into several different posts, but I think it's just as effective to
have a simple table of contents (see to the right, if you're viewing
this in a desktop browser).

## 1. Holistic Information Security
This post, however, takes Spring Boot one step further in the context
of enterprise information security towards thinking about the holistic
approach to information security. I am by no means an information
security professional, but given my experience in building large-scale
systems over the past while in an enterprise environment, and the need
to protect sensitive information, I definitely see the practical need
for a holistic way of managing secrets. Especially in an environment
where there are many people involved in the daily operation of many
disparate, interconnected systems, and the leakage of certain secrets
could have incredibly damaging effects on many people.[^3]

While encryption is definitely very powerful and [still seems
to work](https://www.usnews.com/news/best-states/washington/articles/2017-03-11/what-the-cia-wikileaks-dump-tells-us-encryption-works),
security professionals often claim that **social engineering** is far
quicker and more effective than other technological means of breaking
into systems, as per the following XKCD comic.

<div class="row">&nbsp;</div>

<div class="row">
  <div class="twelve columns">
    <div class="centered img1">
      <img src="https://imgs.xkcd.com/comics/security.png"
        title="Security (XKCD: https://xkcd.com/538/)" />
    </div>
    <div class="centered img-caption">
      <b>Security</b><br />
      Source: <a href="https://xkcd.com/538/">XKCD</a>
    </div>
  </div>
</div>

Some of the primary security holes of which many developers
in large enterprises, admittedly myself included, are guilty are
as follows.

1. **E-mailing production system credentials around.** We all know how
   easily people's e-mail can be hacked nowadays.
2. **Giving developers access to production databases, secure VPNs and
   root access to servers and never revoking that access**. Depending
   on the workplace culture, people have this tendency to trust each
   other. Technical people especially seem to trust each other, in my
   personal experience, far more than they trust non-technical people
   (largely, I think, because of simply having common interests).
3. **Storing production system credentials in Git repositories**. And
   we all know that, even if you remove those credentials in a future
   commit, *Git never forgets*. This is something that software like
   [BlackBox](https://github.com/StackExchange/blackbox) attempts to
   address, but GPG key management is something that requires a decent
   amount of skill and background knowledge - is there perhaps another
   way entirely to handle this sort of thing?

## 2. Secrets at Scale
So yes, the people aspect of information security is of paramount
importance, but so is the corresponding technology that you use to
enhance your processes towards holistic information security
management. This is far more easily managed when you are a 5-person
startup, but what happens when your IT department comprises hundreds,
or even thousands of people?

Here's a great presentation on this holistic approach:

<div class="row">&nbsp;</div>

<div class="row">
  <div class="twelve columns">
    <div class="centered video-embed">
      <iframe width="560" height="315" src="https://www.youtube.com/embed/9rjDFQ_GLNo" frameborder="0" allowfullscreen></iframe>
    </div>
    <div class="centered img-caption">
      <b>Managing secrets at scale, Alex Schoof, LeaseWeb Tech Summit,
      Berlin 2016</b>
    </div>
  </div>
</div>

## 3. Hashicorp Vault
Enter [Vault](https://www.vaultproject.io/) by Hashicorp. Since I
started playing around with it, I've definitely become quite a fan.
It's probably the most holistic solution to the general enterprise
software development security problem of **how to manage secrets**,
and for me definitely fulfils the criteria outlined by Alex Schoof
in his LeaseWeb Tech Summit talk above. It's also written in
[Go](https://golang.org/) - one of my new favourite lower-level
programming languages, and so is filled with all sorts of Go-y
goodness.[^4]

### 3.1. Where Vault Shines
Some of the primary selling points of Vault include the following.

* **No one person ever has to have access to the master key** to be
  able to access all secrets. Vault encrypts all data with a **master
  key** that is only ever stored in memory. It's also broken up into key
  shards (known as **unseal keys**) using [Shamir's Secret
  Sharing Algorithm](https://en.wikipedia.org/wiki/Shamir's_Secret_Sharing),
  which allows you to hand out different shards to different people in
  the organisation. When Vault needs to be unsealed, multiple people
  are then required to come together in agreement to unseal Vault.
* **Secrets and credentials have a lifetime by default**. This means
  that that production database access you granted to that developer the
  other day doesn't need to manually be cleaned up - their (temporary)
  credentials will automatically be revoked after a configured period
  of time.
* **Vault can create SSH keys, database credentials, and even PKI
  certificates on your behalf**. This means that Vault can manage the
  whole lifecycle, especially the cleanup, of these various secrets
  on your behalf, making your life so much easier.
* **Vault allows you to define your own [access control
  policies](https://www.vaultproject.io/docs/concepts/policies.html)**.
  For an enterprise environment with IT governance constraints, this
  is an absolute must.

### 3.2. Getting Vault Up and Running
Getting started with Vault is really easy. They've got [great
documentation](https://www.vaultproject.io/docs/index.html), and the
[Getting Started](https://www.vaultproject.io/intro/getting-started/install.html)
guide is pretty comprehensive, but I'll document my own process here
for the purposes of illustrating some nuances.

#### 3.2.1. Get PostgreSQL
We will eventually need PostgreSQL for this tutorial.
What I did on my local machine was just grab the Docker container for
PostgreSQL v9.6:

```bash
> docker pull postgres:9.6
> docker run --name postgres-9.6 -p 5432:5432 -e POSTGRES_PASSWORD=postgres -d postgres
```

That'll allow our `postgres` superuser to log in with the simple
username/password combination of `postgres` and `postgres`. **Obviously
not secure for production use!** Make sure you've got the PostgreSQL
client installed on your system and then test out your connection
as follows:

```bash
# Assuming your PostgreSQL Docker container is bound to localhost:5432
> psql -U postgres -W -h localhost
```

#### 3.2.2. Start Vault
I personally just got Vault up and running on my MacBook Pro using
the [Docker container](https://hub.docker.com/_/vault/):

```bash
> docker pull vault
# If you want this to run in the background, replace the "-it" switch
# with "-d" in the last line of the following command
> docker run --cap-add=IPC_LOCK \
    -e 'VAULT_LOCAL_CONFIG={"backend": {"file": {"path": "/vault/file"}}, "default_lease_ttl": "168h", "max_lease_ttl": "720h", "listener": {"tcp": {"address": "0.0.0.0:8200", "tls_disable": 1}}}' \
    --link postgres-9.6:postgres \
    --name vault \
    -p 8200:8200 \
    -it vault server
```

On my MacBook, that last command gets the Vault server up and running
**uninitialised** and **sealed** (we'll get to these concepts shortly),
accessible from `http://localhost:8200`.

As per the [write-up on Docker Hub](https://hub.docker.com/_/vault/),
you'll need to add the `IPC_LOCK`
capability to prevent sensitive values from being swapped to disk.
Of course, I could have gotten Vault up and running in
[Dev Server](https://www.vaultproject.io/docs/concepts/dev-server.html)
mode just to try it out, but I really wanted to play with their
[seal/unseal](https://www.vaultproject.io/docs/concepts/seal.html)
functionality.

#### 3.2.3. Install the Vault Client
I also used [Homebrew](https://brew.sh/) to install Vault on my local
machine to use it in its client mode to talk to the Docker
container-based server:

```bash
> brew install vault
> vault -v
Vault v0.7.2 ('d28dd5a018294562dbc9a18c95554d52b5d12390')
```

Admittedly, you could just do this through the Docker container you
just pulled, but I also wanted to make sure that a different
binary worked with the API.

#### 3.2.4. Initialising the Vault Server
To make life easier while dealing with the command line client, set an
environment variable to tell the client how to access the Vault
API:

```bash
> export VAULT_ADDR=http://localhost:8200
```

Now we need to **initialise** the server. This generates a **master
key** which only ever resides in memory, and this master key is
used to encrypt all of the data that goes into your Vault. You'll
never be shown the master key directly - instead, Vault will give you
several **unseal keys**, where combinations of several of these keys
will allow Vault to regenerate the master key to be able to
decrypt your data.

To initialise a Vault server, once you've configured its address
in your environment variables, simply do the following:

```bash
> vault init
```

#### 3.2.5. Unseal Keys
Running the `vault init` command will immediately spit out your
unseal keys to the command line. I just copied these down into a text
file because I'm playing around with Vault, but in a production
setup you'd probably need to write each of these keys down on a piece of
paper and hand them to the relevant trusted individuals in your
organisation. By default, Vault generates 5 of these **unseal keys**,
as well as a **root API token** which effectively allows "superuser"
access to Vault's API.

```bash
Unseal Key 1: S3y8jna5tNau1XFMFghMGogd1RcLt8bGmzFNrmlNeT8S
Unseal Key 2: 1Jb69ALChUp44U075e7o6sC6i4Qy2vuQOaQRI7DAv5eE
Unseal Key 3: Bf7MuQm9/kxQE3Po0aov7J58/lLQmkrUENGlhINaby97
Unseal Key 4: 0cyo8ew87fd+/GaGZb1oe+lBX0HSpgR4Y6aky/dN+87h
Unseal Key 5: myANdcEthLwFdCkJf9HNmncG3XhXNMEt92/ixZZCrHet
Initial Root Token: 18ba798d-43d3-b666-254f-80f4469cf6f6

Vault initialized with 5 keys and a key threshold of 3. Please
securely distribute the above keys. When the vault is re-sealed,
restarted, or stopped, you must provide at least 3 of these keys
to unseal it again.

Vault does not store the master key. Without at least 3 keys,
your vault will remain permanently sealed.
```

#### 3.2.6. Unsealing Vault
Once initialised, Vault is still in a **sealed** state.
This means that even Vault itself doesn't have access to your
secrets - everything's encrypted. In order to **unseal** Vault,
it needs a certain minimum number of **unseal keys** (known as
the **key threshold**, which is 3 of the 5 unseal keys
generated by Vault with its default configuration).

In the following example, I'll just pick the first 3 unseal keys
to unseal my Vault instance, although you could arbitrarily select any
3 of them.

```bash
# Set the token so Vault can trust our API calls
> export VAULT_TOKEN="18ba798d-43d3-b666-254f-80f4469cf6f6"

# Perform the unseal process
# First key
> vault unseal "S3y8jna5tNau1XFMFghMGogd1RcLt8bGmzFNrmlNeT8S"
Sealed: true
Key Shares: 5
Key Threshold: 3
Unseal Progress: 1
Unseal Nonce: e1e16dfb-3edf-5602-3f75-d4d86204f82e

# Second key
> vault unseal "1Jb69ALChUp44U075e7o6sC6i4Qy2vuQOaQRI7DAv5eE"
Sealed: true
Key Shares: 5
Key Threshold: 3
Unseal Progress: 2
Unseal Nonce: e1e16dfb-3edf-5602-3f75-d4d86204f82e

# Third key
> vault unseal "Bf7MuQm9/kxQE3Po0aov7J58/lLQmkrUENGlhINaby97"
Sealed: false
Key Shares: 5
Key Threshold: 3
Unseal Progress: 0
Unseal Nonce:

# Verify that Vault is unsealed
> vault status
Sealed: false
Key Shares: 5
Key Threshold: 3
Unseal Progress: 0
Unseal Nonce:
Version: 0.7.2
Cluster Name: vault-cluster-ce4965e9
Cluster ID: 54c8f1b2-f379-6ef6-178a-afcf67ce1c87

High-Availability Enabled: false
```

And *voila*! Vault is ready to be used. We'll come back to Vault
a little later. For now, let's think about our application.

## 4. Application Integration Considerations
Before we move on to building a simple Spring Boot-based application
that integrates with Vault, there are several things to keep in
mind when architecting your application and configuring your
environment to be Vault-ready. These apply especially when
thinking about the processes around your application's deployment.

### 4.1. Application Authentication
The trick in having an application talk to Vault is finding a reliable,
secure, relatively easily managed way of indicating to Vault that your
application is who it says it is (because Vault, of
course, can't just trust any old application requesting production
database credentials). There are various different
[authentication backends](https://www.vaultproject.io/docs/auth/index.html)
for Vault. The most interesting and useful ones, from an application
perspective, to me are as follows.

#### 4.1.1. Token-Based Authentication
[Token-based authentication](https://www.vaultproject.io/docs/auth/token.html)
is by far the easiest way to get your application to authenticate
against Vault. As you saw earlier, when Vault starts up it generates a
root authentication token, which is useful for initial Vault setup and
for local testing.

The trouble with token-based authentication is: **where do you store
the token?** Can't put it in the repository in your application
configuration, because that would defeat the whole point of using Vault
in the first place. One might be able to get away with having someone
in DevOps manually generate a token and inject it by way of
environment variables (e.g. when starting your application inside a
Docker container), but that doesn't scale too well - what happens when
you need to fire up 100 instances of your application? Is your poor
DevOps person going to sit and manually start each container with a
separate token? I suppose one could write some scripts to do this for
you, but is there perhaps an easier/better way?

#### 4.1.2. AppRole Authentication
[AppRole authentication](https://www.vaultproject.io/docs/auth/approle.html)
seems conceptually quite similar to token-based authentication to me,
with the exception that, in addition to a *role ID*, you can also
require a *secret ID*, where you have relatively fine-grained control
over the number of times a secret ID can be used, secret ID lifetimes,
policies applied to roles, etc.

I'd still be concerned about where the role ID is stored, as well
as the process of generating a secret ID: it seems as though a
significant amount of manual intervention is required to make use of
this mechanism. This is fine for smaller systems with few running
instances of an application, but I can see that scaling up would
require some fiddling and scripting.

#### 4.1.3. TLS Certificate-Based Authentication
Using [TLS certificates](https://www.vaultproject.io/docs/auth/cert.html)
to authenticate against Vault seems to me to be one of the more
secure methods. This mechanism will, however, by necessity, require
quite a bit more up-front effort than the other methods - like setting
up an internal root certificate authority (CA), and perhaps intermediate
CAs to generate short-lived certificates for each of your application
instances.

[Configuring Spring Vault's SSL client](http://docs.spring.io/spring-vault/docs/1.0.1.RELEASE/reference/html/#vault.client-ssl)
seems pretty straightforward. I can imagine that you would probably
not want to bundle your key store in your Java application if you
have short-lived certificates, because updating the client certificate
would then require rebuilding and redeploying your application (as
opposed to updating the key store and then perhaps just restarting your
application instance).

### 4.2. Vault-Managed Secrets
Once you're authenticated against a Vault instance, there are,
depending on your permissions,
[many different kinds of secrets](https://www.vaultproject.io/docs/secrets/index.html)
that Vault can manage for you. These secrets are handled by way of
mounting and unmounting different **secret backends**. Here's
just a few of the different kinds of secrets Vault can manage for you:

* **Database credentials**, e.g. for Cassandra, MongoDB, MSSQL, MySQL
  and PostgreSQL. Here you supply connection strings to Vault to
  be able to connect to your relevant backend(s), and you also supply
  user creation queries (i.e. raw database queries) to Vault to tell
  Vault how exactly to create a new user when someone requests
  credentials.
* **SSH credentials** for remote server access.
* **PKI certificates**, so Vault itself can issue certificates for
  you.
* **Generic secrets**, where Vault acts as a simple key/value store
  where you want values to be encrypted and only accessible by way
  of Vault's access control mechanisms.

## 5. PostgreSQL and Vault
We obviously can't get a Java application up and running without
our relevant data source. So let's configure PostgreSQL now for use by
Vault, and vice-versa.

### 5.1. Connecting Vault to PostgreSQL
So now, we need to enable PostgreSQL support in Vault. First,
we're going to [mount the Vault database backend](https://www.vaultproject.io/docs/secrets/databases/index.html),
and then connect to PostgreSQL using the
[PostgreSQL database plugin](https://www.vaultproject.io/docs/secrets/databases/postgresql.html):

```bash
> vault mount database

# Tell Vault where our PostgreSQL instance is
> vault write database/config/postgresql \
    plugin_name=postgresql-database-plugin \
    connection_url="postgresql://postgres:postgres@postgres:5432/?sslmode=disable" \
    allowed_roles="todo"
```

I've used the `sslmode=disable` here because I haven't enabled SSL
support in my PostgreSQL instance, but you'd probably want to enable
it in production to ensure all comms between Vault and PostgreSQL
are secure on your local network.

The `allowed_roles="todo"` part will become apparent shortly.

### 5.2. PostgreSQL Database and Permissions
One important thing to remember about Vault is that it effectively
creates **throwaway credentials** - in other words, it will create an
arbitrary username and password for you that will eventually be
deleted, and replaced with another arbitrary username and password,
or renewed (by way of *lease renewal*). Part of the problem with
this is that, if you create the database tables with one
PostgreSQL throwaway user, it won't be possible to access them with
a different throwaway user if/when Vault expires the original user's
credentials.

This makes setting up PostgreSQL database- and table-level permissions
a little tricky, and honestly I haven't yet figured out the best way
of handling this situation. One way that I think could work, perhaps
with a little improvement, is to make use of PostgreSQL
[role membership](https://www.postgresql.org/docs/9.6/static/role-membership.html),
taking into account [this advice](https://dba.stackexchange.com/questions/33943/granting-access-to-all-tables-for-a-user)
in terms of restricting which users can connect to our database.

Effectively, what this means is that we'll need to:

1. Create our database (`todo`).
2. Create a base role with the relevant privileges to write to our
   tables, from which the roles that Vault creates will inherit
   (`todo_app`).
3. Tell Vault how to create throwaway users that inherit permissions
   from our base role.

To accomplish points 1 and 2 above:

```sql
CREATE DATABASE todo;

-- Create our base role from which Vault's created roles will inherit
CREATE ROLE todo_app NOINHERIT;

-- Allow our todo_app role to read from and write to any table in
-- the public schema (quite dangerous if you don't use the next
-- two SQL statements on all of your other databases to explicitly
-- control which roles can connect to which databases)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO todo_app;

-- Make sure that not just anybody can connect to our todo database
REVOKE CONNECT ON DATABASE todo FROM PUBLIC;

-- Make sure anyone inheriting from our todo_app role can connect
GRANT CONNECT ON DATABASE todo TO todo_app;
```

### 5.3. Telling Vault How to Create Roles
Another great thing about Vault is that it doesn't prescribe how
your roles need to be created. Here's how you tell Vault how to
create our app's users:

```bash
> vault write database/roles/todo \
    db_name=postgresql \
    creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; GRANT todo_app TO \"{{name}}\";" \
    default_ttl="1h" \
    max_ttl="24h" \
    revocation_statements="DROP ROLE \"{{name}}\";" \
    renew_statements="ALTER ROLE \"{{name}}\" WITH VALID UNTIL '{{expiration}}';"
```

This statement tells Vault a number of things:

1. Create a Vault database role called `todo`.
2. It must use our configured `postgresql` database.
3. The SQL statements template to execute when it creates a new role.
   You'll see the `{{name}}`, `{{password}}` and `{{expiration}}`
   template variables in the statement that Vault injects at runtime.

Finally, we can now move on to the actual construction of an
application to demonstrate integration with Vault!

## 6. Building our Spring Vault Application
As with most great technologies out there, there's usually a
Spring project specifically dedicated to integrating Spring with that
technology, and Vault is no exception. [Spring Vault](http://projects.spring.io/spring-vault/)
allows you to source your secrets (in the form of
[Spring configuration properties](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-external-config.html))
from a Vault secret store, as opposed to (and in conjunction with)
the traditional `application.properties` or `application.yml` files
in your project's class path.

The full source code for this sample application is available
on [GitHub](https://github.com/thanethomson/spring-vault-todo).

### 6.1. Bootstrap the Project
I personally prefer [Gradle](https://gradle.org/) over
[Maven](https://maven.apache.org/), largely because I think that
XML is really ugly and illegible (the same reason why I prefer
Java-based Spring configuration over XML-based configuration). See
the [example repository](https://github.com/thanethomson/spring-vault-todo)
for my `build.gradle` and `settings.gradle` files. Make sure you
have Gradle installed for your platform.

We'll be making use of the following Spring-related projects to
speed up the construction of our application:

* [Spring Boot](https://projects.spring.io/spring-boot/), which
  forms the base substrate of our project.
* [Spring Data JPA](http://projects.spring.io/spring-data-jpa/) for
  JPA-based database integration.
* [Spring Data REST](http://projects.spring.io/spring-data-rest/) for
  a really easy, powerful way to expose your data via RESTful APIs.
* [Spring Vault](http://projects.spring.io/spring-vault/), of course,
  for integration with Vault.

### 6.2. Spring Configuration
I personally prefer Spring's Java-based configuration over XML
configuration any day. We need to configure several aspects of our
application, each covered in the following sub-sections.

#### 6.2.1. Vault
It all starts with Vault. Technically, we need Vault to be integrated
even before we configure our database, because we'll be loading our
database credentials from Vault. Here I'm following the Spring Vault
documentation on using simple
[token-based authentication](http://docs.spring.io/spring-vault/docs/1.0.1.RELEASE/reference/html/#vault.authentication.token)
with Vault (TLS cert-based authentication is a topic for another blog
post).

```java
package com.thanethomson.demos.todo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.vault.authentication.ClientAuthentication;
import org.springframework.vault.authentication.TokenAuthentication;
import org.springframework.vault.client.VaultEndpoint;
import org.springframework.vault.config.AbstractVaultConfiguration;

import java.net.URI;

@Configuration
public class VaultConfig extends AbstractVaultConfiguration {

    @Value("${vault.uri}")
    URI vaultUri;

    @Value("${vault.token}")
    String vaultToken;

    @Override
    public VaultEndpoint vaultEndpoint() {
        return VaultEndpoint.from(vaultUri);
    }

    @Override
    public ClientAuthentication clientAuthentication() {
        return new TokenAuthentication(vaultToken);
    }

}
```

This allows us to specify two simple configuration parameters, either
in our `application.yml` file or via environment variables, which
Spring will inject into our application at runtime:

* `vault.uri` - The URI for our current Vault instance. In this case,
  I just used `http://localhost:8200`.
* `vault.token` - The API token for our application to use in order
  to authenticate against Vault. For illustration purposes, I simply
  just used the root API token generated earlier during Vault
  initialisation.

#### 6.2.2. PostgreSQL Configuration
Here I'm using [HikariCP](http://brettwooldridge.github.io/HikariCP/)
for managing my PostgreSQL connection pool. By the looks of it, it's
a great production-grade connection pool manager. I also wanted to
be able to tell my app to either use Vault to obtain database
credentials, or to obtain them from Spring configuration (i.e. the
`application.yml` file or environment variables):

```java
package com.thanethomson.demos.todo.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.vault.core.VaultOperations;
import org.springframework.vault.support.VaultResponse;

import javax.sql.DataSource;
import java.util.Map;

/**
 * If Vault support is enabled, this will attempt to obtain credentials from Vault. Otherwise
 * it will attempt to grab credentials from the Spring environment configuration.
 */
@Configuration
public class DatabaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${vault.enabled}")
    Boolean vaultEnabled;

    @Bean(name = "hikariDataSource", destroyMethod = "close")
    public DataSource dataSource(Environment env, VaultOperations vault) {
        String username, password;

        if (vaultEnabled) {
            VaultResponse vaultResponse = vault.read("database/creds/todo");
            Map<String, Object> creds = vaultResponse.getData();
            username = (String)creds.get("username");
            password = (String)creds.get("password");
            logger.info("Obtained database credentials from Vault");
        } else {
            username = env.getProperty("spring.datasource.username");
            password = env.getProperty("spring.datasource.password");
            logger.info("Obtained database credentials from Spring configuration");
        }

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(env.getProperty("spring.datasource.url"));
        config.setUsername(username);
        config.setPassword(password);

        return new HikariDataSource(config);
    }

}
```

There are also a couple of important configuration parameters here
that we can specify to control how we connect to our database:

* `vault.enabled` - A boolean value to indicate whether or not to
  actually use Vault to obtain credentials. If `false`, the assumption
  is that we'll be able to get the credentials from some of the
  following properties.
* `spring.datasource.url` - In my case, I used the address of my
  local PostgreSQL container: `jdbc:postgresql://localhost:5432/todo`
  (it needs to be a JDBC connection string). For integration testing,
  I used a different database:
  `jdbc:postgresql://localhost:5432/todo_test`.
* `spring.datasource.username` - If Vault is not used, this must contain
  the username to access our PostgreSQL database.
* `spring.datasource.password` - Also, if Vault is not used, this must
  contain our database's password.

#### 6.2.3. Other Configuration
There are other configuration classes I had to create to get the
API to work as I wanted it to, but those are topics for other posts.

## 7. Integration Testing
If you clone the [repository](https://github.com/thanethomson/spring-vault-todo),
and you've set up your Vault and PostgreSQL instances as per the
earlier instructions, you should be able to get the integration tests
to run relatively quickly.

```bash
# From your repo's directory, if you want to use all of the values
# in the application.yml (and overrides from application-test.yml)
# configuration file(s):
> ./gradlew clean test -Dspring.profiles.active=test
```

Be sure to set up your own configuration values in the
`src/main/resources/application-test.yml` configuration file.

At the time of this writing, there was just one integration test,
which tested the API by:

1. Creating a sample user.
2. Attempting to authenticate against the API using the created
   sample user's credentials.
3. Updating the sample user's password.
4. Authenticating against the API again using the new password.

## 8. Production Considerations
In future blog posts, I hope to take this application towards a
somewhat production-ready application. In order to do so, you would
need to think about the following things.

### 8.1. Database Migrations
I've already integrated [Flyway](https://flywaydb.org/) to handle
database migrations. My thinking is:

1. Bootstrap the database using Hibernate just once.
2. Dump the database/table creation scripts into the
   `src/main/resources/db/migrations` folder (with a little manual
   tweaking, most likely).
3. Drop the original Hibernate-created database.
4. Use Flyway to recreate the initial database (version 1).
5. Profit.

The process here is, in my opinion, much more cumbersome than Django's
[migrations](https://docs.djangoproject.com/en/1.11/topics/migrations/)
framework. Django still provides a lot of the flexibility and
ability to customise your migrations, while speeding up more trivial
migrations (like the simple addition or removal of a field). Using
Flyway means that you have to manually write these migrations in
SQL code, always.

### 8.2. TLS Certificate Management
In order to make use of Vault's
[TLS certificate-based authentication](http://docs.spring.io/spring-vault/docs/1.0.1.RELEASE/reference/html/#vault.authentication.clientcert),
you will need some really good processes to manage these certificates.
If you're in an enterprise/corporate environment, you will probably need
to have at least one dedicated person just to manage this process,
depending on the scale of your infrastructure.

### 8.3. Vault High Availability
One of the things I didn't cover at all in this post is Vault's
[High Availability](https://www.vaultproject.io/docs/concepts/ha.html)
(HA) mode. This is an absolute must if many services in your
infrastructure rely on Vault to operate, because Vault then becomes
a glaringly obvious **single point of failure**.

By using Vault's HA mode, you help minimise the risk associated with
Vault failure. Of course, this isn't enough on its own. You will need
the appropriate monitoring systems, processes and people in place in
order to make sure it's always up.

### 8.4. Lease Renewal for Secrets
Vault also provides for renewal of secrets' leases. To be honest, I
have not yet figured out how to facilitate this from within a
Spring Boot application. The most likely course of action here would
be to use Spring Vault's APIs to trigger a renewal of a particular
lease, or perhaps a Cron job of sorts.

One challenge here would be permission management - making sure that
the API has the permissions to renew the lease on a particular set of
credentials. Another challenge here would be to handle the situation
where, for whatever reason, your application does not renew its
lease on its secret(s) and needs to restart to recreate database
credentials/etc.

## 9. Conclusion
Overall, Spring and Vault seem like a really powerful combination
in facilitating enterprise-scale secrets management that goes far
beyond simply storing your production database credentials in your
source repository or in environment variables/shell scripts. There
is quite a lot of work, however, involved in building a
production-ready, Vault-integrated Spring Boot application, not to
mention all of the required organisational processes required in order
to facilitate a high degree of reliability of Vault-integrated
services.

Is it worth the effort? It depends: how important is your
organisation's services' security to you? That will determine whether
or not it's worth the investment.

I hope to expand on the
[Todo](https://github.com/thanethomson/spring-vault-todo) demo
application from this tutorial over time in order to illustrate various
other aspects of Spring Boot, Vault, PostgreSQL, and possibly other
kinds of technologies (perhaps frontend technologies). Watch this
space!

#### Footnotes
[^1]:
    With even the likes of Netflix contributing such project families
    as [Spring Cloud](http://projects.spring.io/spring-cloud/) - an
    incredibly powerful set of tools for building and orchestrating
    large-scale, cloud-based applications.
[^2]:
    I do find, personally however, that Django is far easier and
    quicker to build a system when compared to its Spring-based
    counterpart. It's most likely because of the
    [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
    approach so popular in the Python community: when you're searching
    for Spring tutorials on anything, you'll most likely find at least
    3 different ways of accomplishing the same thing. This was
    most confusing for me in the beginning, coming from my DRY
    Python-based background. Even getting into the Spring documentation
    was quite a challenge, and I've often found myself having to
    read through the underlying Spring Framework code to genuinely
    understand how something actually works.
[^3]:
    My own personal response to this kind of statement is often,
    *Well what do you have to hide that could be so damaging if
    revealed?* - a kind of political argument. In my own context,
    however, in working for a video streaming
    company where content is licensed from Hollywood, each and every
    item that is leaked through the company
    causes the company to be subject to massive fines. This, to the
    point that a large leak could even result in the shutting down
    of the streaming company entirely, putting thousands of people
    out of work (this applies to pretty much any video streaming
    company). So there are often valid financial and legal reasons
    to keep certain kinds of things secret.
[^4]:
    Like the fact that it comes packaged as a single system-specific
    binary application, where the binary can allow you to run a
    client or a server, depending on your command line options.
