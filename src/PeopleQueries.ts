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


// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getAllContacts(personFields: string = 'names,imClients,urls,phoneNumbers'): GoogleAppsScript.People.Schema.Person[] {
  let nextPageToken: string | undefined = undefined
  let allPeople: GoogleAppsScript.People.Schema.Person[] = []
  do {
    const query = {
      pageToken: nextPageToken,
      pageSize: 500,
      personFields: personFields
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
