<template>
  <v-form ref="form" v-model="valid" validate-on="input">
    <v-row :class="isMobile() ? 'mt-3' : ''"><h3>Basic Information</h3></v-row>
    <v-row class="groove">
      <!-- first name -->
      <v-col>
        <v-text-field
          v-model="editedEmployee.firstName"
          label="First Name *"
          :rules="getRequiredRules()"
        ></v-text-field>
      </v-col>
      <!-- middle name -->
      <v-col>
        <v-text-field
          v-model.trim="editedEmployee.middleName"
          :label="editedEmployee.noMiddleName ? 'No Middle Name' : 'Middle Name *'"
          :rules="editedEmployee.noMiddleName ? [() => true] : getRequiredRules()"
          :hide-details="editedEmployee.noMiddleName ? true : 'auto'"
          @update:model-value="if (!isEmpty(editedEmployee.middleName)) editedEmployee.noMiddleName = false;"
        >
          <template #append-inner>
            <v-btn
              v-if="!editedEmployee.noMiddleName"
              @click="editedEmployee.noMiddleName = true"
              variant="text"
              icon=""
            >
              <v-tooltip text="Please disable if you do not have a middle name" location="top" activator="parent">
              </v-tooltip>
              <v-icon>mdi-check-circle</v-icon>
            </v-btn>
            <v-btn v-else @click="editedEmployee.noMiddleName = false" variant="text" icon="">
              <v-tooltip text="Please enable if you have a middle name" location="top" activator="parent"> </v-tooltip>
              <v-icon>mdi-close-circle</v-icon>
            </v-btn>
          </template>
        </v-text-field>
      </v-col>
      <!-- last name -->
      <v-col>
        <v-text-field v-model="editedEmployee.lastName" label="Last Name *" :rules="getRequiredRules()"></v-text-field>
      </v-col>
      <!-- nickname -->
      <v-col>
        <v-text-field v-model="editedEmployee.nickname" label="Nickname"></v-text-field>
      </v-col>
    </v-row>
    <!-- current address -->
    <v-row :class="isMobile() ? 'mt-7' : ''"><h3>Current Address</h3></v-row>
    <v-row class="groove">
      <v-col>
        <!-- private icon and search bar -->
        <v-row align="center">
          <v-col class="pb-0 d-flex">
            <div class="mt-4 mb-9 ml-3 mr-7 d-inline">
              <v-icon color="black">mdi-shield</v-icon>
              <v-tooltip activator="parent" location="top" text="Address is always hidden from other users"></v-tooltip>
            </div>
            <v-autocomplete
              class="d-inline"
              prepend-inner-icon="mdi-magnify"
              label="Search Locations"
              :items="Object.keys(placeIds)"
              no-data-text="Start searching..."
              @update:search="updateAddressDropDown($event)"
              ref="addressSearch"
            >
              <template #item="{ item, props }">
                <v-list-item @click="autofillLocation(item, props)">{{ item.value }}</v-list-item>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>
        <!-- actual address fields -->
        <v-row>
          <v-col :cols="!isMobile() ? '6' : '12'">
            <v-text-field
              v-model.trim="editedEmployee.currentStreet"
              label="Street 1"
              data-vv-name="Street 1"
            ></v-text-field>
          </v-col>
          <v-col :cols="!isMobile() ? '6' : '12'">
            <v-text-field
              v-model.trim="editedEmployee.currentStreet2"
              label="Street 2"
              data-vv-name="Street 2"
            ></v-text-field>
          </v-col>
          <v-col>
            <v-text-field v-model.trim="editedEmployee.currentCity" label="City"></v-text-field>
          </v-col>
          <v-col>
            <v-autocomplete
              v-model="editedEmployee.currentState"
              :items="Object.values(STATES)"
              item-title="text"
              label="State"
            ></v-autocomplete>
          </v-col>
          <v-col>
            <v-text-field
              v-model.trim="editedEmployee.currentZIP"
              label="ZIP"
              data-vv-name="Current ZIP"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row class="mt-7"><h3>CASE Information</h3></v-row>
    <v-row class="groove">
      <v-col>
        <v-row>
          <!-- case email -->
          <v-col>
            <v-text-field
              v-model="emailUsername"
              label="CASE Email *"
              @update:model-value="removeEmailDomain()"
              :suffix="CASE_EMAIL_DOMAIN"
              :rules="getCaseEmailRules()"
            ></v-text-field>
          </v-col>
          <!-- employee number / employee id -->
          <v-col v-if="userIsAdminOrManager">
            <v-text-field
              v-model="editedEmployee.employeeNumber"
              label="Employee Number *"
              :rules="employeeNumberRules"
            ></v-text-field>
          </v-col>
          <!-- job role -->
          <v-col>
            <v-combobox v-model="editedEmployee.jobRole" label="Job Role" :items="JOB_TITLES"></v-combobox>
          </v-col>
        </v-row>
        <v-row>
          <!-- ain / agency identification number -->
          <v-col>
            <v-text-field
              v-model="editedEmployee.agencyIdentificationNumber"
              label="Agency Identification Number"
              :rules="getAINRules()"
              maxLength="7"
            ></v-text-field>
          </v-col>
          <!-- employee role -->
          <v-col v-if="userIsAdminOrManager">
            <v-combobox v-model="employeeRole" label="Employee Role" :items="EMPLOYEE_ROLES"></v-combobox>
          </v-col>
          <!-- tags -->
          <v-col v-if="userIsAdminOrManager">
            <v-autocomplete
              v-model="editedTags"
              label="Tags"
              :items="store.getters.tags"
              item-title="tagName"
              return-object
              multiple
              chips
              closeable-chips
              clearable
            ></v-autocomplete>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row class="mt-7"><h3>Personal Information</h3></v-row>
    <v-row>
      <v-col>
        <v-row class="groove">
          <!-- birthday -->
          <v-col :cols="!isMobile() ? '4' : '12'">
            <v-text-field
              v-model="formattedBirthday"
              label="Birthday"
              v-mask="'##/##/####'"
              hint="MM/DD/YYYY"
              :rules="[getBirthdayRules()]"
              prepend-inner-icon="mdi-calendar"
              autocomplete="off"
              style="min-width: 200px"
              @keypress="birthdayMenu = false"
            >
              <v-menu activator="parent" :close-on-content-click="false" v-model="birthdayMenu" location="start center">
                <v-date-picker
                  v-model="birthday"
                  show-adjacent-months
                  hide-actions
                  keyboard-icon=""
                  color="#bc3825"
                  title="Birthday"
                  @update:model-value="onUpdateDatePicker($event)"
                >
                </v-date-picker>
              </v-menu>
              <template #append-inner>
                <private-button v-model="editedEmployee.birthdayFeed"></private-button>
              </template>
            </v-text-field>
          </v-col>
          <!-- personal email -->
          <v-col>
            <v-text-field
              v-model="editedEmployee.personalEmail"
              label="Personal Email"
              :rules="getEmailRules()"
              style="min-width: 350px"
            >
              <template #prepend-inner><v-icon>mdi-email</v-icon></template>
              <template #append-inner>
                <private-button v-model="editedEmployee.personalEmailHidden"></private-button>
              </template>
            </v-text-field>
          </v-col>
          <!-- github -->
          <v-col>
            <v-text-field v-model="editedEmployee.github" label="Github Username">
              <template #prepend-inner><v-icon>$github</v-icon></template>
            </v-text-field>
          </v-col>
          <!-- twitter / X -->
          <v-col>
            <v-text-field v-model="editedEmployee.twitter" label="X Username">
              <template #prepend-inner><v-icon size="16">$twitter</v-icon></template>
            </v-text-field>
          </v-col>
          <!-- linkedin -->
          <v-col>
            <v-text-field v-model="editedEmployee.linkedIn" label="LinkedIn Profile URL" :rules="getURLRules()">
              <template #prepend-inner><v-icon>$linkedin</v-icon></template>
            </v-text-field>
          </v-col>
        </v-row>
      </v-col>

      <!-- place of birth -->
      <v-col class="pt-0 mt-7" cols="12">
        <v-row><h3>Place of Birth</h3></v-row>
        <v-row class="groove">
          <v-col>
            <v-row align="center">
              <v-col class="d-flex pb-0">
                <div class="mt-4 mb-9 ml-3 mr-7 d-inline">
                  <v-icon color="black">mdi-shield</v-icon>
                  <v-tooltip
                    activator="parent"
                    location="top"
                    text="Place of birth is always hidden from other users"
                  ></v-tooltip>
                </div>
                <v-autocomplete
                  prepend-inner-icon="mdi-magnify"
                  label="City Locations"
                  @update:search="updateCityDropDown($event)"
                  :items="Object.keys(predictions)"
                  no-data-text="Start searching..."
                  persitent-hint="Search city and select option to auto-fill fields below."
                  persistent-hint
                  ref="birthPlaceSearch"
                >
                  <template #item="{ item, props }">
                    <v-list-item @click="updateCityBoxes(item, props)">{{ item.value }}</v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
            </v-row>
            <v-row>
              <v-col :cols="!isMobile() ? '4' : '12'">
                <v-text-field v-model.trim="editedEmployee.city" label="City" data-vv-name="City"></v-text-field>
              </v-col>
              <v-col :class="isMobile() ? 'mb-4' : ''">
                <v-autocomplete
                  v-model="editedEmployee.st"
                  label="State"
                  :items="Object.values(STATES)"
                  hide-details="auto"
                  :disabled="editedEmployee.country !== 'United States'"
                ></v-autocomplete>
              </v-col>
              <!-- country of birth -->
              <v-col>
                <v-autocomplete
                  v-model="editedEmployee.country"
                  label="Country"
                  :items="COUNTRIES"
                  hide-details="auto"
                ></v-autocomplete>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <!-- phone numbers -->
    <v-row class="mt-7"><h3>Phone Numbers</h3></v-row>
    <v-row class="mb-4 groove d-flex justify-center">
      <!-- phone numbers -->
      <v-col cols="12" v-if="!isMobile()">
        <v-row v-for="(phoneNumber, index) in phoneNumbers" :key="phoneNumber + index">
          <v-col cols="2">
            <v-autocomplete
              v-model="phoneNumber.type"
              label="Type"
              :items="PHONE_TYPES"
              :rules="getPhoneNumberTypeRules()"
              :autofocus="phoneAutofocus"
            ></v-autocomplete>
          </v-col>
          <v-col class="flex-grow">
            <v-text-field
              v-model.trim="phoneNumber.number"
              label="Phone Number"
              v-mask="'###-###-####'"
              :rules="getPhoneNumberRules()"
              data-vv-name="Phone Number"
            >
              <template #append>
                <v-col class="d-flex align-center" cols="auto" style="max-height: 56px">
                  <private-button v-model="phoneNumber.private"></private-button>
                </v-col>
                <v-col class="d-flex align-center" cols="auto" style="max-height: 56px">
                  <v-tooltip text="Delete Number" location="top">
                    <template #activator="{ props }">
                      <v-btn v-bind="props" icon="mdi-delete" variant="text" @click="deletePhoneNumber(index)"></v-btn>
                    </template>
                  </v-tooltip>
                </v-col>
              </template>
            </v-text-field>
          </v-col>
        </v-row>
      </v-col>
      <v-col v-else>
        <v-row v-for="(phoneNumber, index) in phoneNumbers" :key="phoneNumber + index">
          <v-col cols="12">
            <v-autocomplete
              v-model="phoneNumber.type"
              label="Type"
              :items="PHONE_TYPES"
              :rules="getPhoneNumberTypeRules()"
              :autofocus="phoneAutofocus"
            >
              <template #append>
                <v-col class="d-flex align-center" cols="auto" style="max-height: 56px">
                  <private-button v-model="phoneNumber.private"></private-button>
                </v-col>
                <v-col class="d-flex align-center" cols="auto" style="max-height: 56px">
                  <v-tooltip text="Delete Number" location="top">
                    <template #activator="{ props }">
                      <v-btn v-bind="props" icon="mdi-delete" variant="text" @click="deletePhoneNumber(index)"></v-btn>
                    </template>
                  </v-tooltip>
                </v-col>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col class="flex-grow">
            <v-text-field
              v-model.trim="phoneNumber.number"
              label="Phone Number"
              v-mask="'###-###-####'"
              :rules="getPhoneNumberRules()"
              data-vv-name="Phone Number"
            >
            </v-text-field>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="d-flex justify-center">
        <v-btn prepend-icon="mdi-plus" @click="addPhoneNumber()">Add Number</v-btn>
      </v-col>
    </v-row>
    <v-row><h3>Edit EEO Information</h3></v-row>
    <v-row class="groove">
      <v-col align="center">
        <v-btn @click="toggleEdit()">Click to Edit EEO Form</v-btn>
        <e-e-o-compliance-edit-modal v-model="toggleForm" :model="editedEmployee"></e-e-o-compliance-edit-modal>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { JOB_TITLES } from '@/components/employees/form-tabs/dropdown-info/jobTitles';
