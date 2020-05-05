<template>
  <v-card hover>
    <v-card-title class="header_style">
      <h3 v-if="model.id">Edit Employee</h3>
      <h3 v-else>Create New Employee</h3>
    </v-card-title>

    <v-container fluid>
      <v-form ref="form" v-model="valid" lazy-validation>
        <!-- Name -->
        <v-text-field
          v-model="model.firstName"
          :rules="genericRules"
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
          :rules="genericRules"
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
          @blur="model.employeeRole = formatRole(employeeRoleFormatted)"
        ></v-autocomplete>

        <!-- Hire Date -->
        <v-menu
          ref="menu1"
          :close-on-content-click="true"
          v-model="menu1"
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
          <v-date-picker v-model="date" no-title @input="menu1 = false"></v-date-picker>
        </v-menu>
        <br />
        <!-- Advanced section -->
        <v-expansion-panels accordion>
          <v-expansion-panel>
            <v-expansion-panel-header style="background-color: whitesmoke;"
              >ADVANCED (optional)</v-expansion-panel-header
            >
            <v-expansion-panel-content style="background-color: whitesmoke;">
              <!-- Prime text field -->
              <v-text-field
                style="padding-right: 20px; padding-left: 10px;"
                v-model="model.prime"
                label="Prime"
                data-vv-name="Prime"
              ></v-text-field>

              <!-- Contract text field -->
              <v-text-field
                style="padding-right: 20px; padding-left: 10px;"
                v-model="model.contract"
                label="Contract"
                data-vv-name="Contract"
              ></v-text-field>

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
                ref="menu3"
                :close-on-content-click="true"
                v-model="menu3"
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
                <v-date-picker v-model="model.birthday" no-title @input="menu3 = false"></v-date-picker>
              </v-menu>

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
                    v-if="this.model.country == 'United States of America'"
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
        <!-- full/part/inactive status [MOBILE] -->
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
              <!-- custom input field -->
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
              <!-- end custom input field -->
            </v-row>
          </v-layout>
        </v-radio-group>
        <!-- end [MOBILE] -->
        <!-- full/part/inactive status [DESKTOP] -->
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
          <!-- end custom input field -->
        </v-radio-group>
        <!-- end [DESKTOP] -->
        <!-- if inactive, set Departure Date -->
        <v-menu
          v-if="isInactive()"
          ref="menu2"
          :close-on-content-click="true"
          v-model="menu2"
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
          <v-date-picker v-model="model.deptDate" no-title @input="menu2 = false"></v-date-picker>
        </v-menu>
        <!-- end full/part/inactive status -->
        <!-- form action buttons -->
        <v-btn class="ma-2" color="white" @click="clearForm"> <icon class="mr-1" name="ban"></icon>Cancel </v-btn>
        <v-btn outlined class="ma-2" color="success" @click="submit" :disabled="!valid || isStatusEmpty()">
          <icon class="mr-1" name="save"></icon>Submit
        </v-btn>
        <!-- end form action buttons -->
      </v-form>
      <update-hire-date-modal
        :activate="changingHireDate"
        :employeeName="`${this.model.firstName} ${this.model.lastName}`"
        :oldDate="this.model.hireDate"
        :newDate="this.date"
      ></update-hire-date-modal>
    </v-container>
  </v-card>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';
import { getRole } from '@/utils/auth';
import dateUtils from '@/shared/dateUtils';
import UpdateHireDateModal from './UpdateHireDateModal.vue';
import MobileDetect from 'mobile-detect';
import { v4 as uuid } from 'uuid';

