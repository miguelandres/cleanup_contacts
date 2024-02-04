# Contact cleaner

[![clasp](https://img.shields.io/badge/built%20with-clasp-4285f4.svg)](https://github.com/google/clasp)

My contacts have lived for a long time on Google, they have accumulated cruft
that is no longer necessary or useful at all, for example IM usernames, which
we generally no longer use or Google+ Profile links that no longer exist.

This script provides a framework to clean up stuff like that, or maybe even
do phone number migrations.

## Development

Make sure you [enable the Google Apps Script API for your Google Account](https://script.google.com/home/usersettings).

```sh
# Install clasp
npm install -g @google/clasp

# Login into your google account with clasp
clasp login

# Install autocomplete for Google Apps Script
npm install --save @types/google-apps-script

# Add all the ESLint stuff
npm install @typescript-eslint/eslint-plugin@latest --save-dev
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install --save-dev eslint-config-prettier
npm i -D @stylistic/eslint-plugin
npm install eslint
```

### Setting up your own Google script

For anyone other than the original author, please remove the `.clasp.json` file
and initialize it again. This clasp configuration is set to my own instance
of the script on my Google account to which you likely have no access.

Therefore run the following commands before doing anything

```sh
rm .clasp.json
# Create a new standalone script in your account
clasp create
```

### What the script does right now

Right now this script is *only* deleting "deprecated" fields or data, according
to my own definition of deprecation here:

- Useless data inherent to how I wrote `runAllCleanups` in [`ContactCleaner.ts`](src/ContactCleaner.ts)
  - Empty or undefined email data
  - Empty or undefined url data
  - Empty or undefined phone numbers
  - ANY and all IM usernames (No one uses any of those anymore, really)
- Useless emails as defined by `isEmailToDelete` in [`EmailProcessor.ts`](src/EmailProcessor.ts)
  - Email Addresses that end in `@google.com`
  - Email Addresses that end in `@uniandes.edu.co` (my alma mater)
- Useless urls as defined by `isUrlToDelete` in [`UrlProcessor.ts`](src/UrlProcessor.ts)
  - urls that contain the substring `google.com/profiles` (Google+ Profiles,
    they no longer exist)
- Phone numbers that have a better version in the same contact, as defined by
  `phoneNumberHasBetterVersionInSameContact` in [`PhoneProcessor.ts`](src/PhoneProcessor.ts),
  the rules are explained below
  - Phone numbers that are at the end of other phone numbers in the same
    contact, i.e. it would delete 5432345678 if you have +15432345678 in the
    same contact.
  - Argentinian International formatted phone numbers from before 9-prefix
    migration for mobile phone numbers in Argentina, granted that the migrated
    number already exists in the same contact, i.e. +541123456789 would be
    deleted if the same contact contains +5491123456789
  - Brazilian International formatted phone numbers from before 9-prefix
    migration for mobile phone numbers in Brazil, granted that the migrated
    number already exists in the same contact, i.e. +551123456789 would be
    deleted if the same contact contains +5511923456789
  - Colombian international formatted phone number from before the landline
    10-digit phone migration granted that the migrated number already exists in
    the same contact, i.e. +5713394949 would be removed if the same contact
    contains +576013394949
  - Colombian locally-formatted phone numbers from before the landline 10-digit
    phone number migration, provided the international new version exists in the
    same contact, i.e. 0313394949 would be removed if the same contact
    contains +576013394949

### How to request more data from the API

Currently the script only requests:

- Names
- Phone Numbers
- Email Addressses
- IM usernames.

If you want to request more information from the API, call `getAllContacts` or
`getFilteredContacts` in [`PeopleQueries.ts`](src/PeopleQueries.ts) with
diferent `personFields`. [See documentation on available person fields](https://developers.google.com/people/api/rest/v1/people.connections/list)

### How to choose what contacts to edit

> [!NOTE]
> This is admittedly kinda janky and can lead to duplication of code, but hey
> I wrote this in a few hours!

You can either edit the `contactFilter` function in [`ContactCleaner.ts`](src/ContactCleaner.ts),
or write your own main function that calls `getFilteredContacts` with a
different `filterFn`. These functions return true for each `Person` object that
you want to edit in the script.

### How to change the edits this script does

> [!CAUTION]
> `updateContacts` will **replace** all data in all the fields passed to it in
> the `updatePersonFields` json parameter. Do not pass a field to it if you are
> not actively both [requesting](#how-to-request-more-data-from-the-api) and
> editing in your script. You risk data loss otherwise.

`runAllCleanups` in [`ContactCleaner.ts`](src/ContactCleaner.ts) basically runs
a map on each person object returned by `getFilteredContacts` and calls
`updateContact` on it.

Modifying the logic that change the person objects will apply those changes.

## How to deploy and run

> [!CAUTION]
> If you make changes to this script I cannot recommend enough either keeping a
> backup of your contacts OR running it first in a burner account with a copy
> of your contacts and evaluate. You risk data loss otherwise.

When you're done with your local edits, use `clasp push` to push them to Google.

You can then use `clasp open` to open the script on your browser and run it from
there.

Alternatively you can use `clasp run` but I haven't tried that.
