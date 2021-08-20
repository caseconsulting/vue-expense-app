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
        <v-row>
          <v-col col="6" class="text-left">
            <h3 v-if="model.id">Editing {{ fullName }}</h3>
            <h3 v-else>New Employee</h3>
          </v-col>
          <v-col col="6" class="text-right">
            <v-tooltip v-if="!model.id && uploadDisabled" right>
              <template v-slot:activator="{ on }">
                <div v-on="on">
                  <v-btn :disabled="true">Upload Resume</v-btn>
                </div>
              </template>
              <span>Please enter a valid employee #</span>
            </v-tooltip>
            <v-btn v-if="!model.id && !uploadDisabled" @click="openUpload">Upload Resume</v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <v-container fluid>
        <v-form ref="form" v-model="valid" lazy-validation class="my-1 mx-5">
          <div v-if="useDropDown">
            <!-- For smaller screens -->
            <v-row>
              <v-col align="center" justify="center">
                <v-menu align-center class="ma-4">
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn text x-large class="pt-5 font-weight-bold" v-bind="attrs" v-on="on"
                      >{{ parsedInfoTab }} <v-icon class="pb-1">expand_more</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="selectDropDown('employee')" v-bind:class="{ errorTab: tabErrors.employee }"
                      >Employee</v-list-item
                    >
                    <v-list-item @click="selectDropDown('personal')" v-bind:class="{ errorTab: tabErrors.personal }"
                      >Personal</v-list-item
                    >
                    <v-list-item @click="selectDropDown('education')" v-bind:class="{ errorTab: tabErrors.education }"
                      >Education</v-list-item
                    >
                    <v-list-item
                      @click="selectDropDown('jobExperience')"
                      v-bind:class="{ errorTab: tabErrors.jobExperience }"
                      >Job Experience</v-list-item
                    >
                    <v-list-item
                      @click="selectDropDown('certification')"
                      v-bind:class="{ errorTab: tabErrors.certification }"
                      >Certifications</v-list-item
                    >
                    <v-list-item @click="selectDropDown('awards')" v-bind:class="{ errorTab: tabErrors.awards }"
                      >Awards</v-list-item
                    >
                    <v-list-item
                      @click="selectDropDown('technologies')"
                      v-bind:class="{ errorTab: tabErrors.technologies }"
                      >Technologies</v-list-item
                    >
                    <v-list-item
                      @click="selectDropDown('customerOrgExp')"
                      v-bind:class="{ errorTab: tabErrors.customerOrgExp }"
                      >Customer Org</v-list-item
                    >
                    <v-list-item @click="selectDropDown('contracts')" v-bind:class="{ errorTab: tabErrors.contracts }"
                      >Contracts</v-list-item
                    >
                    <v-list-item @click="selectDropDown('clearance')" v-bind:class="{ errorTab: tabErrors.clearance }"
                      >Clearance</v-list-item
                    >
                    <v-list-item @click="selectDropDown('languages')" v-bind:class="{ errorTab: tabErrors.languages }"
                      >Languages</v-list-item
                    >
                  </v-list>
                </v-menu>
                <hr class="my-3" />
                <employee-tab
                  v-if="formTab === 'employee'"
                  :admin="hasAdminPermissions()"
                  :validating="validating.employee"
                  :model="model"
                >
                </employee-tab>
                <personal-tab v-if="formTab === 'personal'" :validating="validating.personal" :model="model">
                </personal-tab>
                <education-tab v-if="formTab === 'education'" :validating="validating.education" :model="model.degrees">
                </education-tab>
                <job-experience-tab
                  v-if="formTab === 'jobExperience'"
                  :validating="validating.jobExperience"
                  :model="model"
                >
                </job-experience-tab>
                <certification-tab
                  v-if="formTab === 'certification'"
                  :validating="validating.certifications"
                  :model="model.certifications"
                >
                </certification-tab>
                <award-tab
                  v-if="formTab === 'awards'"
                  :validating="validating.awards"
                  :model="model.awards"
                ></award-tab>
                <technology-tab
                  v-if="formTab === 'technologies'"
                  :validating="validating.technologies"
                  :model="model.technologies"
                >
                </technology-tab>
                <customer-org-tab
                  v-if="formTab === 'customerOrgExp'"
                  :validating="validating.customerOrgExp"
                  :model="model.customerOrgExp"
                >
                </customer-org-tab>
                <contract-tab
                  v-if="formTab === 'contracts'"
                  :validating="validating.contracts"
                  :model="model.contracts"
                >
                </contract-tab>
                <clearance-tab
                  v-if="formTab === 'clearance'"
                  :validating="validating.clearance"
                  :model="model.clearances"
                >
                </clearance-tab>
                <languages-tab
                  v-if="formTab === 'languages'"
                  :validating="validating.languages"
                  :model="model.languages"
                >
                </languages-tab>
              </v-col>
            </v-row>
          </div>
          <!-- Tabs for larger screens -->
          <v-tabs v-if="!useDropDown" v-model="formTab" center-active show-arrows class="pb-0">
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-tab v-on="on" href="#employee" v-bind:class="{ errorTab: tabErrors.employee }">Employee</v-tab>
              </template>
              <span v-if="tabErrors.employee">Submit to update tab validation</span>
              <span v-else>Employee Tab</span>
            </v-tooltip>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-tab v-on="on" href="#personal" v-bind:class="{ errorTab: tabErrors.personal }">Personal</v-tab>
              </template>
              <span v-if="tabErrors.personal">Submit to update tab validation</span>
              <span v-else>Personal Tab</span>
            </v-tooltip>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-tab v-on="on" href="#education" v-bind:class="{ errorTab: tabErrors.education }">Education</v-tab>
              </template>
              <span v-if="tabErrors.education">Submit to update tab validation</span>
              <span v-else>Education Tab</span>
            </v-tooltip>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-tab v-on="on" href="#jobExperience" v-bind:class="{ errorTab: tabErrors.jobExperience }"
                  >Job Experience</v-tab
                >
              </template>
              <span v-if="tabErrors.jobExperience">Submit to update tab validation</span>
              <span v-else>Job Experience Tab</span>
            </v-tooltip>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-tab v-on="on" href="#certifications" v-bind:class="{ errorTab: tabErrors.certifications }"
                  >Certifications</v-tab
                >
              </template>
              <span v-if="tabErrors.certifications">Submit to update tab validation</span>
              <span v-else>Certifications Tab</span>
            </v-tooltip>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-tab v-on="on" href="#awards" v-bind:class="{ errorTab: tabErrors.awards }">Awards</v-tab>
              </template>
              <span v-if="tabErrors.awards">Submit to update tab validation</span>
              <span v-else>Awards Tab</span>
            </v-tooltip>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-tab v-on="on" href="#technologies" v-bind:class="{ errorTab: tabErrors.technologies }"
                  >Technologies</v-tab
                >
              </template>
              <span v-if="tabErrors.technologies">Submit to update tab validation</span>
              <span v-else>Technologies Tab</span>
            </v-tooltip>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-tab v-on="on" href="#customerOrgExp" v-bind:class="{ errorTab: tabErrors.customerOrgExp }"
                  >Customer Org</v-tab
                >
              </template>
              <span v-if="tabErrors.customerOrgExp">Submit to update tab validation</span>
              <span v-else>Customer Org Tab</span>
            </v-tooltip>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-tab v-on="on" href="#contracts" v-bind:class="{ errorTab: tabErrors.contracts }">Contracts</v-tab>
              </template>
              <span v-if="tabErrors.contracts">Submit to update tab validation</span>
              <span v-else>Contracts Tab</span>
            </v-tooltip>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-tab v-on="on" href="#clearance" v-bind:class="{ errorTab: tabErrors.clearance }">Clearance</v-tab>
              </template>
              <span v-if="tabErrors.clearance">Submit to update tab validation</span>
              <span v-else>Clearance Tab</span>
            </v-tooltip>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-tab v-on="on" href="#languages" v-bind:class="{ errorTab: tabErrors.languages }">Languages</v-tab>
              </template>
              <span v-if="tabErrors.languages">Submit to update tab validation</span>
              <span v-else>Languages Tab</span>
            </v-tooltip>
            <!-- Employee -->
            <v-tab-item id="employee" class="mt-6 mb-4">
              <employee-tab
                :disableEmpNum="disableEmpNum"
                :admin="hasAdminPermissions()"
                :model="model"
                :validating="validating.employee"
                :key="updateEmpTab"
              ></employee-tab>
            </v-tab-item>
            <!-- Personal Info -->
            <v-tab-item id="personal" class="mt-6 mb-4">
              <personal-tab :model="model" :validating="validating.personal"></personal-tab>
            </v-tab-item>
            <!-- Education -->
            <v-tab-item id="education" class="mt-6 mb-4">
              <education-tab
                :model="model.degrees"
                :validating="validating.education"
                :allowAdditions="true"
              ></education-tab>
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
            <!-- Languages -->
            <v-tab-item id="languages" class="mt-6 mb-4">
              <languages-tab :model="model.languages" :validating="validating.languages"></languages-tab>
            </v-tab-item>
          </v-tabs>

          <!-- Form action buttons -->
          <v-btn id="employeeCancelBtn" class="ma-2" color="white" @click="cancel" elevation="2"
            ><icon class="mr-1" name="ban"></icon>Cancel</v-btn
          >
          <v-btn id="employeeSubmitBtn" outlined class="ma-2" color="success" @click="confirm">
            <icon class="mr-1" name="save"></icon>Submit
          </v-btn>
          <!-- End form action buttons -->
        </v-form>
        <!-- Confirmation Model -->
        <form-submission-confirmation
          :submitting="this.submitting"
          :toggleSubmissionConfirmation="this.confirmingValid"
          type="form"
        ></form-submission-confirmation>
        <many-form-errors
          :toggleSubmissionConfirmation="this.confirmingError"
          :errorTabs="errorTabNames"
        ></many-form-errors>
        <resume-parser :toggleResumeParser="this.toggleResumeParser" :employee="model"></resume-parser>
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
import LanguagesTab from '@/components/employees/formTabs/LanguagesTab';
import ManyFormErrors from '@/components/modals/ManyFormErrors.vue';
import PersonalTab from '@/components/employees/formTabs/PersonalTab';
import ResumeParser from '@/components/modals/ResumeParser';
import TechnologyTab from '@/components/employees/formTabs/TechnologyTab';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');
import { getRole } from '@/utils/auth';
import { v4 as uuid } from 'uuid';
import _ from 'lodash';
// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|
/**
 * Selects the currect form tab for the menu
 */
