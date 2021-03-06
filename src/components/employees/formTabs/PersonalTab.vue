<template>
  <div>
    <!-- Github -->
    <v-text-field
      style="padding-right: 20px; padding-left: 10px"
      v-model="editedPersonalInfo.github"
      label="Github"
      data-vv-name="Github"
    ></v-text-field>

    <!-- Twitter -->
    <v-text-field
      style="padding-right: 20px; padding-left: 10px"
      v-model="editedPersonalInfo.twitter"
      label="Twitter"
      data-vv-name="Twitter"
    ></v-text-field>

    <!-- LinkedIn -->
    <v-text-field
      style="padding-right: 20px; padding-left: 10px"
      v-model="editedPersonalInfo.linkedIn"
      label="LinkedIn"
      :rules="urlRules"
      data-vv-name="LinkedIn"
    ></v-text-field>

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
      style="padding-right: 20px; padding-bottom: 20px"
    >
      <template v-slot:activator="{ on }">
        <v-text-field
          ref="formFields"
          v-mask="'##/##/####'"
          v-model="birthdayFormat"
          :rules="dateOptionalRules"
          label="Birthday"
          hint="MM/DD/YYYY format"
          persistent-hint
          prepend-icon="event"
          @blur="editedPersonalInfo.birthday = parseDate(birthdayFormat)"
          v-on="on"
        ></v-text-field>
      </template>
      <v-date-picker v-model="editedPersonalInfo.birthday" no-title @input="BirthdayMenu = false"></v-date-picker>
    </v-menu>

    <!-- Show Birthday -->
    <v-switch
      v-model="editedPersonalInfo.birthdayFeed"
      label="Have birthday recognized on company feed?"
      :disabled="disableBirthdayFeed"
    ></v-switch>

    <!-- Place of Birth -->
    <p style="font-size: 17px; padding-left: 10px; padding-top: 10px">Place of Birth</p>
    <div style="padding-right: 20px; padding-left: 30px; padding-bottom: 10px">
      <div style="border-left-style: groove; padding-right: 20px; padding-left: 10px">
        <!-- Place of Birth: City text field -->
        <v-text-field
          v-model="editedPersonalInfo.city"
          label="City"
          data-vv-name="City"
          style="padding-top: 0px"
        ></v-text-field>

        <!-- Place of Birth: Country autocomplete -->
        <v-autocomplete
          :items="countries"
          v-model="editedPersonalInfo.country"
          item-text="text"
          label="Country"
          style="padding-top: 0px; padding-bottom: 0px"
        ></v-autocomplete>

        <!-- Place of Birth: State autocomplete -->
        <v-autocomplete
          v-if="isUSA"
          :items="Object.values(states)"
          v-model="editedPersonalInfo.st"
          item-text="text"
          label="State"
          style="padding-top: 0px"
        ></v-autocomplete>
      </div>
    </div>
    <!-- Current Address -->
    <p style="font-size: 17px; padding-left: 10px; padding-top: 10px">Current Address</p>
    <v-combobox
      class="pb-3"
      style="padding-top: 0px"
      @input.native="updateAddressDropDown"
      :items="Object.keys(placeIds)"
      v-model="searchString"
      :search-input.sync="searchString"
      @change="updateBoxes"
      outlined
      hint="Search address and select option to auto-fill fields below"
      persistent-hint
    ></v-combobox>
    <div style="padding-right: 20px; padding-left: 30px; padding-bottom: 10px">
      <div style="border-left-style: groove; padding-right: 20px; padding-left: 10px">
        <!-- Current Address: Street text field -->
        <v-text-field
          v-model="editedPersonalInfo.currentStreet"
          label="Street"
          data-vv-name="Street"
          style="padding-top: 0px"
        ></v-text-field>
        <!-- Current Address: City text field -->
        <v-text-field
          v-model="editedPersonalInfo.currentCity"
          label="City"
          data-vv-name="Current City"
          style="padding-top: 0px"
        ></v-text-field>
        <!-- Current Address: State autocomplete -->
        <v-autocomplete
          :items="Object.values(states)"
          v-model="editedPersonalInfo.currentState"
          item-text="text"
          label="State"
          style="padding-top: 0px"
        ></v-autocomplete>
        <!-- Current Address: ZIP text field -->
        <v-text-field
          v-model="editedPersonalInfo.currentZIP"
          v-mask="'#####'"
          label="ZIP"
          data-vv-name="Current ZIP"
          style="padding-top: 0px"
        ></v-text-field>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';
