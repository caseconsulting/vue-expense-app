<template>
  <v-container>
    <v-row><h3>Basic Information</h3></v-row>
    <v-row>
      <!-- first name -->
      <v-col>
        <v-text-field v-model="editedEmployee.firstName" label="First Name" :rules="getRequiredRules()"></v-text-field>
      </v-col>
      <!-- middle name -->
      <v-col>
        <v-text-field
          v-model.trim="middleName"
          :label="hasMiddleName ? 'Middle Name' : 'No Middle Name'"
          :rules="hasMiddleName ? middleNameRules : []"
          :hide-details="hasMiddleName ? 'auto' : true"
          @update:model-value="hasMiddleName = true"
        >
          <template v-slot:append-inner>
            <v-btn v-if="hasMiddleName" @click="(hasMiddleName = false), (middleName = '')" variant="text" icon="">
              <v-tooltip text="Please disable if you do not have a middle name" location="top" activator="parent">
              </v-tooltip>
              <v-icon>mdi-check-circle</v-icon>
            </v-btn>
            <v-btn v-else @click="hasMiddleName = true" variant="text" icon="">
              <v-tooltip text="Please enable if you have a middle name" location="top" activator="parent"> </v-tooltip>
              <v-icon>mdi-close-circle</v-icon>
            </v-btn>
          </template>
        </v-text-field>
      </v-col>
      <!-- last name -->
      <v-col>
        <v-text-field v-model="editedEmployee.lastName" label="Last Name" :rules="getRequiredRules()"></v-text-field>
      </v-col>
      <!-- nickname -->
      <v-col>
        <v-text-field v-model="editedEmployee.nickname" label="Nickname"></v-text-field>
      </v-col>
    </v-row>
    <!-- current address -->
    <v-row><h3>Current Address</h3></v-row>
    <v-row class="groove">
      <v-col>
        <!-- private icon and search bar -->
        <v-row align="center">
          <v-col class="pb-0">
            <v-autocomplete
              prepend-inner-icon="mdi-magnify"
              v-model="searchString"
              label="Search Locations"
              :items="Object.keys(placeIds)"
              no-data-text="Start searching..."
              @update:search="updateAddressDropDown($event)"
            >
              <template #prepend>
                <v-tooltip location="top" text="Address is always hidden from other users">
                  <template #activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-shield" variant="text" v-ripple="false"></v-btn>
                  </template>
                </v-tooltip>
              </template>
              <template #item="{ item, props }">
                <v-list-item @click="autofillLocation(item, props)">{{ item.value }}</v-list-item>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>
        <!-- actual address fields -->
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model.trim="editedEmployee.currentStreet"
              label="Street 1"
              data-vv-name="Street 1"
            ></v-text-field>
          </v-col>
          <v-col cols="6">
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
    <v-row>
      <!-- case email -->
      <v-col>
        <v-text-field
          v-model="emailUsername"
          label="CASE Email"
          @update:model-value="removeEmailDomain()"
          :suffix="CASE_EMAIL_DOMAIN"
          :rules="getCaseEmailRules()"
        ></v-text-field>
      </v-col>
      <!-- employee number / employee id -->
      <v-col v-if="userIsAdminOrManager">
        <v-text-field
          v-model="editedEmployee.employeeNumber"
          label="Employee Number"
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
        ></v-text-field>
      </v-col>
      <!-- employee role -->
      <v-col v-if="userIsAdminOrManager">
        <v-combobox v-model="employeeRole" label="Employee Role" :items="EMPLOYEE_ROLES"></v-combobox>
      </v-col>
      <!-- tags -->
      <v-col v-if="userIsAdminOrManager">
        <v-autocomplete
          v-model="tags"
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
    <v-row><h3>Personal Information</h3></v-row>
    <v-row>
      <!-- birthday -->
      <v-col cols="4">
        <v-text-field
          v-model="formattedBirthday"
          label="Birthday"
          v-mask="'##/##/####'"
          hint="MM/DD/YYYY"
          :rules="[...getDateOptionalRules(), ...getNonFutureDateRules()]"
          prepend-icon="mdi-calendar"
          @update:focused="editedEmployee.birthday = format(formattedBirthday, null, 'YYYY-MM-DD')"
          @click:prepend="birthdayMenu = true"
          @keypress="birthdayMenu = false"
          autocomplete="off"
          class="flex-grow"
          style="min-width: 250px"
        >
          <v-menu activator="parent" :close-on-content-click="false" v-model="birthdayMenu" location="start center">
            <v-date-picker
              v-model="editedEmployee.birthday"
              @update:model-value="birthdayMenu = false"
              show-adjacent-months
              hide-actions
              keyboard-icon=""
              color="#bc3825"
              title="Birthday"
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
        <v-text-field v-model="personalEmail.emailValue" label="Personal Email" :rules="getEmailRules()">
          <template #prepend-inner><v-icon>mdi-email</v-icon></template>
          <template #append-inner>
            <private-button v-model="personalEmail.private"></private-button>
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

      <!-- place of birth -->
      <v-col class="pt-0" cols="12">
        <v-row><h3>Place of Birth</h3></v-row>
        <v-row class="groove pb-2">
          <v-col>
            <v-row align="center">
              <v-col class="pb-0">
                <v-autocomplete
                  prepend-inner-icon="mdi-magnify"
                  label="City Locations"
                  @update:search="updateCityDropDown($event)"
                  :items="Object.keys(predictions)"
                  v-model="citySearchString"
                  no-data-text="Start searching..."
                  persitent-hint="Search city and select option to auto-fill fields below."
                  persistent-hint
                >
                  <template #prepend>
                    <v-tooltip location="top" text="Place of birth is always hidden from other users">
                      <template #activator="{ props }">
                        <v-btn v-bind="props" icon="mdi-shield" variant="text" v-ripple="false"></v-btn>
                      </template>
                    </v-tooltip>
                  </template>
                  <template #item="{ item, props }">
                    <v-list-item @click="updateCityBoxes(item, props)">{{ item.value }}</v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-text-field v-model.trim="editedEmployee.city" label="City" data-vv-name="City"></v-text-field>
              </v-col>
              <v-col>
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
    <v-row><h3>Phone Numbers</h3></v-row>
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
      <v-col class="d-flex justify-center">
        <v-btn prepend-icon="mdi-plus" @click="addPhoneNumber()">Add Number</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { JOB_TITLES } from '@/components/employees/form-tabs/dropdown-info/jobTitles';
