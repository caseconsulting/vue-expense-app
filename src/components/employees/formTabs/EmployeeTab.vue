<template>
  <div>
    <!-- We have to put the fields in a v-for
      in order the 'ref=formFields' to be placed into
      an array -->
    <div v-for="i in [0]" :key="i">
      <!-- First Name -->
      <v-text-field
        id="employeeFirstName"
        ref="formFields"
        v-model="editedEmployee.firstName"
        :rules="getRequiredRules()"
        label="First Name"
        data-vv-name="First Name"
        :disabled="!admin"
      ></v-text-field>
      <!-- Middle Name -->
      <v-text-field
        id="employeeMiddleName"
        ref="formFields"
        v-model="editedEmployee.middleName"
        :rules="middleNameRules()"
        label="Middle Name"
        data-vv-name="Middle Name"
        :disabled="!admin || editedEmployee.noMiddleName"
      ></v-text-field>
      <v-checkbox
        class="mt-0"
        label="Do not have a middle name"
        v-model="editedEmployee.noMiddleName"
        @click="editedEmployee.middleName = null"
      ></v-checkbox>
      <!-- Last Name -->
      <v-text-field
        id="employeeLastName"
        ref="formFields"
        v-model="editedEmployee.lastName"
        :rules="getRequiredRules()"
        label="Last Name"
        data-vv-name="Last Name"
        :disabled="!admin"
      ></v-text-field>
      <!-- Nickname -->
      <v-text-field
        id="employeeNickname"
        ref="formFields"
        v-model="editedEmployee.nickname"
        label="Nickname (optional)"
        data-vv-name="Nickname"
        :disabled="!userIsAdmin() && !userIsEmployee() && !userIsManager()"
      ></v-text-field>

      <!-- Employee # -->
      <v-text-field
        id="employeeNumber"
        ref="formFields"
        v-model="editedEmployee.employeeNumber"
        :rules="[...getRequiredRules(), ...getNumberRules(), ...duplicateEmployeeNumberRule]"
        label="Employee #"
        data-vv-name="Employee #"
        :disabled="!admin || disableEmpNum"
        @input.native="duplicateEmployeeNum"
      ></v-text-field>

      <!-- Email -->
      <v-text-field
        id="employeeEmail"
        ref="formFields"
        v-model="editedEmployee.email"
        :rules="emailRules"
        label="Email"
        data-vv-name="Email"
        :disabled="!admin"
      ></v-text-field>

      <!-- Job Role -->
      <v-combobox
        id="employeeJobRole"
        :items="jobTitles"
        v-model="editedEmployee.jobRole"
        item-text="text"
        label="Job Role (optional)"
      ></v-combobox>

      <!-- Employee Role -->
      <v-autocomplete
        v-if="!loading && (userIsAdmin() || (userIsManager() && !userIsEmployee()))"
        id="employeeRole"
        ref="formFields"
        :items="permissions"
        :rules="getRequiredRules()"
        v-model="employeeRoleFormatted"
        label="Employee Role"
        @blur="editedEmployee.employeeRole = formatKebabCase(employeeRoleFormatted)"
      ></v-autocomplete>

      <!-- Hire Date -->
      <v-menu
        ref="hireMenu"
        :close-on-content-click="false"
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
            id="employeeHireDateField"
            ref="formFields"
            v-model="hireDateFormatted"
            :rules="getDateRules()"
            :disabled="hasExpenses || !admin"
            v-mask="'##/##/####'"
            label="Hire Date"
            hint="MM/DD/YYYY format"
            persistent-hint
            prepend-icon="event"
            @blur="editedEmployee.hireDate = parseDate(hireDateFormatted)"
            @input="hireMenu = false"
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
        <v-row class="ma-0">
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
          <v-col v-if="isPartTime()" cols="6" sm="3">
            <v-text-field
              class="employeeStatusBox"
              height="40"
              outlined
              ref="formFields"
              :rules="statusRules"
              suffix="%"
              v-mask="'##'"
              v-model="status"
            ></v-text-field>
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
        <div v-if="isPartTime()">
          <v-text-field
            class="employeeStatusBox"
            height="40"
            outlined
            ref="formFields"
            :rules="statusRules"
            suffix="%"
            v-mask="'##'"
            v-model="status"
          ></v-text-field>
        </div>
        <!-- End Full/Part/Inactive Status [DESKTOP] -->
      </v-radio-group>
      <!-- End [DESKTOP] -->
      <!-- If inactive, set Departure Date -->
      <v-menu
        v-if="isInactive()"
        ref="departureMenu"
        :rules="getRequiredRules()"
        :close-on-content-click="false"
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
            :rules="getDateRules()"
            label="Departure Date"
            hint="MM/DD/YYYY format"
            v-mask="'##/##/####'"
            persistent-hint
            prepend-icon="event"
            @blur="editedEmployee.deptDate = parseDate(deptDateFormatted)"
            @input="departureMenu = false"
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
      <v-switch
        v-model="mifiStatus"
        label="Use Mifi instead of increased technology budget ($150)"
        v-if="editedEmployee.employeeRole !== 'intern' && !isInactive()"
      ></v-switch>
    </div>
  </div>
