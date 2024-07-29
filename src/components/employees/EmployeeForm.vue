<template>
  <div :class="!model.id ? 'overflow' : ''">
    <v-card>
      <!-- Form Header -->
      <v-card-title class="d-flex align-center header_style">
        <v-row>
          <v-col col="6" class="text-left">
            <h3 v-if="model.id">Editing {{ fullName }}</h3>
            <h3 v-else>New Employee</h3>
          </v-col>
        </v-row>
      </v-card-title>
      <div v-if="submitting" class="py-10 px-6">
        <v-progress-linear :indeterminate="true"></v-progress-linear>
      </div>
      <v-container v-show="!submitting" fluid>
        <v-form ref="form" v-model="valid" lazy-validation class="my-1 mx-xl-5 mx-lg-5 mx-md-0">
          <div v-if="useDropDown">
            <!-- For smaller screens -->
            <v-row>
              <v-col align="center" justify="center">
                <v-menu align-center class="ma-4">
                  <template v-slot:activator="{ props }">
                    <v-btn variant="text" size="x-large" class="pt-5 font-weight-bold" v-bind="props"
                      >{{ parsedInfoTab }} <v-icon class="pb-1">mdi-chevron-down</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="selectDropDown('employee')" v-bind:class="{ errorTab: tabErrors.employee }"
                      >Employee</v-list-item
                    >
                    <v-list-item @click="selectDropDown('personal')" v-bind:class="{ errorTab: tabErrors.personal }"
                      >Personal</v-list-item
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
                    <v-list-item
                      @click="selectDropDown('technologies')"
                      v-bind:class="{ errorTab: tabErrors.technologies }"
                      >Tech and Skills</v-list-item
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
                    <v-list-item @click="selectDropDown('languages')" v-bind:class="{ errorTab: tabErrors.languages }"
                      >Foreign Languages</v-list-item
                    >
                  </v-list>
                </v-menu>
                <hr class="my-3" />
                <!-- Employee Tab -->
                <employee-tab
                  v-if="formTab === 'employee'"
                  :admin="hasAdminPermissions()"
                  :validating="validating.employee"
                  :model="model"
                >
                </employee-tab>
                <!-- Personal Tab -->
                <personal-tab v-if="formTab === 'personal'" :validating="validating.personal" :model="model">
                </personal-tab>
                <!-- Education Tab -->
                <education-tab
                  v-if="formTab === 'education'"
                  :validating="validating.education"
                  :model="model.education"
                  :allowAdditions="true"
                >
                </education-tab>
                <!-- Job Experience Tab -->
                <job-experience-tab
                  v-if="formTab === 'jobExperience'"
                  :validating="validating.jobExperience"
                  :model="model"
                >
                </job-experience-tab>
                <!-- Certification Tab -->
                <certification-tab
                  v-if="formTab === 'certification'"
                  :validating="validating.certifications"
                  :model="model.certifications"
                >
                </certification-tab>
                <!-- Award Tab -->
                <award-tab
                  v-if="formTab === 'awards'"
                  :validating="validating.awards"
                  :model="model.awards"
                ></award-tab>
                <!-- Technology Tab -->
                <technology-tab
                  v-if="formTab === 'technologies'"
                  :validating="validating.technologies"
                  :model="model.technologies"
                >
                </technology-tab>
                <!-- Customer Org Tab -->
                <customer-org-tab
                  v-if="formTab === 'customerOrgExp'"
                  :validating="validating.customerOrgExp"
                  :model="model.customerOrgExp"
                >
                </customer-org-tab>
                <!-- Contract Tab -->
                <contract-tab
                  v-if="formTab === 'contracts'"
                  :contracts="contracts"
                  :validating="validating.contracts"
                  :model="model.contracts"
                >
                </contract-tab>
                <!-- Clearance Tab -->
                <clearance-tab
                  v-if="formTab === 'clearance'"
                  :validating="validating.clearance"
                  :model="model.clearances"
                >
                </clearance-tab>
                <!-- Languages Tab -->
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
          <v-tabs v-if="!useDropDown" v-model="formTab" center-active show-arrows color="blue" class="pb-0">
            <v-tab value="employee" id="employeeTab" v-bind:class="{ errorTab: tabErrors.employee }">
              Employee
              <v-tooltip v-if="tabErrors.employee" activator="parent" location="top">
                <span>Submit to update tab validation</span>
              </v-tooltip>
            </v-tab>

            <v-tab value="personal" id="personalTab" v-bind:class="{ errorTab: tabErrors.personal }">
              Personal
              <v-tooltip v-if="tabErrors.personal" activator="parent" location="top">
                <span>Submit to update tab validation</span>
              </v-tooltip>
            </v-tab>

            <v-tab value="customerOrgExp" id="customerOrgTab" v-bind:class="{ errorTab: tabErrors.customerOrgExp }">
              Customer Org
              <v-tooltip v-if="tabErrors.customerOrgExp" activator="parent" location="top">
                <span>Submit to update tab validation</span>
              </v-tooltip>
            </v-tab>

            <v-tab value="contracts" id="contractsTab" v-bind:class="{ errorTab: tabErrors.contracts }">
              Contracts
              <v-tooltip v-if="tabErrors.contracts" activator="parent" location="top">
                <span>Submit to update tab validation</span>
              </v-tooltip>
            </v-tab>

            <v-tab value="clearance" id="clearanceTab" v-bind:class="{ errorTab: tabErrors.clearance }">
              Clearance
              <v-tooltip v-if="tabErrors.clearance" activator="parent" location="top">
                <span>Submit to update tab validation</span>
              </v-tooltip>
            </v-tab>

            <v-tab value="technologies" id="technologiesTab" v-bind:class="{ errorTab: tabErrors.technologies }">
              Tech and Skills
              <v-tooltip v-if="tabErrors.technologies" activator="parent" location="top">
                <span>Submit to update tab validation</span>
              </v-tooltip>
            </v-tab>

            <v-tab value="education" id="educationTab" v-bind:class="{ errorTab: tabErrors.education }">
              Education
              <v-tooltip v-if="tabErrors.education" activator="parent" location="top">
                <span>Submit to update tab validation</span>
              </v-tooltip>
            </v-tab>

            <v-tab value="jobExperience" id="jobExperienceTab" v-bind:class="{ errorTab: tabErrors.jobExperience }">
              Job Experience
              <v-tooltip v-if="tabErrors.jobExperience" activator="parent" location="top">
                <span>Submit to update tab validation</span>
              </v-tooltip>
            </v-tab>

            <v-tab value="certifications" id="certificationsTab" v-bind:class="{ errorTab: tabErrors.certifications }">
              Certifications
              <v-tooltip v-if="tabErrors.certifications" activator="parent" location="top">
                <span>Submit to update tab validation</span>
              </v-tooltip>
            </v-tab>

            <v-tab value="awards" id="awardsTab" v-bind:class="{ errorTab: tabErrors.awards }">
              Awards
              <v-tooltip v-if="tabErrors.awards" activator="parent" location="top">
                <span>Submit to update tab validation</span>
              </v-tooltip>
            </v-tab>

            <v-tab value="languages" id="languagesTab" v-bind:class="{ errorTab: tabErrors.languages }">
              Foreign Languages
              <v-tooltip v-if="tabErrors.languages" activator="parent" location="top">
                <span>Submit to update tab validation</span>
              </v-tooltip>
            </v-tab>
          </v-tabs>

          <v-window v-if="!useDropDown" v-model="formTab">
            <!-- Employee -->
            <v-window-item value="employee" id="employee" class="mt-6 mb-4 px-3">
              <employee-tab
                :disableEmpNum="disableEmpNum"
                :admin="hasAdminPermissions()"
                :model="model"
                :validating="validating.employee"
                :key="updateEmpTab"
              ></employee-tab>
            </v-window-item>
            <!-- Personal Info -->
            <v-window-item value="personal" id="personal" class="mt-6 mb-4 px-3">
              <personal-tab :model="model" :validating="validating.personal"></personal-tab>
            </v-window-item>
            <!-- Customer Org Experience -->
            <v-window-item value="customerOrgExp" id="customerOrgExp" class="mt-6 mb-4 px-3">
              <customer-org-tab
                :model="model.customerOrgExp"
                :validating="validating.customerOrgExp"
              ></customer-org-tab>
            </v-window-item>
            <!-- Contracts -->
            <v-window-item value="contracts" id="contracts" class="mt-6 mb-4 px-3">
              <contract-tab
                :contracts="contracts"
                :model="model.contracts"
                :validating="validating.contracts"
              ></contract-tab>
            </v-window-item>
            <!-- Clearance -->
            <v-window-item value="clearance" id="clearance" class="mt-6 mb-4 px-3">
              <clearance-tab :model="model.clearances" :validating="validating.clearance"></clearance-tab>
            </v-window-item>
            <!-- Technologies -->
            <v-window-item value="technologies" id="technologies" class="mt-6 mb-4 px-3">
              <technology-tab :model="model.technologies" :validating="validating.technologies"></technology-tab>
            </v-window-item>
            <!-- Education -->
            <v-window-item value="education" id="education" class="mt-6 mb-4 px-3">
              <education-tab
                :model="model.education"
                :validating="validating.education"
                :allowAdditions="true"
              ></education-tab>
            </v-window-item>
            <!-- Experience -->
            <v-window-item value="jobExperience" id="jobExperience" class="mt-6 mb-4 px-3">
              <job-experience-tab :model="model" :validating="validating.jobExperience"></job-experience-tab>
            </v-window-item>
            <!-- Certifications -->
            <v-window-item value="certifications" id="certifications" class="mt-6 mb-4 px-3">
              <certification-tab
                :model="model.certifications"
                :validating="validating.certifications"
              ></certification-tab>
            </v-window-item>
            <!-- Awards -->
            <v-window-item value="awards" id="awards" class="mt-6 mb-4 px-3">
              <award-tab :model="model.awards" :validating="validating.awards"></award-tab>
            </v-window-item>
            <!-- Languages -->
            <v-window-item value="languages" id="languages" class="mt-6 mb-4 px-3">
              <languages-tab :model="model.languages" :validating="validating.languages"></languages-tab>
            </v-window-item>
          </v-window>

          <v-card-actions>
            <!-- Form action buttons -->
            <v-btn id="employeeCancelBtn" variant="text" class="ma-2" @click="cancelA">Cancel</v-btn>
            <v-btn id="employeeSubmitBtn" variant="outlined" class="ma-2" color="success" @click="submit">
              <v-icon class="mr-1">mdi-content-save</v-icon>Submit
            </v-btn>
            <!-- End form action buttons -->
          </v-card-actions>
        </v-form>
        <!-- Confirmation Model -->
        <form-cancel-confirmation
          :cancelling="this.cancelling"
          :toggleSubmissionConfirmation="this.confirmingValid"
          type="cancel"
        ></form-cancel-confirmation>
        <many-form-errors
          :toggleSubmissionConfirmation="this.confirmingError"
          :errorTabs="errorTabNames"
        ></many-form-errors>
        <resume-parser v-if="!model.id" :toggleResumeParser="this.toggleResumeParser" :employee="model"></resume-parser>
      </v-container>
    </v-card>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import AwardTab from '@/components/employees/form-tabs/AwardTab';
