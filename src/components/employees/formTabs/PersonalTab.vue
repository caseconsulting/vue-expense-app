<template>
  <div>
    <!-- We have to put the fields in a v-for
      in order the 'ref=formFields' to be placed into
      an array -->
    <div v-for="i in [0]" :key="i">
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
            :items="states"
            v-model="editedPersonalInfo.st"
            item-text="text"
            label="State"
            style="padding-top: 0px"
          ></v-autocomplete>
        </div>
      </div>
      <!-- Current Address -->
      <p style="font-size: 17px; padding-left: 10px; padding-top: 10px">Current Address</p>
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
            :items="states"
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
      editedPersonalInfo: _.cloneDeep(this.model), //employee personal info that can be edited
      states: [
        '',
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
  directives: { mask },
  methods: {
    formatDate,
    parseDate,
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
