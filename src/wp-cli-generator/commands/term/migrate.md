# wp term migrate

Migrate a term of a taxonomy to another taxonomy.

### OPTIONS

<term>
: Slug or ID of the term to migrate.

[--by=<field>]
: Explicitly handle the term value as a slug or id.
---
default: id
options:
  - slug
  - id
---

[--from=<taxonomy>]
: Taxonomy slug of the term to migrate.

[--to=<taxonomy>]
: Taxonomy slug to migrate to.

### EXAMPLES

    # Migrate a category's term (video) to tag taxonomy.
    $ wp term migrate 9190 --from=category --to=post_tag
    Term 'video' assigned to post 1155.
    Term 'video' migrated.
    Old instance of term 'video' removed from its original taxonomy.
    Success: Migrated the term 'video' from taxonomy 'category' to taxonomy 'post_tag' for 1 post.