const regex = /^(([^<>()[\]\\.,;:\s@#"]+(\.[^<>()[\]\\.,;:\s@#"]+)*)|(".+"))@consultwithcase.com/;

function clearForm() {
  this.$refs.form.reset();
  this.$set(this, 'date', '');
  this.$set(this.model, 'email', '@consultwithcase.com');
  this.$set(this.model, 'employeeRole', '');
  this.$set(this.model, 'firstName', '');
  this.$set(this.model, 'middleName', '');
  this.$set(this.model, 'lastName', '');
  this.$set(this.model, 'employeeNumber', '');
  this.$set(this.model, 'hireDate', '');
  this.$set(this.model, 'id', '');
  this.$set(this.model, 'workStatus', 100);

  // New Fields
  this.$set(this.model, 'prime', '');
  this.$set(this.model, 'contract', '');
  this.$set(this.model, 'github', '');
  this.$set(this.model, 'twitter', '');
  this.$set(this.model, 'jobRole', '');
  this.$set(this.model, 'birthday', '');
  this.$set(this.model, 'city', '');
  this.$set(this.model, 'st', '');
  this.$set(this.model, 'country', '');
  this.$set(this.model, 'deptDate', '');

  this.deptDateFormatted = null;
}

function formatDate(date) {
  return dateUtils.formatDate(date);
}

function formatRole(employeeRole) {
  return _.kebabCase(employeeRole);
}

function viewStatus() {
  if (this.model.workStatus && this.model.workStatus > 0 && this.model.workStatus < 100) {
    this.status = this.model.workStatus;
  } else {
    this.status = '';
  }
}

function isMobile() {
  let md = new MobileDetect(window.navigator.userAgent);
  return md.os() === 'AndroidOS' || md.os() === 'iOS';
}

function isFullTime() {
  return this.statusRadio == 'inactive';
}

function isInactive() {
  return this.statusRadio == 'inactive';
}

function isPartTime() {
  return this.statusRadio == 'part';
}

function isStatusEmpty() {
  return this.status.length == 0;
}

function parseDate(date) {
  return dateUtils.parseDate(date);
}

async function submit() {
  if (this.$refs.form.validate()) {
    if (!this.isInactive()) {
      this.$set(this.model, 'deptDate', '');
    }

    // set the hire date
    this.$set(this.model, 'hireDate', this.date);

    // set the status
    this.$set(this.model, 'workStatus', parseInt(this.status));

    if (this.model.id) {
      // update employee
      let updatedEmployee = await api.updateItem(api.EMPLOYEES, this.model);
      if (updatedEmployee.id) {
        this.$emit('update');
        this.clearForm();
      } else {
        this.$emit('error', updatedEmployee.response.data.message);
      }
    } else {
      this.model.id = uuid();
      let newEmployee = await api.createItem(api.EMPLOYEES, this.model);
      if (newEmployee.id) {
        this.$set(this.model, 'id', newEmployee.id);
        this.$emit('add', newEmployee);
        this.clearForm();
      } else {
        this.$emit('error', newEmployee.response.data.message);
        this.$set(this.model, 'id', '');
      }
    }
  }
}

function userIsAdmin() {
  return getRole() === 'admin';
}

// LIFECYCLE HOOKS
async function created() {
  window.EventBus.$on('cancel-hireDate-change', () => {
    this.changingHireDate = false;
    this.date = this.model.hireDate;
  });
  window.EventBus.$on('confirm-hireDate-change', () => {
    this.changingHireDate = false;
  });
  this.countries = _.map(await api.getCountries(), 'name');
  this.countries.unshift('United States of America');
}

export default {
  data() {
    return {
      birthdayFormat: '',
      changingHireDate: false,
      componentRules: [(v) => !!v || 'Something must be selected'],
      countries: [], // list of countries
      date: null,
      dateOptionalRules: [
        (v) => {
          if (v) {
            return /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) || 'Date must be valid. Format: MM/DD/YYYY';
          } else {
            return true;
          }
        }
      ],
      dateRules: [
        (v) => !!v || 'Date must be valid. Format: MM/DD/YYYY',
        (v) => (!!v && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/DD/YYYY'
      ],
      statusRules: [
        (v) => !!v, // || 'Percentage must be a whole number between 0 - 99',
        (v) => /^\d+$/.test(v), // || 'Percentage amount must be a whole number',
        (v) => v < 100, //|| 'Percentage must be less than 100', // percentage must be less than 100
        (v) => v >= 0 // || 'Percentage must be greater than 0' // percentage must be greater than 0
      ],
      deleting: false,
      deptDateFormatted: null,
      emailRules: [
        (v) => !!v || 'Email is required',
        (v) => regex.test(v) || 'Not a valid @consultwithcase email address'
      ],
      employeeRoleFormatted: '',
      genericRules: [(v) => !!v || 'This field is required'],
      hasExpenses: false,
      hireDateFormatted: null,
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
      ],
      menu1: false,
      menu2: false,
      menu3: false,
      numberRules: [
        (v) => !!v || 'Employee # is required',
        (v) => /^\d+$/.test(v) || 'Employee # must be a positive number'
      ],
      permissions: ['Admin', 'User'],
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
      ],
      status: '100',
      statusRadio: 'full',
      valid: false
    };
  },
  components: {
    UpdateHireDateModal
  },
  created,
  watch: {
    date: function () {
      this.hireDateFormatted = this.formatDate(this.date) || this.hireDateFormatted;
      //fixes v-date-picker error so that if the format of date is incorrect the date is set to null
      if (this.date !== null && !this.formatDate(this.date)) {
        this.date = null;
      }

      // prompt user to confirm hire date change
      if (this.formatDate(this.date) && this.model.id && this.date != this.model.hireDate) {
        this.changingHireDate = true;
      } else {
        this.changingHireDate = false;
      }
    },
    'model.hireDate': async function () {
      this.hasExpenses = this.model.id ? _.size(await api.getAllEmployeeExpenses(this.model.id)) > 0 : false;
      this.date = this.model.hireDate;
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
    'model.birthday': function () {
      this.birthdayFormat = this.formatDate(this.model.birthday) || this.birthdayFormat;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.model.birthday !== null && !this.formatDate(this.model.birthday)) {
        this.model.birthday = null;
      }
    },
    'model.workStatus': function () {
      // if work status exists
      if (this.model.workStatus != null) {
        // convert employee work status to string
        this.status = this.model.workStatus.toString();

        // set status radio
        if (this.status == '100') {
          this.statusRadio = 'full';
        } else if (this.status == '0') {
          this.statusRadio = 'inactive';
        } else {
          this.statusRadio = 'part';
        }
      } else {
        // if status does not exist
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
    }
  },
  props: ['model'],
  methods: {
    clearForm,
    viewStatus,
    formatDate,
    formatRole,
    isFullTime,
    isInactive,
    isMobile,
    isPartTime,
    isStatusEmpty,
    parseDate,
    submit,
    userIsAdmin
  }
};
</script>

<style>
.disabled {
  background-color: #ddd;
}

.customInput :hover {
  border: solid 1px black;
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

.percentageBox input {
  text-align: right;
  width: 60%;
}

.percentageBox input:hover {
  border: none;
}

.percentageBox div {
  padding-top: 6px;
  margin-left: 2px;
}

.percentageBox div:hover {
  border: none;
}
</style>
