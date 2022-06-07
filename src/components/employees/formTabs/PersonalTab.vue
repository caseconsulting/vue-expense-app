<template>
  <div>
    <!-- Github -->
    <v-text-field v-model="editedPersonalInfo.github" label="Github" data-vv-name="Github"></v-text-field>

    <!-- Twitter -->
    <v-text-field v-model="editedPersonalInfo.twitter" label="Twitter" data-vv-name="Twitter"></v-text-field>

    <!-- LinkedIn -->
    <v-text-field
      v-model="editedPersonalInfo.linkedIn"
      label="LinkedIn"
      :rules="getURLRules()"
      data-vv-name="LinkedIn"
    ></v-text-field>

    <!-- Phone Numbers -->
    <p class="mt-5">Phone Numbers</p>
    <div class="groove pr-0 pl-2 mb-4">
      <v-row v-for="(phoneNumber, index) in phoneNumbers" :key="index" class="d-flex align-center mt-0">
        <v-col class="pt-0" cols="7" xl="3" lg="3" md="3" sm="3" xs="7">
          <v-autocomplete
            v-model="phoneNumber.type"
            label="Type"
            :items="phoneNumberTypes"
            data-vv-name="Phone Type"
            :rules="getPhoneNumberTypeRules()"
            clearable
          ></v-autocomplete>
        </v-col>
        <v-col class="pt-0" cols="6">
          <v-text-field
            v-model="phoneNumber.number"
            v-mask="'###-###-####'"
            hint="###-###-#### format"
            :rules="getPhoneNumberRules()"
            label="Phone Number"
            data-vv-name="Phone Number"
          >
          </v-text-field>
        </v-col>
        <v-col class="py-0 pr-0" cols="4" xl="2" lg="2" md="3" sm="3" xs="4">
          <v-tooltip bottom slot="append-outer">
            <template v-slot:activator="{ on }">
              <v-btn class="justify-end mr-2" v-on="on" @click="deletePhoneInput(index)" text icon>
                <v-icon class="case-gray">delete</v-icon>
              </v-btn>
            </template>
            <span>Delete Number</span>
          </v-tooltip>
          <v-tooltip bottom slot="append-outer">
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" @click="changeNumberVisibility(index)" text icon>
                <v-icon v-if="phoneNumber.private">mdi-shield</v-icon>
                <v-icon v-else>mdi-shield-outline</v-icon>
              </v-btn>
            </template>
            <span v-if="phoneNumber.private"
              >Based on user preference, this is only visible to You, Managers, and Admins</span
            >
            <span v-else>Based on user preference, this is visible to everyone</span>
          </v-tooltip>
        </v-col>
        <v-col v-if="index != phoneNumbers.length - 1 && $vuetify.breakpoint.name === 'xs'" cols="12">
          <v-divider class="mb-2"></v-divider>
        </v-col>
      </v-row>
      <div align="center" class="py-2">
        <v-btn @click="addPhoneInput()">Add a Number</v-btn>
      </div>
    </div>

    <!-- Birthday Picker -->
    <v-menu
      ref="BirthdayMenu"
      :close-on-content-click="false"
      v-model="BirthdayMenu"
      :nudge-right="40"
      transition="scale-transition"
      offset-y
      max-width="290px"
      min-width="290px"
    >
      <template v-slot:activator="{ on }">
        <v-text-field
          ref="formFields"
          v-mask="'##/##/####'"
          v-model="birthdayFormat"
          :rules="[...getDateOptionalRules(), ...getNonFutureDateRules()]"
          label="Birthday"
          hint="MM/DD/YYYY format"
          persistent-hint
          prepend-icon="event"
          @blur="editedPersonalInfo.birthday = parseDate(birthdayFormat)"
          @input="BirthdayMenu = false"
          v-on="on"
        ></v-text-field>
      </template>
      <v-date-picker v-model="editedPersonalInfo.birthday" no-title @input="BirthdayMenu = false"></v-date-picker>
    </v-menu>

    <!-- Show Birthday -->
    <v-switch
      v-model="editedPersonalInfo.birthdayFeed"
      label="Have birthday (MM/DD format) recognized on company feed?"
      :disabled="disableBirthdayFeed"
    ></v-switch>

    <!-- Place of Birth -->
    <p>
      Place of Birth
      <v-tooltip bottom slot="append-outer">
        <template v-slot:activator="{ on }">
          <v-btn class="pb-1" text icon v-on="on"><v-icon class="case-gray">shield</v-icon></v-btn>
        </template>
        <span>Only Visible to You, Managers, and Admins</span>
      </v-tooltip>
    </p>
    <div class="groove pr-5 pl-2">
      <!-- Place of Birth: City text field -->
      <v-text-field v-model="editedPersonalInfo.city" label="City" data-vv-name="City" class="pt-0"></v-text-field>

      <!-- Place of Birth: Country autocomplete -->
      <v-autocomplete
        :items="countries"
        v-model="editedPersonalInfo.country"
        item-text="text"
        label="Country"
      ></v-autocomplete>

      <!-- Place of Birth: State autocomplete -->
      <v-autocomplete
        v-if="isUSA"
        :items="Object.values(states)"
        v-model="editedPersonalInfo.st"
        item-text="text"
        label="State"
        class="pt-0"
      ></v-autocomplete>
    </div>
    <!-- Current Address -->
    <div v-if="userhasAdminPermissions() || userIsEmployee()">
      <p class="pt-4 mb-0 pb-0">
        Current Address
        <v-tooltip bottom slot="append-outer">
          <template v-slot:activator="{ on }">
            <v-btn class="pb-1" text icon v-on="on"><v-icon class="case-gray">shield</v-icon></v-btn>
          </template>
          <span>Only Visible to You, Managers, and Admins</span>
        </v-tooltip>
      </p>
      <v-combobox
        class="pb-3 pt-0"
        @input.native="updateAddressDropDown"
        :items="Object.keys(this.placeIds)"
        v-model="searchString"
        :search-input.sync="searchString"
        @change="updateBoxes"
        outlined
        hint="Search address and select option to auto-fill fields below."
        persistent-hint
      >
        <v-list slot="append-item" name="joe" class="case-gray"> Powered By Google </v-list>
      </v-combobox>
      <div class="groove pr-5 pl-2">
        <!-- Current Address: Street text field -->
        <v-text-field
          v-model="editedPersonalInfo.currentStreet"
          label="Street"
          data-vv-name="Street"
          class="pt-0"
        ></v-text-field>
        <!-- Current Address: City text field -->
        <v-text-field
          v-model="editedPersonalInfo.currentCity"
          label="City"
          data-vv-name="Current City"
          class="pt-0"
        ></v-text-field>
        <!-- Current Address: State autocomplete -->
        <v-autocomplete
          :items="Object.values(states)"
          v-model="editedPersonalInfo.currentState"
          item-text="text"
          label="State"
          class="pt-0"
        ></v-autocomplete>
        <!-- Current Address: ZIP text field -->
        <v-text-field
          v-model="editedPersonalInfo.currentZIP"
          v-mask="'#####'"
          label="ZIP"
          data-vv-name="Current ZIP"
          class="pt-0"
        ></v-text-field>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';
