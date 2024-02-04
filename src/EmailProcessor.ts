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
 * Function to decide whether an email should be deleted
 * @param email Google Apps Script email instance
 * @returns true if the email should be deleted
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isEmailToDelete(email: GoogleAppsScript.People.Schema.EmailAddress): boolean {
  return email.value == undefined ||
    email.value?.length == 0 ||
    email.value?.endsWith("@google.com") ||
    email.value?.endsWith("@uniandes.edu.co")
}

/**
 * Debugging function that shows all of the emails to delete for everyone.
 * Does not make any changes
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateReportOfEmailsToDelete() {
  const filteredContacts = getFilteredContacts((person) =>
    (person.emailAddresses?.filter(isEmailToDelete) ?? []).length > 0
  )

  filteredContacts.forEach((person) => {
    const emailsToDelete = person.emailAddresses?.filter(isEmailToDelete).map((email) => email.value!)
    console.log(`${person.names?.at(0)?.displayName} has the following emails to delete: ${emailsToDelete}`)
  })
}