import api from '@/shared/api';
import { format, FORMATTED_ISOFORMAT, ISO8601 } from '@/shared/dateUtils';
import { CASE_EMAIL_DOMAIN, EMPLOYEE_ROLES, PHONE_TYPES } from '@/shared/employeeUtils';
import {
  getBirthdayRules,
  getCaseEmailRules,
  getEmailRules,
  getNumberRules,
  getPhoneNumberRules,
  getPhoneNumberTypeRules,
  getRequiredRules,
  getURLRules
} from '@/shared/validationUtils';
import { COUNTRIES, isMobile, STATES } from '@/utils/utils';
import dayjs from 'dayjs';
import { cloneDeep, filter, forEach, includes, isEmpty, lowerCase, some, startCase, xorBy } from 'lodash';
import { computed, inject, onBeforeMount, onBeforeUnmount, onMounted, readonly, ref } from 'vue';
import { mask } from 'vue-the-mask';
import { useStore } from 'vuex';
import PrivateButton from '../PrivateButton.vue';
import EEOComplianceEditModal from '../modals/EEOComplianceEditModal.vue';
import { getAINRules } from '../../../shared/validationUtils';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const store = useStore();
const emitter = inject('emitter');
const vMask = mask; // import v mask directive

const editedEmployee = defineModel({ required: true });
const valid = defineModel('valid', { required: true });
const uneditedTags = readonly(getEmployeeTags());
const editedTags = ref(cloneDeep(editedEmployee.value.tags ?? getEmployeeTags()));
const form = ref(null); // template ref to form

