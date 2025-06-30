# wp post term set

Set object terms.

Replaces existing terms on the object.

### OPTIONS

<id>
: The ID of the object.

<taxonomy>
: The name of the taxonomy type to be updated.

<term>...
: The slug of the term or terms to be updated.

[--by=<field>]
: Explicitly handle the term value as a slug or id.
---
default: slug
options:
  - slug
  - id
---


