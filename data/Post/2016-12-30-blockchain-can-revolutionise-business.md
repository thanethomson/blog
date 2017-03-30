---
title: The Blockchain can Revolutionise Business
slug: blockchain-can-revolutionise-business
summary: >
  Just not in the way it's being punted by marketers,
  "strategic business thinkers" and banks at the moment. Its real value
  lies in its ability to decentralise trust, taking that trust away
  from (centralised) organisations and putting that trust into open,
  transparent computing algorithms, code and the community.
date: 2016-12-30T21:00:00
tags:
  - software
  - blockchain
  - decentralisation
  - peer-to-peer
  - philosophy
show-toc: true
---

It won't, however, be the
[saviour](https://www.hpe.com/h30683/us/en/strategic-business-insights/c/enterprise-security/security/blockchain-will-rewire-security--privacy-and-business.html?jumpid=HPSW_SEC_FEED)
it's being touted to be from the perspective of marketers and
businesspeople who don't understand it. Its real value
lies in its ability to **decentralise trust**, taking that trust away
from (centralised) organisations (mainly businesses and people that act
as [trusted third parties](http://www.businessdictionary.com/definition/trusted-third-party.html))
and putting that trust into open, transparent computing algorithms,
code and the community. This has massively disruptive potential for
several different industries that have historically relied heavily on
centralised networks of trust, especially **financial services**.

To understand more precisely why the
[blockchain](https://en.wikipedia.org/wiki/Blockchain_(database))
has disruptive potential, one needs to understand, firstly, what
decentralised systems are in general, and, secondly, why the blockchain
exists at all. This will also help in understanding why
one should not blindly trust the hype around it.

## Decentralisation
Take a look at the following three pictures to understand the high-level
differences between **centralised**, **decentralised** and
**distributed** systems. In the diagrams, black dots represent
"client" or "peer" nodes in the network (such as your mobile phone or
laptop, or perhaps an individual customer of a bank), and blue dots
represent *trusted* "server" nodes (such as the servers belonging to
Facebook, your bank, or your e-mail service).

<div class="row">&nbsp;</div>

<div class="row">
    <div class="four columns">
        <div class="centered img2">
            <img src="/assets/blog/images/centralised-computing.png" />
        </div>
        <div class="centered img-caption">
            <b>Centralised System</b><br />
            Facebook, Google, banks, most modern businesses
        </div>
    </div>

    <div class="four columns">
        <div class="centered img2">
            <img src="/assets/blog/images/decentralised-computing.png" />
        </div>
        <div class="centered img-caption">
            <b>Decentralised System</b><br />
            Bitcoin/Blockchain, E-mail, <a href="http://yacy.net/">YaCy</a>
        </div>
    </div>

    <div class="four columns">
        <div class="centered img2">
            <img src="/assets/blog/images/distributed-computing.png" />
        </div>
        <div class="centered img-caption">
            <b>Distributed System</b><br />
            BitTorrent
        </div>
    </div>
</div>

I purposefully represented the blockchain as a **decentralised
system** as opposed to a distributed one because not all nodes in
the network are
[full nodes](https://bitcoin.org/en/full-node) holding the whole
blockchain in its entirety. It
is possible to make use of the blockchain without storing all
historical transactions, but if you don't store the entire
transaction history, you're implicitly trusting all of the other
full nodes who do.

More on this below.

## What is the Blockchain?
For the non-technical audience: the
[blockchain](https://en.wikipedia.org/wiki/Blockchain_(database)), in
the way it's used by Bitcoin, is simply a way of representing
[financial ledger](http://www.investopedia.com/terms/g/generalledger.asp?lgl=no-infinite)
transactions in a sequential way (the order of all users' transactions
is vitally important to the integrity of any transactional system). So
why all the fuss? Watch the following video - it does a good
job of explaining the real value and significance of Bitcoin and the
blockchain, and how it works, at a very high level. After that, I'll
dig into some of the differences between traditional, centralised
accounting practices, as compared to decentralised, blockchain-based
accounting.

<div class="row">&nbsp;</div>

<div class="row">
  <div class="twelve columns">
    <div class="centered video-embed">
      <iframe width="560" height="315" src="https://www.youtube.com/embed/YIVAluSL9SU" frameborder="0" allowfullscreen></iframe>
    </div>
    <div class="centered img-caption">
      <b>The real value of Bitcoin and crypto currency technology - The
      blockchain explained</b>
    </div>
  </div>
</div>

#### Traditional accounting
When using traditional financial accounting software systems (e.g.
[Sage One](http://www.sage.com/company/solutions/sage-one)), some of the
underlying assumptions are that:

1. You can trust the person (or system) capturing financial transactions
   that happen in the real world.
2. You can trust your software to store them in the correct order.
3. You can trust your people and software to only store a single
   instance of a particular transaction (no
   [double-spending](https://en.wikipedia.org/wiki/Double-spending)
   allowed).
3. You can trust the people and software to not go back and tweak or
   modify those transactions' details.

Companies implement strict, usually hierarchical, controls and
governance around who
can actually manipulate the data stored by their accounting software,
and are audited regularly to ensure there's no foul play. The
servers storing the financial data are usually **centralised**, so that
there's a
[single source of truth](https://en.wikipedia.org/wiki/Single_source_of_truth)
that all connected clients can trust to give them accurate information.

So how would it work if we *decentralised* our trust in the financial
transaction history?

#### Decentralised, blockchain-based accounting
There is no single source of truth in the blockchain, which was a novel
invention by
[Satoshi Nakamoto](https://en.wikipedia.org/wiki/Satoshi_Nakamoto) in
trying to solve the problem of ensuring that ledger transactions are
correctly ordered and cryptographically verified in a **decentralised**
system. Here, users do not trust each other, but rather put their trust
into open, transparent, cryptographic algorithms and protocols, and the
strength of the network.

Comparing decentralised accounting with the traditional accounting
trust points mentioned earlier:

1. You cannot trust anyone submitting a transaction to the
   network, but you can trust in the algorithms used by the network
   to check that your transaction is valid.
2. You can trust the blockchain to store transactions in the correct
   sequence. Sometimes, it does happen that the blockchain gets
   [forked](http://bitcoin.stackexchange.com/questions/30817/what-is-a-soft-fork)
   due to a disagreement between the peers as to which block of
   transactions should be next in the sequence. This is automatically
   resolved by the network.
3. You can trust the blockchain to ensure no double-spending.
4. You can trust the cryptographic protocols in the network to
   ensure that nobody modifies historical transactions. This would
   result in corruption of the blockchain, and the peers would reject
   any such modifications[^1].

## Disruptive Potential
Now we get to the *so what?* part of the discussion: what, then,
makes the blockchain so "disruptive"?

#### Goodbye banks?
Since it isn't just your bank that keeps a copy of the ledger, and you
can keep a copy of the ledger yourself too (where you and the rest of
the community are held accountable to each other through cryptographic
algorithms), why do you need a bank
to facilitate transactions for you? Beyond getting credit from the
bank, what more does the bank really do for you than act as a
[trusted third party](http://www.businessdictionary.com/definition/trusted-third-party.html)
between you and the other person with whom
you're doing business?[^2]

This sort of disruptive potential applies to absolutely any real-world
situation where there's a need for a trusted third party whose sole
purpose is to **facilitate and reliably track transactions**. If it's in
the interest of a community to keep track of something in a
trustworthy way, a decentralised blockchain can do just as well today
as a trusted third party's software systems.

Unfortunately, the blockchain is also a relatively new technology
and is still being battle-tested by the community to ensure that it
really is [secure](http://www.hongkiat.com/blog/bitcoin-security/).
Information security is far more than just cryptography,
as per the following XKCD comic.[^3]

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

#### Applications outside of finance
Being a decentralised transaction tracking system, the kind of transaction
that gets tracked by the blockchain is totally up to the
developers building the application layer of software *on top* of this
transaction tracking system. Bitcoin, by design, is a financial
transaction tracking system built on top of the blockchain.

Several application areas for the blockchain outside of finance come to
my mind:

* Accommodation booking systems, especially
  [Airbnb](https://www.airbnb.com/)-style accommodation bookings.
* Parcel tracking systems, especially where multiple different
  courier services are employed to deliver a parcel.
* Government accountability systems, where the general public can
  reliably track whether their government is delivering on their
  promises (whether this be financially or otherwise).
* Community-oriented agricultural produce tracking systems, which
  could allow transparent tracking and reporting of local agricultural
  produce for communities.

And there are potentially loads more.

#### Don't trust the (irresponsible) marketers
Therefore, the blockchain is potentially disruptive. **But it
won't necessarily benefit all businesses**. Disruption might just mean
that **your** business is the one being disrupted, meaning that it
might just put you out of business. (If, of course, you're
in the business of acting as a trusted third party).

#### Who really benefits from the blockchain?
From what I can see, your business only really stands to benefit
from the blockchain if you:

1. rely heavily on one or more trusted third parties,
2. provide a good/service to the broader community,
3. would save time/money/etc. if your trusted third parties were
   decentralised and entrusted to the community, and
4. the broader community comprises, at least partially, of people who
   are technologically savvy and invested enough in your good/service
   to want to *be* part of the community to whom your data is
   entrusted.

#### Don't trust the banks' "love" of blockchain
Apparently, [many international banks are embracing the blockchain](http://www.coindesk.com/8-banking-giants-bitcoin-blockchain/).
I would personally be very skeptical of this sort of move on their
part, because it is the very nature of the financial institution that
currently stands to be disrupted by blockchain-like technologies.

For example, Bank of America is apparently
["going big" on Bitcoin and the blockchain](http://www.cnbc.com/2016/01/28/bank-of-america-is-going-big-on-blockchain-plans-to-file-20-patents.html).
By filing patents? All this does is provide them with ammo to
potentially sue people who infringe those patents, potentially hindering
efforts to decentralise the financial system. From my perspective, this
is a purely self-preservation-oriented move on their part.

I also call bullshit on every bank who claims they'll benefit by
implementing a blockchain *internally* within the bank for tracking
transactions. In computer programming, this is pretty much what we call
a [CQRS](http://martinfowler.com/bliki/CQRS.html) architectural model,
and the banks should be using that kind of model anyways.

The whole point of the blockchain is to **decentralise** its storage and
entrust the transaction validation and history to the **community**.
What good is it if all of the nodes are behind the bank's firewalls?
How is that any different, from the perspective of a bank customer,
to the situation as it is today, where the customer's trust still
effectively has to be centralised within the bank?

## Conclusion
The *blockchain* is a technology aimed at
**decentralising trust**. This has the potential to disrupt some
industries that presently rely on **trusted third parties**. Those
who stand to benefit the most are people who currently rely on
trusted third parties, whereas those who stand to lose the most
are those who *are* trusted third parties in facilitating
transactions between other people.

Finally, don't trust irresponsible marketers when they tell you
that the blockchain is the solution to all your problems (it only
solves a pretty niche sort of problem, actually), and for goodness'
sake don't trust the banks when they say they're in full support of
the blockchain. These two groups of people are the most likely
candidates to, inadvertently or on purpose, strangle it to death while
nobody's paying attention.

#### Footnotes
[^1]:
    In the Bitcoin network, each
    [full node](https://bitcoin.org/en/full-node) is responsible for
    storing and validating the *entire* blockchain. That's right: each
    full node stores every single transaction that's ever
    happened in the history of Bitcoin. At the time of this writing there
    were [5,553](https://bitnodes.21.co/) full nodes in operation across the
    world, and the size of the blockchain was around **90GB**. This data,
    of course, grows every day as more and more of the virtual currency
    changes hands, and the number of transactions increases.
[^2]:
    You and the other person both trust the
    bank to keep your money safe, and you both trust that if you instruct
    the bank to transfer money from your account into the other person's
    account, it will be done reliably.
[^3]:
    Not to mention the threat that
    [quantum computers](https://en.wikipedia.org/wiki/Quantum_computing)
    pose to the underlying cryptographic algorithms used in the current
    versions of the blockchain. Quantum computers are
    [swiftly moving towards becoming practically realisable](https://www.sciencedaily.com/releases/2016/12/161202103416.htm).
    (Arguably, these factors also pose threats to the traditional
    banking system too - so pick who you'd rather trust: the banks,
    or the community).
