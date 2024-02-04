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
 * Regex used to remove all unnecessary characters from a phone number, only
 * keeping the actual numbers and the + sign (for international format)
 */
const nonPhoneCharactersRegex = /[^0-9+]/g

/**
 * Returns true if there is a better, canonical version of the same number in
 * the same contact, making this phone number a good candidate for deletion
 *
 * @param phoneNumberToEvaluate Phone number in a simplified format that is currently in evaluation
 * @param allPhonesInContact An array of all phone numbers in the same contact, in a similar, simplified format
 */
function phoneNumberHasBetterVersionInSameContact(
  phoneNumberToEvaluate: string,
  allPhonesInContact?: string[]
): boolean {
  return allPhonesInContact
    ?.find((otherPhone) => otherPhone != phoneNumberToEvaluate
      && (
        otherPhone.endsWith(phoneNumberToEvaluate) ||
        // Argentinian number that hasn't been fixed
        (phoneNumberToEvaluate.startsWith("+5411") && otherPhone.startsWith("+54911") && otherPhone.endsWith(phoneNumberToEvaluate.slice(5))) ||
        // Brazilian International Format without the extra 9
        (phoneNumberToEvaluate.startsWith("+55") && phoneNumberToEvaluate.length == 13 && otherPhone.startsWith(phoneNumberToEvaluate.slice(0, 5)) && otherPhone.endsWith(phoneNumberToEvaluate.slice(5))) ||
        // Old colombian international format for landlines
        (phoneNumberToEvaluate.startsWith("+57") && phoneNumberToEvaluate.length == 11 && otherPhone.startsWith("+5760") && otherPhone.endsWith(phoneNumberToEvaluate.slice(3))) ||
        // Old colombian local format for landlines
        (phoneNumberToEvaluate.startsWith("03") && phoneNumberToEvaluate.length == 10 && otherPhone.startsWith("+5760") && otherPhone.endsWith(phoneNumberToEvaluate.slice(2)))
      )) != undefined
}

/**
 * Returns the simplified phone number, only keeping the + sign and digits.
 *
 * @param phone A Google Apps Script PhoneNumber object
 * @returns The simplified phone number as a string, of undefined if `phone.value` is undefined
 */
function getSimplifiedPhoneNumber(phone: GoogleAppsScript.People.Schema.PhoneNumber): string | undefined {
  return phone.value?.replaceAll(nonPhoneCharactersRegex, "")
}

/**
 * Returns an array of simplified phone numbers, only keeping the + sign and digits.
 *
 * @param phones An array of Google Apps Script PhoneNumber objects, or undefined
 * @returns An array of simplified phone numbers, or undefined if `phones` was undefined
 */
function getSimplifiedPhoneNumbers(phones?: GoogleAppsScript.People.Schema.PhoneNumber[]): string[] | undefined {
  return phones
    ?.map((phone) => getSimplifiedPhoneNumber(phone))
    ?.filter((phone): phone is string => !(phone == null))
}

/**
 * Returns an array of simplified phone numbers to delete.
 * @param phones An array of Google Apps Script PhoneNumber objects, or undefined
 * @returns An array of simplified phone numbers that the script should delete, or undefined if `phones` was undefined
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getPhonesToDelete(phones?: GoogleAppsScript.People.Schema.PhoneNumber[]): string[] | undefined {
  const simplifiedPhones = getSimplifiedPhoneNumbers(phones)
  return simplifiedPhones?.filter((phone) =>
    phoneNumberHasBetterVersionInSameContact(phone, simplifiedPhones))
}

/**
 * Debug function that does not apply any changes but displays all contacts with phone numbers that are not in
 * international format
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateReportOfContactsWithPhonesInLocalFormat() {
  const filteredContacts = getFilteredContacts((person) =>
    (getSimplifiedPhoneNumbers(person.phoneNumbers)?.filter((number) => !number.startsWith("+"))?.length ?? 0) > 0
  )

  filteredContacts.forEach((person) => {
    const phoneString = getSimplifiedPhoneNumbers(person.phoneNumbers)!.filter((number) => !number.startsWith("+")).join(", ")
    console.log(`${person.names?.at(0)?.displayName} has the following non international numbers: ${phoneString}`)
  })
}
