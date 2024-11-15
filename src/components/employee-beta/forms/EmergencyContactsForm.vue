<template>
  <div>
    <v-row class="mt-2"><h3>Emergency Contacts</h3></v-row>
    <v-row>
      <v-col :cols="isMobile() ? 12 : undefined" class="d-flex justify-center">
        <v-btn prepend-icon="mdi-plus" @click="addContact()">Add Contact</v-btn>
      </v-col>
    </v-row>

    <v-row v-for="(contact, index) in editedEmployee.emergencyContacts" :key="contact + index">
      <v-col :cols="isMobile() ? 12 : undefined">
        <!-- basic info -->
        <v-row>
          <v-col :cols="isMobile() ? 12 : undefined" :order="isMobile() ? 2 : undefined">
            <v-text-field v-model="contact.name" label="Full Name" />
          </v-col>
          <v-col :cols="isMobile() ? 12 : undefined" :order="isMobile() ? 3 : undefined">
            <v-autocomplete
              v-model="contact.relationship"
              :items="relationshipOptions"
              label="Relationship"
              @update:model-value="congrats(contact, index)"
              :messages="relMessage[index]"
            />
          </v-col>
          <v-col :cols="isMobile() ? 12 : undefined" :order="isMobile() ? 1 : undefined">
            <v-checkbox-btn
              v-model="contact.primaryContact"
              label="Primary Contact?"
              @click="setPrimaryContact(index)"
              class="mt-2"
            />
          </v-col>
        </v-row>

        <!-- contact methods -->
        <v-row>
          <v-col :cols="isMobile() ? 12 : undefined">
            <v-text-field
              v-model="contact.mobilePhone"
              v-mask="'###-###-####'"
              :rules="optional(getPhoneNumberNoExtRules())"
              validate-on="blur"
              label="Mobile Phone"
            />
          </v-col>
          <v-col :cols="isMobile() ? 12 : undefined">
            <v-text-field
              v-model="contact.homePhone"
              v-mask="'###-###-####'"
              :rules="optional(getPhoneNumberNoExtRules())"
              validate-on="blur"
              label="Home Phone"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col :cols="isMobile() ? 12 : undefined">
            <v-text-field
              v-model="contact.workPhone"
              v-mask="'###-###-####, ext. ######'"
              :rules="optional(getPhoneNumberRules())"
              validate-on="blur"
              label="Work Phone"
            />
          </v-col>
          <v-col :cols="isMobile() ? 12 : undefined">
            <v-text-field v-model="contact.email" :rules="getEmailRules()" validate-on="blur" label="Email" />
          </v-col>
        </v-row>

        <!-- address for some reason -->
        <!-- what are we gonna do? snail mail them? -->
        <v-row> </v-row>
        <v-row>
          <v-col :cols="isMobile() ? 12 : undefined">
            <v-combobox
              class="d-inline"
              prepend-inner-icon="mdi-magnify"
              label="Street 1"
              :items="Object.keys(placeIds)"
              no-data-text="Start searching..."
              @update:search="updateAddressDropDown($event, index)"
              v-model="contact.addressLine1"
            >
              <template #item="{ item, props }">
                <v-list-item @click="autofillLocation(item, index, props)">{{ item.value }}</v-list-item>
              </template>
            </v-combobox>
            <!-- <v-text-field v-model="contact.addressLine1" label="Street 1" /> -->
          </v-col>
          <v-col :cols="isMobile() ? 12 : undefined">
            <v-text-field v-model="contact.addressLine2" label="Street 2" />
          </v-col>
        </v-row>
        <v-row>
          <v-col :cols="isMobile() ? 12 : undefined">
            <v-text-field v-model="contact.city" label="City" />
          </v-col>
          <v-col :cols="isMobile() ? 12 : undefined">
            <v-autocomplete
              v-model="contact.state"
              :items="Object.values(STATES)"
              :disabled="editedEmployee.country !== 'United States'"
              label="State"
            />
          </v-col>
          <v-col :cols="isMobile() ? 12 : undefined">
            <v-text-field v-model="contact.zipcode" label="Zipcode" />
          </v-col>
          <v-col :cols="isMobile() ? 12 : undefined">
            <v-autocomplete v-model="contact.country" :items="COUNTRIES" label="Country" />
          </v-col>
        </v-row>
      </v-col>
      <v-divider
        v-if="index < editedEmployee.emergencyContacts.length - 1"
        class="border-opacity-25 mb-6 mt-4"
        thickness="3"
      />
    </v-row>
    <v-row v-if="(editedEmployee.emergencyContacts?.length || 0) != 0">
      <v-col :cols="isMobile() ? 12 : undefined" class="d-flex justify-center">
        <v-btn prepend-icon="mdi-plus" @click="addContact(false)">Add Contact</v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { isMobile } from '@/utils/utils';
