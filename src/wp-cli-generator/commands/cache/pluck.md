# wp cache pluck

Get a nested value from the cache.

### OPTIONS

<key>
: Cache key.

<key-path>...
: The name(s) of the keys within the value to locate the value to pluck.

[--group=<group>]
: Method for grouping data within the cache which allows the same key to be used across groups.
---
default: default
---

[--format=<format>]
: The output format of the value.
---
default: plaintext
options:
  - plaintext
  - json
  - yaml
---


