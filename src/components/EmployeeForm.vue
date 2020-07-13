<template>
  <v-card hover>
    <v-card-title class="header_style">
      <!-- Editing an employee -->
      <h3 v-if="model.id">Edit Employee</h3>
      <!-- Creating a new employee -->
      <h3 v-else>Create New Employee</h3>
    </v-card-title>

    <v-container fluid>
      <v-form ref="form" v-model="valid" lazy-validation>
        <!-- Name -->
        <v-text-field
          v-model="model.firstName"
          :rules="requiredRules"
          label="First Name"
          data-vv-name="First Name"
        ></v-text-field>
        <v-text-field
          v-model="model.middleName"
          label="Middle Name (optional)"
          data-vv-name="Middle Name"
        ></v-text-field>
        <v-text-field
          v-model="model.lastName"
          :rules="requiredRules"
          label="Last Name"
          data-vv-name="Last Name"
        ></v-text-field>

        <!-- Employee # -->
        <v-text-field
          v-model="model.employeeNumber"
          :rules="numberRules"
          label="Employee #"
          data-vv-name="Employee #"
        ></v-text-field>

        <!-- Email -->
        <v-text-field v-model="model.email" :rules="emailRules" label="Email" data-vv-name="Email"></v-text-field>

        <!-- Employee Role -->
        <v-autocomplete
          :disabled="!userIsAdmin()"
          :items="permissions"
          :rules="componentRules"
          v-model="employeeRoleFormatted"
          label="Employee Role"
          @blur="model.employeeRole = formatKebabCase(employeeRoleFormatted)"
        ></v-autocomplete>

        <!-- Hire Date -->
        <v-menu
          ref="hireMenu"
          :close-on-content-click="true"
          v-model="hireMenu"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
          style="padding-right: 20px; padding-bottom: 20px;"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="hireDateFormatted"
              :rules="dateRules"
              :disabled="hasExpenses"
              label="Hire Date"
              hint="MM/DD/YYYY format"
              persistent-hint
              prepend-icon="event"
              @blur="date = parseDate(hireDateFormatted)"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="date" no-title @input="hireMenu = false"></v-date-picker>
        </v-menu>
        <br />

        <!-- Advanced section -->
        <v-expansion-panels accordion>
          <v-expansion-panel>
            <v-expansion-panel-header style="background-color: whitesmoke;"
              >ADVANCED (optional)</v-expansion-panel-header
            >
            <v-expansion-panel-content style="background-color: whitesmoke;">
              <!-- Prime combo box -->
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
                  <v-text-field
                    v-model="model.city"
                    label="City"
                    data-vv-name="City"
                    style="padding-top: 0px;"
                  ></v-text-field>

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
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- Full/Part/Inactive Status [MOBILE] -->
        <v-radio-group v-if="isMobile()" v-model="statusRadio" row mandatory>
          <v-layout fluid>
            <v-row class="ml-0">
              <v-flex xs6 sm3>
                <v-radio label="Full Time" value="full"></v-radio>
              </v-flex>
              <v-flex xs6 sm3>
                <v-radio label="Part Time" value="part" @change="viewStatus()"></v-radio>
              </v-flex>
              <v-flex xs6 sm3>
                <v-radio label="Inactive" value="inactive"></v-radio>
              </v-flex>
              <!-- Custom Input Field -->
              <v-flex xs6 sm3>
                <div :class="{ customInput: isPartTime() }">
                  <div :class="['percentageBox', { disabled: !isPartTime(), inputError: isStatusEmpty() }]">
                    <input
                      v-model="status"
                      type="text"
                      oninput="this.value = this.value.replace(/[^0-9]/g, '');"
                      maxlength="2"
                      :disabled="!isPartTime()"
                    />
                    <div>%</div>
                  </div>
                </div>
              </v-flex>
              <!-- End Custom Input Field -->
            </v-row>
          </v-layout>
        </v-radio-group>
        <!-- End [Full/Part/Inactive Status [MOBILE]] -->

        <!-- Full/Part/Inactive Status [DESKTOP] -->
        <v-radio-group v-else v-model="statusRadio" row mandatory>
          <v-radio label="Full Time" value="full"></v-radio>
          <v-radio label="Part Time" value="part" @change="viewStatus()"></v-radio>
          <v-radio label="Inactive" value="inactive"></v-radio>
          <!-- custom input field -->
          <div :class="{ customInput: isPartTime() }">
            <div :class="['percentageBox', { disabled: !isPartTime(), inputError: isStatusEmpty() }]">
              <input
                v-model="status"
                type="text"
                oninput="this.value = this.value.replace(/[^0-9]/g, '');"
                maxlength="2"
                :disabled="!isPartTime()"
              />
              <div>%</div>
            </div>
          </div>
          <!-- End Full/Part/Inactive Status [DESKTOP] -->
        </v-radio-group>
        <!-- End [DESKTOP] -->

        <!-- If inactive, set Departure Date -->
        <v-menu
          v-if="isInactive()"
          ref="departureMenu"
          :close-on-content-click="true"
          v-model="departureMenu"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
          style="padding-right: 20px; padding-bottom: 20px;"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="deptDateFormatted"
              :rules="dateRules"
              label="Departure Date"
              hint="MM/DD/YYYY format"
              persistent-hint
              prepend-icon="event"
              @blur="model.deptDate = parseDate(deptDateFormatted)"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="model.deptDate" no-title @input="departureMenu = false"></v-date-picker>
        </v-menu>
        <!-- End Full/Part/Inactive Status [DESKTOP] -->

        <!-- Form action buttons -->
        <v-btn class="ma-2" color="white" @click="clearForm"> <icon class="mr-1" name="ban"></icon>Cancel </v-btn>
        <v-btn outlined class="ma-2" color="success" @click="submit" :disabled="!valid || isStatusEmpty()">
          <icon class="mr-1" name="save"></icon>Submit
        </v-btn>
        <!-- End form action buttons -->
      </v-form>
    </v-container>
  </v-card>
