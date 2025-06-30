# wp transient pluck

Get a nested value from a transient.

### OPTIONS

<key>
: Key for the transient.

<key-path>...
: The name(s) of the keys within the value to locate the value to pluck.

[--format=<format>]
: The output format of the value.
---
default: plaintext
options:
  - plaintext
  - json
  - yaml
---

[--network]
: Get the value of a network|site transient. On single site, this is a specially-named cache key. On multisite, this is a global cache (instead of local to the site).