import {
  getDateOptionalRules,
  getNonFutureDateRules,
  getURLRules,
  getPhoneNumberRules,
  getPhoneNumberTypeRules
} from '@/shared/validationUtils.js';
import { formatDate, isEmpty, parseDate, countryList } from '@/utils/utils';
import { mask } from 'vue-the-mask';
import { getRole } from '@/utils/auth';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data.
 */
async function created() {
  window.EventBus.$emit('created', 'personal'); // emit personal tab was created
  // get countries
  this.countries = countryList;
  // set formatted birthday date
  this.birthdayFormat = this.formatDate(this.editedPersonalInfo.birthday) || this.birthdayFormat;
  // fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
  if (this.editedPersonalInfo.birthday !== null && !this.formatDate(this.editedPersonalInfo.birthday)) {
    // clear birthday date if fails to format
    this.editedPersonalInfo.birthday = null;
  }

  let user = this.$store.getters.user;
  this.userId = user.employeeNumber;

  this.phoneNumbers = this.editedPersonalInfo.privatePhoneNumbers.concat(this.editedPersonalInfo.publicPhoneNumbers);
  if (this.phoneNumbers.length === 0) {
    this.phoneNumbers = [{ type: '', number: '', private: true, valid: true }];
  }
} // created

// |--------------------------------------------------|
// |                                                  |
// |                    Computed                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Function for handling if the birthdayFeed switch is disabled.
 *
 * @return boolean - birthday feed is disabled
 */
