// Copyright (c) 2024 Miguel Barreto and others
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
import { getFilteredContacts } from './PeopleQueries.js';
import { isEmailToDelete } from './EmailProcessor.js';
import { contactFilter, personChangesToString } from './ContactCleaner.js';
import { getPhonesToDelete, getSimplifiedPhoneNumber } from './PhoneProcessor.js';
import { isUrlToDelete } from './UrlProcessor.js';
/**
 * Entry point to the main script, runs all the cleanups described in the
 * readme.
 */

export function runAllCleanups() {
  const contacts = getFilteredContacts(contactFilter);
  contacts.forEach(person => {
    console.log(
      `Removing the following details from ${personChangesToString(person)}`
    );
    person.imClients = undefined;
    person.urls = person.urls?.filter(url => !isUrlToDelete(url));
    person.emailAddresses = person.emailAddresses?.filter(
      email => !isEmailToDelete(email)
    );
    const phonesToDelete = getPhonesToDelete(person.phoneNumbers);
    person.phoneNumbers = person.phoneNumbers?.filter(
      phone =>
        phonesToDelete?.find(
          phoneToDelete => phoneToDelete == getSimplifiedPhoneNumber(phone)
        ) == undefined
    );

    People!.People!.updateContact(person, person.resourceName!, {
      updatePersonFields: 'imClients,urls,phoneNumbers,emailAddresses',
    });
    console.log('Done updating, waiting 100ms.');
    Utilities.sleep(100);
  });
}
