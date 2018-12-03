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
since I have been getting into those technologies over the past year or so, I
have tended to write more and more software in Go, and am really enjoying it. I
really love the simplicity of the language (once you get over its quirks, like
how the [`GOPATH`](https://golang.org/doc/code.html#GOPATH) works, and
[dependency management](https://golang.github.io/dep/)).

[Elliptic curve
cryptography](https://en.wikipedia.org/wiki/Elliptic-curve_cryptography) (ECC)
seems to be used quite extensively in blockchain applications, and so naturally
digital signatures based on ECC are quite important for message validation.
Validating ECDSA signatures in Golang seems trivial at first, but then one
quickly gets lost down a rabbit hole of cryptography and different data
representation formats. I thought I would document how I personally went about
doing this when transmitting ECDSA signatures in JSON messages, to be validated
using Golang.

Note that this article assumes a basic working knowledge of [public key
cryptography](https://en.wikipedia.org/wiki/Public-key_cryptography), as well as
elliptic curve cryptography. For a great intro to these fields, please see [this
Cloudflare blog
post](https://blog.cloudflare.com/a-relatively-easy-to-understand-primer-on-elliptic-curve-cryptography/).
Also, I am a big fan of the Python programming language, so I will be using
Python extensively here for illustration purposes when constructing signatures,
but then Go to validate them.

**EDIT**: I updated the way that I do the JSON serialisation/deserialisation
in this post based on feedback from [this Reddit
thread](https://www.reddit.com/r/golang/comments/a1s9no/validating_elliptic_curve_signatures_using_golang/easxudg)
to try to make it more secure.

## The Problem
Recently I have had to implement some blockchain-oriented code (built on top of
[Tendermint]([blockchain](https://tendermint.com/))) that cryptographically
validates that a particular user sent a given message. The structure of the
message envelope (`envelope`) is something like the following, where the
structure of the `message` and `transaction` fields could vary from message to
message:

```json
{
    "message": {
        "type": "transactionType",
        "userId": 123,
        "transaction": {
            "amount": 10123.50
        }
    },
    "signature": "...ECDSA signature..."
}
```

The reason why we only have a `message` and `signature` field in our `envelope`
is that we need to be able to validate the signature against **raw bytes**. For
this, we will use the raw bytes of the `message` field prior to JSON
deserialisation.

What we ultimately want is a way of validating that the user with ID
`envelope.message.userId` actually did generate this message and the
cryptographic signature in `envelope.signature`. To do this, we define (in
pseudocode) the function `validateSignature`, which returns a boolean value:

```javascript
isValid = validateSignature(
    user.publicKey,
    envelope.message,
    envelope.signature
)
```

Of course, the generation of the signature in the first place must take place by
way of a function roughly like the following:

```javascript
envelope.signature = computeSignature(
    user.privateKey,
    envelope.message
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
    sha256(envelope.message)
)

// For validating the ECDSA signature
isValid = validateSignature(
    user.publicKey,
    sha256(envelope.message),
    envelope.signature
)
```

This is because one generally seems to compute ECDSA signatures from message
hashes as opposed to the entire message, and in this case we are using the
SHA256 algorithm for computing the hash of the most important fields in the
message.

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
Let's say our message envelope looks as follows:

```json
{
    "message": {
        "type": "issueTx",
        "userId": 1,
        "transaction": {
            "amount": 10123.50
        }
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

# we have 2 levels of indentation because this is precisely how Golang would
# extract it into the json.RawMessage field
envelope = """{
        "type": "issueTx",
        "userId": 1,
        "transaction": {
            "amount": 10123.50
        }
    }"""

h = hashlib.sha256()
# the .encode("utf-8") is to convert from a Python string to raw bytes
h.update(envelope.encode("utf-8"))

# print out the hexadecimal version of the digest
print(h.hexdigest())
# should print:
# 47b17caac45041a19dc8b03921389c55756d9719ad091125ef8f139b99becb96

# print out the binary version of the digest (this is what we really want)
print(h.digest())
# should print:
# b'G\xb1|\xaa\xc4PA\xa1\x9d\xc8\xb09!8\x9cUum\x97\x19\xad\t\x11%\xef\x8f\x13\x9b\x99\xbe\xcb\x96'
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
msg_sha256_hash = b'G\xb1|\xaa\xc4PA\xa1\x9d\xc8\xb09!8\x9cUum\x97\x19\xad\t\x11%\xef\x8f\x13\x9b\x99\xbe\xcb\x96'
# compute the signature! (and convert to DER format)
sig = sk.sign_digest(
    msg_sha256_hash,
    sigencode=ecdsa.util.sigencode_der,
)
print(sig)
# on my machine, with my key:
# b'0E\x02 \x19(\xa3\x11\xb6\xb8V^HG\x9a\x7f\x95\xe1\xe6\x15\x8b\xc5\xc2\x863\x10\x99\xcd\xf9\xcf\xb2\x13\xa1\xdbl\xb6\x02!\x00\xc1R\xc0hh\\qK\xfcR\x18\x02\xdb\xddj5kq\xacf\xb0_jO\xb0\x8e\xd4P\x0f\xfb@\xb3'
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
sig = b'0E\x02 \x19(\xa3\x11\xb6\xb8V^HG\x9a\x7f\x95\xe1\xe6\x15\x8b\xc5\xc2\x863\x10\x99\xcd\xf9\xcf\xb2\x13\xa1\xdbl\xb6\x02!\x00\xc1R\xc0hh\\qK\xfcR\x18\x02\xdb\xddj5kq\xacf\xb0_jO\xb0\x8e\xd4P\x0f\xfb@\xb3'
# parse the ASN.1 sequence from this signature
seq = Sequence.load(sig)
# print the native (Pythonic) representation of this ASN.1 object
print(seq.native)
# on my machine, prints:
# OrderedDict([('0', 11379620559389084367780510252548132663400275028223528508518721806165041966262), ('1', 87442589186005784642307971049779867575540489022841522355105800395127625826483)])

# print out the key/value pairs embedded in the sequence in hexadecimal
for k, v in seq.native.items():
    print("%s => %X" % (k, v))
# on my machine, prints:
# 0 => 1928A311B6B8565E48479A7F95E1E6158BC5C286331099CDF9CFB213A1DB6CB6
# 1 => C152C068685C714BFC521802DBDD6A356B71AC66B05F6A4FB08ED4500FFB40B3
```

### Inspect the Signature (OpenSSL)
Alternatively, if we want to inspect the signature using OpenSSL, because it's
already encoded in DER format, simply do the following from Python:

```python
# write our ECDSA signature from earlier to the file "signature.der"
with open("signature.der", "wb") as f:
    f.write(b'0E\x02 \x19(\xa3\x11\xb6\xb8V^HG\x9a\x7f\x95\xe1\xe6\x15\x8b\xc5\xc2\x863\x10\x99\xcd\xf9\xcf\xb2\x13\xa1\xdbl\xb6\x02!\x00\xc1R\xc0hh\\qK\xfcR\x18\x02\xdb\xddj5kq\xacf\xb0_jO\xb0\x8e\xd4P\x0f\xfb@\xb3')
```

And then from BASH:

```bash
> openssl asn1parse -inform DER -in signature.der
    0:d=0  hl=2 l=  69 cons: SEQUENCE          
    2:d=1  hl=2 l=  32 prim: INTEGER           :1928A311B6B8565E48479A7F95E1E6158BC5C286331099CDF9CFB213A1DB6CB6
   36:d=1  hl=2 l=  33 prim: INTEGER           :C152C068685C714BFC521802DBDD6A356B71AC66B05F6A4FB08ED4500FFB40B3
```

Compare the hexadecimal representation of these two components to the two
printed earlier from Python - you will see that they are precisely the same.

### Base64-Encode the Signature for Transmission
To be able to send this binary data across to our Golang application, however,
we are going to need to encode it in such a way as to be able to encapsulate it
in a JSON message. The easiest way to do this is to
[Base64](https://en.wikipedia.org/wiki/Base64)-encode it. This is a trivial task
using Python:

```python
import base64

# our ECDSA signature from earlier
sig = b'0E\x02 \x19(\xa3\x11\xb6\xb8V^HG\x9a\x7f\x95\xe1\xe6\x15\x8b\xc5\xc2\x863\x10\x99\xcd\xf9\xcf\xb2\x13\xa1\xdbl\xb6\x02!\x00\xc1R\xc0hh\\qK\xfcR\x18\x02\xdb\xddj5kq\xacf\xb0_jO\xb0\x8e\xd4P\x0f\xfb@\xb3'
# now base64-encode the signature
b64sig = base64.b64encode(sig)
print(b64sig)
# on my machine, prints:
# b'MEUCIBkooxG2uFZeSEeaf5Xh5hWLxcKGMxCZzfnPshOh22y2AiEAwVLAaGhccUv8UhgC291qNWtxrGawX2pPsI7UUA/7QLM='
```

### Final Envelope Structure
The final envelope therefore will look something like this:

```json
{
    "message": {
        "type": "issueTx",
        "userId": 1,
        "transaction": {
            "amount": 10123.50
        }
    },
    "signature": "MEUCIBkooxG2uFZeSEeaf5Xh5hWLxcKGMxCZzfnPshOh22y2AiEAwVLAaGhccUv8UhgC291qNWtxrGawX2pPsI7UUA/7QLM="
}
```

## Validating the Signature from Golang
Assuming that all our Golang application is going to receive from the user is
just the above JSON message payload, and no other authentication information,
here is how we would validate it:

```go
package messaging

import (
    "crypto/ecdsa"
    "crypto/sha256"
    "encoding/asn1"
    "encoding/base64"
    "encoding/json"
    "errors"
    "math/big"
)

// Represents the two mathematical components of an ECDSA signature once
// decomposed.
type ECDSASignature struct {
    R, S *big.Int
}

// Encapsulates the overall message we're trying to decode and validate.
type Envelope struct {
    RawMessage json.RawMessage `json:"message"`
    Message    interface{}     `json:"-"`
    Signature  string          `json:"signature"`
}

// The body of the message to be contained in the Message field of our Envelope
// structure.
type MessageBody struct {
    Type        string          `json:"type"`
    UserID      uint32          `json:"userId"`
    Transaction json.RawMessage `json:"transaction"`
}

// Helper function to compute the SHA256 hash of the given string of bytes.
func hash(b []byte) []byte {
    h := sha256.New()
    // hash the body bytes
    h.Write(b)
    // compute the SHA256 hash
    return h.Sum(nil)
}

// Attempts to create a new envelope structure from the given JSON string.
func NewEnvelopeFromJSON(s string) (*Envelope, error) {
    var e Envelope
    if err := json.Unmarshal([]byte(s), &e); err != nil {
        return nil, err
    }
    // now attempt to unmarshal the message body itself from the raw message
    var body MessageBody
    if err := json.Unmarshal(e.RawMessage, &body); err != nil {
        return nil, err
    }
    e.Message = body
    return &e, nil
}

// The central validation routine that validates this message against the given
// public key. On success, returns nil, on failure returns a relevant error.
func (e *Envelope) Validate(publicKey *ecdsa.PublicKey) error {
    // first decode the signature to extract the DER-encoded byte string
    der, err := base64.StdEncoding.DecodeString(e.Signature)
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
    // compute the SHA256 hash of our message
    h := hash(e.RawMessage)
    // validate the signature!
    valid := ecdsa.Verify(
        publicKey,
        h,
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
    "encoding/pem"
    "errors"
    "testing"
)

const (
    TestPublicKey string = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAElk30LFnrF48XLeEHrG3K/r7215xg
gOEmGeRDdJ7f86ByD7uK/Jxje79Jtn9HNjyQahd7bBBKUOfcWG3Kh927oA==
-----END PUBLIC KEY-----`

    // NB: make sure to use SPACES here in the test message instead of tabs,
    // otherwise validation will fail
    TestMessage string = `{
    "message": {
        "type": "issueTx",
        "userId": 1,
        "transaction": {
            "amount": 10123.50
        }
    },
    "signature": "MEUCIBkooxG2uFZeSEeaf5Xh5hWLxcKGMxCZzfnPshOh22y2AiEAwVLAaGhccUv8UhgC291qNWtxrGawX2pPsI7UUA/7QLM="
}`
)

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

func TestEnvelopeValidation(t *testing.T) {
    // our test message
    envelope, err := NewEnvelopeFromJSON(TestMessage)
    if err != nil {
        t.Error("Expected to be able to deserialise test message, but failed with err =", err)
    }
    // extract the public key from the test key string
    publicKey, err := loadPublicKey(TestPublicKey)
    if err != nil {
        t.Error("Failed to parse test public key:", err)
    }
    // now we validate the signature against the public key
    if err := envelope.Validate(publicKey); err != nil {
        t.Error("Expected nil error from message envelope validation routine, but got:", err)
    }
}
```

And voilà! You have yourself a tested ECDSA signature validation mechanism in
Golang for JSON messages. It should be relatively straightforward from this
point on to extend this example to different kinds of JSON messages.

For a great example of how to dynamically unmarshal JSON using Golang, see [this
post](http://eagain.net/articles/go-dynamic-json/).

