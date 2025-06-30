# wp user term add

Add a term to an object.

Append the term to the existing set of terms on the object.

### OPTIONS

<id>
: The ID of the object.

<taxonomy>
: The name of the taxonomy type to be added.

<term>...
: The slug of the term or terms to be added.

[--by=<field>]
: Explicitly handle the term value as a slug or id.
---
default: slug
options:
  - slug
  - id
---


