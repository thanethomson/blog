---
title: Making Statik Backwards-Compatible
slug: making-statik-backwards-compatible
summary: >
  Statik, the static web site generator, can now be used with
  Python 2.7+, where it used to only work with Python 3.5+. The latest
  release, v0.8.0, fixes several minor issues. This post documents
  some of the process of making Statik backwards-compatible with
  Python 2.7+.
date: 2016-11-21T15:15:00
tags:
  - statik
  - software
  - projects
---

Up to today, [Statik](https://getstatik.com) only worked with Python
3.5+. As of [v0.8.0](https://github.com/thanethomson/statik/releases/tag/v0.8.0),
it has been tested to work with Python 2.7 (specifically, Python
2.7.12). **Statik** makes use of many Python 3-specific syntax
conventions. One of the best resources I found was the documentation for
the Python [`future`](https://github.com/PythonCharmers/python-future)
library. My main resource there was their [Cheat Sheet: Writing
Python 2-3 compatible code](http://python-future.org/compatible_idioms.html).

## Unicode
The first challenge was to ensure that Python 2 and 3 code both use
Unicode encoding for strings by default. Fortunately, back-porting
Python 3 code to Python 2 code that chooses Unicode strings by default
is pretty easy. Simply include the following import right at the
beginning of your script:

```python
from __future__ import unicode_literals
```

There were several places where this didn't work, however. In one
place I was dynamically creating a Python type using the `type()`
built-in function:

```python
Model = type(
    model.name,   # Threw an exception: requires a string, not a unicode value
    (Base, ),
    model_fields
)
```

In order to fix this, I had to cast this value to a string using the
native `str()` function (not the one from the `builtins` library in
`python-future`, because that one forces the string to Unicode):

```python
Model = type(
    str(model.name),
    (Base, ),
    model_fields
)
```

The other place where this didn't work so well was in my `setup.py`
script, which complained about the `package` field being of the wrong
data type. In this case, I just made sure to leave out the
`unicode_literals` import and let the strings be defined as standard
Python strings. See the [`setup.py`](https://github.com/thanethomson/statik/blob/master/setup.py)
script on GitHub.

## For loops
I like how concise Python 3's for loop iteration is: 

```python
# In Python 3
for key, value in some_dict.items():
    do_something(key, value)
```

Trouble is, according to [Python-Future's cheat sheet](http://python-future.org/compatible_idioms.html#iterating-through-dict-keys-values-items),
this is inefficient in Python 2. I suppose it would have worked, but
I don't like writing code using functions that I know are inefficient
when a more efficient mechanism exists. Therefore, one of the possible
workarounds I used is the following:

```python
from future.utils import iteritems

for key, value in iteritems(some_dict):
    do_something(key, value)
```

## Calling parent class constructors
I was quite sad to do away with Python 3's more elegant syntax
for calling a parent class' constructor:

```python
class ParentClass(object):
    def __init__(self):
        do_something_parenty()

class ChildClass(ParentClass):
    def __init__(self):
        super().__init__()
        do_something_childy()
```

Instead, I had to revert to Python 2's more verbose form, which is
still supported in Python 3:

```python
class ParentClass(object):
    def __init__(self):
        do_something_parenty()

class ChildClass(ParentClass):
    def __init__(self):
        super(ChildClass, self).__init__()
        do_something_childy()
```

## Dynamic Module Imports
Python 3 has really great built-in support for dynamically loading
modules through the [`importlib`](https://docs.python.org/3/library/importlib.html)
library, which was used to dynamically import template tags and filters
for **Statik** projects (added in [this pull request](https://github.com/thanethomson/statik/pull/21)
by [@pztrick](https://github.com/pztrick)).

But how can one achieve this same functionality using Python 2?
Unfortunately, [Python 2's `importlib`](https://docs.python.org/2.7/library/importlib.html)
is a very lightweight wrapper around the `__import__` library, and
doesn't provide nearly as much functionality as Python 3's version. In
the end, I had to make use of the [`six`](https://pythonhosted.org/six/)
library to do Python 2/3 detection and default to the built-in
[`imp`](https://docs.python.org/2/library/imp.html) library in Python
2 (deprecated in Python 3):

```python
import six

if six.PY3:
    import importlib.util
elif six.PY2:
    import imp
   

def import_module(module_name, path):
    """Import the given module from the specified file system path."""
    if six.PY3:
        spec = importlib.util.spec_from_file_location(module_name, path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
    elif six.PY2:
        imp.load_source(module_name, path)
```

This was probably the most obscure part of the porting process (I
suppose it's pretty uncommon to be dynamically loading libraries in
this particular way).

## Travis CI
As an additional plus, I've integrated Statik with
[Travis CI](https://travis-ci.org/) to build the code automatically
as I push to `master`. The great things about Travis CI are that
it's free for open source projects, and it's super easy to build your
Python project against multiple different versions of Python.
See their [Building a Python Project](https://docs.travis-ci.com/user/languages/python/)
guide.

At the time of this writing, I build and run my unit tests against
Python 2.7 and 3.5. This is the `.travis.yml` file at the time of
this writing:

```yml
language: python
python:
  - "2.7"
  - "3.5"
install:
  - "pip install -r requirements.txt"
script:
  - "python -m unittest discover"
```

## Conclusion
It takes quite a bit of work to port a Python 3 project to be
backwards-compatible with Python 2, but it's apparently more difficult
to do it the other way around in certain cases (2 to 3).

I'm just glad **Statik** can now be used in a wider range of projects,
as it can now be embedded into Python 2.7+ projects.

Hope it helps! <i class="fa fa-smile-o"></i>