</template>

<script>
import api from '@/shared/api.js';
import dateUtils from '@/shared/dateUtils';
import { getRole } from '@/utils/auth';
import MobileDetect from 'mobile-detect';
import { v4 as uuid } from 'uuid';
import _ from 'lodash';

const regex = /^(([^<>()[\]\\.,;:\s@#"]+(\.[^<>()[\]\\.,;:\s@#"]+)*)|(".+"))@consultwithcase.com/;

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
    this.model.st = '';
    return false;
  }
}
// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Clears the form and sets all fields to a default state.
 */
function clearForm() {
  this.$refs.form.resetValidation();
  this.$set(this, 'date', '');
  this.$set(this.model, 'email', '@consultwithcase.com');
  this.$set(this.model, 'employeeRole', '');
  this.$set(this.model, 'firstName', '');
  this.$set(this.model, 'middleName', '');
  this.$set(this.model, 'lastName', '');
  this.$set(this.model, 'employeeNumber', '');
  this.$set(this.model, 'hireDate', '');
  this.$set(this, 'hireDateFormatted', '');
  this.$set(this.model, 'id', '');
  this.$set(this.model, 'workStatus', 100);

  // New Fields
  this.$set(this.model, 'prime', '');
  this.$set(this.model, 'contract', '');
  this.$set(this.model, 'github', '');
  this.$set(this.model, 'twitter', '');
  this.$set(this.model, 'jobRole', '');
  this.$set(this.model, 'birthday', '');
  this.$set(this, 'birthdayFormat', '');
  this.$set(this.model, 'birthdayFeed', false);
  this.$set(this.model, 'city', '');
  this.$set(this.model, 'st', '');
  this.$set(this.model, 'country', '');
  this.$set(this.model, 'deptDate', '');
  this.$set(this, 'deptDateFormatted', '');

  this.deptDateFormatted = null;
} // clearForm

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
 * Converts a string to kebab case.
 *
 * @param value - String value to convert
 * @return String - String in kebab case
 */
function formatKebabCase(value) {
  return _.kebabCase(value);
} // formatKebabCase

/**
 * Sets the status to an employee if part time, otherwise sets it to an empty string.
 */
function viewStatus() {
  if (this.model.workStatus && this.model.workStatus > 0 && this.model.workStatus < 100) {
    this.status = this.model.workStatus;
  } else {
    this.status = '';
  }
} // viewStatus

/**
 * Checks if the current device used is mobile. Return true if it is mobile. Returns false if it is not mobile.
 *
 * @return boolean - if the device is mobile
 */
function isMobile() {
  let md = new MobileDetect(window.navigator.userAgent);
  return md.os() === 'AndroidOS' || md.os() === 'iOS';
} // isMobile

/**
 * Checks if full time work status button is selected.
 *
 * @return boolean - full time work status button selected
 */
function isFullTime() {
  return this.statusRadio == 'full';
} // isFullTime

/**
 * Checks if inactive work status button is selected.
 *
 * @return boolean - inactive work status button selected
 */
function isInactive() {
  return this.statusRadio == 'inactive';
} // isInactive

/**
 * Checks if part time work status button is selected.
 *
 * @return boolean - part time work status button selected
 */
function isPartTime() {
  return this.statusRadio == 'part';
} // isPartTime

/**
 * Checks if the work status is empty.
 *
 * @return boolean - work status is empty
 */
function isStatusEmpty() {
  return this.status.length == 0;
} // isStatusEmpty

/**
 * Parse a date to isoformat (YYYY-MM-DD).
 *
 * @param Date = date to parse
 * @return Date - date in isoformat
 */
function parseDate(date) {
  return dateUtils.parseDate(date);
} // parseDate

/**
 * Submits the employee form.
 */
async function submit() {
  if (this.$refs.form.validate()) {
    this.$emit('startAction');
    // form validated
    if (!this.isInactive()) {
      // set deptDate if employee is active
      this.$set(this.model, 'deptDate', '');
    }

    // set employee hire date
    this.$set(this.model, 'hireDate', this.date);

    // set employee work status
    this.$set(this.model, 'workStatus', parseInt(this.status));

    if (this.model.id) {
      // updating employee
      let updatedEmployee = await api.updateItem(api.EMPLOYEES, this.model);
      if (updatedEmployee.id) {
        // successfully updated employee
        this.$emit('update');
        this.clearForm();
        this.$emit('endAction');
      } else {
        // failed to update employee
        this.$emit('error', updatedEmployee.response.data.message);
        this.$emit('endAction');
      }
    } else {
      // creating employee
      this.model.id = uuid();
      let newEmployee = await api.createItem(api.EMPLOYEES, this.model);
      if (newEmployee.id) {
        // successfully created employee
        this.$emit('add', newEmployee);
        this.clearForm();
        this.$emit('endAction');
      } else {
        // failed to create employee
        this.$emit('error', newEmployee.response.data.message);
        this.$set(this.model, 'id', ''); // reset id
        this.$emit('endAction');
      }
    }
  }
} // submit

/**
 * Check if the user is an admin. Returns true if the user is an admin, otherwise returns false.
 *
 * @return boolean - user is an admin
 */
function userIsAdmin() {
  return getRole() === 'admin';
} // userIsAdmin

/**
 * Function for handling if the birthdayFeed switch is disabled
 *
 * @return boolean - birthday feed is disabled
 */
function disableBirthdayFeed() {
  if (this.model.birthday == '' || this.model.birthday == null || typeof this.model.birthday == 'undefined') {
    this.undisabled = false;
    this.model.birthdayFeed = false;
    return true;
  }
  this.undisabled = true;
  return false;
}

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Set the list of countries.
 */
async function created() {
  this.countries = _.map(await api.getCountries(), 'name');
  this.countries.unshift('United States of America');
}

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  data() {
    return {
      birthdayFormat: '', // formatted birthday
      componentRules: [(v) => !!v || 'Something must be selected'], // rules for required componenet selection
      countries: [], // list of countries
      date: null, // hire date
      dateOptionalRules: [
        (v) => {
          if (v) {
            return /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) || 'Date must be valid. Format: MM/DD/YYYY';
          } else {
            return true;
          }
        }
      ], // rules for optional date
      dateRules: [
        (v) => !!v || 'Date must be valid. Format: MM/DD/YYYY',
        (v) => (!!v && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/DD/YYYY'
      ], // rules for date
      statusRules: [
        (v) => !!v, // || 'Percentage must be a whole number between 0 - 99',
        (v) => /^\d+$/.test(v), // || 'Percentage amount must be a whole number',
        (v) => v < 100, //|| 'Percentage must be less than 100', // percentage must be less than 100
        (v) => v >= 0 // || 'Percentage must be greater than 0' // percentage must be greater than 0
      ], // rules for work status
      deptDateFormatted: null, // formatted depature date
      emailRules: [
        (v) => !!v || 'Email is required',
        (v) => regex.test(v) || 'Not a valid @consultwithcase email address'
      ], // rules for employee email
      employeeRoleFormatted: '', // formatted employee role
      requiredRules: [(v) => !!v || 'This field is required'], // rules for required fields
      hasExpenses: false, // employee has expenses
      hireDateFormatted: null, // formatted hire date
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
      hireMenu: false, // display hire menu
      departureMenu: false, // display depature menu
      BirthdayMenu: false, // display birthday menu
      numberRules: [
        (v) => !!v || 'Employee # is required',
        (v) => /^\d+$/.test(v) || 'Employee # must be a positive number'
      ], // rules for employee number
      permissions: ['Admin', 'User'], // employee role options
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
      status: '100', // work status value
      statusRadio: 'full', // work status button
      valid: false, // form validity
      undisabled: false
    };
  },
  computed: {
    isUSA
  },
  methods: {
    clearForm,
    viewStatus,
    formatDate,
    formatKebabCase,
    isFullTime,
    isInactive,
    isMobile,
    isPartTime,
    isStatusEmpty,
    parseDate,
    submit,
    userIsAdmin,
    disableBirthdayFeed
  },
  props: ['model', 'employeeInfo'], // employee to be created/updated
  watch: {
    date: function () {
      this.hireDateFormatted = this.formatDate(this.date) || this.hireDateFormatted;
      //fixes v-date-picker error so that if the format of date is incorrect the date is set to null
      if (this.date !== null && !this.formatDate(this.date)) {
        this.date = null;
      }
    },
    'model.birthday': function () {
      this.birthdayFormat = this.formatDate(this.model.birthday) || this.birthdayFormat;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.model.birthday !== null && !this.formatDate(this.model.birthday)) {
        this.model.birthday = null;
      }
    },
    'model.deptDate': function () {
      this.deptDateFormatted = this.formatDate(this.model.deptDate) || this.deptDateFormatted;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.model.deptDate !== null && !this.formatDate(this.model.deptDate)) {
        this.model.deptDate = null;
      }
    },
    'model.employeeRole': function () {
      if (this.model.employeeRole != 'User') {
        this.employeeRoleFormatted = _.startCase(this.model.employeeRole);
      }
    },
    'model.hireDate': async function () {
      this.hasExpenses = this.model.id ? _.size(await api.getAllEmployeeExpenses(this.model.id)) > 0 : false;
      this.date = this.model.hireDate;
    },
    'model.workStatus': function () {
      if (this.model.workStatus != null) {
        // set work status buttons if the status exists
        this.status = this.model.workStatus.toString(); // convert employee work status to string

        // set status radio
        if (this.status == '100') {
          this.statusRadio = 'full';
        } else if (this.status == '0') {
          this.statusRadio = 'inactive';
        } else {
          this.statusRadio = 'part';
        }
      } else {
        // set status to default full time if it does not exist
        this.status = '100';
        this.statusRadio = 'full';
      }
    },
    statusRadio: function () {
      if (this.statusRadio == 'full') {
        this.status = '100';
      } else if (this.statusRadio == 'inactive') {
        this.status = '0';
      }
    },
    undisabled: function () {
      if (this.employee != null) {
        this.model.birthdayFeed = this.employee.birthdayFeed;
      }
      //this.model.id &&
      else if (this.undisabled == true) {
        this.model.birthdayFeed = true;
      }
    }
  }
};
</script>

<style>
.customInput :hover {
  border: solid 1px black;
}

.disabled {
  background-color: #ddd;
}

.inputError {
  border: solid 1px red !important;
}

.percentageBox {
  border: solid 1px gray;
  width: 46px;
  height: 34px;
  border-radius: 2px;
  font-size: 14px;
  display: flex;
}

.percentageBox div {
  padding-top: 6px;
  margin-left: 2px;
}

.percentageBox div:hover {
  border: none;
}

.percentageBox input {
  text-align: right;
  width: 60%;
}

.percentageBox input:hover {
  border: none;
}
</style>
