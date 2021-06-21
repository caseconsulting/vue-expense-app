<template>
  <div>
    <!-- Name -->
    <v-text-field
      ref="formFields"
      v-model="editedEmployee.firstName"
      :rules="requiredRules"
      label="First Name"
      data-vv-name="First Name"
      :disabled="!admin"
    ></v-text-field>
    <v-text-field
      v-model="editedEmployee.middleName"
      label="Middle Name (optional)"
      data-vv-name="Middle Name"
      :disabled="!admin"
    ></v-text-field>
    <v-text-field
      ref="formFields"
      v-model="editedEmployee.lastName"
      :rules="requiredRules"
      label="Last Name"
      data-vv-name="Last Name"
      :disabled="!admin"
    ></v-text-field>
    <v-text-field
      ref="formFields"
      v-model="editedEmployee.nickname"
      label="Nickname (optional)"
      data-vv-name="Nickname"
      :disabled="!admin"
    ></v-text-field>

    <!-- Employee # -->
    <v-text-field
      ref="formFields"
      v-model="editedEmployee.employeeNumber"
      :rules="numberRules"
      label="Employee #"
      data-vv-name="Employee #"
      :disabled="!admin"
    ></v-text-field>

    <!-- Email -->
    <v-text-field
      ref="formFields"
      v-model="editedEmployee.email"
      :rules="emailRules"
      label="Email"
      data-vv-name="Email"
      :disabled="!admin"
    ></v-text-field>

    <!-- Prime -->
    <v-combobox
      v-model="editedEmployee.prime"
      :items="employeeInfo.primes"
      label="Prime"
      data-vv-name="Prime"
    ></v-combobox>

    <!-- Contract -->
    <v-combobox
      v-model="editedEmployee.contract"
      :items="employeeInfo.contracts"
      label="Contract"
      data-vv-name="Contract"
    ></v-combobox>

    <!-- Job Role -->
    <v-autocomplete
      :items="jobTitles"
      v-model="editedEmployee.jobRole"
      item-text="text"
      label="Job Role"
    ></v-autocomplete>

    <!-- Employee Role -->
    <v-autocomplete
      ref="formFields"
      :disabled="!admin"
      :items="permissions"
      :rules="requiredRules"
      v-model="employeeRoleFormatted"
      label="Employee Role"
      @blur="editedEmployee.employeeRole = formatKebabCase(employeeRoleFormatted)"
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
      style="padding-right: 20px; padding-bottom: 20px"
      :disabled="!admin"
    >
      <template v-slot:activator="{ on }">
        <v-text-field
          ref="formFields"
          v-model="hireDateFormatted"
          :rules="dateRules"
          :disabled="hasExpenses || !admin"
          v-mask="'##/##/####'"
          label="Hire Date"
          hint="MM/DD/YYYY format"
          persistent-hint
          prepend-icon="event"
          @blur="editedEmployee.hireDate = parseDate(hireDateFormatted)"
          v-on="on"
        ></v-text-field>
      </template>
      <v-date-picker
        v-model="editedEmployee.hireDate"
        no-title
        @input="hireMenu = false"
        :disabled="!admin"
      ></v-date-picker>
    </v-menu>

    <!-- Full/Part/Inactive Status [MOBILE] -->
    <v-radio-group v-if="isMobile()" v-model="statusRadio" row mandatory :disabled="!admin">
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
    <v-radio-group v-else v-model="statusRadio" row mandatory hide-details :disabled="!admin">
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
      v-if="isInactive() || (isPartTime() && status && status == 0)"
      ref="departureMenu"
      :close-on-content-click="true"
      v-model="departureMenu"
      :nudge-right="40"
      transition="scale-transition"
      offset-y
      max-width="290px"
      min-width="290px"
      style="padding-right: 20px; padding-bottom: 20px"
      :disabled="!admin"
    >
      <template v-slot:activator="{ on }">
        <v-text-field
          ref="formFields"
          v-model="deptDateFormatted"
          :rules="dateRules"
          label="Departure Date"
          hint="MM/DD/YYYY format"
          persistent-hint
          prepend-icon="event"
          @blur="editedEmployee.deptDate = parseDate(deptDateFormatted)"
          v-on="on"
          :disabled="!admin"
        ></v-text-field>
      </template>
      <v-date-picker
        v-model="editedEmployee.deptDate"
        no-title
        @input="departureMenu = false"
        :disabled="!admin"
      ></v-date-picker>
    </v-menu>
    <!-- End Full/Part/Inactive Status [DESKTOP] -->
  </div>
</template>
<script>
import api from '@/shared/api.js';
import MobileDetect from 'mobile-detect';
import _ from 'lodash';
import { formatDate, isEmpty, parseDate } from '@/utils/utils';
import { mask } from 'vue-the-mask';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');