// reformatted data for use in form
const emailUsername = ref(
  editedEmployee.value.email ? editedEmployee.value.email.slice(0, editedEmployee.value.email.indexOf('@')) : ''
);
const employeeRole = ref(startCase(editedEmployee.value.employeeRole));
const phoneNumbers = ref(initPhoneNumbers());

// other refs
const addressSearch = ref(null); // current address search input
const birthPlaceSearch = ref(null); // birth place search input
const birthdayMenu = ref(false);
const placeIds = ref({}); // for address autocomplete
const predictions = ref({}); // for POB autocomplete
const toggleForm = ref(false); // for EEO data

// other refs
const phoneAutofocus = ref(false);

// values to help with resetting edits after cancelling
let stopPrepare = false;
const onDiscardEdits = (employee) => {
  stopPrepare = true;
  editedEmployee.value = employee;
};

defineExpose({ prepareSubmit }); // allows parent to use refs to call prepareSubmit()

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

onBeforeMount(() => {
  emitter.on('discard-edits', onDiscardEdits);
  emitter.on('confirmed-cancel-eeo', () => {
    toggleForm.value = false;
  });
});

onMounted(validate);

onBeforeUnmount(() => {
  emitter.off('discard-edits', onDiscardEdits);
});

onBeforeUnmount(prepareSubmit);

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const userIsAdminOrManager = computed(() => {
  const role = store.getters.user.employeeRole;
  return role === 'admin' || role === 'manager';
});