import { formatDate, isEmpty, parseDate } from '@/utils/utils';
import { mask } from 'vue-the-mask';
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
  this.countries = _.map(await api.getCountries(), 'name');
  this.countries.unshift('United States of America');
  // set formatted birthday date
  this.birthdayFormat = formatDate(this.editedPersonalInfo.birthday) || this.birthdayFormat;
  // fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
  if (this.editedPersonalInfo.birthday !== null && !formatDate(this.editedPersonalInfo.birthday)) {
    // clear birthday date if fails to format
    this.editedPersonalInfo.birthday = null;
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
 */
function isUSA() {
  if (this.editedPersonalInfo.country == 'United States of America') {
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
 * Updates the address dropdown according to the user's input
 */
async function updateAddressDropDown() {
  let query = event.target.value;
  if (query.length > 0) {
    let locations = await api.getLocation(query);
    //object used to contain addresses and their respective ID's
    //needed later to obtain the selected address's zip code
    this.placeIds = {};
    _.forEach(locations.predictions, (location) => {
      this.placeIds[location.description] = location.place_id;
    });
  }
} //updateAddressDropDown

/**
 * Once an address has been selected, it autofills the city, street, and state fields.
 * It also updates the zip code field making an additional Google Maps API call
 * to obtain the selected address's zip code.
 */
async function updateBoxes() {
  let fullAddress = this.searchString.split(', ');
  //fills in the first three fields
  this.editedPersonalInfo.currentCity = fullAddress[1];
  this.editedPersonalInfo.currentStreet = fullAddress[0];
  this.editedPersonalInfo.currentState = this.states[fullAddress[2]];
  //obtains the selected address's ID needed for the zip code API call
  let selectedAddress = this.placeIds[this.searchString];
  this.searchString = '';
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
} //updateBoxes

/**
 * Validate all input fields are valid. Emit to parent the error status.
 */
function validateFields() {
  let hasErrors = false;
  let errorCount = 0;
  if (_.isArray(this.$refs.formFields)) {
    // more than one TYPE of vuetify component used
    _.forEach(this.$refs.formFields, (field) => {
      if (!field.validate()) {
        errorCount++;
      }
    });

    if (errorCount > 0) {
      hasErrors = true;
    }
  } else if (this.$refs.formFields) {
    // single vuetify component
    hasErrors = !this.$refs.formFields.validate();
  }
  window.EventBus.$emit('doneValidating', 'personal', this.editedPersonalInfo); // emit done validating
  window.EventBus.$emit('personalStatus', [hasErrors, errorCount]); // emit error status
} // validateFields

export default {
  created,
  computed: {
    disableBirthdayFeed,
    isUSA
  },
  data() {
    return {
      addressDropDown: [],
      birthdayFormat: null, // formatted birthday
      BirthdayMenu: false, // display birthday menu
      countries: [], // list of countries
      dateOptionalRules: [
        (v) => {
          return !isEmpty(v) ? /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) || 'Date must be valid. Format: MM/DD/YYYY' : true;
        },
        (v) => moment(v, 'MM/DD/YYYY').isValid() || 'Date must be valid',
        (v) => moment(v, 'MM/DD/YYYY').isBefore(moment()) || 'Date must not be a future date'
      ], // rules for an optional date
      urlRules: [
        (v) =>
          isEmpty(v) ||
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(
            v
          ) ||
          'URL must be valid. Only http(s) are accepted.'
      ], // rules for training url
      searchString: '',
      placeIds: {},
      editedPersonalInfo: _.cloneDeep(this.model), //employee personal info that can be edited
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
    parseDate,
    updateAddressDropDown,
    updateBoxes,
    validateFields
  },
  props: ['model', 'validating'],
  watch: {
    'model.id': function () {
      //when select an employee with a different ID the personal info reflects the employee that was chosen
      this.editedPersonalInfo = _.cloneDeep(this.model);
    },
    'editedPersonalInfo.birthday': function () {
      this.birthdayFormat = formatDate(this.editedPersonalInfo.birthday) || this.birthdayFormat;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.editedPersonalInfo.birthday !== null && !formatDate(this.editedPersonalInfo.birthday)) {
        this.editedPersonalInfo.birthday = null;
      }
    },
    validating: function (val) {
      if (val) {
        this.validateFields();
      }
    }
  }
};
</script>
