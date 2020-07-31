<template>
  <div>
    <!-- Status Alert -->
    <v-snackbar
      v-model="errorStatus.statusType"
      :color="errorStatus.color"
      :multi-line="true"
      :right="true"
      :timeout="5000"
      :top="true"
      :vertical="true"
    >
      <v-card-title headline color="white">
        <span class="headline">{{ errorStatus.statusMessage }}</span>
      </v-card-title>
      <v-btn color="white" text @click="clearStatus">
        Close
      </v-btn>
    </v-snackbar>
    <v-card hover>
      <v-card-title class="header_style">
        <!-- Editing an employee -->
        <h3 v-if="model.id">Editing {{ fullName }}</h3>
        <h3 v-else>New Employee</h3>
      </v-card-title>

      <v-container fluid>
        <v-form ref="form" v-model="valid" lazy-validation>
          <!-- Tabs -->
          <v-tabs show-arrows class="pb-4">
            <v-tab href="#employee">General Info</v-tab>
            <v-tab href="#degrees">Degrees</v-tab>
            <v-tab href="#jobExperience">Job Experience</v-tab>
            <v-tab href="#certifications">Certifications</v-tab>
            <v-tab href="#awards">Awards</v-tab>
            <v-tab href="#technologies">Technologies</v-tab>
            <v-tab href="#customerOrgExp">Customer Org</v-tab>
            <v-tab-item id="employee">
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
                    @blur="hireDate = parseDate(hireDateFormatted)"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker v-model="hireDate" no-title @input="hireMenu = false"></v-date-picker>
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
                <v-row class="ml-0">
                  <v-col cols="6" sm="3">
                    <v-radio label="Full Time" value="full"></v-radio>
                  </v-col>
                  <v-col cols="6" sm="3">
                    <v-radio label="Part Time" value="part" @change="viewStatus()"></v-radio>
                  </v-col>
                  <v-col cols="6" sm="3">
                    <v-radio label="Inactive" value="inactive"></v-radio>
                  </v-col>
                  <!-- Custom Input Field -->
                  <v-col cols="6" sm="3">
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
                  </v-col>
                  <!-- End Custom Input Field -->
                </v-row>
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
            </v-tab-item>
            <!-- Degrees -->
            <v-tab-item id="degrees">
              <p class="pr-5" style="display: inline-block;">Degree:</p>
              <v-autocomplete
                style="width: 70%; display: inline-block;"
                v-model="this.model.degree"
                :items="this.model.degrees"
              ></v-autocomplete>
              <br />
              <p class="pr-5" style="display: inline-block;">Major:</p>
              <v-autocomplete
                style="width: 70%; display: inline-block;"
                v-model="this.model.major"
                :items="this.model.majors"
              ></v-autocomplete>
              <!-- Plus button  -->
              <v-icon>add</v-icon>
              <br />
              <p class="pr-5" style="display: inline-block;">Minor:</p>
              <v-autocomplete
                style="width: 70%; display: inline-block;"
                v-model="this.model.minor"
                :items="this.model.minors"
              ></v-autocomplete>
              <!-- Plus button  -->
              <v-icon>add</v-icon>
              <br />

              <!-- Degrees - Concentration -->
              <div>Concentration:</div>
              <v-row class="px-3" align="center">
                <!-- <p class="pr-5 mb-0" align-center text-center style="display: inline-block;">Concentration:</p> -->
                <v-autocomplete v-model="this.model.major" :items="this.model.majors">
                  <!-- Plus button  -->
                  <template v-slot:append-outer>
                    <v-slide-x-reverse-transition mode="out-in">
                      <v-icon>delete</v-icon>
                    </v-slide-x-reverse-transition>
                  </template>
                </v-autocomplete>
              </v-row>
              <!-- End Degrees - Concentration -->

              <!-- Completion year -->
            </v-tab-item>
            <!-- Experience -->
            <v-tab-item id="jobExperience">
              <div class="pb-7">
                <p>Case:</p>
                <!-- Start date -->
                <v-menu
                  :close-on-content-click="true"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px"
                  style="padding-right: 20px; padding-bottom: 20px;"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      label="Start Date"
                      hint="MM/DD/YYYY format"
                      persistent-hint
                      prepend-icon="event"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker no-title></v-date-picker>
                </v-menu>
              </div>
              <!-- Plus button  -->
              <!-- If user adds another -->
              <div class="py-2">
                <!-- company  -->
                <p class="pr-3" style="display: inline-block;">Company:</p>
                <v-autocomplete style="display: inline-block; width: 80%;"></v-autocomplete>
                <br />
                <!-- general, IC radio button -->
                <input type="radio" id="general" name="job-type" value="general" />
                <label for="general">General</label>
                <br />
                <input type="radio" id="ic" name="job-type" value="ic" />
                <label for="ic">IC</label>
                <br />
                <!-- start date -->
                <v-menu
                  :close-on-content-click="true"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px"
                  style="padding-right: 20px; padding-bottom: 20px;"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      label="Start Date"
                      hint="MM/DD/YYYY format"
                      persistent-hint
                      prepend-icon="event"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker no-title></v-date-picker>
                </v-menu>
                <!-- end date -->
                <v-menu
                  :close-on-content-click="true"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px"
                  style="padding-right: 20px; padding-bottom: 20px;"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      label="End Date"
                      hint="MM/DD/YYYY format"
                      persistent-hint
                      prepend-icon="event"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker no-title></v-date-picker>
                </v-menu>
              </div>
            </v-tab-item>
            <!-- Certifications -->
            <v-tab-item id="certifications">
              <!-- Title -->
              <!-- Date -->
              <!-- Optional expiration date -->
            </v-tab-item>
            <!-- Awards -->
            <v-tab-item id="awards">
              <!-- Title  -->
              <!-- date -->
            </v-tab-item>
            <!-- Technologies -->
            <v-tab-item id="technologies">
              <!-- Title  -->
              <!-- Start Date -->
              <!-- End DAte optional -->
            </v-tab-item>
            <!-- Customer Org Experience -->
            <v-tab-item id="customerOrgExp">
              <!-- Title -->
              <v-autocomplete></v-autocomplete>
              <!-- DST, ADO, Talent, ..., Other -->
              <!-- start date -->
              <!-- end date optional  -->
            </v-tab-item>
          </v-tabs>

          <!-- Form action buttons -->
          <v-btn class="ma-2" color="white" @click="cancel"><icon class="mr-1" name="ban"></icon>Cancel</v-btn>
          <v-btn outlined class="ma-2" color="success" @click="confirm" :disabled="!valid || isStatusEmpty()">
            <icon class="mr-1" name="save"></icon>Submit
          </v-btn>
          <!-- End form action buttons -->
        </v-form>
        <form-submission-confirmation :activate="this.confirming"></form-submission-confirmation>
      </v-container>
    </v-card>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import dateUtils from '@/shared/dateUtils';
