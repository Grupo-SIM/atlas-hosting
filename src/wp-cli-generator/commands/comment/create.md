# wp comment create

Creates a new comment.

### OPTIONS

[--<field>=<value>]
: Associative args for the new comment. See wp_insert_comment().

[--porcelain]
: Output just the new comment id.

### EXAMPLES

    # Create comment.
    $ wp comment create --comment_post_ID=15 --comment_content="hello blog" --comment_author="wp-cli"
    Success: Created comment 932.


