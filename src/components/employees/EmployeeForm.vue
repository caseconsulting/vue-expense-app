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
      <v-btn color="white" text @click="clearStatus"> Close </v-btn>
    </v-snackbar>
    <!-- End Status Alert -->

    <v-card hover>
      <!-- Form Header -->
      <v-card-title class="header_style">
        <h3 v-if="model.id">Editing {{ fullName }}</h3>
        <h3 v-else>New Employee</h3>
      </v-card-title>

      <v-container fluid>
        <v-form ref="form" v-model="valid" lazy-validation class="my-1 mx-5">
          <!-- Tabs -->
          <v-tabs v-model="formTab" center-active show-arrows class="pb-0">
            <v-tab href="#employee" v-bind:class="{ errorTab: tabErrors.employee }">Employee</v-tab>
            <v-tab href="#personal" v-bind:class="{ errorTab: tabErrors.personal }">Personal</v-tab>
            <v-tab href="#education" v-bind:class="{ errorTab: tabErrors.education }">Education</v-tab>
            <v-tab href="#jobExperience" v-bind:class="{ errorTab: tabErrors.jobExperience }">Job Experience</v-tab>
            <v-tab href="#certifications" v-bind:class="{ errorTab: tabErrors.certifications }">Certifications</v-tab>
            <v-tab href="#awards" v-bind:class="{ errorTab: tabErrors.awards }">Awards</v-tab>
            <v-tab href="#technologies" v-bind:class="{ errorTab: tabErrors.technologies }">Technologies</v-tab>
            <v-tab href="#customerOrgExp" v-bind:class="{ errorTab: tabErrors.customerOrgExp }">Customer Org</v-tab>
            <v-tab href="#contracts" v-bind:class="{ errorTab: tabErrors.contracts }">Contracts</v-tab>
            <v-tab href="#clearance" v-bind:class="{ errorTab: tabErrors.clearance }">Clearance</v-tab>
            <!-- Employee -->
            <v-tab-item id="employee" class="mt-6 mb-4">
              <employee-tab :admin="userIsAdmin()" :model="model" :validating="validating.employee"></employee-tab>
            </v-tab-item>
            <!-- Personal Info -->
            <v-tab-item id="personal" class="mt-6 mb-4">
              <personal-tab :model="model" :validating="validating.personal"></personal-tab>
            </v-tab-item>
            <!-- Education -->
            <v-tab-item id="education" class="mt-6 mb-4">
              <education-tab :model="model.degrees" :validating="validating.education"></education-tab>
            </v-tab-item>
            <!-- Experience -->
            <v-tab-item id="jobExperience" class="mt-6 mb-4">
              <job-experience-tab :model="model" :validating="validating.jobExperience"></job-experience-tab>
            </v-tab-item>
            <!-- Certifications -->
            <v-tab-item id="certifications" class="mt-6 mb-4">
              <certification-tab
                :model="model.certifications"
                :validating="validating.certifications"
              ></certification-tab>
            </v-tab-item>
            <!-- Awards -->
            <v-tab-item id="awards" class="mt-6 mb-4">
              <award-tab :model="model.awards" :validating="validating.awards"></award-tab>
            </v-tab-item>
            <!-- Technologies -->
            <v-tab-item id="technologies" class="mt-6 mb-4">
              <technology-tab :model="model.technologies" :validating="validating.technologies"></technology-tab>
            </v-tab-item>
            <!-- Customer Org Experience -->
            <v-tab-item id="customerOrgExp" class="mt-6 mb-4">
              <customer-org-tab
                :model="model.customerOrgExp"
                :validating="validating.customerOrgExp"
              ></customer-org-tab>
            </v-tab-item>
            <!-- Contracts -->
            <v-tab-item id="contracts" class="mt-6 mb-4">
              <contract-tab :model="model.contracts" :validating="validating.contracts"></contract-tab>
            </v-tab-item>
            <!-- Clearance -->
            <v-tab-item id="clearance" class="mt-6 mb-4">
              <clearance-tab :model="model.clearances" :validating="validating.clearance"></clearance-tab>
            </v-tab-item>
          </v-tabs>

          <!-- Form action buttons -->
          <v-btn class="ma-2" color="white" @click="cancel" elevation="2"
            ><icon class="mr-1" name="ban"></icon>Cancel</v-btn
          >
          <v-btn outlined class="ma-2" color="success" @click="confirm" :disabled="!valid || model.workStatus == null">
            <icon class="mr-1" name="save"></icon>Submit
          </v-btn>
          <!-- End form action buttons -->
        </v-form>
        <!-- Confirmation Model -->
        <form-submission-confirmation :toggleSubmissionConfirmation="this.confirming"></form-submission-confirmation>
      </v-container>
    </v-card>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import AwardTab from '@/components/employees/formTabs/AwardTab';
