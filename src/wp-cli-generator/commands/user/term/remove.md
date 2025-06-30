# wp user term remove

Remove a term from an object.

### OPTIONS

<id>
: The ID of the object.

<taxonomy>
: The name of the term's taxonomy.

[<term>...]
: The slug of the term or terms to be removed from the object.

[--by=<field>]
: Explicitly handle the term value as a slug or id.
---
default: slug
options:
  - slug
  - id
---

[--all]
: Remove all terms from the object.


