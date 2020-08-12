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
          <v-tabs v-model="formTab" center-active show-arrows class="pb-0">
            <v-tab href="#employee">Employee</v-tab>
            <v-tab href="#personal">Personal</v-tab>
            <v-tab href="#education">Education</v-tab>
            <v-tab href="#jobExperience">Job Experience</v-tab>
            <v-tab href="#certifications">Certifications</v-tab>
            <v-tab href="#awards">Awards</v-tab>
            <v-tab href="#technologies">Technologies</v-tab>
            <v-tab href="#customerOrgExp">Customer Org</v-tab>
            <v-tab href="#clearance">Clearance</v-tab>
            <!-- Employee -->
            <v-tab-item id="employee">
              <employee-tab :admin="userIsAdmin()" :model="model"></employee-tab>
            </v-tab-item>
            <!-- Personal Info -->
            <v-tab-item id="personal">
              <personal-tab :model="model"></personal-tab>
            </v-tab-item>
            <!-- Education -->
            <v-tab-item id="education">
              <education-tab :model="model"></education-tab>
            </v-tab-item>
            <!-- Experience -->
            <v-tab-item id="jobExperience">
              <job-experience-tab :model="model"></job-experience-tab>
            </v-tab-item>
            <!-- Certifications -->
            <v-tab-item id="certifications">
              <certification-tab :model="model"></certification-tab>
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
              <customer-org-tab :model="model"></customer-org-tab>
            </v-tab-item>
            <v-tab-item id="clearance">
              <clearance-tab :model="model"></clearance-tab>
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
import EducationTab from '@/components/employees/formTabs/EducationTab';
import EmployeeTab from '@/components/employees/formTabs/EmployeeTab';
import CertificationTab from '@/components/employees/formTabs/CertificationTab';
import CustomerOrgTab from '@/components/employees/formTabs/CustomerOrgTab';
import FormSubmissionConfirmation from '@/components/modals/FormSubmissionConfirmation.vue';
import JobExperienceTab from '@/components/employees/formTabs/JobExperienceTab';
import PersonalTab from '@/components/employees/formTabs/PersonalTab';
import ClearanceTab from '@/components/employees/formTabs/ClearanceTab';
import moment from 'moment';
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
 * Removes unnecessary attributes from the employee data.
 */
function cleanUpData() {
  // Degrees
  if (!_.isEmpty(this.model.degrees)) {
    this.model.degrees = _.map(this.model.degrees, (degree) => {
      // remove date picker menu booleans
      delete degree.showEducationMenu;

      // delete null attributes
      _.forEach(degree, (value, key) => {
        if (_.isNil(value)) {
          delete degree[key];
        }
      });

      // return updated degree
      return degree;
    });
  } else {
    this.model.degrees = null;
  }

  // Certifications
  if (!_.isEmpty(this.model.certifications)) {
    this.model.certifications = _.map(this.model.certifications, (certification) => {
      // remove date picker menu booleans
      delete certification.showReceivedMenu;
      delete certification.showExpirationMenu;

      // delete null attributes
      _.forEach(certification, (value, key) => {
        if (_.isNil(value)) {
          delete certification[key];
        }
      });

      // return updated certification
      return certification;
    });
  } else {
    this.model.certifications = null;
  }

  // Jobs
  if (!_.isEmpty(this.model.jobs)) {
    this.model.jobs = _.reverse(
      _.sortBy(
        _.map(this.model.jobs, (job) => {
          // remove date picker menu booleans
          delete job.showEndMenu;
          delete job.showStartMenu;

          // delete null attributes
          _.forEach(job, (value, key) => {
            if (_.isNil(value)) {
              delete job[key];
            }
          });

          // return updated job
          return job;
        }),
        (job) => {
          return moment(job.startDate);
        }
      )
    );
  } else {
    this.model.jobs = null;
  }

  // IC Time Frames
  if (!_.isEmpty(this.model.icTimeFrames)) {
    this.model.icTimeFrames = _.reverse(
      _.sortBy(
        _.map(this.model.icTimeFrames, (timeFrame) => {
          // remove date picker menu booleans
          delete timeFrame.showRangeMenu;

          // sort range dates
          let chronologicalRange = _.sortBy(timeFrame.range, (monthYear) => {
            return moment(monthYear, 'YYYY-MM');
          });

          timeFrame.range = chronologicalRange;

          // return updated time frame
          return timeFrame;
        }),
        (timeFrame) => {
          return moment(timeFrame.range[0], 'YYYY-MM');
        }
      )
    );
  } else {
    this.model.icTimeFrames = null;
  }

  // Clearances
  if (!_.isEmpty(this.model.clearances)) {
    this.model.clearances = _.reverse(
      _.sortBy(
        _.map(this.model.clearances, (clearance) => {
          // remove date picker menu booleans
          delete clearance.showGrantedMenu;
          delete clearance.showExpirationMenu;
          delete clearance.showSubmissionMenu;
          delete clearance.showPolyMenu;
          delete clearance.showAdjudicationMenu;

          // delete null attributes
          _.forEach(clearance, (value, key) => {
            if (_.isNil(value)) {
              delete clearance[key];
            }
          });

          // clean up and sort BI Dates
          clearance.biDates = _.reverse(
            _.sortBy(
              _.map(clearance.biDates, (biDates) => {
                let chronologicalRange = _.sortBy(biDates.range, (date) => {
                  return moment(date, 'YYYY-MM-DD');
                });
                return {
                  range: chronologicalRange
                };
              }),
              (biDates) => {
                return biDates.range[0];
              }
            )
          );

          // sort adjudication dates
          clearance.adjudicationDates = _.reverse(
            _.sortBy(clearance.adjudicationDates, (date) => {
              return moment(date, 'YYYY-MM-DD');
            })
          );

          // sort poly dates
          clearance.polyDates = _.reverse(
            _.sortBy(clearance.polyDates, (date) => {
              return moment(date, 'YYYY-MM-DD');
            })
          );

          // return updated clearance
          return clearance;
        }),
        (clearance) => {
          return moment(clearance.grantedDate);
        }
      )
    );
  } else {
    this.model.clearances = null;
  }
} // cleanUpData

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
 * Submits the employee form.
 */
async function submit() {
  this.submitting = true;
  if (this.$refs.form.validate()) {
    // form validated
    this.$emit('startAction');

    this.cleanUpData();

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
  this.model = _.cloneDeep(
    _.mergeWith(this.model, this.employee, (modelValue, employeeValue) => {
      return _.isNil(employeeValue) ? modelValue : employeeValue;
    })
  );

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
    CertificationTab,
    ClearanceTab,
    CustomerOrgTab,
    EducationTab,
    EmployeeTab,
    FormSubmissionConfirmation,
    JobExperienceTab,
    PersonalTab
  },
  created,
  data() {
    return {
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
        birthday: null,
        birthdayFeed: false,
        certifications: [],
        city: null,
        clearances: [],
        contract: null,
        country: null,
        customerOrgExp: [],
        degrees: [],
        deptDate: null,
        email: '@consultwithcase.com',
        employeeNumber: null,
        employeeRole: 'user',
        firstName: null,
        github: null,
        hireDate: null,
        icTimeFrames: [],
        id: null,
        jobRole: null,
        jobs: [],
        lastName: null,
        middleName: null,
        prime: null,
        st: null,
        twitter: null,
        workStatus: 100
      },
      submitting: false,
      valid: false // form validity
    };
  },
  methods: {
    cancel,
    cleanUpData,
    clearStatus,
    confirm,
    displayError,
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
    }
  }
};
</script>

<style>
.v-window {
  padding: 20px;
}
</style>
