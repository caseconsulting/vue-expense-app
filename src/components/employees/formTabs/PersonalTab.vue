<template>
  <div>
    <v-combobox
      style="padding-right: 20px; padding-left: 10px;"
      v-model="model.prime"
      :items="employeeInfo.primes"
      label="Prime"
      data-vv-name="Prime"
      dense
    ></v-combobox>

    <!-- Contract combo box -->
    <v-combobox
      style="padding-right: 20px; padding-left: 10px;"
      v-model="model.contract"
      :items="employeeInfo.contracts"
      label="Contract"
      data-vv-name="Contract"
      dense
    ></v-combobox>

    <!-- Github text field -->
    <v-text-field
      style="padding-right: 20px; padding-left: 10px;"
      v-model="model.github"
      label="Github"
      data-vv-name="Github"
    ></v-text-field>

    <!-- Twitter text field -->
    <v-text-field
      style="padding-right: 20px; padding-left: 10px;"
      v-model="model.twitter"
      label="Twitter"
      data-vv-name="Twitter"
    ></v-text-field>

    <!-- Job Role autocomplete -->
    <v-autocomplete
      style="padding-right: 20px; padding-left: 10px;"
      :items="jobRoles"
      v-model="model.jobRole"
      item-text="text"
      label="Job Role"
    ></v-autocomplete>

    <!-- Birthday Picker -->
    <v-menu
      ref="BirthdayMenu"
      :close-on-content-click="true"
      v-model="BirthdayMenu"
      :nudge-right="40"
      transition="scale-transition"
      offset-y
      max-width="290px"
      min-width="290px"
      style="padding-right: 20px; padding-bottom: 20px;"
    >
      <template v-slot:activator="{ on }">
        <v-text-field
          v-model="birthdayFormat"
          :rules="dateOptionalRules"
          label="Birthday"
          hint="MM/DD/YYYY format"
          persistent-hint
          prepend-icon="event"
          @blur="model.birthday = parseDate(birthdayFormat)"
          v-on="on"
        ></v-text-field>
      </template>
      <v-date-picker v-model="model.birthday" no-title @input="BirthdayMenu = false"></v-date-picker>
    </v-menu>

    <!-- opt out of birthday feed -->
    <v-switch
      v-model="model.birthdayFeed"
      label="Have birthday recognized on company feed?"
      :disabled="disableBirthdayFeed()"
    ></v-switch>

    <!-- Place of Birth -->
    <p style="font-size: 17px; padding-left: 10px; padding-top: 10px;">Place of Birth</p>
    <div style="padding-right: 20px; padding-left: 30px; padding-bottom: 10px;">
      <div style="border-left-style: groove; padding-right: 20px; padding-left: 10px;">
        <!-- Place of Birth: City text field -->
        <v-text-field v-model="model.city" label="City" data-vv-name="City" style="padding-top: 0px;"></v-text-field>

        <!-- Place of Birth: Country autocomplete -->
        <v-autocomplete
          :items="countries"
          v-model="model.country"
          item-text="text"
          label="Country"
          style="padding-top: 0px; padding-bottom: 0px;"
        ></v-autocomplete>

        <!-- Place of Birth: State autocomplete -->
        <v-autocomplete
          v-if="isUSA"
          :items="states"
          v-model="model.st"
          item-text="text"
          label="State"
          style="padding-top: 0px;"
        ></v-autocomplete>
      </div>
    </div>
  </div>
</template>
<script>
import api from '@/shared/api.js';
import dateUtils from '@/shared/dateUtils';
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |                    Computed                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * checks to see if the country is the United States. if it is: returns true
 * otherwise clears state field and returns false
 */
function isUSA() {
  if (this.model.country == 'United States of America') {
    return true;
  } else {
    this.model.st = null;
    return false;
  }
}

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Function for handling if the birthdayFeed switch is disabled
 *
 * @return boolean - birthday feed is disabled
 */
function disableBirthdayFeed() {
  if (this.model.birthday == null) {
    this.undisabled = false;
    this.model.birthdayFeed = false;
    return true;
  }
  this.undisabled = true;
  this.model.birthdayFeed = true;
  return false;
} // disableBirthdayFeed