import FormSubmissionConfirmation from '@/components/FormSubmissionConfirmation.vue';
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
 * resets back to employee info.
 */
function cancel() {
  window.EventBus.$emit('cancel-form');
} // cancel

/**
 * Clears the form and sets all fields to a default state.
 */
function clearForm() {
  this.$refs.form.resetValidation();
  this.$set(this, 'hireDate', null);
  this.$set(this.model, 'email', '@consultwithcase.com');
  this.$set(this.model, 'employeeRole', null);
  this.$set(this.model, 'firstName', null);
  this.$set(this.model, 'middleName', null);
  this.$set(this.model, 'lastName', null);
  this.$set(this.model, 'employeeNumber', null);
  this.$set(this.model, 'hireDate', null);
  this.$set(this, 'hireDateFormatted', null);
  this.$set(this.model, 'id', null);
  this.$set(this.model, 'workStatus', 100);
  this.$set(this, 'statusRadio', 'full');

  // New Fields
  this.$set(this.model, 'prime', null);
  this.$set(this.model, 'contract', null);
  this.$set(this.model, 'github', null);
  this.$set(this.model, 'twitter', null);
  this.$set(this.model, 'jobRole', null);
  this.$set(this.model, 'birthday', null);
  this.$set(this, 'birthdayFormat', null);
  this.$set(this.model, 'birthdayFeed', false);
  this.$set(this.model, 'city', null);
  this.$set(this.model, 'st', null);
  this.$set(this.model, 'country', null);
  this.$set(this.model, 'deptDate', null);
  this.$set(this, 'deptDateFormatted', null);

  this.deptDateFormatted = null;
} // clearForm

