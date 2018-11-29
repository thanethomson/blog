---
title: ECDSA Signatures in Go
slug: ecdsa-signatures-go
summary: >
  How to construct ECDSA signatures with OpenSSL and Python, and then validate
  them using Golang's built-in cryptographic libraries.
date: "2018-11-30 08:00"
tags:
  - software
  - cryptography
  - go
---

The [Go](https://golang.org/) programming language is widely used in the
[Kubernetes](https://kubernetes.io) and blockchain communities. So naturally,
since I've been getting into those technologies over the past year or so, I've
tended to write more and more software in Go, and I'm really enjoying it. I
really love the simplicity of the language (once you get over its quirks, like
how the [`GOPATH`](https://golang.org/doc/code.html#GOPATH) works, and
[dependency management](https://golang.github.io/dep/)).

Note that this article assumes a basic working knowledge of [public key
cryptography](https://en.wikipedia.org/wiki/Public-key_cryptography), as well as
[elliptic curve
cryptography](https://en.wikipedia.org/wiki/Elliptic-curve_cryptography). For a
great basic intro to these fields, please see [this Cloudflare blog
post](https://blog.cloudflare.com/a-relatively-easy-to-understand-primer-on-elliptic-curve-cryptography/).

I'm also a big Python fan, so I'll be using Python extensively here for
illustration purposes when constructing signatures, but then Go to validate
them.

## The Problem
Most recently, I've had to implement some blockchain-oriented code (built on top
of [Tendermint]([blockchain](https://tendermint.com/))) that cryptographically
validates that a particular user sent a given message. The structure of the
message (`msg`) is something like the following, where the structure of the
`body` field could vary from message to message:

```json
{
    "type": "messageType",
    "userId": 123,
    "body": {
        "hello": "world"
    },
    "signature": "...ECDSA signature..."
}
```

What we want is a way of validating that the user with ID `msg.userId`
actually did generate this message and the cryptographic signature in
`msg.signature`. To do this, we define (in pseudocode) the function
`validateSignature`[^1] which returns a boolean value:

```javascript
isValid = validateSignature(
    msg.signature,
    msg.type,
    msg.userId,
    msg.body,
    user.publicKey
)
```

Of course, the generation of the signature in the first place must take place by
way of a function roughly like the following:

```javascript
msg.signature = computeSignature(
    msg.type,
    msg.userId,
    msg.body,
    user.privateKey
)
```

Here there must be some client-side mechanism whereby the user generates a
signature using their private key.

## Elliptic Curve DSA
The [Elliptic Curve Digital Signature
Algorithm](https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm)
is a great way at present to cryptographically sign a message. Here we basically
expand our `computeSignature` pseudocode above into the following rough algorithm:

```
signature = ecdsa(
    sha256(
        msg.type,
        msg.userId,
        msg.body
    ),
    user.privateKey
)
```

This is because one generally seems to compute ECDSA signatures from message
hashes as opposed to the entire message, and in this case we're using the SHA256
algorithm for computing the hash of the most important fields in the message.

## Generating Keys
Before we do anything else, we need our user to have an elliptic curve
public/private key pair. For this, we'll use OpenSSL:

```bash
# Generate the private key in PEM format
> openssl ecparam -name prime256v1 -genkey -noout -out user1.key

# Generate the public key from the private key, also in PEM format
> openssl ec -in user1.key -pubout -out user1.pub
```

## Our Message
Let's say our message object looks as follows:

```json
{
    "type": "issueTx",
    "userId": 1,
    "body": {
        "amount": 10123.40
    }
}
```

To compute the SHA256 hash of the message, I would run a trusty old Python repl
and use the [hashlib](https://docs.python.org/3/library/hashlib.html) library:

```python
import hashlib
import struct
import json

msg = {
    "type": "issueTx",
    "userId": 1,
    "body": {
        "amount": 10123.40
    }
}

h = hashlib.sha256()
# the .encode("utf-8") is to convert from a Python string to raw bytes
h.update(msg["type"].encode("utf-8"))
# assume we're packing 32-bit unsigned integers in here in big endian
h.update(struct.pack(">L", msg["userId"]))
# hash a JSON string representation of the body, whose structure could vary
h.update(json.dumps(msg["body"]).encode("utf-8"))

# print out the hexadecimal version of the digest
print(h.hexdigest())
# should print:
# b2ae5865b2c837c042dbdac0d73933c23296ce85af3cd6283e8b3a4c9786ca8b

# print out the binary version of the digest (this is what we really want)
print(h.digest())
# should print:
# b'\xb2\xaeXe\xb2\xc87\xc0B\xdb\xda\xc0\xd793\xc22\x96\xce\x85\xaf<\xd6(>\x8b:L\x97\x86\xca\x8b'
```

What we actually want now, however, is the ECDSA signature computed from the
above hash and the user's private key. For this, there's a cool Python library
called [python-ecdsa](https://github.com/warner/python-ecdsa):

```python
import ecdsa

# load the private/signing key from the key we generated earlier using OpenSSL
sk = ecdsa.SigningKey.from_pem(open("user1.key").read())
# use the hash from earlier to compute the signature
msg_sha256_hash = b'\xb2\xaeXe\xb2\xc87\xc0B\xdb\xda\xc0\xd793\xc22\x96\xce\x85\xaf<\xd6(>\x8b:L\x97\x86\xca\x8b'
# compute the signature!
sig = sk.sign_digest(
    msg_sha256_hash,
    sigencode=ecdsa.util.sigencode_der,
)
print(sig)
# on my machine, with my key:
# b'0F\x02!\x00\xcf/\r\r #=6\xe9\x18\xf8\xd3\xd2\xd2K]R\x80"P-\x13k\x19\x7fB\x94\x87h\xa3\x93a\x02!\x00\xd6\x88\xaa\xdb\xb2\xcd\xcb\x9dO\xd8\xb8\x8d\x0f\xa6\xc1\xadU\x13\xb2Ha\xd7Q\xb3.\x94\xfaMp)W\x98'
```

The `sig` variable above will be a binary string encoded using
[DER](https://en.wikipedia.org/wiki/X.690) encoding. Technically, the signature
actually has 2 components to it - understanding this is critical to being able
to decode the signature later on from your Go code.

For now, using the [asn1crypto](https://github.com/wbond/asn1crypto/) library
from Python, we can easily decode the two numbers from the above signature:

```python
from asn1crypto.core import Sequence

# our ECDSA signature from earlier
sig = b'0F\x02!\x00\xcf/\r\r #=6\xe9\x18\xf8\xd3\xd2\xd2K]R\x80"P-\x13k\x19\x7fB\x94\x87h\xa3\x93a\x02!\x00\xd6\x88\xaa\xdb\xb2\xcd\xcb\x9dO\xd8\xb8\x8d\x0f\xa6\xc1\xadU\x13\xb2Ha\xd7Q\xb3.\x94\xfaMp)W\x98'
# parse the ASN.1 sequence from this signature
seq = Sequence.load(sig)
# print the native (Pythonic) representation of this ASN.1 object
print(seq.native)
# on my machine, prints:
# OrderedDict([('0', 93711891545347031273226189377946569688579597979839532937904091718102313833313), ('1', 97036420017566389104000357856189024451674129190139560452435242258984432392088)])
```

#### Footnotes
[^1]:
    One of the assumptions here is that my system can look up a user's public
    key from a database somewhere, based on the user ID. Also, to meet the
    [determinism](https://tendermint.com/docs/spec/abci/abci.html#determinism)
    requirements of Tendermint, the best way I can come up with right now to
    handle message authentication is to include the claimed source user ID in
    the message body itself. The assumption here is that updates to users'
    public keys will also end up being stored on the blockchain.
