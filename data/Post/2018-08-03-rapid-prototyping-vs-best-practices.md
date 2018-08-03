---
title: Rapid Prototyping vs Best Practices
slug: rapid-prototyping-vs-best-practices
summary: >
  When kicking off a new project, whether working on an existing code base or a
  new one, should one rapidly prototype the solution (at the risk of writing
  throwaway code), or should one apply as many best practices and sound
  architectural approaches as one knows (at the risk of over-engineering the
  solution)? Towards which of the two ends of this spectrum, or where between the
  two ends, does one aim?
date: "2018-08-03 08:00"
tags:
  - software
  - prototyping
  - architecture
---

When kicking off a new project, whether working on an existing code base or a
new one, should one rapidly prototype the solution (at the risk of writing
throwaway code), or should one apply as many best practices and sound
architectural approaches as one knows (at the risk of over-engineering the
solution)? Towards which of the two ends of this spectrum, or where between the
two ends, does one aim?

This is a question with which I've personally struggled over the years, and I've
found that the answer only seems to become clearer when you attempt to answer a
deeper question: **how much uncertainty is there in your project**?

In this article, I'll first elaborate on what I mean by the "rapid prototyping"
and "best practices" approaches, why I see them being at two opposing ends of a
spectrum of possible ways of solving a problem using software, and then I'll try
to unpack that rather abstract question regarding uncertainty a little more so I
can hopefully make it a little more practical.

