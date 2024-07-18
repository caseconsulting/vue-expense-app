<template>
  <div>
    <small class="text-info">*indicates required field</small>
    <!-- We have to put the fields in a v-for
      in order the 'ref=formFields' to be placed into
      an array -->
    <div v-for="i in [0]" :key="i" class="mt-6">
      <v-row>
        <v-col cols="12" md="3" class="my-0 py-0 mb-md-4">
          <!-- First Name -->
          <v-text-field
            id="employeeFirstName"
            ref="formFields"
            v-model.trim="editedEmployee.firstName"
            :rules="getRequiredRules()"
            label="First Name*"
            variant="underlined"
            data-vv-name="First Name"
          ></v-text-field
        ></v-col>
        <v-col cols="12" md="3" class="my-0 py-0">
          <!-- Middle Name -->
          <div class="d-flex align-center">
            <v-text-field
              id="employeeMiddleName"
              ref="formFields"
              v-model.trim="editedEmployee.middleName"
              :rules="middleNameRules()"
              :label="editedEmployee.noMiddleName ? 'Not Applicable' : 'Middle Name*'"
              variant="underlined"
              data-vv-name="Middle Name"
              @update:model-value="
                editedEmployee.middleName && editedEmployee.middleName.length > 0
                  ? (editedEmployee.noMiddleName = false)
                  : ''
              "
            >
              <template v-slot:append-inner>
                <v-avatar
                  v-if="!editedEmployee.middleName"
                  @click="editedEmployee.noMiddleName = !editedEmployee.noMiddleName"
                  class="pointer"
                  size="x-small"
                >
                  <span v-if="!editedEmployee.noMiddleName">
                    <v-tooltip activator="parent">Click if you have no middle name</v-tooltip>
                    <v-icon color="black"> mdi-close-circle-outline </v-icon>
                  </span>
                  <span v-else>
                    <v-tooltip activator="parent">I do not have a middle name</v-tooltip>
                    <v-icon color="black"> mdi-minus-circle </v-icon>
                  </span>
                </v-avatar>
              </template>
            </v-text-field>
          </div>
        </v-col>
        <v-col cols="12" md="3" class="my-0 py-0">
          <!-- Last Name -->
          <v-text-field
            id="employeeLastName"
            ref="formFields"
            v-model.trim="editedEmployee.lastName"
            :rules="getRequiredRules()"
            label="Last Name*"
            variant="underlined"
            data-vv-name="Last Name"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3" class="my-0 py-0">
          <!-- Nickname -->
          <v-text-field
            id="employeeNickname"
            ref="formFields"
            v-model.trim="editedEmployee.nickname"
            label="Nickname"
            variant="underlined"
            data-vv-name="Nickname"
            :disabled="!userRoleIsAdmin() && !thisIsMyProfile() && !userRoleIsManager()"
          ></v-text-field>
        </v-col>
      </v-row>

      <!-- Employee # -->
      <v-text-field
        id="employeeNumber"
        ref="formFields"
        v-model="editedEmployee.employeeNumber"
        :rules="[...getRequiredRules(), ...getNumberRules(), ...duplicateEmployeeNumberRule]"
        label="Employee Number*"
        variant="underlined"
        data-vv-name="Employee Number"
        :disabled="!admin || disableEmpNum"
        @update:model-value="duplicateEmployeeNum"
      ></v-text-field>

      <!-- Email -->
      <v-text-field
        id="employeeEmail"
        ref="formFields"
        v-model.trim="emailUsername"
        suffix="@consultwithcase.com"
        :rules="getCaseEmailRules()"
        label="Email*"
        variant="underlined"
        data-vv-name="Email"
        :disabled="!admin"
        @update:focused="combineEmailUsernameAndDomain"
      ></v-text-field>

      <!-- Job Role -->
      <v-combobox
        id="employeeJobRole"
        :items="jobTitles"
        v-model="editedEmployee.jobRole"
        variant="underlined"
        item-title="text"
        label="Job Role"
      ></v-combobox>

      <!-- AIN -->
      <v-text-field
        id="agencyIdentificationNumber"
        ref="formFields"
        v-model.trim="editedEmployee.agencyIdentificationNumber"
        :rules="getAINRules()"
        maxLength="7"
        label="Agency Identification Number"
        variant="underlined"
        data-vv-name="Agency Identification Number"
      ></v-text-field>

      <!-- Employee Tags -->
      <v-autocomplete
        v-if="!loading && (userRoleIsAdmin() || userRoleIsManager())"
        id="employeeTags"
        ref="formFields"
        :items="$store.getters.tags"
        v-model="employeeEditedTags"
        multiple
        chips
        clearable
        closable-chips
        label="Employee Tags"
        variant="underlined"
        item-title="tagName"
        return-object
      ></v-autocomplete>

      <!-- Employee Role -->
      <v-autocomplete
        v-if="!loading && (userRoleIsAdmin() || (userRoleIsManager() && !thisIsMyProfile()))"
        id="employeeRole"
        ref="formFields"
        :items="permissions"
        :rules="getRequiredRules()"
        v-model="employeeRoleFormatted"
        label="Employee Role*"
        variant="underlined"
        @update:focused="editedEmployee.employeeRole = formatKebabCase(employeeRoleFormatted)"
      ></v-autocomplete>

      <!-- Hire Date -->
      <v-text-field
        id="employeeHireDateField"
        ref="formFields"
        v-model="hireDateFormatted"
        :rules="getDateRules()"
        :disabled="hasExpenses || !admin"
        v-mask="'##/##/####'"
        prepend-icon="mdi-calendar"
        label="Hire Date*"
        variant="underlined"
        hint="MM/DD/YYYY format"
        persistent-hint
        @update:focused="editedEmployee.hireDate = format(hireDateFormatted, 'MM/DD/YYYY', 'YYYY-MM-DD')"
        @click:prepend="hireMenu = true"
        @keypress="hireMenu = false"
        autocomplete="off"
      >
        <v-menu
          activator="parent"
          ref="hireMenu"
          location="start center"
          :close-on-content-click="false"
          v-model="hireMenu"
          :disabled="!admin"
        >
          <v-date-picker
            v-model="editedEmployee.hireDate"
            @update:model-value="hireMenu = false"
            :max="editedEmployee.deptDate"
            :disabled="!admin"
            show-adjacent-months
            hide-actions
            keyboard-icon=""
            color="#bc3825"
            title="Hire Date"
          ></v-date-picker>
        </v-menu>
      </v-text-field>

      <!-- If inactive, set Departure Date -->
      <v-text-field
        v-if="isInactive()"
        ref="formFields"
        id="employeeDepartureDateField"
        v-model="deptDateFormatted"
        :rules="[...getDateRules(), validateDates()]"
        label="Departure Date"
        variant="underlined"
        prepend-icon="mdi-calendar"
        hint="MM/DD/YYYY format"
        v-mask="'##/##/####'"
        class="mt-1"
        persistent-hint
        @update:focused="editedEmployee.deptDate = format(deptDateFormatted, 'MM/DD/YYYY', 'YYYY-MM-DD')"
        @click:prepend="departureMenu = true"
        @keypress="departureMenu = false"
        :disabled="!admin"
      >
        <v-menu
          activator="parent"
          :rules="getRequiredRules()"
          :close-on-content-click="false"
          v-model="departureMenu"
          :disabled="!admin"
          location="start center"
        >
          <v-date-picker
            v-model="editedEmployee.deptDate"
            @update:model-value="departureMenu = false"
            :min="editedEmployee.hireDate"
            :disabled="!admin"
            show-adjacent-months
            hide-actions
            keyboard-icon=""
            color="#bc3825"
            title="Departure Date"
          ></v-date-picker>
        </v-menu>
      </v-text-field>
      <!-- Full/Part/Inactive Status [MOBILE] -->
      <v-radio-group
        v-if="isMobile()"
        v-model="statusRadio"
        inline
        direction
        hide-details
        density="compact"
        class="my-4"
        :disabled="!admin"
      >
        <v-radio label="Full Time" value="full"></v-radio>
        <v-radio label="Part Time" value="part" class="mx-2" @update:model-value="viewStatus()"></v-radio>
        <v-radio label="Inactive" value="inactive"></v-radio>
        <!-- Custom Input Field -->
        <v-text-field
          v-if="isPartTime()"
          class="employeeStatusBox"
          variant="outlined"
          ref="formFields"
          :rules="statusRules"
          suffix="%"
          v-mask="'##'"
          v-model="status"
        ></v-text-field>
        <!-- End Custom Input Field -->
      </v-radio-group>
      <!-- End [Full/Part/Inactive Status [MOBILE]] -->

      <!-- Full/Part/Inactive Status [DESKTOP] -->
      <v-radio-group v-else v-model="statusRadio" inline hide-details :disabled="!admin" class="mt-5">
        <v-radio label="Full Time" value="full"></v-radio>
        <v-radio label="Part Time" value="part" @update:model-value="viewStatus()"></v-radio>
        <v-radio label="Inactive" value="inactive"></v-radio>
        <!-- custom input field -->
        <div v-if="isPartTime()">
          <v-text-field
            class="employeeStatusBox ml-4"
            variant="outlined"
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

      <!-- START EEO Compliance Reporting Section -->
      <v-divider class="my-2"></v-divider>
      <p class="mb-0 mt-5">
        EEO Compliance Reporting
        <span>
          <v-tooltip activator="parent" location="top" max-width="500">
            Data in this section is only Visible to You, Managers, and Admins. Equal Employment Opportunity (EEO)
            reporting is required for companies with more than 50 employees. <b>Note:</b> options for the fields below
            are the same as the options listed in the paper format.
          </v-tooltip>
          <v-icon class="case-gray">shield</v-icon>
        </span>
      </p>

      <!-- Gender -->
      <v-select
        label="Gender"
        v-model="editedEmployee.eeoGender"
        :items="eeoGenderItems"
        variant="underlined"
        item-title="text"
        item-value="value"
        return-object
        :disabled="(editedEmployee.eeoDeclineSelfIdentify || !thisIsMyProfile()) && !adminCanEditEeo()"
        clearable
      >
      </v-select>
      <!-- Hispanic or Latino -->
      <v-select
        label="Hispanic or Latino"
        v-model="editedEmployee.eeoHispanicOrLatino"
        :items="eeoHispanicOrLatinoItems"
        variant="underlined"
        item-title="text"
        item-value="value"
        return-object
        :disabled="(editedEmployee.eeoDeclineSelfIdentify || !thisIsMyProfile()) && !adminCanEditEeo()"
        clearable
      >
      </v-select>
      <!-- Race or Ethnicity -->
      <v-select
        label="Race or Ethnicity"
        v-model="editedEmployee.eeoRaceOrEthnicity"
        :items="eeoRaceOrEthnicityItems"
        variant="underlined"
        item-title="text"
        item-value="value"
        return-object
        :disabled="
          disableRaceOrEthnicity ||
          ((editedEmployee.eeoDeclineSelfIdentify || !thisIsMyProfile()) && !adminCanEditEeo())
        "
        clearable
      >
      </v-select>

      <div>
        <!-- Job Category -->
        <v-tooltip activator="parent" location="top" max-width="400">
          Most CASE employees are considered 'Professionals'. Please select 'Professional' unless you know you fall into
          a different category.
        </v-tooltip>
        <v-select
          label="Job Category"
          v-model="editedEmployee.eeoJobCategory"
          :items="eeoJobCategoryItems"
          variant="underlined"
          item-title="text"
          item-value="value"
          return-object
          :disabled="(editedEmployee.eeoDeclineSelfIdentify || !thisIsMyProfile()) && !adminCanEditEeo()"
          clearable
        >
        </v-select>
      </div>

      <!-- Disability -->
      <v-radio-group
        v-model="editedEmployee.eeoHasDisability"
        :disabled="(editedEmployee.eeoDeclineSelfIdentify || !thisIsMyProfile()) && !adminCanEditEeo()"
        inline
        hide-details
        class="mt-0"
        clearable
      >
        <span class="mt-2 mr-4">Disability:</span>
        <v-radio label="Yes" :value="true"></v-radio>
        <v-radio label="No" :value="false"></v-radio>
      </v-radio-group>

      <!-- Protected Veteran -->
      <v-radio-group
        v-model="editedEmployee.eeoIsProtectedVeteran"
        :disabled="(editedEmployee.eeoDeclineSelfIdentify || !thisIsMyProfile()) && !adminCanEditEeo()"
        inline
        hide-details
        class="mt-2"
        clearable
      >
        <span class="mt-2 mr-4">Protected Veteran:</span>
        <v-radio label="Yes" :value="true"></v-radio>
        <v-radio label="No" :value="false"></v-radio>
      </v-radio-group>

      <!-- Decline Self-identify -->
      <v-checkbox
        class="my-1"
        label="Decline to self-identify"
        v-model="editedEmployee.eeoDeclineSelfIdentify"
        :disabled="!adminCanEditEeo() && !thisIsMyProfile()"
        hide-details
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
import { format } from '@/shared/dateUtils';
import {
  getAINRules,
  getCaseEmailRules,
  getDateRules,
  getNumberRules,
  getRequiredRules,
  getValidateFalse
} from '@/shared/validationUtils';
import {
  asyncForEach,
  isEmpty,
  isMobile,
  userRoleIsAdmin,
  userRoleIsIntern,
  userRoleIsManager,
  userRoleIsUser
} from '@/utils/utils';
import _ from 'lodash';
import { mask } from 'vue-the-mask';
import EEODeclineSelfIdentify from '../../modals/EEODeclineSelfIdentify.vue';
import { JOB_TITLES } from './dropdown-info/jobTitles';

