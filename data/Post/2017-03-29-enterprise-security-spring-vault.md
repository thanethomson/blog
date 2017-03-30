---
title: Enterprise Security with Spring and Vault
slug: enterprise-security-spring-vault
summary: >
  Spring Framework is an incredibly powerful framework, and Spring Boot
  lets you get up and running with Spring in next to no time. What
  happens when Spring meets Hashicorp's Vault for enterprise-level
  secrets management?
date: 2017-03-29T21:00:00
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
closest framework in terms of ease-of-use to my personal favourite
framework [Django](https://www.djangoproject.com/).

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
could have incredibly damaging effects on many people.[^2]

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
   (largely, I think, because of the trust facilitated by simply having
   common interests).
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
goodness.[^3]

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

#### 3.2.1. Start Vault
I personally just got Vault up and running on my MacBook Pro using
the [Docker container](https://hub.docker.com/_/vault/):

```bash
> docker pull vault
> docker run --cap-add=IPC_LOCK \
    -e 'VAULT_LOCAL_CONFIG={"backend": {"file": {"path": "/vault/file"}}, "default_lease_ttl": "168h", "max_lease_ttl": "720h", "listener": {"tcp": {"address": "0.0.0.0:8200", "tls_disable": 1}}}' \
    --name vault \
    -p 8200:8200 \
    -d vault server
```

As per the write-up on Docker Hub, you'll need to add the `IPC_LOCK`
capability to prevent sensitive values from being swapped to disk.
Of course, I could have gotten Vault up and running in
[Dev Server](https://www.vaultproject.io/docs/concepts/dev-server.html)
mode just to try it out, but I really wanted to play with their
[seal/unseal](https://www.vaultproject.io/docs/concepts/seal.html)
functionality.

#### 3.2.2. Install the Vault Client
I also used [Homebrew](https://brew.sh/) to install Vault on my local
machine to use it in its client mode to talk to the Docker
container-based server:

```bash
> brew install vault
> vault -v
Vault v0.6.5 ('5d8d702f33b5fd965cbe8d6d0728295de813a196')
```

Admittedly, you could just do this through the Docker container you
just pulled, but I also wanted to make sure that a different
binary worked with the API.

#### 3.2.3. Unseal Keys
The very first time you start Vault up in production mode, it
will, by default, generate a **master key** which only ever resides
in memory. Therefore, I had to open up [Kitematic](https://kitematic.com/)
to view the console output of the `vault` container I was running
to see the **key shards** (AKA **unseal keys**) that the Vault
instance generated.

I just copied these down in a text file because
I was just playing around with Vault, but in a production setup
you'd probably need to write each of these keys down on a piece of
paper and hand them to the relevant trusted individuals in your
organisation. By default, Vault generates 5 of these **unseal keys**,
as well as a **root API token** which effectively allows "superuser"
access to Vault's API.

```
Unseal Key 1: wRVjp8yn07Bicz35LBjsjMxe1ANomBcLydEXbwxNuVMB
Unseal Key 2: BbSzYz1wjrrND0BsxhY78GsJr3L+TBAsPtLwiTEfWSEC
Unseal Key 3: nSaUUGrhRDfJ/vh3aH2z5vXyZsS5OIOGPLmxXBCH/QQD
Unseal Key 4: JtFjE+xdTAaRSJozBkORTVj5jtbxjCWF06SR4nbzyawE
Unseal Key 5: vkNEILvMhouVuSIoqCgZW8YCR2C2+LYv0c/QN1drbYkF
Initial Root Token: a28752e0-3995-64d3-67e2-2ad1329110ab
```

#### 3.2.4. Unsealing Vault
Vault's server, when it starts up, comes up in a **sealed** state.
This means that even Vault itself doesn't have access to your
secrets - everything's encrypted. In order to **unseal** Vault,
it needs a certain minimum number of **unseal keys** (known as
the **key threshold**, which is 3 of the 5 unseal keys
generated by Vault with its default configuration).

Vault then takes these 3 keys to reconstruct the master key and,
effectively, be able to decrypt all of the data in its storage. One
could pick any 3 of the 5 unseal keys to unseal Vault.

```bash
# Set the token so Vault can trust our API calls
> export VAULT_TOKEN="a28752e0-3995-64d3-67e2-2ad1329110ab"

# Perform the unseal process
> vault unseal "wRVjp8yn07Bicz35LBjsjMxe1ANomBcLydEXbwxNuVMB"
> vault unseal "BbSzYz1wjrrND0BsxhY78GsJr3L+TBAsPtLwiTEfWSEC"
> vault unseal "nSaUUGrhRDfJ/vh3aH2z5vXyZsS5OIOGPLmxXBCH/QQD"

# Verify that Vault is unsealed
> vault status
Sealed: false
Key Shares: 5
Key Threshold: 3
Unseal Progress: 0
Unseal Nonce: Version: 0.6.5
Cluster Name: vault-cluster-073615e2
Cluster ID: 59d41882-9637-1737-532b-09da36b27c7c

High-Availability Enabled: false
```

And *voila*! Vault is ready to be used. We'll come back to Vault
a little later.

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

[Configuring Spring Vault's SSL client](http://docs.spring.io/spring-vault/docs/1.0.0.RC1/reference/html/#vault.client-ssl)
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
Vault, and vice-versa. What I did on my local machine was just grab the
Docker container for PostgreSQL v9.6:

```bash
> docker pull postgres:9.6
> docker run --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres -d postgres
```

That'll allow our `postgres` superuser to log in with the simple
username/password combination of `postgres` and `postgres`. Obviously
not secure for production use. Make sure you've got the PostgreSQL
client installed on your system and then test out your connection
as follows:

```bash
# Assuming your PostgreSQL Docker container is bound to localhost:5432
> psql -U postgres -W -h localhost
```

Check your PostgreSQL container's IP address by way of:

```bash
> docker inspect bridge
{
    ...
    "Containers": {
        "8125e9077410be461101f6adbeae0c7bcf65b0c29f74a920546a9786bc15e00a": {
            "Name": "postgres-9.6",
            ...
            "IPv4Address": "172.17.0.2/16",
            "IPv6Address": ""
        },
        ...
    },
    ...
}
```

So we can see that, within the Docker bridge network, our PostgreSQL
instance is bound to the IP address `172.17.0.2` - this is important,
because Vault needs to be able to communicate with that host.

So now, we need to enable PostgreSQL support in Vault, and then
tell Vault how to access our PostgreSQL instance:

```bash
# Mount the PostgreSQL backend (once-off only)
> vault mount postgres

# Tell Vault where our PostgreSQL instance is
> vault write postgresql/config/connection \
    connection_url="postgresql://postgres:postgres@172.17.0.2:5432/?sslmode=disable"
```

I've used the `sslmode=disable` here because I haven't enabled SSL
support in my PostgreSQL instance, but you'd probably want to enable
it in production to ensure all comms between Vault and PostgreSQL
are secure on your local network.

## 6. Spring Vault
Finally, we can now move on to the actual construction of an
application to demonstrate integration with Vault!

As with most great technologies out there, there's usually a
Spring project specifically dedicated to integrating Spring with that
technology, and Vault is no exception. [Spring Vault](http://projects.spring.io/spring-vault/)
is specifically dedicated to integrating Spring with
Vault, and allows you to source your secrets (in the form of
[Spring configuration properties](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-external-config.html))
from a Vault secret store, as opposed to (and in conjunction with)
the traditional `application.properties` or `application.yml` files
in your project's class path.


#### Footnotes
[^1]:
    With even the likes of Netflix contributing such project families
    as [Spring Cloud](http://projects.spring.io/spring-cloud/) - an
    incredibly powerful set of tools for building and orchestrating
    large-scale, cloud-based applications.
[^2]:
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
[^3]:
    Like the fact that it comes packaged as a single system-specific
    binary application, where the binary can allow you to run a
    client or a server, depending on your command line options.
