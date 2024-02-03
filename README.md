# Contact cleaner

[![clasp](https://img.shields.io/badge/built%20with-clasp-4285f4.svg)](https://github.com/google/clasp)

My contacts have lived for a long time on Google, they have accumulated cruft
that is no longer necessary or useful at all, for example IM usernames, which
we generally no longer use or Google+ Profile links that no longer exist.

This script provides a framework to clean up stuff like that, or maybe even
do phone number migrations.

## Development

```sh
# Init npm
npm init

# Install autocomplete for Google Apps Script
npm install --save @types/google-apps-script

# Add all the ESLint stuff
npm install @typescript-eslint/eslint-plugin@latest --save-dev
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install --save-dev eslint-config-prettier
npm install eslint
```

Push with `clasp push`