/**
 * Clear the action status that is displayed in the snackbar.
 */
function clearStatus() {
  this.$set(this.errorStatus, 'statusType', undefined);
  this.$set(this.errorStatus, 'statusMessage', null);
  this.$set(this.errorStatus, 'color', null);
} // clearStatus

function confirm() {
  if (this.$refs.form.validate()) {
    this.confirming = true;
  }
} // confirm

/**
 * Set and display an error action status in the snackbar.
 *
 * @param err - String error message
 */
async function displayError(err) {
  this.$set(this.errorStatus, 'statusType', 'ERROR');
  this.$set(this.errorStatus, 'statusMessage', err);
  this.$set(this.errorStatus, 'color', 'red');
} // displayError

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
    this.status = null;
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
  return _.isString(this.status) ? this.status.length == 0 || (this.isPartTime() && this.status <= 0) : true;
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
  this.submitting = true;
  if (this.$refs.form.validate()) {
    this.$emit('startAction');
    // form validated
    if (!this.isInactive()) {
      // set deptDate if employee is active
      this.$set(this.model, 'deptDate', null);
    }

    // set employee hire date
    this.$set(this.model, 'hireDate', this.hireDate);

    // set employee work status
    this.$set(this.model, 'workStatus', parseInt(this.status));

    if (this.model.id) {
      // updating employee
      let updatedEmployee = await api.updateItem(api.EMPLOYEES, this.model);
      if (updatedEmployee.id) {
        // successfully updated employee
        this.fullName = `${updatedEmployee.firstName} ${updatedEmployee.lastName}`;
        window.EventBus.$emit('update', updatedEmployee);
        cancel();
      } else {
        // failed to update employee
        this.$emit('error', updatedEmployee.response.data.message);
        this.displayError(updatedEmployee.response.data.message);
        // this.$emit('cancel-form');
      }
    } else {
      // creating employee
      this.model.id = uuid();
      let newEmployee = await api.createItem(api.EMPLOYEES, this.model);
      if (newEmployee.id) {
        // successfully created employee
        this.$router.push(`/employee/${newEmployee.employeeNumber}`);
      } else {
        // failed to create employee
        this.$emit('error', newEmployee.response.data.message);
        this.displayError(newEmployee.response.data.message);
        this.$set(this.model, 'id', null); // reset id
        // this.$emit('endAction');
      }
    }
  }
  this.submitting = false;
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
  if (this.model.birthday == null) {
    this.undisabled = false;
    this.model.birthdayFeed = false;
    return true;
  }
  this.undisabled = true;
  this.model.birthdayFeed = true;
  return false;
}

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

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Set the list of countries.
 */