function disableBirthdayFeed() {
  if (this.editedPersonalInfo.birthday == null) {
    this.editedPersonalInfo.birthdayFeed = false;
    return true;
  }
  return false;
} // disableBirthdayFeed

/**
 * Checks to see if the country is the United States. if it is: returns true
 * otherwise clears state field and returns false.
 *
 * @param boolan - USA is selected for countries
 * @return boolean - is the USA
 */
function isUSA() {
  if (this.editedPersonalInfo.country == 'United States') {
    return true;
  } else {
    this.editedPersonalInfo.st = null;
    return false;
  }
} // isUSA

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Updates the address dropdown according to the user's input.
 */
async function updateAddressDropDown() {
  let query = event.target.value;
  if (query.length > 3) {
    let locations = await api.getLocation(query);
    //object used to contain addresses and their respective ID's
    //needed later to obtain the selected address's zip code
    this.placeIds = {};
    _.forEach(locations.predictions, (location) => {
      this.placeIds[location.description] = location.place_id;
    });
  } else {
    this.placeIds = {};
  }
} //updateAddressDropDown

/**
 * Once an address has been selected, it autofills the city, street, and state fields.
 * It also updates the zip code field making an additional Google Maps API call
 * to obtain the selected address's zip code.
 */
async function updateBoxes() {
  if (!this.isEmpty(this.searchString)) {
    let fullAddress = this.searchString.split(', ');
    //fills in the first three fields
    this.editedPersonalInfo.currentCity = fullAddress[1];
    this.editedPersonalInfo.currentStreet = fullAddress[0];
    this.editedPersonalInfo.currentState = this.states[fullAddress[2].split(' ')[0]];

    //obtains the selected address's ID needed for the zip code API call
    let selectedAddress = this.placeIds[this.searchString];
    let res = await api.getZipCode(selectedAddress);
    //Response contains an array of objects, with each object containing
    //a field title 'type'. 'Type' is another array and we want the one
    //containing the postal_code string
    this.editedPersonalInfo.currentZIP = '';
    _.forEach(res.result.address_components, (field) => {
      if (field.types.includes('postal_code')) {
        this.editedPersonalInfo.currentZIP = field.short_name;
      }
    });
    //resets addresses and ID's in dropdown
    this.placeIds = {};
    this.searchString = '';
  }
} // updateBoxes

/**
 * Checks whether the current user role has admin permissions, used specifically
 * to prevent the manager from changing their own role on the Employee tab.
 *
 * @return - boolean: true if the user role is admin
 */
function userhasAdminPermissions() {
  return this.getRole() === 'admin' || this.getRole() === 'manager';
} // userhasAdminPermissions

/**
 * Checks if the profile accessed is the signed-in user's profile.
 *
 * @return boolean - true if the profile is the user's profile
 */
function userIsEmployee() {
  if (this.$route.params.id == this.userId) {
    return true;
  }
  return false;
} // userIsEmployee

/**
 * Validate all input fields are valid. Emit to parent the error status.
 */
function validateFields() {
  this.sortPhoneNumbers();

  let errorCount = 0;
  //ensures that refs are put in an array so we can reuse forEach loop
  let components = !_.isArray(this.$refs.formFields) ? [this.$refs.formFields] : this.$refs.formFields;
  _.forEach(components, (field) => {
    if (field && !field.validate()) errorCount++;
  });
  window.EventBus.$emit('personalStatus', errorCount); // emit error status
  window.EventBus.$emit('doneValidating', 'personal', this.editedPersonalInfo); // emit done validating
} // validateFields

/**
 * Adds a template data block for phone input
 * field
 */
function addPhoneInput() {
  this.phoneNumbers.push({
    type: '',
    number: '',
    private: true,
    valid: true
  });
} // addPhoneInput

/**
 * Sorts phone numbers into two lists based on private or public.
 */
function sortPhoneNumbers() {
  this.editedPersonalInfo.privatePhoneNumbers = _.filter(this.phoneNumbers, (num) => num.private);
  this.editedPersonalInfo.publicPhoneNumbers = _.filter(this.phoneNumbers, (num) => !num.private);
} // sortPhoneNumbers

/**
 * Removes a phone input at given index
 */
function deletePhoneInput(index) {
  this.phoneNumbers.splice(index, 1);
} // deletePhoneInput

/**
 * Changes the visibility of the given number.
 * @param index - the index of the number to change
 */
