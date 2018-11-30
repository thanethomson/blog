---
title: Validating ECDSA Signatures in Golang
slug: validating-ecdsa-signatures-golang
summary: >
  Elliptic curve cryptography (ECC) seems to be used quite extensively in
  blockchain applications, and so naturally digital signatures based on ECC are
  quite important for message validation. Validating ECDSA signatures in Golang
  seems trivial at first, but then one quickly gets lost down a rabbit hole of
  cryptography and different data representation formats. I thought I'd document
  how I personally went about doing this when transmitting ECDSA signatures in
  JSON messages, to be validated using Golang.
date: "2018-11-30 15:00"
tags:
  - software
  - cryptography
  - go
  - golang
show-toc: true
---

The [Go](https://golang.org/) programming language is widely used in the
[Kubernetes](https://kubernetes.io) and blockchain communities. So naturally,
since I've been getting into those technologies over the past year or so, I've
tended to write more and more software in Go, and I'm really enjoying it. I
really love the simplicity of the language (once you get over its quirks, like
how the [`GOPATH`](https://golang.org/doc/code.html#GOPATH) works, and
[dependency management](https://golang.github.io/dep/)).

[Elliptic curve
cryptography](https://en.wikipedia.org/wiki/Elliptic-curve_cryptography) (ECC)
seems to be used quite extensively in blockchain applications, and so naturally
digital signatures based on ECC are quite important for message validation.
Validating ECDSA signatures in Golang seems trivial at first, but then one
quickly gets lost down a rabbit hole of cryptography and different data
representation formats. I thought I'd document how I personally went about doing
this when transmitting ECDSA signatures in JSON messages, to be validated using
Golang.

Note that this article assumes a basic working knowledge of [public key
cryptography](https://en.wikipedia.org/wiki/Public-key_cryptography), as well as
elliptic curve cryptography.[^1] Also, I'm a big fan of the Python programming
language, so I'll be using Python extensively here for illustration purposes
when constructing signatures, but then Go to validate them.

## The Problem
Recently I've had to implement some blockchain-oriented code (built on top of
[Tendermint]([blockchain](https://tendermint.com/))) that cryptographically
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
`validateSignature`[^2] which returns a boolean value:

```javascript
isValid = validateSignature(
    user.publicKey,
    msg.type,
    msg.userId,
    msg.body,
    msg.signature
)
```

Of course, the generation of the signature in the first place must take place by
way of a function roughly like the following:

```javascript
msg.signature = computeSignature(
    user.privateKey,
    msg.type,
    msg.userId,
    msg.body
)
```

The major questions/problems I ran into while trying to implement this were:

1. **How do I represent ECDSA signatures in my JSON messages?**
2. **How do I generate reliable test data to test my Golang ECDSA message
   validation?** I didn't want to write the generation code in Golang, because
   it increased the chances of me making mistakes.

To answer the first question, I first needed to understand the ECDSA algorithm a
little and how it's practically used, as well as how other tools (like OpenSSL)
represent these signatures. It wasn't easy at all to find this sort of
information directly - I had to stumble upon it while hunting through
somewhat-related StackOverflow posts.

To answer the second one, I used a combination of OpenSSL and Python, where
there are some really cool libraries available for Python to handle ECDSA
signatures.

## Elliptic Curve DSA
The [Elliptic Curve Digital Signature
Algorithm](https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm)
is a great way at present to cryptographically sign a message. Here we basically
expand our `computeSignature` pseudocode above into the following rough algorithms:

```javascript
// For generating the ECDSA signature
signature = ecdsa(
    user.privateKey,
    sha256(
        msg.type,
        msg.userId,
        msg.body
    )
)

// For validating the ECDSA signature
isValid = validateSignature(
    user.publicKey,
    sha256(
        msg.type,
        msg.userId,
        msg.body
    ),
    msg.signature
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

# Take a look at our private key
> cat user1.key
-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIAXeS0XjNT5e6mWvINNLJC1rpwdyIcgExxiF7oeDTFPboAoGCCqGSM49
AwEHoUQDQgAElk30LFnrF48XLeEHrG3K/r7215xggOEmGeRDdJ7f86ByD7uK/Jxj
e79Jtn9HNjyQahd7bBBKUOfcWG3Kh927oA==
-----END EC PRIVATE KEY-----

# Take a look at our public key
> cat user1.pub
-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAElk30LFnrF48XLeEHrG3K/r7215xg
gOEmGeRDdJ7f86ByD7uK/Jxje79Jtn9HNjyQahd7bBBKUOfcWG3Kh927oA==
-----END PUBLIC KEY-----
```

## Building Our Message
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

### Hash it!
To quickly compute the SHA256 hash of the message, I would run a trusty old
Python repl and use the
[hashlib](https://docs.python.org/3/library/hashlib.html) library:

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

### Generate the Signature
What we actually want now, however, is the ECDSA signature computed from the
above hash and the user's private key. For this, there's a cool Python library
called [python-ecdsa](https://github.com/warner/python-ecdsa):

```python
import ecdsa

# load the private/signing key from the key we generated earlier using OpenSSL
sk = ecdsa.SigningKey.from_pem(open("user1.key").read())
# use the hash from earlier to compute the signature
msg_sha256_hash = b'\xb2\xaeXe\xb2\xc87\xc0B\xdb\xda\xc0\xd793\xc22\x96\xce\x85\xaf<\xd6(>\x8b:L\x97\x86\xca\x8b'
# compute the signature! (and convert to DER format)
sig = sk.sign_digest(
    msg_sha256_hash,
    sigencode=ecdsa.util.sigencode_der,
)
print(sig)
# on my machine, with my key:
# b'0F\x02!\x00\xcf/\r\r #=6\xe9\x18\xf8\xd3\xd2\xd2K]R\x80"P-\x13k\x19\x7fB\x94\x87h\xa3\x93a\x02!\x00\xd6\x88\xaa\xdb\xb2\xcd\xcb\x9dO\xd8\xb8\x8d\x0f\xa6\xc1\xadU\x13\xb2Ha\xd7Q\xb3.\x94\xfaMp)W\x98'
```

### Inspect the Signature (Python)
The `sig` variable above will be a binary string encoded using
[DER](https://en.wikipedia.org/wiki/X.690) encoding. Technically, the signature
actually has 2 components to it - understanding this is critical to being able
to decode the signature later on from your Go code. For now, using the
[asn1crypto](https://github.com/wbond/asn1crypto/) library for Python, we can
easily decode the two numbers from the above signature:

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

# print out the key/value pairs embedded in the sequence in hexadecimal
for k, v in seq.native.items():
    print("%s => %X" % (k, v))
# on my machine, prints:
# 0 => CF2F0D0D20233D36E918F8D3D2D24B5D528022502D136B197F42948768A39361
# 1 => D688AADBB2CDCB9D4FD8B88D0FA6C1AD5513B24861D751B32E94FA4D70295798
```

### Inspect the Signature (OpenSSL)
Alternatively, if we want to inspect the signature using OpenSSL, because it's
already encoded in DER format, simply do the following from Python:

```python
# write our ECDSA signature from earlier to the file "signature.der"
with open("signature.der", "wb") as f:
    f.write(b'0F\x02!\x00\xcf/\r\r #=6\xe9\x18\xf8\xd3\xd2\xd2K]R\x80"P-\x13k\x19\x7fB\x94\x87h\xa3\x93a\x02!\x00\xd6\x88\xaa\xdb\xb2\xcd\xcb\x9dO\xd8\xb8\x8d\x0f\xa6\xc1\xadU\x13\xb2Ha\xd7Q\xb3.\x94\xfaMp)W\x98')
```

And then from BASH:

```bash
> openssl asn1parse -inform DER -in signature.der
    0:d=0  hl=2 l=  70 cons: SEQUENCE          
    2:d=1  hl=2 l=  33 prim: INTEGER           :CF2F0D0D20233D36E918F8D3D2D24B5D528022502D136B197F42948768A39361
   37:d=1  hl=2 l=  33 prim: INTEGER           :D688AADBB2CDCB9D4FD8B88D0FA6C1AD5513B24861D751B32E94FA4D70295798
```

Compare the hexadecimal representation of these two components to the two
printed earlier from Python - you'll see that they're precisely the same.

### Base64-Encode the Signature for Transmission
To be able to send this binary data across to our Golang application, however,
we're going to need to encode it in such a way as to be able to encapsulate it
in a JSON message. The easiest way to do this is to
[Base64](https://en.wikipedia.org/wiki/Base64)-encode it. In Python it's really
easy:

```python
import base64

# our ECDSA signature from earlier
sig = b'0F\x02!\x00\xcf/\r\r #=6\xe9\x18\xf8\xd3\xd2\xd2K]R\x80"P-\x13k\x19\x7fB\x94\x87h\xa3\x93a\x02!\x00\xd6\x88\xaa\xdb\xb2\xcd\xcb\x9dO\xd8\xb8\x8d\x0f\xa6\xc1\xadU\x13\xb2Ha\xd7Q\xb3.\x94\xfaMp)W\x98'
# now base64-encode the signature
b64sig = base64.b64encode(sig)
print(b64sig)
# on my machine, prints:
# b'MEYCIQDPLw0NICM9NukY+NPS0ktdUoAiUC0Taxl/QpSHaKOTYQIhANaIqtuyzcudT9i4jQ+mwa1VE7JIYddRsy6U+k1wKVeY'
```

### Final Message Structure
The final message therefore will look something like this:

```json
{
    "type": "issueTx",
    "userId": 1,
    "body": {
        "amount": 10123.40
    },
    "signature": "MEYCIQDPLw0NICM9NukY+NPS0ktdUoAiUC0Taxl/QpSHaKOTYQIhANaIqtuyzcudT9i4jQ+mwa1VE7JIYddRsy6U+k1wKVeY"
}
```

## Validating the Signature from Golang
Assuming that all our Golang application is going to receive from the user is
just the above JSON message payload, and no other authentication information,
here's how we'd validate it:

```go
package messaging

import (
    "crypto/ecdsa"
    "crypto/sha256"
    "encoding/asn1"
    "encoding/base64"
    "encoding/binary"
    "encoding/json"
    "errors"
    "math/big"
)

// Represents the two mathematical components of an ECDSA signature once
// decomposed.
type ECDSASignature struct {
    R, S *big.Int
}

// Encapsulates the message we're trying to decode and validate.
type Message struct {
    Type      string          `json:"type"`
    UserID    uint32          `json:"userId"`
    Body      json.RawMessage `json:"body"`
    Signature string          `json:"signature"`
}

// Computes the SHA256 hash of the message so we can validate the signature.
func (m *Message) hash() []byte {
    h := sha256.New()
    // hash the message type
    h.Write([]byte(m.Type))
    // convert the user ID into a 4-byte big endian-encoded byte string
    b := make([]byte, 4)
    binary.BigEndian.PutUint32(b, m.UserID)
    h.Write(b)
    // hash the body of the message
    if m.Body != nil && len(m.Body) > 0 {
        h.Write(m.Body)
    }
    // compute the SHA256 hash
    return h.Sum(nil)
}

// The central validation routine that validates this message against the given
// public key. On success, returns nil, on failure returns a relevant error.
func (m *Message) Validate(publicKey *ecdsa.PublicKey) error {
    // first decode the signature to extract the DER-encoded byte string
    der, err := base64.StdEncoding.DecodeString(m.Signature)
    if err != nil {
        return err
    }
    // unmarshal the R and S components of the ASN.1-encoded signature into our
    // signature data structure
    sig := &ECDSASignature{}
    _, err = asn1.Unmarshal(der, sig)
    if err != nil {
        return err
    }
    // validate the signature!
    valid := ecdsa.Verify(
        publicKey,
        m.hash(), // compute the SHA256 hash of our message
        sig.R,
        sig.S,
    )
    if !valid {
        return errors.New("Signature validation failed")
    }
    // signature is valid
    return nil
}
```

## Testing Our Signature Validation
To test the signature validation, we need to write a simple unit test using the
public key we generated with OpenSSL, along with the test data we generated from
our Python scripts above.

```go
package messaging

import (
    "crypto/ecdsa"
    "crypto/x509"
    "encoding/json"
    "encoding/pem"
    "errors"
    "testing"
)

const TestPublicKey string = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAElk30LFnrF48XLeEHrG3K/r7215xg
gOEmGeRDdJ7f86ByD7uK/Jxje79Jtn9HNjyQahd7bBBKUOfcWG3Kh927oA==
-----END PUBLIC KEY-----`

func loadPublicKey(publicKey string) (*ecdsa.PublicKey, error) {
    // decode the key, assuming it's in PEM format
    block, _ := pem.Decode([]byte(publicKey))
    if block == nil {
        return nil, errors.New("Failed to decode PEM public key")
    }
    pub, err := x509.ParsePKIXPublicKey(block.Bytes)
    if err != nil {
        return nil, errors.New("Failed to parse ECDSA public key")
    }
    switch pub := pub.(type) {
    case *ecdsa.PublicKey:
        return pub, nil
    }
    return nil, errors.New("Unsupported public key type")
}

func TestMsgEnvelopeValidation(t *testing.T) {
    // our test message
    msg := &Message{
        Type:      "issueTx",
        UserID:    1,
        Body:      json.RawMessage(`{"amount": 10123.4}`),
        Signature: "MEYCIQDPLw0NICM9NukY+NPS0ktdUoAiUC0Taxl/QpSHaKOTYQIhANaIqtuyzcudT9i4jQ+mwa1VE7JIYddRsy6U+k1wKVeY",
    }
    // extract the public key from the test key string
    publicKey, err := loadPublicKey(TestPublicKey)
    if err != nil {
        t.Error("Failed to parse test public key:", err)
    }
    // now we validate the signature against the public key
    if err := msg.Validate(publicKey); err != nil {
        t.Error("Expected nil error from message envelope validation routine, but got:", err)
    }
}
```

And voilà! You've got yourself a tested ECDSA signature validation mechanism in
Golang. Of course, the body validation here is very fragile, since changing a
single character in the body of the message will necessarily affect its SHA256
hash, and therefore its signature. But I'm sure you get the picture.

#### Footnotes
[^1]:
    For a great basic intro to these fields, please see [this Cloudflare blog
    post](https://blog.cloudflare.com/a-relatively-easy-to-understand-primer-on-elliptic-curve-cryptography/).
[^2]: One of the assumptions here is that my system can look up a
    user's public key from a database somewhere, based on the user ID. Also, to
    meet the
    [determinism](https://tendermint.com/docs/spec/abci/abci.html#determinism)
    requirements of Tendermint, the best way I can come up with right now to
    handle message authentication is to include the claimed source user ID in
    the message body itself. The assumption here is that updates to users'
    public keys will also end up being stored on the blockchain.
