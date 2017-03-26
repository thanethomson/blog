---
title: Building in a little fat
slug: building-in-a-little-fat
summary: 
date: 2014-06-29
tags:
  - anti-fragile
  - business
  - philosophy
  - process
  - scalability
---
Several times now I've wondered if there are perhaps lessons we can take from
real-world, successful projects and approaches the ICT industry that we may be
able to apply generally to society. A simple example is how the [Agile
management](https://en.wikipedia.org/wiki/Agile_management) approach speaks
rather deeply, on a philosophical level, about how to approach projects in a
rapidly changing, non-deterministic environment where requirements may change
rapidly. It is quite obvious how this sort of approach could be applied in
similar environments where older, more deterministic project management
approaches are too cumbersome or rigid (of course, the implementation details
would have to be tailored for the environment, because strict Agile project
management is usually quite specific to software development).

Lately I've been looking into what it takes to build scalable, robust,
reliable systems for a variety of purposes and there seems to be, in a similar
way to Agile project management, an underlying philosophical shift from the
ways in which traditional systems are built. This philosophical shift can
quite simply be summarised in a single sentence: **build in enough fat to
cater for the worst case scenario** (so-called ["black
swan"](https://en.wikipedia.org/wiki/Black_swan_theory) events).

Do you anticipate, even with a very low likelihood, that you may have a sudden
spike in traffic with over 100,000 users accessing your system simultaneously?
Make sure your system is load-balanced and horizontally
[scalable](https://en.wikipedia.org/wiki/Scalability), and find ways to break
up complex computational problems (which may become bottlenecks or constraints
in your system) into smaller parts and distribute these smaller computations
across your clusters. You don't know how often and which of your servers will
fail? Make sure you replicate data and functionality across multiple nodes,
storing more than one copy of a chunk of data in case a server rack fails. You
don't know where most of your users will be? Set up multiple data centres
across the world, providing localised, distributed access to your services. Of
course, you have to balance this with the costs of doing so, so you may set up
small-ish data centres, but with the ability to add more capacity if
necessary.

This happens to be the philosophical approach that Nassim Taleb advocates in
his (absolutely mind-blowing) book [Anti-Fragile](http://amzn.com/0812979680),
and is applicable to many spheres of life. It's also hinted towards in the
famous Eliyahu M. Goldratt's [Theory of
Constraints](https://en.wikipedia.org/wiki/Theory_of_constraints) from his
seminal work, [The Goal](http://amzn.com/0884271951), where he recommends
building in buffers around your process constraints to ensure the constraint
is never starved and that it's output is never blocked. It's also very
important to have backup equipment to be able to replace or supplement your
process "constraint" in the case of failure, because, as the theory goes, a
constraint failure will result in total system failure.

Such a philosophy is applicable to many situations in everyday life, and, at
least in my mind, is verging on achieving the status of a general principle.
For example, if one has to undertake an hour-long drive (with no traffic) to
be on time for an appointment at 14h00, and there is a very small chance of a
traffic jam where the worst-case scenario could be up to a two-hour delay,
applying this principle would result in one leaving at 11h00. Of course, this
may result in you being two hours early if you don't encounter any traffic, so
you'll have to weigh up the costs involved in being two hours early versus two
hours late. (Note that this is usually a very intuitive process that we
generally go through on a daily basis, but you would be surprised at how often
this is only applied in situations like being on time for appointments and
neglected in business). There are countless examples of how this naturally
occurs in nature (just think about how much money goes into our struggle to
fight against nature when our bodies store up fat).

This is also applicable to personal financial planning. Think about the worst-
case scenarios as to what could happen to you in life: you could be killed in
an accident, be diagnosed with a life-threatening illness, be permanently
disabled, or the economy of your country in which your retirement funds are
stored could encounter hyperinflation. Covering yourself for the worst-case
scenarios helps you to ensure that you, should you survive, and your family,
should they survive, are not crippled even further by financial circumstances.
It's easy to see how this sort of example could extend to business financial
planning.

Overall, you have to look at the cost of encountering a "black swan" event. A
prime example cited by Taleb is the [Fukushima nuclear
disaster](https://en.wikipedia.org/wiki/Fukushima_Daiichi_nuclear_disaster),
where they failed to take into account the cost of a very low-probability
event like the tsunami that caused the disaster when initially building the
plant.

At the very least, such a configuration, whether it be a web application, a
manufacturing line, an entire supply chain, could be called "robust" in the
face of catastrophe (i.e. that the overall configuration would be unharmed and
continue to operate in the face of catastrophe).

One of the primary benefits of such robust configurations, as Taleb points
out, is that **one doesn't need to be able to predict the future when
constructing them**. Just take care of the worst-case scenarios as best you
can, and the configurations will take care of themselves, freeing you up on
many levels to focus your (otherwise worry-oriented) energy elsewhere.

