---
title: Writing Homebrew Formulae for Python Applications
slug: writing-homebrew-formulae-python-apps
summary: >
  Since I couldn't find any good tutorials on the Internet on
  creating and submitting Homebrew formulae for Python packages,
  I thought I'd write a little about my experience in submitting
  the formula for Statik, as well as my recent experience in submitting
  an update for Statik when I released a new version.
date: 2017-01-20T15:00:00
tags:
  - software
  - projects
  - tutorials
---

[Homebrew](http://brew.sh) is a really awesome package manager for
**macOS**, which I personally use on an almost daily basis for managing
all sorts of software packages on my MacBook Pro. Without it, I believe
that my life as a software developer would be so much harder.

Since I've been recently been putting a lot more work into enhancements
for [Statik](https://getstatik.com), and I was getting to a point where
it was starting to become more useful, I thought I'd contribute a
formula for it to Homebrew. I was also quite inspired by [this
Changelog podcast](https://changelog.com/podcast/232) where Max
Howell, the original creator of Homebrew, was interviewed recently.

## Homebrew Contribution
Having never really contributed to large-scale open source projects
before, it was quite a change for me to see the kinds of community-
and technology-driven quality control mechanisms employed for such
projects as Homebrew. At the time of this writing, Homebrew's
[homebrew-core](https://github.com/Homebrew/homebrew-core/) repo had
just over 6,000 contributors.

There are several things to read first before trying to submit your
application to Homebrew:

* [The Formula Cookbook](http://docs.brew.sh/Formula-Cookbook.html)
* [Python for Formula Authors](https://github.com/Homebrew/brew/blob/master/docs/Python-for-Formula-Authors.md).

[My first submission of Statik](https://github.com/Homebrew/homebrew-core/pull/8413)
went through a few iterations to improve its quality, especially in
terms of adding some kind of functional unit testing.
[My latest update](https://github.com/Homebrew/homebrew-core/pull/9070)
was naturally way smoother.