/**
 * Dayjs object that wraps the birthday
 *
 * @type {import('vue').WritableComputedRef<import('dayjs').Dayjs>}
 */
const birthday = computed({
  get: () => dayjs(editedEmployee.value.birthday, ISO8601),
  set: (val) => {
    editedEmployee.value.birthday = val.format(ISO8601);
  }
});

/**
 * Formatted string of the employee's birthday
 *
 * @type {import('vue').WritableComputedRef<string>}
 */
const formattedBirthday = computed({
  get: () => {
    if (!birthday.value.isValid()) return '';
    return birthday.value.format(FORMATTED_ISOFORMAT);
  },
  set: (val) => {
    const day = dayjs(val, FORMATTED_ISOFORMAT);
    if (day.isValid()) birthday.value = day;
  }
});

/** @type {import('vue').ComputedRef<((v: any) => true | string)[]>} */
const employeeNumberRules = computed(() => [
  ...getRequiredRules(),
  ...getNumberRules(),
  (v) => {
    let duplicate = some(store.getters.employees, (employee) => {
      // ensures that the employee number being set is not the same as another employee
      employee.employeeNumber === Number(v) && employee.employeeNumber !== store.getters.user.employeeNumber;
    });
    return !duplicate || 'This employee id is already in use';
  }
]);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Uses the formatted/transformed data from the form and loads it into the edited employee
 */
