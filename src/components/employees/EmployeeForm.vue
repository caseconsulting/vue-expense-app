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
          <v-tabs v-model="formTab" show-arrows class="pb-0">
            <v-tab href="#employee">Employee</v-tab>
            <v-tab href="#personal">Personal</v-tab>
            <v-tab href="#degrees">Degrees</v-tab>
            <v-tab href="#jobExperience">Job Experience</v-tab>
            <v-tab href="#certifications">Certifications</v-tab>
            <v-tab href="#awards">Awards</v-tab>
            <v-tab href="#technologies">Technologies</v-tab>
            <v-tab href="#customerOrgExp">Customer Org</v-tab>
            <v-tab-item id="employee">
              <employee-tab :admin="userIsAdmin()" :model="model"></employee-tab>
            </v-tab-item>
            <!-- End Employee Tab -->
            <!-- Personal Info -->
            <v-tab-item id="personal">
              <personal-tab :model="model"></personal-tab>
            </v-tab-item>
            <!-- End Personal Info -->

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
          <v-btn outlined class="ma-2" color="success" @click="confirm" :disabled="!valid || model.workStatus == null">
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
import EmployeeTab from '@/components/employees/formTabs/EmployeeTab';
import FormSubmissionConfirmation from '@/components/modals/FormSubmissionConfirmation.vue';
import PersonalTab from '@/components/employees/formTabs/PersonalTab';
import { getRole } from '@/utils/auth';
import { v4 as uuid } from 'uuid';
import _ from 'lodash';

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
 * Submits the employee form.
 */
async function submit() {
  this.submitting = true;
  if (this.$refs.form.validate()) {
    // form validated
    this.$emit('startAction');

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

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

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
  this.birthdayFormat = this.formatDate(this.model.birthday) || this.birthdayFormat;
  //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
  if (this.model.birthday !== null && !this.formatDate(this.model.birthday)) {
    this.model.birthday = null;
  }
  if (this.employee) {
    this.fullName = `${this.employee.firstName} ${this.employee.lastName}`;
  }

  this.formTab = this.currentTab;
  this.afterCreate = true;
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
    EmployeeTab,
    FormSubmissionConfirmation,
    PersonalTab
  },
  created,
  data() {
    return {
      birthdayFormat: null, // formatted birthday
      BirthdayMenu: false,
      confirming: false,
      dateOptionalRules: [
        (v) => {
          if (v) {
            return /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) || 'Date must be valid. Format: MM/DD/YYYY';
          } else {
            return true;
          }
        }
      ], // rules for optional date
      errorStatus: {
        statusType: undefined,
        statusMessage: null,
        color: null
      }, // snack bar error
      formTab: null,
      fullName: '', // employee's first and last name
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
      submitting: false,
      valid: false, // form validity
      undisabled: false
    };
  },
  methods: {
    cancel,
    clearStatus,
    confirm,
    displayError,
    formatDate,
    submit,
    userIsAdmin
  },
  props: ['currentTab', 'employee'], // employee to be created/updated
  watch: {
    formTab: function (val) {
      if (this.afterCreate) {
        if (!_.isEqual(val, this.currentTab)) {
          window.EventBus.$emit('tabChange', val);
        }
      }
    },
    'model.birthday': function () {
      this.birthdayFormat = this.formatDate(this.model.birthday) || this.birthdayFormat;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.model.birthday !== null && !this.formatDate(this.model.birthday)) {
        this.model.birthday = null;
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
