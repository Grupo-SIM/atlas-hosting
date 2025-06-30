# wp cache patch

Update a nested value from the cache.

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
: Cache key.

<key-path>...
: The name(s) of the keys within the value to locate the value to patch.

[<value>]
: The new value. If omitted, the value is read from STDIN.

[--group=<group>]
: Method for grouping data within the cache which allows the same key to be used across groups.
---
default: default
---

[--expiration=<expiration>]
 : Define how long to keep the value, in seconds. `0` means as long as possible.
 ---
 default: 0
 ---

[--format=<format>]
: The serialization format for the value.
---
default: plaintext
options:
  - plaintext
  - json
---


