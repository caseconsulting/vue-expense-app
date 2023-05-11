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
      ></v-text-field>
      <!-- Middle Name -->
      <v-text-field
        id="employeeMiddleName"
        ref="formFields"
        v-model="editedEmployee.middleName"
        :rules="middleNameRules()"
        label="Middle Name"
        data-vv-name="Middle Name"
        :disabled="editedEmployee.noMiddleName"
      ></v-text-field>
      <v-checkbox
        class="mt-0"
        id="employeeMiddleBox"
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
      ></v-text-field>
      <!-- Nickname -->
      <v-text-field
        id="employeeNickname"
        ref="formFields"
        v-model="editedEmployee.nickname"
        label="Nickname (optional)"
        data-vv-name="Nickname"
        :disabled="!userRoleIsAdmin() && !thisIsMyProfile() && !userRoleIsManager()"
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
        v-model="emailUsername"
        suffix="@consultwithcase.com"
        :rules="emailRules"
        label="Email"
        data-vv-name="Email"
        :disabled="!admin"
        @blur="combineEmailUsernameAndDomain"
      ></v-text-field>

      <!-- Job Role -->
      <v-combobox
        id="employeeJobRole"
        :items="jobTitles"
        v-model="editedEmployee.jobRole"
        item-text="text"
        label="Job Role (optional)"
      ></v-combobox>

      <!-- AIN -->
      <v-text-field
        id="agencyIdentificationNumber"
        ref="formFields"
        v-model="editedEmployee.agencyIdentificationNumber"
        label="Agency Identification Number"
        data-vv-name="Agency Identification Number"
      ></v-text-field>

      <!-- Employee Role -->
      <v-autocomplete
        v-if="!loading && (userRoleIsAdmin() || (userRoleIsManager() && !thisIsMyProfile()))"
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
            @blur="editedEmployee.hireDate = format(hireDateFormatted, 'MM/DD/YYYY', 'YYYY-MM-DD')"
            @input="hireMenu = false"
            v-on="on"
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="editedEmployee.hireDate"
          no-title
          :max="editedEmployee.deptDate"
          @input="hireMenu = false"
          :disabled="!admin"
        ></v-date-picker>
      </v-menu>
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
        :disabled="!admin"
      >
        <template v-slot:activator="{ on }">
          <v-text-field
            ref="formFields"
            v-model="deptDateFormatted"
            :rules="[...getDateRules(), ...validateDates()]"
            label="Departure Date"
            hint="MM/DD/YYYY format"
            v-mask="'##/##/####'"
            persistent-hint
            prepend-icon="event"
            @blur="editedEmployee.deptDate = format(deptDateFormatted, 'MM/DD/YYYY', 'YYYY-MM-DD')"
            @input="departureMenu = false"
            v-on="on"
            :disabled="!admin"
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="editedEmployee.deptDate"
          no-title
          :min="editedEmployee.hireDate"
          @input="departureMenu = false"
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
      <v-switch
        v-model="mifiStatus"
        label="Use Mifi instead of increased technology budget ($150)"
        v-if="!userRoleIsIntern() && !isInactive()"
      ></v-switch>

      <!-- START EEO Compliance Reporting Section -->
      <v-divider class="my-2"></v-divider>
      <p class="mb-0 mt-5">
        EEO Compliance Reporting
        <v-tooltip top max-width="500">
          <template v-slot:activator="{ on }">
            <v-icon v-on="on" class="case-gray">shield</v-icon>
          </template>
          <span
            >Data in this section is only Visible to You, Managers, and Admins. Equal Employment Opportunity (EEO)
            reporting is required for companies with more than 50 employees. <b>Note:</b> options for the fields below
            are the same as the options listed in the paper format.
          </span>
        </v-tooltip>
      </p>

      <!-- Gender -->
      <v-select
        label="Gender"
        v-model="editedEmployee.eeoGender"
        :items="eeoGenderItems"
        item-text="text"
        item-value="value"
        return-object
        :disabled="(editedEmployee.eeoDeclineSelfIdentify && thisIsMyProfile()) || !adminCanEditEeo()"
      >
      </v-select>
      <!-- Hispanic or Latino -->
      <v-select
        label="Hispanic or Latino"
        v-model="editedEmployee.eeoHispanicOrLatino"
        :items="eeoHispanicOrLatinoItems"
        item-text="text"
        item-value="value"
        return-object
        :disabled="(editedEmployee.eeoDeclineSelfIdentify && thisIsMyProfile()) || !adminCanEditEeo()"
      >
      </v-select>
      <!-- Race or Ethnicity -->
      <v-select
        label="Race or Ethnicity"
        v-model="editedEmployee.eeoRaceOrEthnicity"
        :items="eeoRaceOrEthnicityItems"
        item-text="text"
        item-value="value"
        return-object
        :disabled="
          (editedEmployee.eeoDeclineSelfIdentify && thisIsMyProfile()) || disableRaceOrEthnicity || !adminCanEditEeo()
        "
      >
      </v-select>
      <!-- Job Category -->
      <v-tooltip top max-width="400"
        ><template v-slot:activator="{ on }">
          <div v-on="on">
            <v-select
              label="Job Category"
              v-model="editedEmployee.eeoJobCategory"
              :items="eeoJobCategoryItems"
              item-text="text"
              item-value="value"
              return-object
              :disabled="(editedEmployee.eeoDeclineSelfIdentify && thisIsMyProfile()) || !adminCanEditEeo()"
            >
            </v-select>
          </div>
        </template>
        <span
          >Most CASE employees are considered 'Professionals'. Please select 'Professional' unless you know you fall
          into a different category.</span
        >
      </v-tooltip>

      <!-- Disability -->
      <v-radio-group
        v-model="editedEmployee.eeoHasDisability"
        :disabled="(editedEmployee.eeoDeclineSelfIdentify && thisIsMyProfile()) || !adminCanEditEeo()"
        row
        class="mt-0"
      >
        <span class="mr-4">Disability:</span>
        <v-radio label="Yes" :value="true"></v-radio>
        <v-radio label="No" :value="false"></v-radio>
      </v-radio-group>

      <!-- Protected Veteran -->
      <v-radio-group
        v-model="editedEmployee.eeoIsProtectedVeteran"
        :disabled="(editedEmployee.eeoDeclineSelfIdentify && thisIsMyProfile()) || !adminCanEditEeo()"
        row
        class="mt-0"
      >
        <span class="mr-4">Protected Veteran:</span>
        <v-radio label="Yes" :value="true"></v-radio>
        <v-radio label="No" :value="false"></v-radio>
      </v-radio-group>

      <!-- Decline Self-identify -->
      <v-checkbox
        class="mt-0"
        label="Decline to self-identify"
        v-model="editedEmployee.eeoDeclineSelfIdentify"
        :disabled="!thisIsMyProfile()"
      ></v-checkbox>

      <!-- Confirm Decline Self-Identify Modal -->
      <e-e-o-decline-self-identify
        :toggleDeclineSelfIdentifyModal="toggleDeclineSelfIdentifyModal"
      ></e-e-o-decline-self-identify>
      <!-- END EEO Compliance Reporting Section -->
    </div>
  </div>