import CertificationTab from '@/components/employees/formTabs/CertificationTab';
import ClearanceTab from '@/components/employees/formTabs/ClearanceTab';
import ContractTab from '@/components/employees/formTabs/ContractTab';
import CustomerOrgTab from '@/components/employees/formTabs/CustomerOrgTab';
import EducationTab from '@/components/employees/formTabs/EducationTab';
import EmployeeTab from '@/components/employees/formTabs/EmployeeTab';
import FormSubmissionConfirmation from '@/components/modals/FormSubmissionConfirmation.vue';
import JobExperienceTab from '@/components/employees/formTabs/JobExperienceTab';
import PersonalTab from '@/components/employees/formTabs/PersonalTab';
import TechnologyTab from '@/components/employees/formTabs/TechnologyTab';
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
 * Resets back to employee info.
 */
function cancel() {
  window.EventBus.$emit('cancel-form');
} // cancel

/**
 * Removes unnecessary attributes from the employee data.
 */
function cleanUpData() {
  // degrees
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

  // certifications
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

  // awards
  if (!_.isEmpty(this.model.awards)) {
    this.model.awards = _.map(this.model.awards, (award) => {
      // remove date picker menu booleans
      delete award.showReceivedMenu;

      // delete null attributes
      _.forEach(award, (value, key) => {
        if (_.isNil(value)) {
          delete award[key];
        }
      });

      // return updated award
      return award;
    });
  } else {
    this.model.awards = null;
  }

  // technologies
  if (_.isEmpty(this.model.technologies)) {
    this.model.technologies = null;
  }

  // customer Org
  if (_.isEmpty(this.model.customerOrgExp)) {
    this.model.customerOrgExp = null;
  }

  // contracts
  if (_.isEmpty(this.model.contracts)) {
    this.model.contracts = null;
  }

  // jobs
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

  // IC time frames
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

  // clearances
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

/**
 * Validate and confirm form submission.
 */
async function confirm() {
  this.tabErrorMessage = null; //resets tab error message each time validating
  // validate tabs
  await _.forEach(this.tabCreated, (value, key) => {
    if (value) {
      this.validating[key] = true;
    }
  });

  //validates forms
  if (this.$refs.form.validate()) {
    //checks to see if there are any tabs with errors
    let hasErrors = await this.hasTabError();
    if (!hasErrors) {
      this.confirming = !this.confirming; // if no errors opens confirm submit popup
    } else if (this.tabErrorMessage) {
      //if there is a custom error message it is displayed here
      this.displayError(this.tabErrorMessage);
    }
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
 * Checks to see if any of the form tabs has an error.
 * @returns boolean - true if any tab has an error false otherwise.
 */
async function hasTabError() {
  let hasErrors = false;
  //iterates over tabs to see if there are any errors
  for (var key of Object.keys(this.tabErrors)) {
    if (this.tabErrors[key]) {
      hasErrors = true;
    }
  }
  return hasErrors;
} // hasTabError

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
    //this.confirming = false;
    this.submit();
  });

  // window.EventBus.$on('canceled', () => {
  //   this.confirming = false;
  // });

  // set tab mounted
  window.EventBus.$on('created', (tab) => {
    this.tabCreated[tab] = true;
  });

  // reset validating status and sets the data based on the tab
  window.EventBus.$on('doneValidating', (tab, data) => {
    this.setFormData(tab, data); //sets the form data
    this.validating[tab] = false;
  });

  // set tab error status
  window.EventBus.$on('awardStatus', (status) => {
    this.tabErrors.awards = status;
  });
  window.EventBus.$on('certificationsStatus', (status) => {
    this.tabErrors.certifications = status;
  });
  window.EventBus.$on('clearanceStatus', (status) => {
    this.tabErrors.clearance = status;
  });
  window.EventBus.$on('contractsStatus', (status) => {
    this.tabErrors.contracts = status;
  });
  window.EventBus.$on('customerOrgExpStatus', (status) => {
    this.tabErrors.customerOrgExp = status;
  });
  window.EventBus.$on('educationStatus', (status) => {
    this.tabErrors.education = status;
  });
  window.EventBus.$on('employeeStatus', (status) => {
    this.tabErrors.employee = status;
  });
  window.EventBus.$on('jobExperienceStatus', (status) => {
    this.tabErrors.jobExperience = status;
  });
  window.EventBus.$on('personalStatus', (status) => {
    this.tabErrors.personal = status;
  });
  window.EventBus.$on('technologiesStatus', (status, errorMessage) => {
    this.tabErrors.technologies = status;
    //when there is a custom error message (multiple entries with same name) gets it ready for display
    if (status && errorMessage) {
      this.tabErrorMessage = _.cloneDeep(errorMessage);
    }
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

/**
 * Sets the form data based on the given tab.
 * @param tab - the tab the data came from
 * @param data - the data to be saved
 */
function setFormData(tab, data) {
  if (tab == 'employee') {
    //sets all employee info to data returned from employee tab
    this.$set(this.model, 'firstName', data.firstName);
    this.$set(this.model, 'middleName', data.middleName);
    this.$set(this.model, 'lastName', data.lastName);
    this.$set(this.model, 'employeeNumber', data.employeeNumber);
    this.$set(this.model, 'email', data.email);
    this.$set(this.model, 'employeeRole', data.employeeRole);
    this.$set(this.model, 'hireDate', data.hireDate);
    this.$set(this.model, 'workStatus', data.workStatus);
    this.$set(this.model, 'deptDate', data.deptDate);
  } else if (tab == 'personal') {
    //sets all personal info to data returned from personal tab
    this.$set(this.model, 'prime', data.prime);
    this.$set(this.model, 'contract', data.contract);
    this.$set(this.model, 'github', data.github);
    this.$set(this.model, 'twitter', data.twitter);
    this.$set(this.model, 'jobRole', data.jobRole);
    this.$set(this.model, 'birthday', data.birthday);
    this.$set(this.model, 'birthdayFeed', data.birthdayFeed);
    this.$set(this.model, 'city', data.city);
    this.$set(this.model, 'country', data.country);
    this.$set(this.model, 'st', data.st);
  } else if (tab == 'education') {
    this.$set(this.model, 'degrees', data); //sets degrees to data returned from education tab
  } else if (tab == 'jobExperience') {
    //sets all jobExperience info to data returned from job experience tab
    this.$set(this.model, 'icTimeFrames', data.icTimeFrames);
    this.$set(this.model, 'jobs', data.jobs);
  } else if (tab == 'certifications') {
    this.$set(this.model, 'certifications', data); //sets certifications to data returned from certifications tab
  } else if (tab == 'awards') {
    this.$set(this.model, 'awards', data); //sets awards to data returned from awards tab
  } else if (tab == 'technologies') {
    this.$set(this.model, 'technologies', data); //sets technologies to data returned from technologies tab
  } else if (tab == 'customerOrgExp') {
    this.$set(this.model, 'customerOrgExp', data); //sets degrees to data returned from education tab
  } else if (tab == 'contracts') {
    this.$set(this.model, 'contracts', data); //sets contracts to data returned from contracts tab
  } else if (tab == 'clearance') {
    this.$set(this.model, 'clearances', data); //sets clearances to data returned from clearance tab
  }
} //setFormData

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
    AwardTab,
    CertificationTab,
    ClearanceTab,
    ContractTab,
    CustomerOrgTab,
    EducationTab,
    EmployeeTab,
    FormSubmissionConfirmation,
    JobExperienceTab,
    PersonalTab,
    TechnologyTab
  },
  created,
  data() {
    return {
      afterCreate: false, // component has been created
      confirming: false, // confirming form submission
      errorStatus: {
        statusType: undefined,
        statusMessage: null,
        color: null
      }, // snack bar error
      formTab: null, // currently active tab
      fullName: '', // employee's first and last name
      model: {
        awards: [],
        birthday: null,
        birthdayFeed: false,
        certifications: [],
        city: null,
        clearances: [],
        contract: null,
        contracts: [],
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
        technologies: [],
        twitter: null,
        workStatus: 100
      }, // employee info
      submitting: false, // submitting form
      tabErrors: {
        awards: false,
        certifications: false,
        clearance: false,
        contracts: false,
        customerOrgExp: false,
        education: false,
        employee: false,
        jobExperience: false,
        personal: false,
        technologies: false
      }, // tab error status
      tabErrorMessage: null, //used to display error message in popup if tab has a custom error message
      tabCreated: {
        awards: false,
        certifications: false,
        clearance: false,
        contracts: false,
        customerOrgExp: false,
        education: false,
        employee: false,
        jobExperience: false,
        personal: false,
        technologies: false
      }, // tab component created
      valid: false, // form validity
      validating: {
        awards: false,
        certifications: false,
        clearance: false,
        contracts: false,
        customerOrgExp: false,
        education: false,
        employee: false,
        jobExperience: false,
        personal: false,
        technologies: false
      } // signal to child tabs to validate
    };
  },
  methods: {
    cancel,
    cleanUpData,
    clearStatus,
    confirm,
    displayError,
    hasTabError,
    setFormData,
    submit,
    userIsAdmin
  },
  props: ['currentTab', 'employee'], // employee to be created/updated
  watch: {
    formTab: function (val) {
      // track current tab when switching between form and info
      if (this.afterCreate) {
        if (!_.isEqual(val, this.currentTab)) {
          window.EventBus.$emit('tabChange', val); // emit to parent tab was changed
        }
      }
    }
  }
};
</script>

<style>
.errorTab {
  color: red !important;
}
</style>