const regex = /^(([^<>()[\]\\.,;:\s@#"]+(\.[^<>()[\]\\.,;:\s@#"]+)*)|(".+"))@consultwithcase.com/;

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data.
 */
async function created() {
  window.EventBus.$emit('created', 'employee'); // emit employee tab was created

  // get all employees
  this.employees = await api.getItems(api.EMPLOYEES);
  // set formatted hire date
  this.hireDateFormatted = formatDate(this.editedEmployee.hireDate) || this.hireDateFormatted;
  // set formatted depature date
  this.deptDateFormatted = formatDate(this.editedEmployee.deptDate) || this.deptDateFormatted;
  // fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
  if (this.editedEmployee.deptDate !== null && !formatDate(this.editedEmployee.deptDate)) {
    // clear depature date if fails to format
    this.editedEmployee.deptDate = null;
  }
  // capitalize the employee role
  this.employeeRoleFormatted = _.startCase(this.editedEmployee.employeeRole);
  // determine if employee has expenses
  this.hasExpenses = this.editedEmployee.id
    ? _.size(await api.getAllEmployeeExpenses(this.editedEmployee.id)) > 0
    : false;

  if (this.editedEmployee.workStatus != null) {
    // set work status buttons if the status exists
    this.status = this.editedEmployee.workStatus.toString(); // convert employee work status to string
    // set status radio
    if (this.status == '100') {
      this.statusRadio = 'full';
    } else if (this.status == '0') {
      this.statusRadio = 'inactive';
    } else {
      this.statusRadio = 'part';
    }
  }
  // set works status value to a string
  this.value = this.editedEmployee.workStatus.toString();
  // filter primes and contracts
  this.filterPrimes();
  this.filterContracts();
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

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
 * Converts a string to kebab case.
 *
 * @param value - String value to convert
 * @return String - String in kebab case
 */
function formatKebabCase(value) {
  return _.kebabCase(value);
} // formatKebabCase

/**
 * Checks if inactive work status button is selected.
 *
 * @return boolean - inactive work status button selected
 */
function isInactive() {
  return this.statusRadio == 'inactive';
} // isInactive

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
    hasErrors = !this.$refs.formFields.validate();
  }

  window.EventBus.$emit('doneValidating', 'employee', this.editedEmployee); // emit done validating
  window.EventBus.$emit('employeeStatus', hasErrors); // emit error status
} // validateFields

/**
 * Sets the status to an employee if part time, otherwise sets it to an empty string.
 */
function viewStatus() {
  if (this.editedEmployee.workStatus && this.editedEmployee.workStatus > 0 && this.editedEmployee.workStatus < 100) {
    this.status = this.editedEmployee.workStatus;
  } else {
    this.status = null;
  }
} // viewStatus

export default {
  created,
  data() {
    return {
      dateRules: [
        (v) => !isEmpty(v) || 'Date must be valid. Format: MM/DD/YYYY',
        (v) => (!isEmpty(v) && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/DD/YYYY',
        (v) => moment(v, 'MM/DD/YYYY').isValid() || 'Date must be valid'
      ], // rules for a required date
      deptDateFormatted: null, // formatted departure date
      departureMenu: false, // display depature menu
      editedEmployee: _.cloneDeep(this.model), //employee that can be edited
      emailRules: [
        (v) => !isEmpty(v) || 'Email is required',
        (v) => regex.test(v) || 'Not a valid @consultwithcase email address'
      ], // rules for an employee email
      employeeInfo: {
        primes: [],
        contracts: []
      }, // employee prime and contract info
      employeeRoleFormatted: null,
      employees: [], // all employees
      hasExpenses: false, // employee has expenses
      hireDateFormatted: null, // formatted hire date
      hireMenu: false, // display hire menu
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
      numberRules: [
        (v) => !isEmpty(v) || 'Employee # is required',
        (v) => /^\d+$/.test(v) || 'Employee # must be a positive number'
      ], // rules for an employee number
      permissions: ['Admin', 'User', 'Intern'], // employee role options
      requiredRules: [(v) => !isEmpty(v) || 'This field is required'], // rules for a required field
      status: '100', // work status value
      statusRadio: 'full', // work status button
      value: '' // used for removing non-number characters from the workstatus
    };
  },
  directives: { mask },
  methods: {
    formatDate,
    formatKebabCase,
    filterContracts,
    filterPrimes,
    isEmpty,
    isInactive,
    isMobile,
    isPartTime,
    isStatusEmpty,
    parseDate,
    validateFields,
    viewStatus
  },
  props: ['admin', 'model', 'validating'],
  watch: {
    'model.id': function () {
      this.editedEmployee = _.cloneDeep(this.model);
    },
    'editedEmployee.employeeRole': function () {
      if (this.editedEmployee.employeeRole != 'User') {
        this.employeeRoleFormatted = _.startCase(this.editedEmployee.employeeRole);
      }
    },
    'editedEmployee.deptDate': function () {
      this.deptDateFormatted = formatDate(this.editedEmployee.deptDate) || this.deptDateFormatted;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.editedEmployee.deptDate !== null && !formatDate(this.editedEmployee.deptDate)) {
        this.editedEmployee.deptDate = null;
      }
    },
    'editedEmployee.hireDate': async function () {
      this.hasExpenses = this.editedEmployee.id
        ? _.size(await api.getAllEmployeeExpenses(this.editedEmployee.id)) > 0
        : false;
      this.hireDateFormatted = formatDate(this.editedEmployee.hireDate) || this.hireDateFormatted;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.editedEmployee.hireDate !== null && !formatDate(this.editedEmployee.hireDate)) {
        this.editedEmployee.hireDate = null;
      }
    },
    statusRadio: function () {
      if (this.statusRadio == 'full') {
        this.status = '100';
        this.editedEmployee.workStatus = 100;
        this.editedEmployee.deptDate = null;
      } else if (this.statusRadio == 'inactive') {
        this.status = '0';
        this.editedEmployee.workStatus = 0;
      } else {
        this.editedEmployee.deptDate = null;
      }
    },
    status: function () {
      if (this.status) {
        this.editedEmployee.workStatus = parseInt(this.status);
      } else {
        this.editedEmployee.workStatus = null;
      }
    },
    validating: function (val) {
      if (val) {
        // parent component triggers validation
        this.validateFields();
      }
    }
  }
};
</script>

<style scoped>
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
