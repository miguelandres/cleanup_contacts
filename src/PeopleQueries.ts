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

/**
 * Gets all the contacts from the Google People API, 500 at a time, and
 * aggregates them in a single in-memory array.
 *
 * Run on corp accounts at your own risk.
 *
 * @param personFields Fields to request, see https://developers.google.com/people/api/rest/v1/people.connections/list
 * @returns All contacts in your google account as Google Apps Script Person
 * objects, with only the `personFields` filled.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getAllContacts(
  personFields: string[] =
    ['names', 'imClients', 'urls', 'phoneNumbers', 'emailAddresses']
): GoogleAppsScript.People.Schema.Person[] {
  let nextPageToken: string | undefined = undefined
  let allPeople: GoogleAppsScript.People.Schema.Person[] = []
  do {
    const query = {
      pageToken: nextPageToken,
      pageSize: 500,
      personFields: personFields.join(",")
    }
    const response = People.People!.Connections!.list(
      'people/me',
      query)
    nextPageToken = response.nextPageToken
    allPeople = allPeople.concat(response.connections!)
  } while (nextPageToken != undefined)
  console.log(`found ${allPeople.length} contacts`)
  return allPeople
}

/**
 * Gets all the contacts from the Google People API, 500 at a time, and
 * aggregates them in a single in-memory array and then filters them by the
 * filterFn criteria.
 *
 * Run on corp accounts at your own risk.
 *
 * @param filterFn a function that takes a Person object and returns true if the
 * object is to be kept in the array.
 * @param personFields Fields to request, see https://developers.google.com/people/api/rest/v1/people.connections/list
 * @returns All contacts in your google account that pass the filterFn as Google
 * Apps Script Person objects, with only the `personFields` filled.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getFilteredContacts(
  filterFn: (person: GoogleAppsScript.People.Schema.Person) => boolean,
  personFields: string[] =
    ['names', 'imClients', 'urls', 'phoneNumbers', 'emailAddresses']
): GoogleAppsScript.People.Schema.Person[] {
  const filteredContacts = getAllContacts(personFields)
    .filter(filterFn)
  console.log(`found ${filteredContacts.length} people that pass the filter`)
  return filteredContacts
}
