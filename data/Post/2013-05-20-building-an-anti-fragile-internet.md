---
title: Building an anti-fragile Internet
slug: building-an-anti-fragile-internet
summary: 
date: 2013-05-20
tags:
  - anti-fragile
  - black swan
  - chaos
  - complexity
  - decentralisation
  - featured
  - internet
  - peer-to-peer
  - taleb
---
I'm still busy reading [Nassim Taleb's "Anti-
Fragile"](http://amzn.com/1846141575) and I have to say that I'm loving it so
far. The book has much to do with humanity's generally faulty perspective on
risk management, and he provides a very coherent alternative perspective. In a
nutshell, Taleb says that there are three different types of systems in life:
_fragile_, _robust_, and _anti-fragile_ systems. Fragile systems generally
don't recover from shocks (e.g. when you drop your television), robust systems
are at best unharmed by shocks, and anti-fragile systems actually benefit,
within limits of course, from shocks (e.g. your body, which gets stronger as
you exercise it). The aim should be to, instead of trying to predict and
prevent future shocks (which is necessary for fragile systems), rather build
enough over-compensation into the system to at least make it robust, but
ideally anti-fragile, such that it benefits from shocks.

He has much to say about people he calls the "fragilista" - those who
construct systems in life to benefit themselves while making society ever-more
fragile. One of the defining characteristics of these fragile systems is a
high level of interdependency in their parts, such that a failure in one part
ripples through to all of the other parts - a poignant example being the
recent (and continuing) global financial crisis. A completely opposite example
is the airline industry, where failures (i.e. a plane crash) are isolated from
each other, and we learn so much from that failure that the whole system (the
industry) benefits from that failure, making the overall system better.



###  The fragility of the current "cloud" paradigm

Bringing these concepts into the ICT domain, the first point of potential
fragility seems to me to be "cloud"-based systems, where one's ICT
infrastructure is built on, operated and maintained by one company (e.g.
[Google AppEngine](https://cloud.google.com/products/), or [Amazon Web
Services](http://aws.amazon.com/), or [Microsoft
Azure](http://www.windowsazure.com/en-us/), or one of the hundreds of other
smaller "cloud platforms"). This has the advantage that one doesn't need to
keep expensive, highly trained staff on board to maintain scalable, robust ICT
services, and one doesn't have to fork out for guaranteed-up-time data centres
and off-site backup centres.

The major disadvantage is this: what if you're a company in South Africa,
whose entire business relies on a "cloud-based" system running on a European
company's infrastructure, and the [Seacom cable unexpectedly gets
cut](http://www.itweb.co.za/index.php?option=com_content&view=article&id=62711)
(this is the cable that provides much of Africa's connectivity to Europe,
India and Asia)? It means downtime, or at best slow connectivity while Seacom
redirects traffic on other networks, for two weeks at a time, which can easily
translate into loss of profits and/or productivity.

With the same company in mind now, what if the [cloud hosting company with
whom you're hosting your cloud system is affected by some sort of
outage](http://www.zdnet.com/amazon-cloud-down-reddit-github-other-major-
sites-affected-7000006166/)? More downtime, more profits lost, and lower
productivity.

And is the system getting better as a result of these failures? I would think
not. Scalable systems seem to be getting [ever-more
complex](http://gigaom.com/2012/01/08/cloud-is-complex-deal-with-it/), and
with greater complexity comes a far greater risk of failure. In a scalable
system with many "moving parts" (as cloud-based systems are), minute little
effects, such as delays between web server accesses and database reads, can
ripple upwards causing large, even catastrophic, failures (read up a little on
[chaos theory](http://en.wikipedia.org/wiki/Chaos_theory) to see how this
works in non-linear dynamic systems).

Of course, Amazon outages and Seacom cable cuts are usually rare, so they can
be considered [Black Swans](http://en.wikipedia.org/wiki/Black_swan_theory) in
the ICT world, but is there perhaps a way to construct scalable, low-
maintenance, low-cost systems in such a way that they would be more robust
against such events? It's easy for us to think of the independence of
incidents in the airline industry, for example, but what's the analogous
example in the ICT domain?



###  Enter the peer-to-peer system

Think about [BitTorrent](http://www.bittorrent.com/) and its distinctive
advantage over a centralised download server. If one person starts to download
a particular large file, that person also starts to make the downloaded chunks
of that file available to their peers such that their peers can start
downloading it without the central source needing to serve those chunks, and
they in turn make chunks available to their peers, and so on. This results in
an optimal distribution of bandwidth (not overloading the source server), and
incredible robustness (the more peers have the whole file, the more impervious
the downloading of that file becomes to failures, thereby becoming more
robust).

People have already started developing peer-to-peer search engines, such as
[YaCy](http://www.yacy.net), where instead of relying on one company's search
engine and search infrastructure (e.g. Google), YaCy involves installing a
piece of software on each peer's computer, and each peer contributes storage
space and search functionality to the collective search system.

Naturally, these examples are quite complex, although at an individual peer
level they operate very simply (a characteristic of complex systems: simple
local rules resulting in large-scale emergent effects).

Thinking of these examples, it would seem as though the tendency in cloud-
based systems is one of _disempowering the individual computer_, making it
dependent on the central system for functionality. This disempowerment of the
individual, as we've seen in the centralised state model in governments,
creates a certain amount of fragility, whereas the opposite, _empowerment of
the individual _(thinking of Taleb's numerous examples in _Anti-Fragile _of
decentralised models of state), creates more robustness, and in certain cases,
anti-fragility.

Peer-to-peer systems are just that: the empowerment of the individual computer
system.



###  Future development

With all of this in mind, several questions arise. Firstly, is it possible to
build "cloud"-type applications which, instead of running on centralised
infrastructure such as Google's AppEngine or Amazon Web Services, run on a
peer-to-peer backbone? Failures in such a system would most likely be
isolated, and would ideally result in temporarily diminished functionality or
capacity, but not complete outages.

Secondly, if it isn't possible to develop such peer-to-peer systems, is there
perhaps a way to decentralise and/or distribute our infrastructure to make it
more robust to Black Swan events?

Finally, what processes can we put in place to both isolate certain systems to
prevent failures from rippling through to other systems, and learn from the
failures of those systems such that our collective communication
infrastructure becomes not just robust, but anti-fragile to failures?

These are some of the questions I'm currently asking in my work at
[Meraka](http://www.csir.co.za/meraka/) at the CSIR in South Africa, as we
attempt to look ahead in building the future Internet.

