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
        <v-row>
          <!-- basic info -->
          <v-col :cols="isMobile() ? 12 : 4" :order="isMobile() ? 2 : undefined">
            <v-text-field v-model="contact.name" label="Full Name" />
          </v-col>
          <v-col :cols="isMobile() ? 12 : 3" :order="isMobile() ? 3 : undefined">
            <v-autocomplete
              v-model="contact.relationship"
              :items="relationshipOptions"
              label="Relationship"
              @update:model-value="congrats(contact, index)"
              :messages="relMessage[index]"
              auto-select-first
            />
          </v-col>
          <v-col :cols="isMobile() ? 6 : 3" :order="isMobile() ? 1 : undefined">
            <v-checkbox-btn
              v-model="contact.primaryContact"
              label="Primary Contact?"
              @click="setPrimaryContact(index)"
              class="mt-2"
            />
          </v-col>
          <v-col :cols="isMobile() ? 6 : 2">
            <v-btn @click="removeContact(index)" icon variant="text" size="small" class="mt-3 ml-0 mr-auto">
              <v-icon size="x-large">mdi-delete</v-icon>
            </v-btn>
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
              @blur="placeIds = {}"
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
              auto-select-first
            />
          </v-col>
          <v-col :cols="isMobile() ? 12 : undefined">
            <v-text-field v-model="contact.zipcode" label="Zipcode" />
          </v-col>
          <v-col :cols="isMobile() ? 12 : undefined">
            <v-autocomplete v-model="contact.country" :items="COUNTRIES" label="Country" auto-select-first />
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

const COUNTRIES = Array.from(new Set(countries_util));
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
  let spouse = new Set(['Husband', 'Wife']);
  for (let oldContact of oldContacts) {
    if (
      oldContact.name === contact.name &&
      !!oldContact.relationship &&
      !spouse.has(oldContact.relationship) &&
      spouse.has(contact.relationship)
    ) {
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
    primaryContact: isPrimary
  };

  // (a|pre)-pend the new contact
  if (prepend) editedEmployee.value.emergencyContacts.unshift(emptyContact);
  else editedEmployee.value.emergencyContacts.push(emptyContact);
}

/**
 * Removes an emergency contact at index
 *
 * @param index
 */
function removeContact(index) {
  editedEmployee.value.emergencyContacts.splice(index, 1);
}

/**
 * Updates the address dropdown according to the user's input.
 */
let timeout;
async function updateAddressDropDown(query) {
  if (query.length <3) return;
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(async () => {
    placeIds.value = {};
    let locations = await api.getLocation(query);
    for (let { formattedAddress, ...rest } of locations) placeIds.value[formattedAddress] = rest;
  }, 250);
}

/**
 * Fills in address info to model
 * @param {import('vue').Ref<any>} item The ref to the search string
 */
async function autofillLocation(item, index) {
  let address = placeIds.value[item.value];
  let contact = editedEmployee.value.emergencyContacts[index]

  // update address info
  contact.addressLine1 = address.street1;
  contact.city = address.city;
  contact.state = address.state;
  contact.zipcode = address.zip;

  //resets addresses and ID's in dropdown
  placeIds.value = {};
}

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
