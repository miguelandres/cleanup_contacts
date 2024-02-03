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

function contactFilter(person: GoogleAppsScript.People.Schema.Person): boolean {
  const hasUrlToDelete = person.urls?.find(isUrlToDelete) != undefined
  if (hasUrlToDelete) return true
  const hasIm = person.imClients != undefined
  if (hasIm) return true
  const phonesToDelete = getPhonesToDelete(person.phoneNumbers)
  const hasPhonesToDelete =
    phonesToDelete != undefined && phonesToDelete.length > 0
  return hasPhonesToDelete
}

function getAllFilteredContacts(): GoogleAppsScript.People.Schema.Person[] {
  const filteredContacts = getAllContacts()
    .filter(contactFilter)
  console.log(`found ${filteredContacts.length} people that pass the filter`)
  return filteredContacts
}


function personDetailsToString(person: GoogleAppsScript.People.Schema.Person): string {
  let phonesToDelete = getPhonesToDelete(person.phoneNumbers)
  phonesToDelete = phonesToDelete != undefined && phonesToDelete.length > 0 ? phonesToDelete : undefined
  let urlsToDelete = person.urls?.filter(isUrlToDelete).map((url) => url.value)
  urlsToDelete = urlsToDelete != undefined && urlsToDelete.length > 0 ? urlsToDelete : undefined
  return [
    `${person.names?.at(0)?.displayName}`,
    person.imClients?.map((im) => `${im.protocol}: ${im.username}`).join(", "),
    phonesToDelete != undefined ? `Phones to delete: ${phonesToDelete.join(", ")}` : undefined,
    urlsToDelete != undefined ? `Urls to delete: ${urlsToDelete.join(", ")}` : undefined
  ].filter((str): str is string => !(str == null)).join("\n")
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function main() {
  const contacts = getAllFilteredContacts()
  contacts.forEach((person) => {
    console.log(`Removing the following details from ${personDetailsToString(person)}`)
    person.imClients = undefined
    person.urls = person.urls?.filter((url) => !isUrlToDelete(url))
    const phonesToDelete = getPhonesToDelete(person.phoneNumbers)
    person.phoneNumbers = person.phoneNumbers
      ?.filter((phone) =>
        phonesToDelete?.find((phoneToDelete) => phoneToDelete == getCanonicalPhone(phone)) == undefined
      )

    People.People!.updateContact(
      person,
      person.resourceName!,
      {
        "updatePersonFields": "imClients,urls,phoneNumbers"
      }
    )
    console.log("Done updating, waiting 1000ms.")
    Utilities.sleep(1000)
  })
}
