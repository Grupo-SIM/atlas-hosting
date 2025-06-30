# wp post generate

Generates some posts.

Creates a specified number of new posts with dummy data.

### OPTIONS

[--count=<number>]
: How many posts to generate?
---
default: 100
---

[--post_type=<type>]
: The type of the generated posts.
---
default: post
---

[--post_status=<status>]
: The status of the generated posts.
---
default: publish
---

[--post_title=<post_title>]
: The post title.
---
default:
---

[--post_author=<login>]
: The author of the generated posts.
---
default:
---

[--post_date=<yyyy-mm-dd-hh-ii-ss>]
: The date of the post. Default is the current time.

[--post_date_gmt=<yyyy-mm-dd-hh-ii-ss>]
: The date of the post in the GMT timezone. Default is the value of --post_date.

[--post_content]
: If set, the command reads the post_content from STDIN.

[--max_depth=<number>]
: For hierarchical post types, generate child posts down to a certain depth.
---
default: 1
---

[--format=<format>]
: Render output in a particular format.
---
default: progress
options:
  - progress
  - ids
---

### EXAMPLES

    # Generate posts.
    $ wp post generate --count=10 --post_type=page --post_date=1999-01-04
    Generating posts  100% [================================================] 0:01 / 0:04

    # Generate posts with fetched content.
    $ curl -N https://loripsum.net/api/5 | wp post generate --post_content --count=10
      % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                     Dload  Upload   Total   Spent    Left  Speed
    100  2509  100  2509    0     0    616      0  0:00:04  0:00:04 --:--:--   616
    Generating posts  100% [================================================] 0:01 / 0:04

    # Add meta to every generated posts.
    $ wp post generate --format=ids | xargs -d ' ' -I % wp post meta add % foo bar
    Success: Added custom field.
    Success: Added custom field.
    Success: Added custom field.