/**
 * Filters out contracts from list of employees.
 */
function filterContracts() {
  let tempContracts = _.map(this.employees, (a) => a.contract); //extract contracts
  tempContracts = _.compact(tempContracts); //remove falsey values
  this.employeeInfo.contracts = [...new Set(tempContracts)]; //remove duplicates
} // filterContracts

/**
 * Filters out primes from list of employees.
 */
function filterPrimes() {
  let tempPrimes = _.map(this.employees, (a) => a.prime); //extract primes
  tempPrimes = _.compact(tempPrimes); //remove falsey values
  this.employeeInfo.primes = [...new Set(tempPrimes)]; //remove duplicates and set
} // filterPrimes

/**
 * Formats a date.
 *
 * @param date - date to format
 * @return Date - formatted date
 */
function formatDate(date) {
  return dateUtils.formatDate(date);
} // formatDate

/**
 * Parse a date to isoformat (YYYY-MM-DD).
 *
 * @param Date = date to parse
 * @return Date - date in isoformat
 */
function parseDate(date) {
  return dateUtils.parseDate(date);
} // parseDate

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

async function created() {
  this.countries = _.map(await api.getCountries(), 'name');
  this.countries.unshift('United States of America');
  this.employees = await api.getItems(api.EMPLOYEES); // get all employees
  this.filterPrimes();
  this.filterContracts();
  this.birthdayFormat = this.formatDate(this.model.birthday) || this.birthdayFormat;
  //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
  if (this.model.birthday !== null && !this.formatDate(this.model.birthday)) {
    this.model.birthday = null;
  }
} // created

export default {
  created,
  computed: {
    isUSA
  },
  data() {
    return {
      birthdayFormat: null, // formatted birthday
      BirthdayMenu: false,
      countries: [], // list of countries
      dateOptionalRules: [
        (v) => {
          if (v) {
            return /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) || 'Date must be valid. Format: MM/DD/YYYY';
          } else {
            return true;
          }
        }
      ], // rules for optional date
      employeeInfo: {
        primes: [],
        contracts: []
      },
      employees: [],
      jobRoles: [
        'Software Developer',
        'Project Manager',
        'System Engineer',
        'Cloud Architect',
        'Cloud Engineer',
        'Data Scientist',
        'QA/Tester',
        'Intern',
        'Accountant',
        'Other'
      ], // job role options
      states: [
        'Alabama',
        'Alaska',
        'American Samoa',
        'Arizona',
        'Arkansas',
        'California',
        'Colorado',
        'Connecticut',
        'Delaware',
        'District of Columbia',
        'Federated States of Micronesia',
        'Florida',
        'Georgia',
        'Guam',
        'Hawaii',
        'Idaho',
        'Illinois',
        'Indiana',
        'Iowa',
        'Kansas',
        'Kentucky',
        'Louisiana',
        'Maine',
        'Marshall Islands',
        'Maryland',
        'Massachusetts',
        'Michigan',
        'Minnesota',
        'Minor Outlying Islands',
        'Mississippi',
        'Missouri',
        'Montana',
        'Nebraska',
        'Nevada',
        'New Hampshire',
        'New Jersey',
        'New Mexico',
        'New York',
        'North Carolina',
        'North Dakota',
        'Northern Mariana Islands',
        'Ohio',
        'Oklahoma',
        'Oregon',
        'Pennsylvania',
        'Puerto Rico',
        'Republic of Palau',
        'Rhode Island',
        'South Carolina',
        'South Dakota',
        'Tennessee',
        'Texas',
        'U.S. Minor Outlying Islands',
        'U.S. Virgin Islands',
        'Utah',
        'Vermont',
        'Virginia',
        'Washington',
        'West Virginia',
        'Wisconsin',
        'Wyoming'
      ], // state options
      undisabled: false
    };
  },
  methods: {
    disableBirthdayFeed,
    filterContracts,
    filterPrimes,
    formatDate,
    parseDate
  },
  props: ['model']
};
</script>
