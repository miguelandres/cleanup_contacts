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
 * Function to evaluate whether an individual person needs to be edited or not.
 *
 * This is passed to @function getFilteredContacts.
 * @param person Person to decide whether to filter or not
 * @returns True if the person will be filtered (kept in the filtered list)
 */
function contactFilter(person: GoogleAppsScript.People.Schema.Person): boolean {
  const hasUrlToDelete = person.urls?.find(isUrlToDelete) != undefined
  if (hasUrlToDelete) return true
  const hasEmailToDelete =
    person.emailAddresses?.find(isEmailToDelete) != undefined
  if (hasEmailToDelete) return true
  const hasIm = person.imClients != undefined
  if (hasIm) return true
  const phonesToDelete = getPhonesToDelete(person.phoneNumbers)
  const hasPhonesToDelete =
    phonesToDelete != undefined && phonesToDelete.length > 0
  return hasPhonesToDelete
}

/**
 * Debugging function that returns a debug string that represnts the changes
 * that a particular person will have when the script runs
 * @param person Person to be edited
 * @returns A string with the name of the person, IM usernames to delete, phones
 * to delete, urls to delete and emails to delete
 */
function personChangesToString(
  person: GoogleAppsScript.People.Schema.Person
): string {
  let phonesToDelete = getPhonesToDelete(person.phoneNumbers)
  phonesToDelete = (phonesToDelete != undefined && phonesToDelete.length > 0) ?
    phonesToDelete : undefined
  let urlsToDelete = person.urls?.filter(isUrlToDelete).map((url) => url.value)
  urlsToDelete = (urlsToDelete != undefined && urlsToDelete.length > 0) ?
    urlsToDelete : undefined

  let emailsToDelete = person
    .emailAddresses
    ?.filter(isEmailToDelete)
    .map((email) => email.value)
  emailsToDelete = (emailsToDelete != undefined && emailsToDelete.length > 0) ?
    emailsToDelete : undefined
  return [
    `${person.names?.at(0)?.displayName}`,
    person.imClients?.map((im) => `${im.protocol}: ${im.username}`).join(", "),
    phonesToDelete != undefined ?
      `Phones to delete: ${phonesToDelete.join(", ")}` : undefined,
    urlsToDelete != undefined ?
      `Urls to delete: ${urlsToDelete.join(", ")}` : undefined,
    emailsToDelete != undefined ?
      `Emails to delete: ${emailsToDelete.join(", ")}` : undefined
  ].filter((str): str is string => !(str == null)).join("\n")
}

/**
 * Entry point to the main script, runs all the cleanups described in the
 * readme.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function runAllCleanups() {
  const contacts = getFilteredContacts(contactFilter)
  contacts.forEach((person) => {
    console.log(
      `Removing the following details from ${personChangesToString(person)}`)
    person.imClients = undefined
    person.urls = person.urls?.filter((url) => !isUrlToDelete(url))
    person.emailAddresses =
      person.emailAddresses?.filter((email) => !isEmailToDelete(email))
    const phonesToDelete = getPhonesToDelete(person.phoneNumbers)
    person.phoneNumbers = person.phoneNumbers
      ?.filter((phone) =>
        phonesToDelete?.find((phoneToDelete) =>
          phoneToDelete == getSimplifiedPhoneNumber(phone)
        ) == undefined
      )

    People.People!.updateContact(
      person,
      person.resourceName!,
      {
        "updatePersonFields": "imClients,urls,phoneNumbers,emailAddresses"
      }
    )
    console.log("Done updating, waiting 100ms.")
    Utilities.sleep(100)
  })
}