async function prepareSubmit() {
  if (!stopPrepare) {
    await validate();

    if (editedEmployee.value.noMiddleName) editedEmployee.value.middleName = '';

    editedEmployee.value.email = emailUsername.value + CASE_EMAIL_DOMAIN;

    editedEmployee.value.employeeRole = lowerCase(employeeRole.value);

    // the xor/symmetric difference is just the elements that have changed
    // this includes both tags the employee was added to and removed from, and no others
    editedEmployee.value.tags = xorBy(editedTags.value, uneditedTags, 'id'); // xor by property 'id'

    editedEmployee.value.birthday = format(formattedBirthday.value, FORMATTED_ISOFORMAT, ISO8601);

    if (editedEmployee.value.country !== 'United States') editedEmployee.value.st = '';

    editedEmployee.value.privatePhoneNumbers = [];
    editedEmployee.value.publicPhoneNumbers = [];

    phoneNumbers.value.forEach((phoneNumber) => {
      if (phoneNumber.private) editedEmployee.value.privatePhoneNumbers.push(phoneNumber);
      else editedEmployee.value.publicPhoneNumbers.push(phoneNumber);
    });
  }
}

async function validate() {
  if (form.value) {
    const result = await form.value.validate();
    emitter.emit('validating', { tab: 'personal', valid: result.valid });
    return result;
  }
  return null;
}

/**
 * Gets tags of edited employee
 *
 * @return {any} A deep clone of the employee tags
 */
function getEmployeeTags() {
  return cloneDeep(filter(store.getters.tags, (tag) => includes(tag.employees, editedEmployee.value.id)));
}

/**
 * Sets the initial value of the list of phone numbers
 *
 * @return {any[]} A concatenated list of pubic and private phone numbers
 */
function initPhoneNumbers() {
  if (editedEmployee.value.privatePhoneNumbers === undefined) {
    editedEmployee.value.privatePhoneNumbers = [];
  }
  if (editedEmployee.value.publicPhoneNumbers === undefined) {
    editedEmployee.value.publicPhoneNumbers = [];
  }
  return editedEmployee.value.publicPhoneNumbers.concat(editedEmployee.value.privatePhoneNumbers);
}