import CertificationTab from '@/components/employees/form-tabs/CertificationTab';
import ClearanceTab from '@/components/employees/form-tabs/ClearanceTab';
import ContractTab from '@/components/employees/form-tabs/ContractTab';
import CustomerOrgTab from '@/components/employees/form-tabs/CustomerOrgTab';
import EducationTab from '@/components/employees/form-tabs/EducationTab';
import EmployeeTab from '@/components/employees/form-tabs/EmployeeTab';
import FormCancelConfirmation from '@/components/modals/FormCancelConfirmation.vue';
import JobExperienceTab from '@/components/employees/form-tabs/JobExperienceTab';
import LanguagesTab from '@/components/employees/form-tabs/LanguagesTab';
import ManyFormErrors from '@/components/modals/ManyFormErrors.vue';
import PersonalTab from '@/components/employees/form-tabs/PersonalTab';
import ResumeParser from '@/components/modals/ResumeParser';
import TechnologyTab from '@/components/employees/form-tabs/TechnologyTab';
import { updateStoreEmployees, updateStoreUser } from '@/utils/storeUtils';
import { format } from '@/shared/dateUtils';
import { getRole } from '@/utils/auth';
import { generateUUID } from '@/utils/utils';
import _ from 'lodash';
import { useDisplayError } from '@/components/shared/StatusSnackbar.vue';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Event called when a resume is submitted
 *
 * @param newEmployeeForm is the new employee model after parsing the resume
 */
