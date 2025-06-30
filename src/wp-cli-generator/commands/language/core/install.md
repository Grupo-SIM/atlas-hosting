# wp language core install

Installs a given language.

Downloads the language pack from WordPress.org. Find your language code at: https://translate.wordpress.org/

### OPTIONS

<language>...
: Language code to install.

[--activate]
: If set, the language will be activated immediately after install.

### EXAMPLES

    # Install the Brazilian Portuguese language.
    $ wp language core install pt_BR
    Downloading translation from https://downloads.wordpress.org/translation/core/6.5/pt_BR.zip...
    Unpacking the update...
    Installing the latest version...
    Removing the old version of the translation...
    Translation updated successfully.
    Language 'pt_BR' installed.
    Success: Installed 1 of 1 languages.


