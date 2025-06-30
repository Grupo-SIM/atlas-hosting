# wp transient patch

Update a nested value from a transient.

### OPTIONS

<action>
: Patch action to perform.
---
options:
  - insert
  - update
  - delete
---

<key>
: Key for the transient.

<key-path>...
: The name(s) of the keys within the value to locate the value to patch.

[<value>]
: The new value. If omitted, the value is read from STDIN.

[--format=<format>]
: The serialization format for the value.
---
default: plaintext
options:
  - plaintext
  - json
---

[--expiration=<expiration>]
: Time until expiration, in seconds.

[--network]
: Get the value of a network|site transient. On single site, this is a specially-named cache key. On multisite, this is a global cache (instead of local to the site).


