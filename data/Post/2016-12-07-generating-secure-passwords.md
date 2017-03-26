---
title: Generating Secure Passwords
slug: generating-secure-passwords
summary: >
  How does one go about selecting an appropriate password generation
  strategy? After doing a little digging into the topic, and trying
  to refresh my mind on concepts such as information entropy, it
  turns out that some of the most difficult passwords to crack right
  now are simply five randomly selected words from a pretty
  large dictionary of plain English words.
date: 2016-12-07T21:07:00
tags:
  - security
  - software
  - projects
  - passwdgen
---

In looking for a good cross-platform password management solution,
and recently deciding to try [pass](https://www.passwordstore.org/)
for a while, I also had to find myself a nice little password
generation utility. Of course, there are tons of these sorts of
programs available today, but I wanted to really understand what goes
into building a relatively secure password generator. So I
wrote and open-sourced a little Python-based password generator
called [passwdgen](https://github.com/thanethomson/passwdgen) that
you can play around with.

Turns out, all you need is a password like:

```
flusters-rearranges-pituitaries-hallucinating-pokemon
```

As per this [XKCD](http://xkcd.com/936/), this kind of password has a
very high information entropy, and is hilarious to read (who doesn't
love the idea of hallucinating Pokemons?), which makes it far more
memorable than a password like:

```
Lx9d=HnH[}(tk
```

Of course, the reality of generating and storing passwords securely
is far more complex and nuanced than is generally thought, and I wanted
to explore this in a bit more detail.

## Password Cracking
To understand how "secure" a password is, I think it's safe to say
that it requires an understanding of how an attacker would attempt
to crack that password. Obviously, if one of your service providers
is stupid enough to store passwords in the clear and they're hacked,
no matter how high the information entropy of your password is you're
pretty much screwed. Let's assume your password policy doesn't allow for
passwords like [123456](http://money.cnn.com/2016/06/09/technology/twitter-password-common-heist/index.html).

Then, let's assume that you store your passwords in a database as
either a [SHA-256](https://en.wikipedia.org/wiki/SHA-2),
[bcrypt](https://en.wikipedia.org/wiki/Bcrypt),
[scrypt](https://en.wikipedia.org/wiki/Scrypt), or
[PBKDF2](https://en.wikipedia.org/wiki/PBKDF2) hash. It's really
important to store your passwords in a way where it's expensive for
an attacker to attempt to brute-force crack your passwords[^1].

Next, let's assume someone manages to breach your system and steals
your database contents, and they've left with a collection of
upvotes, links to cat pictures and fake news, and usernames with
hashes of passwords. These passwords can now safely, from the comfort
of their own home/data centre/botnet, be lovingly brute-force-massaged
into becoming clear passwords. The process of doing this requires the
attacker to run a huge number of possible password combinations
through the same hashing function that was used to generate the password
hashes in the first place.

And finally, let's assume that your attacker has enough money to
get access to one or more high-end GPUs to attempt the brute-force
attack. [GPUs tend to be far faster at hashing than CPUs](https://blog.codinghorror.com/speed-hashing/).
Let's not get into the problem of quantum computers just yet.

#### The easy case: unsalted SHA-256 with prior knowledge
Read up a little on password
[salting](https://en.wikipedia.org/wiki/Salt_(cryptography)) - it may
just save your ass one day. In a nutshell, it makes hashing any
particular input data take more computing resources than if no
salting process is employed. We'll now dig into what could happen if the
unsalted SHA-256 hashes of your users' passwords get leaked.

Take a quick look at the list of GPUs on
[Coin Police](http://coinpolice.com/gpu/) at the moment. They have
a particular interest in GPUs that can compute SHA-256 hashes quickly,
because it assists in Bitcoin mining. Many of the high-end GPUs, at
the time of this writing, can compute SHA-256 hashes at a rate of
1,000 megahashes per second, which translates into 1,000,000,000,000
(or `10^9`) hashes per second.

Now, our attacker has to pick a particular user's SHA-256 hash to crack
and knows, somehow, that the user generated his password from a
particular dictionary with 71,188 words (like `passwdgen`'s dictionary)
and that the words are joined by hyphens (don't ask how our attacker
knows all of this). The following table represents the difficulty
of cracking a single unsalted SHA-256 hash using a relatively
high-end GPU[^2].

| Words | Permutations                      | Max Time to Crack | Entropy    |
| ----- | --------------------------------- | ----------------- | ---------- |
| 2     | 5,067,660,156                     | 5.07 seconds      | 32.24 bits |
| 3     | 360,746,455,865,016               | 4.175 days        | 48.36 bits |
| 4     | 25,679,736,460,751,163,960        | 814 years         | 64.47 bits |
| 5     | 1,827,986,360,222,110,855,328,640 | 57,965,067 years  | 80.6 bits  |

Here I worked out the [entropy](https://en.wikipedia.org/wiki/Entropy_(information_theory))
of each class of password as follows, along with the number of
possible [permutations](https://en.wikipedia.org/wiki/Permutation)
an attacker would need to test:

```
entropy = log2(71,188) x word_count
permutations = 2 ^ entropy = (n!) / (n - k)!
```

Where `n` = dictionary size (71,188) and `k` = word count. You'll notice
that I calculated the entropy from the perspective of the attacker.
While I agree that, technically, the entropy should be measured by
way of the source generation approach, we're actually more interested
in working out some sort of comparable measure from the perspective of
the attacker. This example happens to show the source entropy, which
corresponds to the attacker's perceived entropy if he has knowledge
about the way in which the password was generated.

But what if the attacker doesn't know anything about how the password
was generated?

#### More difficult: unsalted SHA-256 with no prior knowledge
If an attacker assumes the password could have possibly been generated
from an alphanumeric character set that contains special characters
(94 characters in total, including lowercase and uppercase English
alphabetical characters), the number of possible permutations goes
up exponentially as the length of the password increases.

| Characters | Permutations                    | Max Time to Crack | Entropy    |
| ---------- | ------------------------------- | ----------------- | ---------- |
| 5          | 6,586,922,160                   | 6.59 seconds      | 32.62 bits |
| 8          | 4,488,223,369,069,440           | 51.95 days        | 52 bits    |
| 10         | 32,808,912,827,897,606,400      | 1,040 years       | 64.83 bits |
| 12         | 228,743,740,236,102,111,820,800 | 7,253,416 years   | 77.6 bits  |
| 40         | 4.71E74                         | 1.49E58 years     | 248 bits   |

I included the last example because a password of 5 words in length
could often be around 40 characters in length (including the hyphens
between the words). So if an attacker doesn't know how a password was
generated, and uses a character-based approach to try to break a
five-dictionary-word password, it will take millennia longer with
a single GPU, or even tens of thousands of GPUs.

### Mo' money, fewer problems, in this case
Let's say your attacker has deep pockets and decides to buy or
custom build hundreds or even thousands of GPUs, and wants to crack
a dictionary-based password (with knowledge about the dictionary and
the character used to separate the words). Take a look at how the time
it takes to crack the password drops as you add more GPUs, if you can
distribute the load evenly across all of these GPUs in parallel:

| GPU(s) | 3 Words    | 4 Words    | 5 Words          |
| ------ | ---------- | ---------- | ---------------- |
| 1      | 4.175 days | 814 years  | 57,965,067 years |
| 10     | 10 hours   | 81.4 years | 5,796,507 years  |
| 100    | 1 hour     | 8.1 years  | 579,650 years    |
| 1,000  | 6 minutes  | 9.7 months | 57,965 years     |
| 10,000 | 36 seconds | 29.7 days  | 5,797 years      |

It seems as though a five-word password is still a better bet here
than anything shorter.

#### Using `scrypt` with prior knowledge
Now, let's say we used `scrypt` to hash our passwords, resulting in
a salted hash that takes a [lot of memory](http://security.stackexchange.com/questions/26245/is-bcrypt-better-than-scrypt)
to compute. Again, resorting to the data at our friends at
[Coin Police](http://coinpolice.com/gpu/), we see that the most powerful
GPUs today can calculate `scrypt` hashes at a rate of 1,300 kilohashes
per second[^3], or 1,300,000 hashes per second. Immediately, you'll
notice how the time it takes to crack the particular dictionary-based
password increases significantly:

| Words | Permutations                      | Max Time to Crack    | Entropy    |
| ----- | --------------------------------- | -------------------- | ---------- |
| 2     | 5,067,660,156                     | 1 hour               | 32.24 bits |
| 3     | 360,746,455,865,016               | 8.8 years            | 48.36 bits |
| 4     | 25,679,736,460,751,163,960        | 626,383 years        | 64.47 bits |
| 5     | 1,827,986,360,222,110,855,328,640 | 44,588,513,255 years | 80.6 bits  |

So, as you can see, simply because of the complexity of, and
computational resources required by, the salted hashing algorithm,
it makes it significantly more expensive for an attacker to crack
passwords. Naturally, this sort of advantage would extend to algorithms
such as `bcrypt` and `PBKDF2`.

Generally, the best way to crack passwords stored using these kinds of
algorithms would be to exploit other kinds of weaknesses (like
deep mathematical, algorithmic or technical weaknesses) in the
algorithms themselves, as opposed to brute-force cracking attempts.

## Conclusion
Practically, as you can see from the calculations in the previous
sections, entropy is not the only factor to take into account when
considering password storage. If you have control over the way in
which your passwords are stored, make sure you use a salted hashing
algorithm that's known to be secure. If you don't have control over
the way your password is stored, at least try to use a password with a
high entropy.

If you'd like to calculate the entropy of your password, consider
installing my little utility program
[passwdgen](https://github.com/thanethomson/passwdgen). It's as simple
as doing the following:

```bash
> echo "mypassword" | passwdgen info
```

To generate a password with a specific minimum entropy, simply do the
following:

```bash
# Generate a password with minimum entropy of 80 bits
> passwdgen generate -m 80
```

Finally, I'm perfectly open to the fact that some of my information with
regard to the cryptographic worthiness of certain approaches is
disputed. There's so much to learn with regard to cryptography at
present that it's nearly impossible to keep up with the depth of all of
the latest developments in the field. Please share your insights in
the comments here so everyone can learn!
<i class="fa fa-smile-o"></i>


#### Footnotes
[^1]:
    In information security in general, it seems as though there's
    no such thing as perfect security: all you can do is attempt to
    make it more expensive for them to hack than they can afford.
[^2]:
    Times given indicate the *worst-case scenario*
    as to how long it would take to test all possible passwords in the
    given set of possible permutations, so this means that it could,
    and would, most likely be quicker to crack a particular password than
    the given max time to crack; also, this means that *all* possible
    passwords in the given class can be cracked within the specified
    time frame.
[^3]:
    It is not clear from the statistics as to how many *rounds*
    are employed in `scrypt` hashing operations on GPUs from sites like
    [Coin Police](http://coinpolice.com/gpu/).
