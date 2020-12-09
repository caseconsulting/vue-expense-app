<template>
  <div>
    <!-- Prime -->
    <v-combobox
      style="padding-right: 20px; padding-left: 10px"
      v-model="model.prime"
      :items="employeeInfo.primes"
      label="Prime"
      data-vv-name="Prime"
    ></v-combobox>

    <!-- Contract -->
    <v-combobox
      style="padding-right: 20px; padding-left: 10px"
      v-model="model.contract"
      :items="employeeInfo.contracts"
      label="Contract"
      data-vv-name="Contract"
    ></v-combobox>

    <!-- Github -->
    <v-text-field
      style="padding-right: 20px; padding-left: 10px"
      v-model="model.github"
      label="Github"
      data-vv-name="Github"
    ></v-text-field>

    <!-- Twitter -->
    <v-text-field
      style="padding-right: 20px; padding-left: 10px"
      v-model="model.twitter"
      label="Twitter"
      data-vv-name="Twitter"
    ></v-text-field>

    <!-- Job Role -->
    <v-autocomplete
      style="padding-right: 20px; padding-left: 10px"
      :items="jobTitles"
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
      style="padding-right: 20px; padding-bottom: 20px"
    >
      <template v-slot:activator="{ on }">
        <v-text-field
          ref="formFields"
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

    <!-- Show Birthday -->
    <v-switch
      v-model="model.birthdayFeed"
      label="Have birthday recognized on company feed?"
      :disabled="disableBirthdayFeed()"
    ></v-switch>

    <!-- Place of Birth -->
    <p style="font-size: 17px; padding-left: 10px; padding-top: 10px">Place of Birth</p>
    <div style="padding-right: 20px; padding-left: 30px; padding-bottom: 10px">
      <div style="border-left-style: groove; padding-right: 20px; padding-left: 10px">
        <!-- Place of Birth: City text field -->
        <v-text-field v-model="model.city" label="City" data-vv-name="City" style="padding-top: 0px"></v-text-field>

        <!-- Place of Birth: Country autocomplete -->
        <v-autocomplete
          :items="countries"
          v-model="model.country"
          item-text="text"
          label="Country"
          style="padding-top: 0px; padding-bottom: 0px"
        ></v-autocomplete>

        <!-- Place of Birth: State autocomplete -->
        <v-autocomplete
          v-if="isUSA"
          :items="states"
          v-model="model.st"
          item-text="text"
          label="State"
          style="padding-top: 0px"
        ></v-autocomplete>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';
import { formatDate, isEmpty, parseDate } from '@/utils/utils';

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
  // get all employees
  this.employees = await api.getItems(api.EMPLOYEES);
  // set formatted birthday date
  this.birthdayFormat = formatDate(this.model.birthday) || this.birthdayFormat;
  // fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
  if (this.model.birthday !== null && !formatDate(this.model.birthday)) {
    // clear birthday date if fails to format
    this.model.birthday = null;
  }
  // filter primes and contracts
  this.filterPrimes();
  this.filterContracts();
} // created

// |--------------------------------------------------|
// |                                                  |
// |                    Computed                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Checks to see if the country is the United States. if it is: returns true
 * otherwise clears state field and returns false.
 *
 * @param boolan - USA is selected for countries
 */
function isUSA() {
  if (this.model.country == 'United States of America') {
    return true;
  } else {
    this.model.st = null;
    return false;
  }
} // isUSA

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Function for handling if the birthdayFeed switch is disabled.
 *
 * @return boolean - birthday feed is disabled
 */
function disableBirthdayFeed() {
  if (this.model.birthday == null) {
    this.model.birthdayFeed = false;
    return true;
  }
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
 * Validate all input fields are valid. Emit to parent the error status.
 */
function validateFields() {
  let hasErrors = false;

  if (_.isArray(this.$refs.formFields)) {
    // more than one TYPE of vuetify component used
    let error = _.find(this.$refs.formFields, (field) => {
      return !field.validate();
    });
    hasErrors = _.isNil(error) ? false : true;
  } else if (this.$refs.formFields) {
    // single vuetify component
    hasErrors = !this.$refs.formFields.validate;
  }

  window.EventBus.$emit('doneValidating', 'personal'); // emit done validating
  window.EventBus.$emit('personalStatus', hasErrors); // emit error status
} // validateFields

export default {
  created,
  computed: {
    isUSA
  },
  data() {
    return {
      birthdayFormat: null, // formatted birthday
      BirthdayMenu: false, // display birthday menu
      countries: [], // list of countries
      dateOptionalRules: [
        (v) => {
          return !isEmpty(v) ? /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) || 'Date must be valid. Format: MM/DD/YYYY' : true;
        }
      ], // rules for an optional date
      employeeInfo: {
        primes: [],
        contracts: []
      }, // employee prime and contract info
      employees: [], // all employees
      jobTitles: [
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
      ], // job title options
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
      ] // state options
    };
  },
  methods: {
    disableBirthdayFeed,
    filterContracts,
    filterPrimes,
    formatDate,
    parseDate,
    validateFields
  },
  props: ['model', 'validating'],
  watch: {
    'model.birthday': function () {
      this.birthdayFormat = formatDate(this.model.birthday) || this.birthdayFormat;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.model.birthday !== null && !formatDate(this.model.birthday)) {
        this.model.birthday = null;
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