async function created() {
  window.EventBus.$on('confirmed', () => {
    this.confirming = false;
    this.submit();
  });

  window.EventBus.$on('canceled', () => {
    this.confirming = false;
  });

  // fills model in with populated fields in employee prop
  this.model = _.mergeWith(this.model, this.employee, (modelValue, employeeValue) => {
    return _.isNil(employeeValue) ? modelValue : employeeValue;
  });

  // this.model = this.employee ? _.cloneDeep(this.employee) : this.model;
  this.countries = _.map(await api.getCountries(), 'name');
  this.countries.unshift('United States of America');
  this.employees = await api.getItems(api.EMPLOYEES); // get all employees
  this.filterPrimes();
  this.filterContracts();
  this.hireDate = this.model.hireDate;
  this.birthdayFormat = this.formatDate(this.model.birthday) || this.birthdayFormat;
  //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
  if (this.model.birthday !== null && !this.formatDate(this.model.birthday)) {
    this.model.birthday = null;
  }
  this.deptDateFormatted = this.formatDate(this.model.deptDate) || this.deptDateFormatted;
  //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
  if (this.model.deptDate !== null && !this.formatDate(this.model.deptDate)) {
    this.model.deptDate = null;
  }
  if (this.model.employeeRole != 'User') {
    this.employeeRoleFormatted = _.startCase(this.model.employeeRole);
  }
  this.hasExpenses = this.model.id ? _.size(await api.getAllEmployeeExpenses(this.model.id)) > 0 : false;
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
  if (this.statusRadio == 'full') {
    this.status = '100';
    this.model.workStatus = 100;
  } else if (this.statusRadio == 'inactive') {
    this.status = '0';
    this.model.workStatus = 0;
  } else {
    if (this.model.workStatus && this.model.workStatus > 0 && this.model.workStatus < 100) {
      this.status = this.model.workStatus.toString();
    } else {
      this.status = null;
    }
  }
  if (this.employee) {
    this.fullName = `${this.employee.firstName} ${this.employee.lastName}`;
  }
  this.value = '' + this.model.workStatus;
} // created

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  beforeDestroy() {
    window.EventBus.$off('confirmed');
    window.EventBus.$off('canceled');
  },
  components: {
    FormSubmissionConfirmation
  },
  created,
  data() {
    return {
      birthdayFormat: null, // formatted birthday
      BirthdayMenu: false,
      componentRules: [(v) => !!v || 'Something must be selected'], // rules for required componenet selection
      countries: [], // list of countries
      confirming: false,
      hireDate: null, // hire date
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
      employeeInfo: {
        primes: [],
        contracts: []
      },
      employeeRoleFormatted: null, // formatted employee role
      employees: [],
      errorStatus: {
        statusType: undefined,
        statusMessage: null,
        color: null
      }, // snack bar error
      fullName: '', // employee's first and last name
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
      model: {
        id: null,
        firstName: null,
        middleName: null,
        lastName: null,
        email: '@consultwithcase.com',
        employeeRole: 'user',
        employeeNumber: null,
        hireDate: null,
        workStatus: 100,
        birthday: null,
        birthdayFeed: false,
        jobRole: null,
        prime: null,
        contract: null,
        github: null,
        twitter: null,
        city: null,
        st: null,
        country: null,
        deptDate: null
      },
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
      submitting: false,
      valid: false, // form validity
      value: '',
      undisabled: false
    };
  },
  computed: {
    isUSA
  },
  methods: {
    cancel,
    clearForm,
    clearStatus,
    confirm,
    displayError,
    viewStatus,
    filterContracts,
    filterPrimes,
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
  props: ['employee'], // employee to be created/updated
  watch: {
    hireDate: function () {
      this.hireDateFormatted = this.formatDate(this.hireDate) || this.hireDateFormatted;
      //fixes v-date-picker error so that if the format of date is incorrect the date is set to null
      if (this.hireDate !== null && !this.formatDate(this.hireDate)) {
        this.hireDate = null;
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
      this.hireDate = this.model.hireDate;
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
        this.model.workStatus = 100;
      } else if (this.statusRadio == 'inactive') {
        this.status = '0';
        this.model.workStatus = 0;
      } else {
        if (this.model.workStatus && this.model.workStatus > 0 && this.model.workStatus < 100) {
          this.status = this.model.workStatus;
        } else {
          this.status = null;
        }
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

.v-window {
  padding: 20px;
}
</style>