function resumeReceived(newEmployeeForm) {
  if (this.model) {
    this.model = newEmployeeForm;
  }
} // resumeReceived

/**
 * Selects the currect form tab for the menu
 *
 * @param tab - current tab that is being selected
 */
function selectDropDown(tab) {
  this.formTab = tab;
} // selectDropDown

/**
 * Resets back to employee info. Also deletes resume when creating an employee if
 * you decide to cancel your submission
 */
function cancelA() {
  //creating an employee
  this.confirmingValid = true;
} // cancelA

async function cancelB() {
  let employees = this.$store.getters.employees;
  //if the user types an employee number that matches another employee's
  let existingResume = employees.some((emp) => emp.employeeNumber == this.employeeNumber);
  if (this.model.employeeNumber && this.$route.params.id === undefined && !existingResume) {
    await api.deleteResume(this.model.id);
  }
  this.emitter.emit('cancel-form');
} // cancelB

/**
 * Removes unnecessary attributes from the employee data.
 */
function cleanUpData() {
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
  if (!_.isEmpty(this.model.contracts)) {
    // delete name attributes since the names are stored in the contracts DynamoDB table
    // this will connect the IDs between employee contracts and the contracts table
    _.forEach(this.model.contracts, (contract) => {
      if (contract.contractName && contract.primeName) {
        contract.contractId = this.contracts.find(
          (c) => c.contractName === contract.contractName && c.primeName === contract.primeName
        ).id;
        delete contract.contractName;
        delete contract.primeName;
      }
      _.forEach(contract.projects, (project) => {
        if (project.projectName) {
          let c;
          if (contract.contractName && contract.primeName) {
            c = this.contracts.find(
              (c) => c.contractName === contract.contractName && c.primeName === contract.primeName
            );
          } else {
            c = this.contracts.find((c) => c.id === contract.contractId);
          }
          project.projectId = c.projects.find((p) => p.projectName === project.projectName).id;
          delete project.projectName;
        }
      });
    });
  } else {
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
            return format(monthYear, null, 'YYYY-MM');
          });
          timeFrame.range = chronologicalRange;
          // return updated time frame
          return timeFrame;
        }),
        (timeFrame) => {
          return format(timeFrame.range[0], null, 'YYYY-MM');
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
          delete clearance.showBIMenu;
          // delete null attributes
          _.forEach(clearance, (value, key) => {
            if (_.isNil(value)) {
              delete clearance[key];
            }
          });
          // sort bi dates
          clearance.biDates = _.reverse(
            _.sortBy(clearance.biDates, (date) => {
              return format(date, null, 'YYYY-MM-DD');
            })
          );
          // sort adjudication dates
          clearance.adjudicationDates = _.reverse(
            _.sortBy(clearance.adjudicationDates, (date) => {
              return format(date, null, 'YYYY-MM-DD');
            })
          );
          // sort poly dates
          clearance.polyDates = _.reverse(
            _.sortBy(clearance.polyDates, (date) => {
              return format(date, null, 'YYYY-MM-DD');
            })
          );
          // return updated clearance
          return clearance;
        }),
        (clearance) => {
          return format(clearance.grantedDate);
        }
      )
    );
  } else {
    this.model.clearances = null;
  }
} // cleanUpData