function selectDropDown(tab) {
  this.formTab = tab;
}
/**
 * Resets back to employee info. Also deletes resume when creating an employee if
 * you decide to cancel your submission
 */
async function cancel() {
  //creating an employee
  let employees = await api.getItems(api.EMPLOYEES);
  //if the user types an employee number that matches another employee's
  let existingResume = employees.some((emp) => emp.employeeNumber == this.employeeNumber);
  if (this.model.employeeNumber && this.$route.params.id === undefined && !existingResume) {
    await api.deleteResume(this.model.employeeNumber);
  }
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
  if (_.isEmpty(this.model.languages)) {
    this.model.languages = null;
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
  if (!_.isEmpty(this.model.companies)) {
    this.model.companies = _.forEach(this.model.companies, (company) => {
      _.forEach(company.positions, (pos) => {
        delete pos.showStartMenu;
        delete pos.showEndMenu;
      });
    });
  } else {
    this.model.companies = null;
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
          delete clearance.showBadgeMenu;
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
  if (this.$refs.form !== undefined && this.$refs.form.validate()) {
    //checks to see if there are any tabs with errors
    let hasErrors = await this.hasTabError();
    if (!hasErrors) {
      this.confirmingValid = true; // if no errors opens confirm submit popup
    } else if (this.tabErrorMessage) {
      //if there is a custom error message it is displayed here
      this.displayError(this.tabErrorMessage);
    }
  } else {
    this.confirmingError = true;
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
 * Check if the user has admin privileges
 * Returns true if the user is an admin or a manager,
 * otherwise returns false.
 *
 * @return boolean - user is an admin or manager
 */
function hasAdminPermissions() {
  return getRole() === 'admin' || getRole() === 'manager';
} // hasAdminPermissions

/**
 * Checks to see if any of the form tabs has an error.
 * @returns boolean - true if any tab has an error false otherwise.
 */
function hasTabError() {
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
  // convert appropriate fields to title case
  await this.convertAutocompleteToTitlecase();
  let hasErrors = await this.hasTabError();
  if (this.$refs.form !== undefined && this.$refs.form.validate() && !hasErrors) {
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
        this.cancel();
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
  window.EventBus.$emit('badgeExp');
} // submit

function addErrorTab(name, errors) {
  if (errors !== 0) {
    this.errorTabNames[name] = errors;
  }
}

async function openUpload() {
  let employees = await api.getItems(api.EMPLOYEES);
  if (employees.some((emp) => emp.employeeNumber == this.employeeNumber)) {
    let message = 'Duplicate employee number, please change to a unique employee number to upload resume';
    this.uploadDisabled = true;
    this.displayError(message);
  } else {
    this.toggleResumeParser = !this.toggleResumeParser;
  }

  //check validation of employee number
  //if no error
  //this.toggleResumeParser = !this.toggleResumeParser;
  //if error
  //pop-up modal with invalid number
  //let err = 'duplicate ID found'
  //this.display(err)
}
// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|
async function created() {
  window.EventBus.$on('disableUpload', (result, employeeNumber) => {
    //disables upload resume button if invalid employee number
    this.uploadDisabled = result;
    //used to send up to Employees creating employee form
    this.employeeNumber = employeeNumber;
    //used to send to employee tab
    this.model.employeeNumber = employeeNumber;
  });

  window.EventBus.$on('uploaded', (result) => {
    this.disableEmpNum = result;
    window.EventBus.$emit('empNum', this.employeeNumber);
  });

  window.EventBus.$on('confirmed-form', async () => {
    await this.submit();
    this.confirmingValid = false;
  });
  window.EventBus.$on('canceled-form', () => {
    this.errorTabNames = {};
    this.confirmingError = false;
  });
  window.EventBus.$on('closeModal', () => {
    this.confirmingValid = false;
  });
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
  window.EventBus.$on('awardStatus', (errorCount) => {
    this.tabErrors.awards = errorCount > 0 ? true : false; //boolean if there are errors
    this.addErrorTab('Awards', errorCount); //error count
  });
  window.EventBus.$on('certificationsStatus', (errorCount) => {
    this.tabErrors.certifications = errorCount > 0 ? true : false;
    this.addErrorTab('Certifications', errorCount);
  });
  window.EventBus.$on('clearanceStatus', (errorCount) => {
    this.tabErrors.clearance = errorCount > 0 ? true : false;
    this.addErrorTab('Clearance', errorCount);
  });
  window.EventBus.$on('contractsStatus', (errorCount) => {
    this.tabErrors.contracts = errorCount > 0 ? true : false;
    this.addErrorTab('Contracts', errorCount);
  });
  window.EventBus.$on('customerOrgExpStatus', (errorCount) => {
    this.tabErrors.customerOrgExp = errorCount > 0 ? true : false;
    this.addErrorTab('Customer Org', errorCount);
  });
  window.EventBus.$on('educationStatus', (errorCount) => {
    this.tabErrors.education = errorCount > 0 ? true : false;
    this.addErrorTab('Education', errorCount);
  });
  window.EventBus.$on('employeeStatus', (errorCount) => {
    this.tabErrors.employee = errorCount > 0 ? true : false;
    this.addErrorTab('Employee', errorCount);
  });
  window.EventBus.$on('jobExperienceStatus', (errorCount) => {
    this.tabErrors.jobExperience = errorCount > 0 ? true : false;
    this.addErrorTab('Job Experience', errorCount);
  });
  window.EventBus.$on('languagesStatus', (errorCount) => {
    this.tabErrors.languages = errorCount > 0 ? true : false;
    this.addErrorTab('Languages', errorCount);
  });
  window.EventBus.$on('personalStatus', (errorCount) => {
    this.tabErrors.personal = errorCount > 0 ? true : false;
    this.addErrorTab('Personal', errorCount);
  });
  window.EventBus.$on('resume', (newEmployeeForm) => {
    if (this.model) {
      this.model = newEmployeeForm;
    }
  });
  window.EventBus.$on('technologiesStatus', (errorCount) => {
    this.tabErrors.technologies = errorCount > 0 ? true : false;
    this.addErrorTab('Technologies', errorCount);
  });
  window.EventBus.$on('technologiesErrStatus', (errorMessage) => {
    this.tabErrors.technologies = true;
    //when there is a custom error message (multiple entries with same name) gets it ready for display
    if (errorMessage) {
      this.tabErrorMessage = _.cloneDeep(errorMessage);
    }
  });
  window.EventBus.$on('educationDuplicateStatus', (errorMessage) => {
    //when there is a custom error message (multiple entries with same name) gets it ready for display
    this.tabErrors.education = true;
    if (errorMessage) {
      this.tabErrorMessage = _.cloneDeep(errorMessage);
    }
  });
  window.EventBus.$on('languagesDuplicateStatus', (errorMessage) => {
    //when there is a custom error message (multiple entries with same name) gets it ready for display
    this.tabErrors.languages = true;
    if (errorMessage) {
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
  this.hasResume = (await api.getResume(this.$route.params.id)) != null;
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
    this.$set(this.model, 'nickname', data.nickname);
    this.$set(this.model, 'employeeNumber', data.employeeNumber);
    this.$set(this.model, 'email', data.email);
    this.$set(this.model, 'prime', data.prime);
    this.$set(this.model, 'contract', data.contract);
    this.$set(this.model, 'jobRole', data.jobRole);
    this.$set(this.model, 'employeeRole', data.employeeRole);
    this.$set(this.model, 'hireDate', data.hireDate);
    this.$set(this.model, 'workStatus', data.workStatus);
    this.$set(this.model, 'deptDate', data.deptDate);
    this.$set(this.model, 'mifiStatus', data.mifiStatus);
  } else if (tab == 'personal') {
    //sets all personal info to data returned from personal tab
    this.$set(this.model, 'github', data.github);
    this.$set(this.model, 'twitter', data.twitter);
    this.$set(this.model, 'linkedIn', data.linkedIn);
    this.$set(this.model, 'phoneNumber', data.phoneNumber);
    this.$set(this.model, 'birthday', data.birthday);
    this.$set(this.model, 'birthdayFeed', data.birthdayFeed);
    this.$set(this.model, 'city', data.city);
    this.$set(this.model, 'country', data.country);
    this.$set(this.model, 'st', data.st);
    this.$set(this.model, 'currentCity', data.currentCity);
    this.$set(this.model, 'currentState', data.currentState);
    this.$set(this.model, 'currentStreet', data.currentStreet);
    this.$set(this.model, 'currentZIP', data.currentZIP);
  } else if (tab == 'education') {
    this.$set(this.model, 'degrees', data); //sets degrees to data returned from education tab
  } else if (tab == 'jobExperience') {
    //sets all jobExperience info to data returned from job experience tab
    this.$set(this.model, 'icTimeFrames', data.icTimeFrames);
    this.$set(this.model, 'companies', data.companies);
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
  } else if (tab == 'languages') {
    this.$set(this.model, 'languages', data); //sets clearances to data returned from clearance tab
  }
} //setFormData
/**
 * Changes the format of the string to title case
 * @param str - the string to be converted
 * @return the title case formatted string
 */
function titleCase(str) {
  str = str.toLowerCase().split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(' ');
} //titleCase
/**
 * Converts all the autocomplete fields to title case capitalization
 */
async function convertAutocompleteToTitlecase() {
  //Convert autocomplete certification field to title case
  if (this.model.certifications !== null) {
    this.model.certifications.forEach((currCert) => {
      currCert.name = titleCase(currCert.name);
    });
  }
  //Convert autocomplete award field to title case
  if (this.model.awards !== null) {
    this.model.awards.forEach((currAward) => {
      currAward.name = titleCase(currAward.name);
    });
  }
  //Convert autocomplete language field to title case
  if (this.model.languages !== null) {
    this.model.languages.forEach((currLang) => {
      currLang.name = titleCase(currLang.name);
    });
  }
  await this.confirm();
} //convertAutocompleteToTitlecase

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
    ResumeParser,
    TechnologyTab,
    LanguagesTab,
    ManyFormErrors
  },
  created,
  data() {
    return {
      afterCreate: false, // component has been created
      confirmingValid: false, // confirming form submission
      confirmingError: false,
      deleteLoading: false,
      disableEmpNum: false,
      errorStatus: {
        statusType: undefined,
        statusMessage: null,
        color: null
      }, // snack bar error
      errorTabNames: {},
      formTab: null, // currently active tab
      fullName: '', // employee's first and last name
      hasResume: false,
      model: {
        awards: [],
        birthday: null,
        birthdayFeed: false,
        certifications: [],
        city: null,
        clearances: [],
        companies: [],
        contract: null,
        contracts: [],
        country: null,
        currentCity: null,
        currentState: null,
        currentStreet: null,
        currentZIP: null,
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
        languages: [],
        lastName: null,
        middleName: null,
        mifiStatus: true,
        nickname: null,
        phoneNumber: null,
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
        languages: false,
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
        languages: false,
        personal: false,
        technologies: false
      }, // tab component created
      toggleResumeParser: false,
      updateEmpTab: 0,
      uploadDisabled: true,
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
        languages: false,
        personal: false,
        technologies: false
      } // signal to child tabs to validate
    };
  },
  methods: {
    addErrorTab,
    cancel,
    cleanUpData,
    clearStatus,
    confirm,
    convertAutocompleteToTitlecase,
    displayError,
    hasAdminPermissions,
    hasTabError,
    openUpload,
    setFormData,
    submit,
    titleCase,
    selectDropDown
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
  },
  computed: {
    useDropDown() {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          return true;
        default:
          return false;
      }
    },
    parsedInfoTab() {
      let parseTab = !this.formTab ? 'Select Info' : this.formTab;
      if (this.formTab === 'customerOrgExp') {
        parseTab = 'Customer Org';
      } else if (this.formTab === 'jobExperience') {
        parseTab = 'Job Experience';
      }
      return parseTab.toUpperCase();
    }
  }
};
</script>

<style>
.errorTab {
  color: red !important;
}
</style>