import api from '@/shared/api';
import { format, FORMATTED_ISOFORMAT, ISO8601 } from '@/shared/dateUtils';
import { CASE_EMAIL_DOMAIN, EMPLOYEE_ROLES, PHONE_TYPES } from '@/shared/employeeUtils';
import {
  getCaseEmailRules,
  getDateOptionalRules,
  getEmailRules,
  getNonFutureDateRules,
  getNumberRules,
  getPhoneNumberRules,
  getPhoneNumberTypeRules,
  getRequiredRules,
  getURLRules
} from '@/shared/validationUtils';
import { COUNTRIES, isMobile, STATES } from '@/utils/utils';
import { cloneDeep, filter, forEach, includes, isEmpty, lowerCase, some, startCase } from 'lodash';
import { computed, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue';
import { mask } from 'vue-the-mask';
import { useStore } from 'vuex';
import PrivateButton from '../PrivateButton.vue';
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const editedEmployee = defineModel('editedEmployee', { required: true });
const prepared = defineModel('prepared', { required: true });
const store = useStore();
defineExpose({ prepareSubmit }); // allows parent to use refs to call prepareSubmit()

const vMask = mask; // import v mask directive

// reformatted data for use in form
const emailUsername = ref(
  editedEmployee.value.email ? editedEmployee.value.email.slice(0, editedEmployee.value.email.indexOf('@')) : ''
);
const hasMiddleName = ref(!editedEmployee.value.noMiddleName);
const middleName = ref(editedEmployee.value.middleName);
const employeeRole = ref(startCase(editedEmployee.value.employeeRole));
const tags = ref(getEmployeeTags());
const formattedBirthday = ref(format(editedEmployee.value.birthday, ISO8601, FORMATTED_ISOFORMAT));
const phoneNumbers = ref(initPhoneNumbers());
const personalEmail = ref({ emailValue: editedEmployee.value.personalEmail, private: true });

// values only used for form, not for employee model
const birthdayMenu = ref(false);
const citySearchString = ref(null); // user input for searching POB
const searchString = ref(''); // user input for searching address
// const states = STATES; // states
const placeIds = ref({}); // for address autocomplete
const predictions = ref({}); // for POB autocomplete

const phoneAutofocus = ref(false);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

onBeforeMount(() => {
  prepared.value = false;
});

onBeforeUnmount(() => {
  prepareSubmit();
});

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/** @type {import('vue').ComputedRef<((v: any) => true | string[]>} */
const middleNameRules = computed(() => {
  if (hasMiddleName.value) return getRequiredRules();
  return [() => true];
});

/** @type {import('vue').ComputedRef<((v: any) => true | string[]>} */
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

const userIsAdminOrManager = computed(() => {
  const role = store.getters.user.employeeRole;
  return role === 'admin' || role === 'manager';
});

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

watch(
  () => editedEmployee.value.birthday,
  (newValue) => {
    formattedBirthday.value = format(newValue, ISO8601, FORMATTED_ISOFORMAT);
  }
);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Uses the formatted/transformed data from the form and loads it into the edited employee
 */
function prepareSubmit() {
  editedEmployee.value.email = emailUsername.value + CASE_EMAIL_DOMAIN;

  editedEmployee.value.noMiddleName = !hasMiddleName.value;
  editedEmployee.value.middleName = hasMiddleName.value ? middleName.value : undefined;

  editedEmployee.value.employeeRole = lowerCase(employeeRole.value);

  editedEmployee.value.privatePhoneNumbers = [];
  editedEmployee.value.publicPhoneNumbers = [];

  phoneNumbers.value.forEach((phoneNumber) => {
    if (phoneNumber.private) editedEmployee.value.privatePhoneNumbers.push(phoneNumber);
    else editedEmployee.value.publicPhoneNumbers.push(phoneNumber);
  });

  editedEmployee.value.personalEmail = personalEmail.value.emailValue;

  if (editedEmployee.value.country !== 'United States') editedEmployee.value.st = undefined;

  prepared.value = true;
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
 * @param {Ref<any>} item The ref to the search string
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
  }
} // autofillLocation

/**
 * Updates the city dropdown according to the user's input.
 */
async function updateCityDropDown(query) {
  if (query.length > 2) {
    let locations = await api.getCity(query);
    //object used to contain addresses and their respective ID's
    //needed later to obtain the selected address's zip code
    predictions.value = {};
    _.forEach(locations.predictions, (location) => {
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
  citySearchString.value = item.value;
  let country = '';
  let state = '';
  if (!isEmpty(citySearchString.value)) {
    let birthInfo = citySearchString.value.split(', ');
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
    citySearchString.value = null;
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
</script>

<style scoped>
.v-text-field {
  min-width: 200px;
}

.v-col {
  min-width: min-content;
}
</style>