/**
 * Check if the user has admin privileges
 * Returns true if the user is an admin or a manager,
 * otherwise returns false.
 *
 * @return boolean - user is an admin or manager
 */
function hasAdminPermissions() {
  return this.getRole() === 'admin' || this.getRole() === 'manager';
} // hasAdminPermissions

/**
 * Checks to see if any of the form tabs has an error.
 *
 * @return boolean - true if any tab has an error false otherwise.
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
 * When submitting, this looks at all tabs and if any are invalid, the submission process is halted.
 */
async function confirm() {
  this.tabErrorMessage = null;
  this.confirmingError = false;
  await _.forEach(this.tabCreated, (value, key) => {
    if (value) {
      this.validating[key] = true;
    }
  });

  //validates forms
  if (this.$refs.form !== undefined) {
    await this.$refs.form.validate();
    await this.$refs.form.validate(); // no idea why this needs to happen twice but it does
    //checks to see if there are any tabs with errors
    let hasErrors = this.hasTabError();
    if (!hasErrors) {
      return false;
    }
  }
  return true; //all but !hasErrors
} //confirm

/**
 * Submits the employee form.
 */
async function submit() {
  this.submitting = true;
  window.scrollTo(0, 0);

  let anyErrors = await this.confirm();

  if (!anyErrors) {
    // convert appropriate fields to title case
    await this.convertAutocompleteToTitlecase(); // recursion here lol confirm -> submit -> cATT -> confirm
    // form validated
    this.emitter.emit('startAction');
    this.cleanUpData();
    this.checkEmployeeDeactivation();
    if (this.model.id) {
      // updating employee
      let updatedEmployee = await api.updateItem(api.EMPLOYEES, this.model);
      if (updatedEmployee.id) {
        // successfully updated employee
        this.fullName = `${updatedEmployee.firstName} ${updatedEmployee.lastName}`;
        this.emitter.emit('update', updatedEmployee);
        // getEmployees and update store with latest data
        if (this.model.id === this.$store.getters.user.id) await this.updateStoreUser();
        await this.updateStoreEmployees();
      } else {
        // failed to update employee
        this.emitter.emit('error', updatedEmployee.response.data.message);
        useDisplayError(updatedEmployee.response.data.message);
      }
    } else {
      // creating employee
      this.model.id = generateUUID();
      let newEmployee = await api.createItem(api.EMPLOYEES, this.model);
      // getEmployees and update store with latest data
      await this.updateStoreEmployees();
      if (newEmployee.id) {
        // successfully created employee
        this.$router.push(`/employee/${newEmployee.employeeNumber}`);
      } else {
        // failed to create employee
        this.emitter.emit('error', newEmployee.response.data.message);
        useDisplayError(newEmployee.response.data.message);
        this.model['id'] = null; // reset id
      }
    }
    if (this.tagsToUpdate && this.tagsToUpdate.length > 0) {
      await this.updateTags();
    }
    await this.cancelB();
  } else {
    this.confirmingError = true;
  }
  this.submitting = false;
  this.emitter.emit('badgeExp');
} // submit