const caseEmailDomain = '@consultwithcase.com';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Turn off listeners.
 */
function beforeUnmount() {
  this.emitter.off('cancel-decline-self-identify');
  this.emitter.off('confirm-decline-self-identify');
} // beforeUnmount

/**
 * Emits to parent the component was created and get data.
 */
async function created() {
  this.emitter.emit('created', 'employee'); // emit employee tab was created
  this.emitter.on('cancel-decline-self-identify', () => {
    this.editedEmployee.eeoDeclineSelfIdentify = false;
    this.toggleDeclineSelfIdentifyModal = false;
  });
  this.emitter.on('confirm-decline-self-identify', () => {
    // clear fields
    if (this.thisIsMyProfile()) {
      this.editedEmployee.eeoGender = null;
      this.editedEmployee.eeoHispanicOrLatino = null;
      this.editedEmployee.eeoRaceOrEthnicity = null;
      this.editedEmployee.eeoJobCategory = null;
      this.editedEmployee.eeoHasDisability = null;
      this.editedEmployee.eeoIsProtectedVeteran = null;
    }
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
  this.populateJobRoleDropdown();
  // find an employees tags
  this.employeeTags = _.filter(this.$store.getters.tags, (tag) => _.includes(tag.employees, this.model.id));
  // using this field to determine if an api call to update tags is needed
  this.employeeEditedTags = _.cloneDeep(this.employeeTags);
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
  return this.userRoleIsAdmin() || this.userRoleIsManager();
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
 * Populates the job roles dropdown with employee data.
 */
function populateJobRoleDropdown() {
  let employeeJobTitles = _.map(this.employees, (e) => e.jobRole);
  employeeJobTitles = _.compact(employeeJobTitles);
  _.forEach(employeeJobTitles, (jobTitle) => this.jobTitles.push(jobTitle));
  this.jobTitles = Array.from(new Set(this.jobTitles)); // remove duplicates
  this.jobTitles?.sort();
} // populateJobRoleDropdown

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
async function validateFields() {
  let errorCount = 0;
  //ensures that refs are put in an array so we can reuse forEach loop
  let components = !_.isArray(this.$refs.formFields) ? [this.$refs.formFields] : this.$refs.formFields;
  await asyncForEach(components, async (field) => {
    if (field && (await field.validate()).length > 0) errorCount++;
  });

  // get symmetric difference of tags to determine which tags need to update
  this.employeeEditedTags = _.xor(
    _.map(this.employeeTags, (t) => t.id),
    _.map(this.employeeEditedTags, (t) => t.id)
  );
  // turn array of ids back into their original objects
  this.employeeEditedTags = _.filter(this.$store.getters.tags, (tag) =>
    _.find(this.employeeEditedTags, (t) => t === tag.id)
  );
  // employee will be added to tags in EmployeeForm when all fields are successfully validated
  this.editedEmployee.editedTags = _.cloneDeep(this.employeeEditedTags);

  // Fail safe in case users or interns somehow change their disabled info
  // Without this, they could change the html to change their data
  if (this.userRoleIsUser() || this.userRoleIsIntern()) {
    this.editedEmployee.employeeNumber = this.model.employeeNumber;
    this.editedEmployee.email = this.model.email;
    this.editedEmployee.employeeRole = this.model.employeeRole;
    this.editedEmployee.hireDate = this.model.hireDate;
    this.editedEmployee.workStatus = this.model.workStatus;
  }

  this.emitter.emit('doneValidating', { tab: 'employee', data: this.editedEmployee }); // emit done validating
  this.emitter.emit('employeeStatus', errorCount); // emit error status
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
  this.emitter.emit('disableUpload', { disabled: this.duplicate, employeeNumber: this.editedEmployee.employeeNumber });
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
    this.emitter.emit('disableUpload', { disabled: false, employeeNumber: empNum });
  } else {
    this.emitter.emit('disableUpload', { disabled: true, employeeNumber: empNum });
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
  beforeUnmount,
  components: { EEODeclineSelfIdentify },
  created,
  data() {
    return {
      agencyIdentificationNumber: '',
      deptDateFormatted: null, // formatted departure date
      departureMenu: false, // display depature menu
      editedEmployee: _.cloneDeep(this.model), //employee that can be edited
      emailUsername: '',
      employeeTags: null,
      employeeEditedTags: null,
      employeeRoleFormatted: null,
      employees: [], // all employees
      hasExpenses: false, // employee has expenses
      hireDateFormatted: null, // formatted hire date
      hireMenu: false, // display hire menu
      jobTitles: JOB_TITLES,
      loading: true,
      duplicateEmployeeNumberRule: [
        (v) => {
          this.duplicate = _.some(
            this.employees,
            (e) => e.employeeNumber === Number(v) && e.employeeNumber !== this.userId
          );
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
          text: 'Executive/Senior Level Official and Manager',
          value: 1
        },
        { text: 'First/Mid Level Official and Manager', value: 2 },
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
    getAINRules,
    getCaseEmailRules,
    getDateRules,
    getNumberRules,
    getRequiredRules,
    getValidateFalse,
    isEmpty,
    isInactive,
    isMobile,
    isPartTime,
    populateJobRoleDropdown,
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

.employeeStatusBox :deep(input) {
  text-align: center;
}

.inputError {
  border: solid 1px red !important;
}
</style>
