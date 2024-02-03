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

const nonPhoneCharactersRegex = /[^0-9+]/g

function isPhoneWithoutPrefixInSameContact(
  canonicalPhone: string,
  allPhonesInContact?: string[]
): boolean {
  return allPhonesInContact
    ?.find((otherPhone) => otherPhone != canonicalPhone
      && (
        otherPhone.endsWith(canonicalPhone) ||
        // Argentinian number that hasn't been fixed
        (canonicalPhone.startsWith("+5411") && otherPhone.startsWith("+54911") && otherPhone.endsWith(canonicalPhone.slice(5))) ||
        // Old colombian international format for landlines
        (canonicalPhone.startsWith("+57") && canonicalPhone.length == 11 && otherPhone.startsWith("+5760") && otherPhone.endsWith(canonicalPhone.slice(3))) ||
        // Old colombian local format for landlines
        (canonicalPhone.startsWith("03") && canonicalPhone.length == 10 && otherPhone.startsWith("+5760") && otherPhone.endsWith(canonicalPhone.slice(2)))
      )) != undefined
}

function getCanonicalPhone(phone: GoogleAppsScript.People.Schema.PhoneNumber): string | undefined {
  return phone.value?.replaceAll(nonPhoneCharactersRegex, "")
}

function getCanonicalPhones(phones?: GoogleAppsScript.People.Schema.PhoneNumber[]): string[] | undefined {
  return phones
    ?.map((phone) => getCanonicalPhone(phone))
    ?.filter((phone): phone is string => !(phone == null))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getPhonesToDelete(phones?: GoogleAppsScript.People.Schema.PhoneNumber[]): string[] | undefined {
  const canonicalPhones = getCanonicalPhones(phones)
  return canonicalPhones?.filter((phone) =>
    isPhoneWithoutPrefixInSameContact(phone, canonicalPhones))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateContactsWithPhonesInLocalFormat() {
  const filteredContacts = getAllFilteredContacts((person) =>
    (getCanonicalPhones(person.phoneNumbers)?.filter((number) => !number.startsWith("+"))?.length ?? 0) > 0
  )

  filteredContacts.forEach((person) => {
    const phoneString = getCanonicalPhones(person.phoneNumbers)!.filter((number) => !number.startsWith("+")).join(", ")
    console.log(`${person.names?.at(0)?.displayName} has the following non international numbers: ${phoneString}`)
  })
}