/**
 * Updates the tags that the employee was added to and removed from.
 * If the employee is in a tag, they need to be removed.
 * If the employee is not in a tag, they need to be added.
 */
async function updateTags() {
  let employeeId = this.model.id;
  let promises = [];
  _.forEach(this.tagsToUpdate, (tag) => {
    let index = _.findIndex(tag.employees, (eId) => eId === employeeId);
    if (index > -1) {
      // remove employee from tag
      tag.employees.splice(index, 1);
    } else {
      // add employee to tag
      tag.employees.push(employeeId);
    }
    promises.push(api.updateItem(api.TAGS, tag));
  });
  // update db tags
  await Promise.all(promises);
  // update store tags
  let updatedStoreTags = _.map(this.$store.getters.tags, (tag) => {
    let foundTag = _.find(this.tagsToUpdate, (t) => t.id === tag.id);
    return foundTag ? foundTag : tag;
  });
  this.$store.dispatch('setTags', { tags: updatedStoreTags });
  return;
} // updateTags

/**
 * add a tab to number of errors in the form
 *
 * @param name - the name of the tab
 * @param errors - the number of errored out tabs
 */
function addErrorTab(name, errors) {
  this.errorTabNames[name] = errors;
  //see if a tab is 0 after fixing validations and remove it
  if (this.errorTabNames[name] === 0) {
    delete this.errorTabNames[name];
  }
} // addErrorTab

/**
 * Changes the format of the string to title case
 *
 * @param str - the string to be converted
 * @return the title case formatted string
 */
function titleCase(str) {
  str = str.split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(' ');
} //titleCase

/**
 * Checks if an employee is being deactivated and if they are then change relevant data.
 */
function checkEmployeeDeactivation() {
  let employee = this.$store.getters.employees.find((e) => e.id == this.model.id);
  if (employee && this.model && employee.workStatus > 0 && this.model.workStatus == 0) {
    // employee is being changed to inactive
    if (this.model.contracts) {
      // deactivate all employee contract projects
      this.model.contracts.forEach((c) => {
        c.projects.forEach((p) => {
          if (!p.endDate) {
            p.presentDate = false;
            p.endDate = format(this.model.deptDate, null, 'YYYY-MM');
          }
        });
      });
    }
  }
} // checkEmployeeDeactivation

/**
 * Converts all the autocomplete fields to title case capitalization
 */
async function convertAutocompleteToTitlecase() {
  //Convert autocomplete certification field to title case
  if (this.model.certifications !== null) {
    this.model.certifications.forEach((currCert) => {
      currCert.name = this.titleCase(currCert.name);
    });
  }
  //Convert autocomplete award field to title case
  if (this.model.awards !== null) {
    this.model.awards.forEach((currAward) => {
      currAward.name = this.titleCase(currAward.name);
    });
  }
  //Convert autocomplete language field to title case
  if (this.model.languages !== null) {
    this.model.languages.forEach((currLang) => {
      currLang.name = this.titleCase(currLang.name);
    });
  }
} //convertAutocompleteToTitlecase

/**
 * Sets the form data based on the given tab.
 *
 * @param tab - the tab the data came from
 * @param data - the data to be saved
 */
