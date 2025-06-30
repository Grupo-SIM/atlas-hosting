# wp scaffold block

Generates PHP, JS and CSS code for registering a Gutenberg block for a plugin or theme.

**Warning: `wp scaffold block` is deprecated.**

The official script to generate a block is the [@wordpress/create-block](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-create-block/) package.

See the [Create a Block tutorial](https://developer.wordpress.org/block-editor/getting-started/tutorial/) for a complete walk-through.

### OPTIONS

<slug>
: The internal name of the block.

[--title=<title>]
: The display title for your block.

[--dashicon=<dashicon>]
: The dashicon to make it easier to identify your block.

[--category=<category>]
: The category name to help users browse and discover your block.
---
default: widgets
options:
  - common
  - embed
  - formatting
  - layout
  - widgets
---

[--theme]
: Create files in the active theme directory. Specify a theme with `--theme=<theme>` to have the file placed in that theme.

[--plugin=<plugin>]
: Create files in the given plugin's directory.

[--force]
: Overwrite files that already exist.