</template>
<script>
import api from '@/shared/api.js';
import _ from 'lodash';
import { getDateRules, getNumberRules, getRequiredRules, getValidateFalse } from '@/shared/validationUtils.js';
import { isEmpty, isMobile, userRoleIsAdmin, userRoleIsManager, userRoleIsUser, userRoleIsIntern } from '@/utils/utils';
import { format } from '@/shared/dateUtils';
import { mask } from 'vue-the-mask';
import EEODeclineSelfIdentify from '../../modals/EEODeclineSelfIdentify.vue';

const caseEmailDomain = '@consultwithcase.com';

const regex = /^[a-zA-Z]+$/;

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Turn off listeners.
 */
function beforeDestroy() {
  window.EventBus.$off('cancel-decline-self-identify');
  window.EventBus.$off('confirm-decline-self-identify');
} // beforeDestroy

/**
 * Emits to parent the component was created and get data.
 */
async function created() {
  window.EventBus.$emit('created', 'employee'); // emit employee tab was created
  window.EventBus.$on('cancel-decline-self-identify', () => {
    this.editedEmployee.eeoDeclineSelfIdentify = false;
    this.toggleDeclineSelfIdentifyModal = false;
  });
  window.EventBus.$on('confirm-decline-self-identify', () => {
    // clear fields
    this.editedEmployee.eeoGender = null;
    this.editedEmployee.eeoHispanicOrLatino = null;
    this.editedEmployee.eeoRaceOrEthnicity = null;
    this.editedEmployee.eeoJobCategory = null;
    this.editedEmployee.eeoHasDisability = null;
    this.editedEmployee.eeoIsProtectedVeteran = null;
    // close modal
    this.toggleDeclineSelfIdentifyModal = false;
  });
  // get all employees
  this.employees = this.$store.getters.employees;
  // set formatted hire date
  this.hireDateFormatted = this.format(this.editedEmployee.hireDate, null, 'MM/DD/YYYY') || this.hireDateFormatted;
  // set formatted depature date
  this.deptDateFormatted = this.format(this.editedEmployee.deptDate, null, 'MM/DD/YYYY') || this.deptDateFormatted;
  // fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
  if (this.editedEmployee.deptDate !== null && !this.format(this.editedEmployee.deptDate, null, 'MM/DD/YYYY')) {
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

  // set email username for textfield population
  this.emailUsername = this.editedEmployee.email.slice(0, this.editedEmployee.email.indexOf('@'));

  // set works status value to a string
  this.value = this.editedEmployee.workStatus.toString();
  this.userId = this.model.employeeNumber;

  // EEO reporting section
  // disable race and ethnicity field if "Hispanic and Latino" is selected.
  if (!this.isEmpty(this.editedEmployee.eeoHispanicOrLatino && this.editedEmployee.eeoRaceOrEthnicity)) {
    if (this.editedEmployee.eeoHispanicOrLatino.value && this.editedEmployee.eeoRaceOrEthnicity.value === 6) {
      this.disableRaceOrEthnicity = true;
    }
  }
  this.loading = false;
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Determines of a user is an admin or manager and
 * if they should be allowed to edit the eeo form.
 *
 * @return boolean - True if an admin/manager can edit an EEO
 */
function adminCanEditEeo() {
  if (this.thisIsMyProfile()) {
    return true;
  } else if ((this.userRoleIsAdmin() || this.userRoleIsManager()) && this.editedEmployee.eeoDeclineSelfIdentify) {
    return true;
  }
  return false;
} //adminCanEditEeo

/**
 * Attaches email username to Case domain name.
 */
function combineEmailUsernameAndDomain() {
  this.editedEmployee.email = this.emailUsername + caseEmailDomain;
} // combineEmailUsernameAndDomain

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
 * Checks if the profile accessed is the signed-in user's profile,
 * specifically used to prevent a manager from editing their own role
 *
 * @return boolean - true if the profile is the user's profile
 */
function thisIsMyProfile() {
  if (this.$route.params.id === this.$store.getters.employeeNumber.toString()) {
    return true;
  }
  return false;
} //thisIsMyProfile

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

  // Fail safe in case users or interns somehow change their disabled info
  // Without this, they could change the html to change their data
  if (this.userRoleIsUser() || this.userRoleIsIntern()) {
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

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for model.id - update the edited employee with the new model.
 */
function watchModelID() {
  this.editedEmployee = _.cloneDeep(this.model);
} // watchModelID

/**
 * watcher for editedEmployee.employeeRole - format role.
 */
function watchEditedEmployeeEmployeeRole() {
  if (this.editedEmployee.employeeRole != 'User') {
    this.employeeRoleFormatted = _.startCase(this.editedEmployee.employeeRole);
  }
} // watchEditedEmployeeEmployeeRole

/**
 * watcher for editedEmployee.deptDate - format date on change.
 */
function watchEditedEmployeeDeptDate() {
  this.deptDateFormatted = format(this.editedEmployee.deptDate, null, 'MM/DD/YYYY') || this.deptDateFormatted;
  //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
  if (this.editedEmployee.deptDate !== null && !this.format(this.editedEmployee.deptDate, null, 'MM/DD/YYYY')) {
    this.editedEmployee.deptDate = null;
  }
} // watchEditedEmployeeDeptDate

/**
 * watcher for editedEmployee.hireDate - format date on change.
 */
async function watchEditedEmployeeHireDate() {
  this.hasExpenses = this.editedEmployee.id
    ? _.size(await api.getAllEmployeeExpenses(this.editedEmployee.id)) > 0
    : false;
  this.hireDateFormatted = this.format(this.editedEmployee.hireDate, null, 'MM/DD/YYYY') || this.hireDateFormatted;
  //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
  if (this.editedEmployee.hireDate !== null && !this.format(this.editedEmployee.hireDate, null, 'MM/DD/YYYY')) {
    this.editedEmployee.hireDate = null;
  }
} // watchEditedEmployeeHireDate

/**
 * watcher for editedEmployee.employeeNumber - determines disable on resume button.
 */
function watchEditedEmployeeEmployeeNumber() {
  let empNum = this.editedEmployee.employeeNumber;
  // determine if the resume button should be disabled or not
  if (empNum !== '' && !isNaN(empNum) && parseInt(empNum) > 0) {
    window.EventBus.$emit('disableUpload', false, empNum);
  } else {
    window.EventBus.$emit('disableUpload', true, empNum);
  }
} // watchEditedEmployeeEmployeeNumber

/**
 * watcher for statusRadio - sets the status and edited employee work status.
 */
function watchStatusRadio() {
  if (this.statusRadio == 'full') {
    this.status = '100';
    this.editedEmployee.workStatus = 100;
    this.editedEmployee.deptDate = null;
  } else if (this.statusRadio == 'inactive') {
    this.status = '0';
    this.editedEmployee.workStatus = 0;
    if (this.deptDateFormatted) {
      this.editedEmployee.deptDate = this.format(this.deptDateFormatted, 'MM/DD/YYYY', 'YYYY-MM-DD');
    }
  } else {
    this.editedEmployee.deptDate = null;
  }
} // watchStatusRadio

/**
 * watcher for status - sets workStatus for the edited employee.
 */
function watchStatus() {
  if (this.status) {
    this.editedEmployee.workStatus = parseInt(this.status);
  } else {
    this.editedEmployee.workStatus = null;
  }
} // watchStatus

/**
 * watcher for mifiStatus sets the editedEmployee when mifiStatus changes.
 */
function watchMifiStatus() {
  this.editedEmployee.mifiStatus = this.mifiStatus;
} // watchMifiStatus

/**
 * watcher for validating - validates fields.
 *
 * @param val - val prop that needs to exist before validating
 */
function watchValidating(val) {
  if (val) {
    // parent component triggers validation
    this.validateFields();
  }
} // watchValidating

/**
 * watcher for activating confirmation modal.
 */
function watchEeoDeclineSelfIdentify() {
  if (this.editedEmployee.eeoDeclineSelfIdentify) {
    // activate modal
    this.toggleDeclineSelfIdentifyModal = true;
  } else if (this.isEmpty(this.editedEmployee.eeoRaceOrEthnicity)) {
    this.disableRaceOrEthnicity = false;
  }
} // watchEeoDeclineSelfIdentify

/**
 * watch for hispanic or latino selection and
 * clear the v-model for race or ethnicity if "Hispanic or Latino" is selected.
 */
function watchEeoHispanicOrLatino() {
  if (!this.isEmpty(this.editedEmployee.eeoHispanicOrLatino)) {
    if (this.editedEmployee.eeoHispanicOrLatino.value) {
      this.editedEmployee.eeoRaceOrEthnicity = this.eeoRaceOrEthnicityItems[6];
      this.disableRaceOrEthnicity = true;
    } else {
      this.disableRaceOrEthnicity = false;
      if (!this.isEmpty(this.editedEmployee.eeoRaceOrEthnicity) && this.editedEmployee.eeoRaceOrEthnicity.value === 6) {
        this.editedEmployee.eeoRaceOrEthnicity = null;
      }
    }
  }
} // watchEeoHispanicOrLatino

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  beforeDestroy,
  components: { EEODeclineSelfIdentify },
  created,
  data() {
    return {
      agencyIdentificationNumber: '',
      deptDateFormatted: null, // formatted departure date
      departureMenu: false, // display depature menu
      editedEmployee: _.cloneDeep(this.model), //employee that can be edited
      emailUsername: '',
      emailRules: [
        (v) => !this.isEmpty(v) || 'Email is required',
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
      statusRules: [(v) => !this.isEmpty(v) || '', (v) => (v !== '0' && v !== '00') || ''],
      validateDates: () => {
        // if the hire date is later than the departure date
        if (this.editedEmployee.hireDate > this.editedEmployee.deptDate) {
          return this.getValidateFalse();
        } else {
          return true;
        }
      },
      userId: null,
      value: '', // used for removing non-number characters from the workstatus
      toggleDeclineSelfIdentifyModal: false,
      disableRaceOrEthnicity: false,
      eeoGenderItems: [
        {
          text: 'Male',
          value: true
        },
        { text: 'Female', value: false }
      ],
      eeoHispanicOrLatinoItems: [
        {
          text: 'Hispanic or Latino',
          value: true
        },
        { text: 'Not Hispanic or Latino', value: false }
      ],
      eeoRaceOrEthnicityItems: [
        { text: 'White', value: 0 },
        {
          text: 'Black or African American',
          value: 1
        },
        { text: 'Native Hawaiian or Other Pacific Islander', value: 2 },
        {
          text: 'Asian',
          value: 3
        },
        { text: 'American Indian or Alaska Native', value: 4 },
        {
          text: 'Two or More Races',
          value: 5
        },
        { text: 'Not Applicable', value: 6 }
      ],
      eeoJobCategoryItems: [
        { text: 'Professional', value: 0 },
        {
          text: 'Executive/Senior Level Offcial and Manager',
          value: 1
        },
        { text: 'First/Mid-Level Offcial and Manager', value: 2 },
        {
          text: 'Technician',
          value: 3
        },
        { text: 'Sales Worker', value: 4 },
        {
          text: 'Administrative Support Worker',
          value: 5
        },
        { text: 'Craft Worker', value: 6 },
        {
          text: 'Operative',
          value: 7
        },
        { text: 'Laborer and Helper', value: 8 },
        {
          text: 'Service Worker',
          value: 9
        }
      ]
    };
  },
  directives: { mask },
  methods: {
    adminCanEditEeo,
    combineEmailUsernameAndDomain,
    duplicateEmployeeNum,
    format,
    formatKebabCase,
    getDateRules,
    getNumberRules,
    getRequiredRules,
    getValidateFalse,
    isEmpty,
    isInactive,
    isMobile,
    isPartTime,
    thisIsMyProfile,
    userRoleIsAdmin,
    userRoleIsManager,
    userRoleIsUser,
    userRoleIsIntern,
    validateFields,
    viewStatus
  },
  props: ['admin', 'model', 'validating', 'disableEmpNum'],
  watch: {
    'model.id': watchModelID,
    'editedEmployee.employeeRole': watchEditedEmployeeEmployeeRole,
    'editedEmployee.deptDate': watchEditedEmployeeDeptDate,
    'editedEmployee.hireDate': watchEditedEmployeeHireDate,
    'editedEmployee.employeeNumber': watchEditedEmployeeEmployeeNumber,
    statusRadio: watchStatusRadio,
    status: watchStatus,
    mifiStatus: watchMifiStatus,
    validating: watchValidating,
    'editedEmployee.eeoDeclineSelfIdentify': watchEeoDeclineSelfIdentify,
    'editedEmployee.eeoHispanicOrLatino': watchEeoHispanicOrLatino
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