function setFormData(tab, data) {
  if (tab == 'employee') {
    //sets all employee info to data returned from employee tab
    this.model['firstName'] = data.firstName;
    this.model['middleName'] = data.middleName;
    this.model['noMiddleName'] = data.noMiddleName;
    this.model['lastName'] = data.lastName;
    this.model['nickname'] = data.nickname;
    this.model['employeeNumber'] = data.employeeNumber;
    this.model['email'] = data.email;
    this.model['prime'] = data.prime;
    this.model['contract'] = data.contract;
    this.model['jobRole'] = data.jobRole;
    this.model['agencyIdentificationNumber'] = data.agencyIdentificationNumber;
    this.model['employeeRole'] = data.employeeRole;
    this.model['hireDate'] = data.hireDate;
    this.model['workStatus'] = data.workStatus;
    this.model['deptDate'] = data.deptDate;
    this.model['eeoDeclineSelfIdentify'] = data.eeoDeclineSelfIdentify;
    this.model['eeoGender'] = data.eeoGender;
    this.model['eeoHispanicOrLatino'] = data.eeoHispanicOrLatino;
    this.model['eeoRaceOrEthnicity'] = data.eeoRaceOrEthnicity;
    this.model['eeoJobCategory'] = data.eeoJobCategory;
    this.model['eeoHasDisability'] = data.eeoHasDisability;
    this.model['eeoIsProtectedVeteran'] = data.eeoIsProtectedVeteran;
    if (this.hasAdminPermissions()) {
      this.model['eeoAdminHasFilledOutEeoForm'] = true;
      this.tagsToUpdate = _.cloneDeep(data.editedTags);
    } else {
      this.model['eeoAdminHasFilledOutEeoForm'] = false;
    }
  } else if (tab == 'personal') {
    // filter github and twitter links
    if (data.github && data.github.indexOf('/') != -1) {
      // remove trailing slash
      if (data.github.slice(-1) === '/') data.github = data.github.slice(0, -1);
      // extract username
      data.github = data.github.substring(data.github.lastIndexOf('/') + 1, data.github.length);
    }
    if (data.twitter && data.twitter.indexOf('/') != -1) {
      // remove trailing slash
      if (data.twitter.slice(-1) === '/') data.twitter = data.twitter.slice(0, -1);
      // extract username
      data.twitter = data.twitter.substring(data.twitter.lastIndexOf('/') + 1, data.twitter.length);
    }

    //sets all personal info to data returned from personal tab
    this.model['github'] = data.github;
    this.model['twitter'] = data.twitter;
    this.model['linkedIn'] = data.linkedIn;
    this.model['personalEmail'] = data.personalEmail;
    this.model['privatePhoneNumbers'] = data.privatePhoneNumbers;
    this.model['publicPhoneNumbers'] = data.publicPhoneNumbers;
    this.model['birthday'] = data.birthday;
    this.model['birthdayFeed'] = data.birthdayFeed;
    this.model['city'] = data.city;
    this.model['country'] = data.country;
    this.model['st'] = data.st;
    this.model['currentCity'] = data.currentCity;
    this.model['currentState'] = data.currentState;
    this.model['currentStreet'] = data.currentStreet;
    this.model['currentStreet2'] = data.currentStreet2;
    this.model['currentZIP'] = data.currentZIP;
  } else if (tab == 'education') {
    this.model['education'] = data; //sets education to data returned from education tab
  } else if (tab == 'jobExperience') {
    //sets all jobExperience info to data returned from job experience tab
    this.model['icTimeFrames'] = data.icTimeFrames;
    this.model['companies'] = data.companies;
  } else if (tab == 'certifications') {
    // update cert expirationWasSeen if needed
    // this presumes that they cannot be rearranged
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < this.model.certifications.length; j++) {
        if (
          data[i].name === this.model.certifications[j].name &&
          data[i].dateSubmitted === this.model.certifications[j].dateSubmitted &&
          data[i].expirationDate !== this.model.certifications[j].expirationDate
        ) {
          data[i].expirationWasSeen = false;
        }
      }
    }
    this.model['certifications'] = data; //sets certifications to data returned from certifications tab
  } else if (tab == 'awards') {
    this.model['awards'] = data; //sets awards to data returned from awards tab
  } else if (tab == 'technologies') {
    this.model['technologies'] = data; //sets technologies to data returned from technologies tab
  } else if (tab == 'customerOrgExp') {
    this.model['customerOrgExp'] = data; //sets degrees to data returned from education tab
  } else if (tab == 'contracts') {
    this.model['contracts'] = data; //sets contracts to data returned from contracts tab
  } else if (tab == 'clearance') {
    this.model['clearances'] = data; //sets clearances to data returned from clearance tab
  } else if (tab == 'languages') {
    this.model['languages'] = data; //sets clearances to data returned from clearance tab
  }
} //setFormData