</template>
<script>
import api from '@/shared/api.js';
import _ from 'lodash';
import { getDateRules, getNumberRules, getRequiredRules } from '@/shared/validationUtils.js';
import { formatDate, isEmpty, parseDate, isMobile } from '@/utils/utils';
import { mask } from 'vue-the-mask';
import { getRole } from '@/utils/auth';
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
  this.hireDateFormatted = this.formatDate(this.editedEmployee.hireDate) || this.hireDateFormatted;
  // set formatted depature date
  this.deptDateFormatted = this.formatDate(this.editedEmployee.deptDate) || this.deptDateFormatted;
  // fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
  if (this.editedEmployee.deptDate !== null && !this.formatDate(this.editedEmployee.deptDate)) {
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

  //set the mifiStatus switch initial value
  if (this.editedEmployee.mifiStatus != null) {
    this.mifiStatus = this.editedEmployee.mifiStatus;
  }
  // set works status value to a string
  this.value = this.editedEmployee.workStatus.toString();
  this.userId = this.model.employeeNumber;
  this.loading = false;
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

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
 * Checks if part time work status button is selected.
 *
 * @return boolean - part time work status button selected
 */
function isPartTime() {
  return this.statusRadio == 'part';
} // isPartTime

/**
 * Checks whether the current user role is admin, used specifically
 * to prevent the manager from changing their own role on the Employee tab
 * @return - boolean: true if the user role is admin
 */
function userIsAdmin() {
  return getRole() === 'admin';
} //userIsAdmin

/**
 * Checks if the profile accessed is the signed-in user's profile,
 * specifically used to prevent a manager from editing their own role
 *
 * @returns boolean - true if the profile is the user's profile
 */
function userIsEmployee() {
  if (this.$route.params.id == this.userId) {
    return true;
  }
  return false;
} //userIsEmployee

/**
 * Checks whether the current user role is manager
 * @returns - boolean: true if the user role is a manager
 */
function userIsManager() {
  return getRole() === 'manager';
} //userIsManager

/**
 * Validate all input fields are valid. Emit to parent the error status.
 */
function validateFields() {
  let errorCount = 0;
  //ensures that refs are put in an array so we can reuse forEach loop
  let components = !_.isArray(this.$refs.formFields) ? [this.$refs.formFields] : this.$refs.formFields;
  _.forEach(components, (field) => {
    if (field && !field.validate()) errorCount++;
  });

  // Fail safe in case users or inters somehow change their disabled info
  // Without this, they could change the html to change their data
  if (getRole() === 'user' || getRole() === 'intern') {
    this.editedEmployee.firstName = this.model.firstName;
    this.editedEmployee.middleName = this.model.middleName;
    this.editedEmployee.noMiddleName = this.model.noMiddleName;
    this.editedEmployee.lastName = this.model.lastName;
    this.editedEmployee.employeeNumber = this.model.employeeNumber;
    this.editedEmployee.email = this.model.email;
    this.editedEmployee.employeeRole = this.model.employeeRole;
    this.editedEmployee.hireDate = this.model.hireDate;
    this.editedEmployee.workStatus = this.model.workStatus;
  }

  window.EventBus.$emit('doneValidating', 'employee', this.editedEmployee); // emit done validating
  window.EventBus.$emit('employeeStatus', errorCount); // emit error status
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

/**
 * Emits the duplicated employee number.
 */
function duplicateEmployeeNum() {
  window.EventBus.$emit('disableUpload', this.duplicate, this.editedEmployee.employeeNumber);
} // duplicateEmployeeNum

export default {
  created,
  data() {
    return {
      deptDateFormatted: null, // formatted departure date
      departureMenu: false, // display depature menu
      editedEmployee: _.cloneDeep(this.model), //employee that can be edited
      emailRules: [
        (v) => !isEmpty(v) || 'Email is required',
        (v) => regex.test(v) || 'Not a valid @consultwithcase email address'
      ], // rules for an employee email
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
      loading: true,
      mifiStatus: true,
      duplicateEmployeeNumberRule: [
        (v) => {
          this.duplicate = false;
          _.forEach(this.employees, (employee) => {
            if (employee.employeeNumber != this.userId && employee.employeeNumber == v) {
              this.duplicate = true;
            }
          });
          return !this.duplicate || 'This employee id is already in use';
        }
      ],
      middleNameRules: () => {
        // if noMiddleName checkbox is not checked
        if (!this.editedEmployee.noMiddleName) {
          return this.getRequiredRules();
        }
      },
      permissions: ['Admin', 'User', 'Intern', 'Manager'], // employee role options
      status: '100', // work status value
      statusRadio: 'full', // work status button
      statusRules: [(v) => !isEmpty(v) || '', (v) => (v !== '0' && v !== '00') || ''],
      userId: null,
      value: '' // used for removing non-number characters from the workstatus
    };
  },
  directives: { mask },
  methods: {
    duplicateEmployeeNum,
    formatDate,
    formatKebabCase,
    getDateRules,
    getNumberRules,
    getRequiredRules,
    isEmpty,
    isInactive,
    isMobile,
    isPartTime,
    parseDate,
    userIsAdmin,
    userIsEmployee,
    userIsManager,
    validateFields,
    viewStatus
  },
  props: ['admin', 'model', 'validating', 'disableEmpNum'],
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
      this.deptDateFormatted = this.formatDate(this.editedEmployee.deptDate) || this.deptDateFormatted;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.editedEmployee.deptDate !== null && !this.formatDate(this.editedEmployee.deptDate)) {
        this.editedEmployee.deptDate = null;
      }
    },
    'editedEmployee.hireDate': async function () {
      this.hasExpenses = this.editedEmployee.id
        ? _.size(await api.getAllEmployeeExpenses(this.editedEmployee.id)) > 0
        : false;
      this.hireDateFormatted = this.formatDate(this.editedEmployee.hireDate) || this.hireDateFormatted;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.editedEmployee.hireDate !== null && !this.formatDate(this.editedEmployee.hireDate)) {
        this.editedEmployee.hireDate = null;
      }
    },
    'editedEmployee.employeeNumber': function () {
      let empNum = this.editedEmployee.employeeNumber;
      // determine if the resume button should be disabled or not
      if (empNum !== '' && !isNaN(empNum) && parseInt(empNum) > 0) {
        window.EventBus.$emit('disableUpload', false, empNum);
      } else {
        window.EventBus.$emit('disableUpload', true, empNum);
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
        if (this.deptDateFormatted && this.parseDate(this.deptDateFormatted)) {
          this.editedEmployee.deptDate = this.parseDate(this.deptDateFormatted);
        }
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
    mifiStatus: function () {
      this.editedEmployee.mifiStatus = this.mifiStatus;
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

.employeeStatusBox {
  width: 65px;
  height: 55px;
}

.employeeStatusBox >>> input {
  text-align: center;
}

.inputError {
  border: solid 1px red !important;
}
</style>