/**
 * Adds a new empty phone number to the list for the user to fill out
 */
function addPhoneNumber() {
  phoneNumbers.value.push({ number: '', type: '', private: true });
  phoneAutofocus.value = true;
}

/**
 * Removes a phone number from the list
 * @param {number} index The index of the phone number in the list
 */
function deletePhoneNumber(index) {
  phoneNumbers.value.splice(index, 1);
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
    forEach(locations.predictions, (location) => {
      placeIds.value[location.description] = location.place_id;
    });
  } else {
    placeIds.value = {};
  }
} //updateAddressDropDown

/**
 * Finds the city, street, state, and zip code current address fields based on an address
 * @param {import('vue').Ref<any>} item The ref to the search string
 */
async function autofillLocation(item) {
  let search = item.value;

  if (!isEmpty(search)) {
    let fullAddress = search.split(', ');
    // fills in the first three fields
    editedEmployee.value.currentCity = fullAddress[1];
    editedEmployee.value.currentStreet = fullAddress[0];
    editedEmployee.value.currentState = STATES[fullAddress[2].split(' ')[0]];

    // obtains the selected address's ID needed for the zip code API call
    let selectedAddress = placeIds.value[search];

    // Response contains an array of objects, with each object containing
    // a field title 'type'. 'Type' is another array and we want the one
    // containing the postal_code string
    let res = await api.getZipCode(selectedAddress);

    editedEmployee.value.currentZIP = '';
    forEach(res.result.address_components, (field) => {
      if (field.types.includes('postal_code')) {
        editedEmployee.value.currentZIP = field.short_name;
      }
    });
    //resets addresses and ID's in dropdown
    placeIds.value = {};
    search = null;
    addressSearch.value.blur();
  }
} // autofillLocation

/**
 * Run when the model value of the birthday date picker is updated
 */
function onUpdateDatePicker(event) {
  birthdayMenu.value = false;
  formattedBirthday.value = event;
}

/**
 * Updates the city dropdown according to the user's input.
 */
async function updateCityDropDown(query) {
  if (query.length > 2) {
    let locations = await api.getCity(query);
    //object used to contain addresses and their respective ID's
    //needed later to obtain the selected address's zip code
    predictions.value = {};
    forEach(locations.predictions, (location) => {
      predictions.value[location.description] = location.predictions;
    });
  } else {
    predictions.value = {};
  }
} //updateCityDropDown

/**
 * Once a city has been selected, it will update the fields.
 */
async function updateCityBoxes(item) {
  let citySearchString = item.value;
  let country = '';
  let state = '';
  if (!isEmpty(citySearchString)) {
    let birthInfo = citySearchString.split(', ');
    let city = birthInfo[0];

    // a city outside the US with no state/region
    if (birthInfo.length == 2) {
      country = birthInfo[1];
    } else {
      state = birthInfo[1];
      country = birthInfo[2];
    }

    if (country === 'USA') {
      country = 'United States';
    }
    //fills in the first three fields
    editedEmployee.value.city = city;
    editedEmployee.value.country = country;
    editedEmployee.value.st = STATES[state];

    //resets predictions and ID's in dropdown
    predictions.value = {};
    birthPlaceSearch.value.blur();
  }
} // updateCityBoxes

/**
 * Removes any text after the '@' symbol on the email username input once the user clicks away.
 * This should help prevent any double domain issues for the CASE email.
 */
function removeEmailDomain() {
  let atIndex = emailUsername.value.indexOf('@');

  if (atIndex !== -1) {
    emailUsername.value = emailUsername.value.substring(0, atIndex);
  }
} // removeEmailDomain

function toggleEdit() {
  emitter.emit('open-dialog');
  toggleForm.value = true;
}
</script>

<style scoped>
.v-text-field {
  min-width: 200px;
}

.v-col {
  min-width: min-content;
}
</style>