## Developing a spectrum of approaches to software development
Ultimately, the point of building software is to solve some kind of problem:
usually different problems at varying degrees of abstraction. For example, you
might be building a game: at the lowest levels, you're solving problems of CPU
and memory management and performing tricky mathematical calculations to fool
the player into thinking they're looking at a [super
mutant](http://www.ign.com/wikis/fallout-4/Super_Mutants) chasing them through a
junk yard, while at a higher level you're attempting to help someone solve the
problem of what to do with their free time such that they enjoy themselves the
most. All of this in such a way that their enjoyment allows you to put food on
your table.

When we get this mix just right at the right levels of abstraction, we say that
we're delivering **value**.

### On building bridges to value
This is somewhat analogous to the process of **bridge building** - one can think
of software development as a process of *building a bridge from a situation of
little value, to a situation of greater value*. When building a bridge, you're
also attempting to solve many different kinds of problems at different levels.
Where do I put the bridge? How sturdy do I make it? What materials do I use? How
do I build it within the budget and time constraints I have?

The approach you take to building a bridge must necessarily be
context-dependent, taking into account the local geography and geology, weather,
labour force, etc. Ultimately, it must, at a higher level of abstraction, take
into account the overall purpose of the bridge: why connect points A and B at
all? Why not just go around the canyon, wade through the river, or fly over it?
Building a multi-lane tarred bridge with steel and concrete reinforcement
wouldn't make sense if one was just building a bridge for preschool children
over a tiny puddle of a pond on their playground. Similarly, one wouldn't build
a bamboo and rope bridge for long-haul trucks to traverse a canyon.

Assuming you have a clear overall problem you're trying to solve by building
this bridge, you may encounter all kinds of uncertainty:

* you may not have the best possible labour force available to build the ideal
  bridge, or that labour force might incur significant changes during
  construction,
* you may not be able to anticipate certain kinds of weather or geological
  events that could completely destroy it,
* you may not have much time to build it (e.g. you may be at war, and the enemy
  might literally kill you before you have a chance to get to the other side),
  and/or
* you may not even know how or when people will end up using this bridge (e.g.
  people may want to drive trucks over this bridge, when you've only built it to
  support a handful of pedestrians).

### Prototyping
If the situation allowed for it, you may start out by building a **prototype**
bridge. Perhaps you may build a scale model, where the analogy in the software
world would be anything ranging from paper-based to clickable
[wireframes](https://en.wikipedia.org/wiki/Website_wireframe). Perhaps, if you
still had too many critical unanswered questions, you may go all the way through
to building a rickety version of the final bridge, perhaps in a different
location, at a smaller scale, and only accessible by a select few people.

In certain fortunate cases, as I've often found in the software world, building
this rickety version (replete with copious quantities of warning signs and
disclaimers) can save you a tremendous amount of pain and suffering in the
future. It can answer many of your unanswered questions and reduce the risk of
failure of the final bridge's construction. If you're extraordinarily lucky,
which is more often the case in software development than in bridge building,
your prototype may be good enough for your client to use *as-is*.

The key defining characteristic of a prototype is its **brittleness**. The most
bare definition of a prototype that I can come up with would be something that
can or does solve all of the relevant problems, at all of the most critical
levels of abstraction, under very strict conditions. It delivers **value**, but
only within those strict conditions. The moment that one attempts to operate it
outside of those conditions, it falls apart, and someone is likely to get hurt.

I would argue that, therefore, a prototype could be classified as an extreme
point on the one end, as it just barely solves the most important problems with
which we're currently concerned. There is, of course, another end of the
spectrum.

### Best practices
When building a large bridge requiring a work force of hundreds, intended to
carry millions of people for many decades, however, one should take a different
approach to building a prototype from the outset. If you know you've got a
decent amount of time, budget, a good labour force, great materials, a clear
vision and paying customers, it really does often make sense to make use of
every best practice you can. The point here is to make sure your final product
is as robust as possible in solving all of the important problems at all the
relevant levels of abstraction.

This kind of solution is also a valid solution to the relevant set of problems,
but its key distinguishing property from a prototype is its **robustness**. This
is the extent to which it can be *stressed*, at various levels of its solution,
and still solve all of the most important problems.

Just as in bridge building, [many](http://a.co/35pVQSI)
[books](http://a.co/hu2pitw) [have](http://a.co/c37YlSZ)
[been](http://a.co/eHNfAdr) [written](http://a.co/2Tj4qMk) on the topic of
**software architecture** that focus on developing the right kinds software
abstractions to deal with these various levels of problems, because over the
years, many smart people have discovered that there are patterns that tend to
emerge when attempting to solve certain kinds of software problems. Just do a
quick search on Amazon for books on the topic of "software design patterns" or
"software architecture" and you'll see.

When this approach is incorrectly applied, however, one ends up in a situation
where the final product is over-engineered: it's built to withstand earthquakes
one hundred times stronger than anything the country's ever seen in its recorded
history, or built such that it won't need maintenance for a decade, or even
built to allow aeroplanes to take off from it. You've wasted millions (or even
billions), wasted years, killed your labour force's morale and nobody cares
about your bridge any more because Elon Musk's built a
[Hyperloop](https://www.spacex.com/hyperloop) right under it that makes it
obsolete.

The incorrect over-application of "best practices" can often be seen as
**premature optimisation**, and is seen as one of the [cardinal sins of the
software development
world](https://softwareengineering.stackexchange.com/questions/80084/is-premature-optimization-really-the-root-of-all-evil).

## Finding where to aim
So where do you aim for your software project? I still often struggle with this
question, because answering it requires wisdom and careful attention, which can
be both challenging and draining. Do you start with a brittle prototype (maybe
in the form of a handful of Python scripts), or do engineer the system that can
withstand multiple simultaneous AWS data centre outages (i.e. withstanding the
end of the world)? As you can imagine, the answer is usually somewhere in
between. To know roughly where though, you have to answer the right questions
that pertain to the **uncertainty** you currently face in your project's
development.

The following questions are by no means exhaustive, but they tend to give me a
good head start.

### Do you have a paying end customer?
The first question I personally like to ask is: **do you have any real-world
end-of-the-value-chain customers that either are already, or have committed to,
paying for and using what you're building?** If you've already got a guarantee
of payment for what you're building, then you should generally be aiming more
towards using best practices. If you're working for a company and being paid to
implement a new internal system, are you guaranteed that people are going to be
using this new system once it's built and working well?

If you don't have a paying customer yet, or your customer doesn't have a paying
customer, or there are no end users for your system yet, you have a high level
of uncertainty in your project. I've found it's really useful to rather
iteratively prototype together with the potential client/user in these sorts of
situations. This requires an explicit up-front understanding that what you're
building is a prototype (call it an "alpha" or "beta" version if your client is
more amenable to that phrasing). At this point, your focus is most likely on
"making the sale", or demonstrating real value to the client, end customer or
end user.

The times when I've failed to apply this insight, the project inevitably fizzled
out and died. One big lesson I've learned through such experiences is that,
especially when you're taking a gamble on a new product or system, it's usually
wise to choose the route that requires relatively little investment with the
possibility of significant pay-off - and if it doesn't work out, your losses
should be capped and affordable. This, by the way, is one of the central lessons
I took from reading Nassim Taleb's book:
[Anti-Fragile](https://www.goodreads.com/book/show/13530973-antifragile).

This first question leads us naturally into the second.

### Do you have a clear vision for the project?
**Do you know what the end product of your labour will actually look like,
practically?** Perhaps you have to integrate with data sources where the quality
is questionable, but you don't have enough of it to determine just how
questionable it is. Perhaps you may be building a system where the client
vacillates so often on the front-end design and/or basic features that you need
to take prescription medication. Or, perhaps, you don't even have a customer
yet, but your product owner is adamant that his/her vision of the product is
what the client/customer will definitely want when they see it.

In these sorts of cases, you've got a high level of uncertainty, and you should
probably be aiming towards the prototype end of the spectrum. Specifically with
the data quality example, I've personally seen how building a prototype here can
provide a very effective stop-gap solution while the robust version is being
built, increasing understanding of the data's real quality and reducing waste
when building the robust version.

What you really want to achieve in this sort of scenario is to allow yourself
room to iterate with your relatively brittle solution until you've reached a
clearer understanding of what the end product needs to be. More robust
solutions, usually having more tests, more layers of abstraction and greater
levels of compensation for errors, also require more work, and are therefore
more costly, to change.

### Who will be maintaining the project?
The third question has to do with uncertainty around the longer-term maintenance
of the project: **who will be looking after it over time?** Perhaps you're only
building something that's supposed to last for a few months or a year, like a
short-term digital marketing campaign. Or, perhaps you're building a system for
a bank, where you know that it's probably going to be running in production for
at least a decade.

The brittleness of a prototype, just like a fragile wine glass, requires that
one have the right knowledge and expertise to tend to it throughout its
lifecycle. This usually means that whoever wrote the code would need to maintain
it, as there would usually be hidden fragilities of which others couldn't
possibly be aware. Learning about all of these hidden fragilities and the
tolerances of these fragilities can be an expensive and painful process.

The more robust the system, however, and the more good architectural practices
applied, the easier it will be for another trained developer to pick up
development on the system.

## A side note on programming language choices
I've had several young developers ask me the question: **which programming
language, or languages, do I learn?** This isn't an easy one to answer, because
new languages pop up at such an incredible rate these days. Follow [Hacker
News](https://news.ycombinator.com/) and you'll see: a new language seems to be
born every week.

My usual answer to this question is: **pick one mainstream compiled programming
language (like Java, C# or C/C++), and one mainstream scripting language (like
Python, Ruby or JavaScript)**. Play around with them by following some tutorials
and pick one of each category, and then learn those two languages really, really
well. Once you know those languages really well, and have built some useful
projects using them, then you can concern yourself with adding one or two
languages to your repertoire every year.

The reasons for this are as follows.

1. I find that **scripting languages are often better suited for building
   prototypes**, whereas **compiled languages are often better suited for
   building more robust systems**. I've generally found this to be so because so
   many of the frameworks for the compiled languages already implement the
   majority of "best practices" and software design patterns. If you don't
   believe me, just try finding a good, widely used [dependency
   injection](https://stackoverflow.com/questions/130794/what-is-dependency-injection)
   framework for scripting languages when compared to those available for
   Java/C#.
2. You'll regularly encounter situations where you'll be building something
   using a mainstream compiled language, but you need to do something *quick 'n
   dirty*, like data transformation from CSV files to SQL tables. This sort of
   case happens more often than you think, and is usually way harder to do using
   a compiled language, so the two languages end up being **complementary**.
3. **You'll most definitely find work** if you know two such mainstream
   programming languages.

## Conclusion
When looking at the range of possible software solutions to problems, it appears
as though a spectrum emerges when measuring those solutions against their
**robustness**. Brittle solutions usually take the form of prototypes, whereas
the application of better architectural principles and design patterns tends to
result in more robust solutions. Choosing where to aim when building your
solution with your particular problem set and context in mind can be
challenging, but can be made a bit easier when considering a few questions that
attempt to uncover how much **uncertainty** there is in your project.

When you don't have a clear **customer** and/or **vision** for your project, aim
more towards a prototype - this will allow you to iterate more rapidly on
possible solutions until you reach the most appropriate one. When you know your
solution will need to work for some time, and you don't know **who will look
after it**, it would be better to invest in developing a more robust
architecture, as looking after a brittle solution usually requires specialised
knowledge, expertise and care.
