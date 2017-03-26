---
title: UX and System Architecture
slug: ux-and-system-architecture
summary: |
  What is the relationship between user experience and system architecture,
  and what works and what doesn't?
date: 2016-07-12T09:31:29
tags:
  - ux
  - architecture
  - philosophy
  - software
---

When building software systems, what exactly is the relationship between
user experience (UX) and system architecture? Or, I suppose a better formulation
of the question would be: what sort of relationship between UX and
system architecture provides the best possible products for users? (Assuming,
of course, you're addressing a user need in the first place
<i class="fa fa-smile-o"></i>).

### In Theory
There are a couple of different angles in trying to answer this question.
Firstly, there's the **theoretical perspective**. For this, I'm going to refer
back to the
[Mythical Man-Month](https://en.wikipedia.org/wiki/The_Mythical_Man-Month)
(p. 45):

> By the architecture of the system, I mean the complete and detailed
specification of the user interface.

This is quite a different spin on my current connotations relating to "system
architecture". It's far more user-centric than the various approaches I've seen
in practice in the organisations in which I've worked. The majority of the time
it's highly focused on the technology stack and how the various different
interfaces fit together. Of course, this potentially has the long-term effect of
providing for good UX, but the technology focus often doesn't provide **explicit
end-user goals** to focus developers' effort. Often the goals end up being
rather functional, with end user experience suffering as a result.

In the worst cases, as often seems to happen in practice, UX problems in systems
often only crop up long after the product has actually been implemented and is
running out in the wild. Here, it's often far more difficult and painful to
restructure the system to improve users' experience.

### The Intuition
There's also the **intuitive perspective**: intuitively, I would expect that
starting with very specific user-oriented goals would provide a great
scaffolding for developers to focus and guide their efforts. As per
[this video](https://youtu.be/rsfPWSPOwqk) from some members of the
Android development team, great UX involves function and form working
well together *holistically*, in ways that afford the user a great
experience every step of the way.

Just as an example, let's say you're building a web-based and RESTful service
comprised of many microservices and different technologies. Apart from the
visual design goals, some of your system goals could be things like:

* **End user page/API query load times need to be kept under 2 seconds.**
  This has a massive impact on the way in which you structure your
  microservices, where you'll put load balancers, where, geographically, you'll
  set up CDNs, what kinds of databases you'll choose, etc.
* **Must facilitate offline access as far as possible.** If, for example, you
  anticipate that your users will be accessing your service from areas where
  connectivity isn't always available (as is often the case here in Africa),
  your technical decisions will be heavily influenced. You'll need to
  think about using local storage in mobile browsers, as well as caching
  on mobile devices for API queries, with as much functionality as possible
  built into the client portion of your application, and as little as possible
  built into the server-side portion.
* **Scrolling through long lists must be fluid - no jerky scrolling, and
  load items (when connectivity is available) must be invisible to the user.**
  This not only affects the client portion of your application, but also
  the server side. Depending on what sort of connectivity your users have,
  you may need to adapt the quantity of data you request from the server to
  facilitate a fluid experience for the user. In the aggregate, this has a
  massive impact on the server load, as well as the manner in which the
  client caches data, and how much data the client will end up caching.

### Great for Testing
Not only would setting explicit UX goals for a product before its construction
seem to provide focus for developers and guide effort, it would also provide
really practical, hands-on **testing criteria** that pretty much anybody in the
team can validate. It's also relatively easy to see how certain kinds of tests
(like the page load/API query times) could easily be automated, even though some
kinds of tests are very subjective.

(The fortunate and unfortunate reality of UX is that we'll never really be able
to get away from subjective testing completely, because the reality of products
is that they're ultimately built for people, who are, by their very nature,
subjective beings - products for products' sake, or systems for systems' sake,
tend to not get very far in terms of user uptake).

### Legacy
It makes sense then that the "systems architect" (if that role is a defined
role in your context, as it is in mine) also be a **champion** for the UX
of the product. In fact, if we stick more strictly to Brooks' definition of
system architecture, the UX practitioner is, in reality, the actual
architect of the overall system.

The challenge here is that it seems as though we've already built up an
entire culture around the concept of "systems architect", where their role
involves very little practical focus on UX, and the UX role is separated out
almost completely. Not only is the UX role separated out, the UX practitioner
is often only considered after the technical solution has been designed, and is
often only associated with the visual aesthetics of the final solution (a
legacy perception stemming, I think, from old, bad web design practices).

This is something that requires a culture change in such organisations, which,
as we all know, is really, really hard if it's not baked in from the beginning
of a group or team's inception.

### Your Experience
Have you seen more user-centric approaches to system architecture in your
own organisation(s)? Let me know what you've seen working in practice!