/**
 * opens up the resume parser.
 */
async function openUpload() {
  let employees = this.$store.getters.employees;
  //check validation of employee number
  if (employees.some((emp) => emp.employeeNumber == this.employeeNumber)) {
    //if error
    //let err = 'duplicate ID found'
    let message = 'Duplicate employee number, please change to a unique employee number to upload resume';
    this.uploadDisabled = true;
    useDisplayError(message);
  } else {
    //if no error
    this.toggleResumeParser = !this.toggleResumeParser;
    // open pop-up modal for resume parser
  }
} // openUpload

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * created lifecycle hook - create all the listeners and set up employee info.
 */
async function created() {
  this.emitter.on('disableUpload', (params) => {
    //disables upload resume button if invalid employee number
    this.uploadDisabled = params.disabled;
    //used to send up to Employees creating employee form
    this.employeeNumber = params.employeeNumber;
    //used to send to employee tab
    this.model.employeeNumber = params.employeeNumber;
  });
  // Starts listener to check if resume is uploaded
  this.emitter.on('uploaded', (result) => {
    this.disableEmpNum = result;
    this.emitter.emit('empNum', this.employeeNumber);
  });
  this.emitter.on('resume', (result) => {
    this.resumeReceived(result.newEmployeeForm);
  });
  // Starts listener to see if the user confirmed to submit the form
  this.emitter.on('confirmed-form', async () => {
    this.confirmingValid = false;
    await cancelB();
  });
  // Starts listener to see if the user confirmed to submit the form
  this.emitter.on('canceled-form', async () => {
    this.confirmingError = false;
  });
  // Starts listener to see if the user cancelled to submit the form
  this.emitter.on('canceled-cancel', () => {
    this.confirmingValid = false;
  });
  this.emitter.on('confirmed-cancel', async () => {
    this.confirmingValid = true;
    await this.cancelB();
  });
  // set tab mounted
  this.emitter.on('created', (tab) => {
    this.tabCreated[tab] = true;
  });
  // reset validating status and sets the data based on the tab
  this.emitter.on('doneValidating', (params) => {
    this.setFormData(params.tab, params.data); //sets the form data
    this.validating[params.tab] = false;
  });
  // set tab error status
  this.emitter.on('awardStatus', (errorCount) => {
    this.tabErrors.awards = errorCount > 0; //boolean if there are errors
    this.addErrorTab('Awards', errorCount); //error count
  });
  // Starts listener to check the Certifications tab has any errors
  this.emitter.on('certificationsStatus', (errorCount) => {
    this.tabErrors.certifications = errorCount > 0;
    this.addErrorTab('Certifications', errorCount);
  });
  // Starts listener to check the Clearance tab has any errors
  this.emitter.on('clearanceStatus', (errorCount) => {
    this.tabErrors.clearance = errorCount > 0;
    this.addErrorTab('Clearance', errorCount);
  });
  // Starts listener to check the Contracts tab has any errors
  this.emitter.on('contractsStatus', (errorCount) => {
    this.tabErrors.contracts = errorCount > 0;
    this.addErrorTab('Contracts', errorCount);
  });
  // Starts listener to check the Customer Org tab has any errors
  this.emitter.on('customerOrgExpStatus', (errorCount) => {
    this.tabErrors.customerOrgExp = errorCount > 0;
    this.addErrorTab('Customer Org', errorCount);
  });
  // Starts listener to check the Education tab has any errors
  this.emitter.on('educationStatus', (errorCount) => {
    this.tabErrors.education = errorCount > 0;
    this.addErrorTab('Education', errorCount);
  });
  // Starts listener to check the Employee tab has any errors
  this.emitter.on('employeeStatus', (errorCount) => {
    this.tabErrors.employee = errorCount > 0;
    this.addErrorTab('Employee', errorCount);
  });
  // Starts listener to check the Job Experience tab has any errors
  this.emitter.on('jobExperienceStatus', (errorCount) => {
    this.tabErrors.jobExperience = errorCount > 0;
    this.addErrorTab('Job Experience', errorCount);
  });
  // Starts listener to check the Languages tab has any errors
  this.emitter.on('languagesStatus', (errorCount) => {
    this.tabErrors.languages = errorCount > 0;
    this.addErrorTab('Foreign Languages', errorCount);
  });
  // Starts listener to check the Personal tab has any errors
  this.emitter.on('personalStatus', (errorCount) => {
    this.tabErrors.personal = errorCount > 0;
    this.addErrorTab('Personal', errorCount);
  });
  // Starts listener to check the Technologies tab has any errors
  this.emitter.on('technologiesStatus', (errorCount) => {
    this.tabErrors.technologies = errorCount > 0;
    this.addErrorTab('Technologies and Skills', errorCount);
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
 * destroying all listeners
 */
function beforeUnmount() {
  this.emitter.off('disableUpload');
  this.emitter.off('uploaded');
  this.emitter.off('confirmed');
  this.emitter.off('canceled');
  this.emitter.off('canceled-form');
  this.emitter.off('canceled-cancel');
  this.emitter.off('confirmed-cancel');
  this.emitter.off('created');
  this.emitter.off('doneValidating');
  this.emitter.off('awardStatus');
  this.emitter.off('certificationsStatus');
  this.emitter.off('clearanceStatus');
  this.emitter.off('contractsStatus');
  this.emitter.off('customerOrgExpStatus');
  this.emitter.off('educationStatus');
  this.emitter.off('employeeStatus');
  this.emitter.off('jobExperienceStatus');
  this.emitter.off('languagesStatus');
  this.emitter.off('personalStatus');
  this.emitter.off('technologiesStatus');
  this.emitter.off('resume');
} // beforeUnmount

// |--------------------------------------------------|
// |                                                  |
// |                    COMPUTED                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * choose whether to use the drop down or not with a boolean computed value
 *
 * @return boolean - returns true for small screens
 */
function useDropDown() {
  switch (this.$vuetify.display.name) {
    case 'xs':
      return true;
    default:
      return false;
  }
} // useDropDown

/**
 * computed value of which tab is selected
 *
 * @return string - selected tab capitalized
 */
function parsedInfoTab() {
  let parseTab = !this.formTab ? 'Select Info' : this.formTab;
  if (this.formTab === 'customerOrgExp') {
    parseTab = 'Customer Org';
  } else if (this.formTab === 'jobExperience') {
    parseTab = 'Job Experience';
  }
  return parseTab.toUpperCase();
} // parsedInfoTab

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for formTab - tracks current tab and emits if changed
 *
 * @param val - the value that represents current tab
 */
function watchFormTab(val) {
  // track current tab when switching between form and info
  if (this.afterCreate) {
    if (!_.isEqual(val, this.currentTab)) {
      this.emitter.emit('tabChange', val); // emit to parent tab was changed
    }
  }
} // watchFormTab

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  beforeUnmount,
  components: {
    AwardTab,
    CertificationTab,
    ClearanceTab,
    ContractTab,
    CustomerOrgTab,
    EducationTab,
    EmployeeTab,
    FormCancelConfirmation,
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
      cancelling: false, // cancelling form
      confirmingValid: false, // confirming form submission
      confirmingError: false,
      contractProjects: this.contracts.map((c) => c.projects).flat(),
      deleteLoading: false,
      disableEmpNum: false,
      errorTabNames: {},
      formTab: null, // currently active tab
      fullName: '', // employee's first and last name
      model: {
        agencyIdentificationNumber: null,
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
        currentStreet2: null,
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
        nickname: null,
        noMiddleName: false,
        personalEmail: null,
        privatePhoneNumbers: [],
        publicPhoneNumbers: [],
        prime: null,
        education: [],
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
      tagsToUpdate: [],
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
    cancelA,
    cancelB,
    cleanUpData,
    checkEmployeeDeactivation,
    confirm,
    convertAutocompleteToTitlecase,
    format, // dateUtils
    getRole,
    hasAdminPermissions,
    hasTabError,
    openUpload,
    setFormData,
    submit,
    titleCase,
    resumeReceived,
    selectDropDown,
    updateStoreEmployees,
    updateStoreUser,
    updateTags
  },
  props: ['contracts', 'currentTab', 'employee'], // employee to be created/updated
  watch: {
    formTab: watchFormTab
  },
  computed: {
    useDropDown,
    parsedInfoTab
  }
};
</script>

<style>
.errorTab {
  color: red !important;
}

.overflow {
  overflow-y: scroll;
}
</style>