function changeNumberVisibility(index) {
  this.phoneNumbers[index].private = !this.phoneNumbers[index].private;
  if (this.phoneNumbers[index].private) {
    this.phonePrivacyBadgeIcon = 'mdi-shield';
  } else {
    this.phonePrivacyBadgeIcon = 'mdi-shield-outline';
  }
} // changeNumberVisibility

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for model.id - update edited personal info
 */
function watchModelID() {
  //when select an employee with a different ID the personal info reflects the employee that was chosen
  this.editedPersonalInfo = _.cloneDeep(this.model);
} // watchModelID

/**
 * watcher for editedPersonalInfo.birthday
 */
function watchEditedPersonalInfoBirthday() {
  this.birthdayFormat = this.formatDate(this.editedPersonalInfo.birthday) || this.birthdayFormat;
  //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
  if (this.editedPersonalInfo.birthday !== null && !this.formatDate(this.editedPersonalInfo.birthday)) {
    this.editedPersonalInfo.birthday = null;
  }
} // watchEditedPersonalInfoBirthday

/**
 * watcher for validating - validates fields
 *
 * @param val - val prop that needs to exist before validating
 */
function watchValidating(val) {
  if (val) {
    // parent component triggers validation
    this.validateFields();
  }
} // watchValidating

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  computed: {
    disableBirthdayFeed,
    isUSA
  },
  data() {
    return {
      editedPersonalInfo: _.cloneDeep(this.model), //employee personal info that can be edited
      addressDropDown: [],
      birthdayFormat: null, // formatted birthday
      BirthdayMenu: false, // display birthday menu
      countries: [], // list of countries
      phoneNumbers: [],
      phonePrivacyBadgeIcon: 'mdi-shield-outline',
      phoneNumberTypes: ['Home', 'Cell', 'Work'],
      searchString: '',
      placeIds: {},
      userId: null,
      states: {
        AL: 'Alabama',
        AK: 'Alaska',
        AS: 'American Samoa',
        AZ: 'Arizona',
        AR: 'Arkansas',
        CA: 'California',
        CO: 'Colorado',
        CT: 'Connecticut',
        DE: 'Delaware',
        DC: 'District Of Columbia',
        FM: 'Federated States Of Micronesia',
        FL: 'Florida',
        GA: 'Georgia',
        GU: 'Guam',
        HI: 'Hawaii',
        ID: 'Idaho',
        IL: 'Illinois',
        IN: 'Indiana',
        IA: 'Iowa',
        KS: 'Kansas',
        KY: 'Kentucky',
        LA: 'Louisiana',
        ME: 'Maine',
        MH: 'Marshall Islands',
        MD: 'Maryland',
        MA: 'Massachusetts',
        MI: 'Michigan',
        MN: 'Minnesota',
        MS: 'Mississippi',
        MO: 'Missouri',
        MT: 'Montana',
        NE: 'Nebraska',
        NV: 'Nevada',
        NH: 'New Hampshire',
        NJ: 'New Jersey',
        NM: 'New Mexico',
        NY: 'New York',
        NC: 'North Carolina',
        ND: 'North Dakota',
        MP: 'Northern Mariana Islands',
        OH: 'Ohio',
        OK: 'Oklahoma',
        OR: 'Oregon',
        PW: 'Palau',
        PA: 'Pennsylvania',
        PR: 'Puerto Rico',
        RI: 'Rhode Island',
        SC: 'South Carolina',
        SD: 'South Dakota',
        TN: 'Tennessee',
        TX: 'Texas',
        UT: 'Utah',
        VT: 'Vermont',
        VI: 'Virgin Islands',
        VA: 'Virginia',
        WA: 'Washington',
        WV: 'West Virginia',
        WI: 'Wisconsin',
        WY: 'Wyoming'
      } //states
    };
  },
  directives: { mask },
  methods: {
    formatDate,
    getDateOptionalRules,
    getNonFutureDateRules,
    getPhoneNumberRules,
    getPhoneNumberTypeRules,
    getURLRules,
    getRole,
    isEmpty,
    parseDate,
    updateAddressDropDown,
    updateBoxes,
    userhasAdminPermissions,
    userIsEmployee,
    validateFields,
    addPhoneInput,
    deletePhoneInput,
    changeNumberVisibility,
    sortPhoneNumbers
  },
  props: ['model', 'validating'],
  watch: {
    'model.id': watchModelID,
    'editedPersonalInfo.birthday': watchEditedPersonalInfoBirthday,
    validating: watchValidating
  }
};
</script>
