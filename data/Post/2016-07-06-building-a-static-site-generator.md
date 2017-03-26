---
title: Building a Static Site Generator
slug: building-a-static-site-generator
summary: |
  I've recently built and published my own static web site generator:
  Statik (https://getstatik.com), aimed at software developers.
date: 2016-07-06T16:02:49
tags:
  - statik
  - software
  - projects
---

I'm quite proud to say that, even though it's a product in a pretty [saturated
market](https://www.staticgen.com/), I've finally published my first [open
source](https://github.com/thanethomson/statik) project:
[Statik](https://getstatik.com). Yes, it's another static web site generator,
but one big difference is that I built it with my own hands, so I know how to
shape and mould it to pretty much any need. Making things myself, being part of
the process, really appeals to my inner hipster <i class="fa fa-smile-o"></i>

## Why another static site generator?
This is one I've answered on **Statik**'s web site, but I think what it comes
down to is the desire for a greater degree of control.

Technically, I can now write Python code and
[SQLAlchemy](http://www.sqlalchemy.org/) ORM queries to get hold of my data.
Model/table structures are defined in YAML files and model instances are defined
in either YAML or Markdown formats instead of being stuck with an architecture
that's geared towards building blogs. I can now build pretty much any kind
of static site, and the various components provided by **Statik**, such as
the ORM and the templating engine, speed up the development of static sites
significantly.

I've even re-themed my personal blog, and this very site has proudly been
generated using **Statik** - there's nothing like using your own product to
refine its ease of use.

## Still to come
There are many, many features yet to come. **Statik** is still very much in
beta at the moment, but I'm really glad to see that I've got a handful of
<i class="fa fa-star"></i>'s on GitHub so far. It's encouraging in terms of
producing new features. But I'm involved in several projects that will
potentially require static web sites, so I'm regularly improving **Statik**
as I personally need new features.

Some of the really cool features still to come include:

  * **Themes**: I'm going to be working on a section of the **Statik** web site
    that'll be dedicated to offering free themes licensed under various
    *Creative Commons* licenses.
  * **CMS**: For those who have a **Statik** theme already, I'm planning on
    building a CMS interface that'll allow one to create and manage instances
    in a similar way to how Django does it with its admin interface.
  * **Workflows**: To speed up the process of publishing your static site to
    your server.
  * **Plugins**: A plugin infrastructure for **Statik** such that you can,
    for example, use new filters and extensions in your templates.
  * **Many minor features**: Such as a simplified approach to paging, various
    integrations (like with Disqus, Google Analytics, Piwik, etc.), and more.

## Contributing
Feel free to drop me suggestions and recommendations in the comments here,
or open up an issue at the [GitHub repo](https://github.com/thanethomson/statik)
if you want a particular enhancement or feature and I'll see if I can get around
to adding it ASAP.