import _isEmpty from 'lodash/isEmpty';
import { COUNTRIES as countries_util, STATES } from '@/utils/utils.js';
import { ref } from 'vue';
import { getEmailRules, getPhoneNumberRules, getPhoneNumberNoExtRules, optional } from '@/shared/validationUtils';
import api from '@/shared/api';
import _forEach from 'lodash/forEach';
import _cloneDeep from 'lodash/cloneDeep';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const COUNTRIES = new Set(countries_util);
// passes in all slot props as a single object
const { slotProps } = defineProps(['slotProps']);
const editedEmployee = ref(slotProps.editedEmployee);
const oldContacts = _cloneDeep(editedEmployee.value.emergencyContacts);
const placeIds = ref({}); // for address autocomplete
let relMessage = ref([]);
const relationshipOptions = ref([
  // list matches BambooHR
  'Partner',
  'Husband',
  'Wife',
  'Ex-Wife',
  'Parent',
  'Father',
  'Mother',
  'Brother',
  'Sister',
  'Son',
  'Daughter',
  'Friend',
  'Other'
]);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Congratulates the user on their marriage when changing a contact from something else
 * to Wife or Husband
 *
 * @param contact - contact being updated
 */
function congrats(contact, index) {
  console.log('Running congrats');
  let spouse = new Set(['Husband', 'Wife']);
  for (let oldContact of oldContacts) {
    if (oldContact.name === contact.name && !spouse.has(oldContact.relationship) && spouse.has(contact.relationship)) {
      relMessage.value[index] = 'Congratulations on your marriage!';
    }
  }
}

/**
 * Adds a contact to the user's emergency contact array.
 *
 * @param prepend whether or not to prepend the item being added
 */
function addContact(prepend = true) {
  // if the user has never added one, make the array
  if (!editedEmployee.value.emergencyContacts) editedEmployee.value.emergencyContacts = [];

  // set this contact as primary if no other contact is primary
  let isPrimary = !editedEmployee.value.emergencyContacts.some((c) => c.primaryContact);
  let emptyContact = {
    name: null,
    relationship: null,
    homePhone: null,
    addressLine1: null,
    addressLine2: null,
    mobilePhone: null,
    email: null,
    zipcode: null,
    city: null,
    state: null,
    country: null,
    workPhone: null,
    workPhoneExtension: null,
    primaryContact: isPrimary
  };

  // (a|pre)-pend the new contact
  if (prepend) editedEmployee.value.emergencyContacts.unshift(emptyContact);
  else editedEmployee.value.emergencyContacts.push(emptyContact);
}

/**
 * Updates the address dropdown according to the user's input.
 */
async function updateAddressDropDown(query) {
  if (query.length > 3) {
    let locations = await api.getLocation(query);
    //object used to contain addresses and their respective ID's
    //needed later to obtain the selected address's zip code
    placeIds.value = {};
    _forEach(locations.predictions, (location) => {
      placeIds.value[location.description] = location.place_id;
    });
  } else {
    placeIds.value = {};
  }
} //updateAddressDropDown

/**
 * Finds the city, street, state, and zip code current address fields based on an address
 * @param {import('vue').Ref<any>} item The ref to the search string
 * @param {Number} index Index of emergency contact
 */
async function autofillLocation(item, index) {
  let search = item.value;

  if (!_isEmpty(search)) {
    let fullAddress = search.split(', ');
    // fills in the three known fields
    editedEmployee.value.emergencyContacts[index].city = fullAddress[1];
    editedEmployee.value.emergencyContacts[index].addressLine1 = fullAddress[0];
    editedEmployee.value.emergencyContacts[index].state = STATES[fullAddress[2].split(' ')[0]];
    if (fullAddress[3] === 'USA') editedEmployee.value.emergencyContacts[index].country = 'United States';

    // obtains the selected address's ID needed for the zip code API call
    let selectedAddress = placeIds.value[search];

    // Response contains an array of objects, with each object containing
    // a field title 'type'. 'Type' is another array and we want the one
    // containing the postal_code string
    let res = await api.getZipCode(selectedAddress);

    editedEmployee.value.emergencyContacts[index].zipcode = '';
    _forEach(res.result.address_components, (field) => {
      if (field.types.includes('postal_code')) {
        editedEmployee.value.emergencyContacts[index].zipcode = field.short_name;
      }
    });
    //resets addresses and ID's in dropdown, keeping only the current street 1
    placeIds.value = {};
    // search = null;
    // searchString.value.blur();
  }
} // autofillLocation

/**
 * Sets primary contact to only one, ensuring that all others are unchecked.
 *
 * @param index - index of primary contact from editedEmployee.emergencyContacts array
 */
function setPrimaryContact(index) {
  for (let i = 0; i < editedEmployee.value.emergencyContacts.length; i++) {
    editedEmployee.value.emergencyContacts[i].primaryContact = i == index;
  }
}
</script>
