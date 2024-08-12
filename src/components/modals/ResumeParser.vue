<template>
  <v-dialog v-model="activate" persistent max-width="1000" @click:outside="confirmBackingOut = !loading">
    <v-card>
      <v-card-title class="header_style d-flex justify-space-between align-center">
        <p style="margin: 0"><strong>Upload Resume</strong></p>
        <v-btn icon="" variant="text" @click="confirmBackingOut = !loading">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pa-3">
        <!-- File upload -->
        <v-form ref="submit" class="ma-3">
          <v-container fluid class="mx-0">
            <v-row>
              <v-col class="text-center">
                <h1>Add Your Resume Here</h1>
              </v-col>
            </v-row>
            <v-row class="d-flex align-center justify-center">
              <v-col cols="9" xl="8" lg="8" md="8" sm="8" class="pr-0">
                <v-file-input :rules="fileRules" variant="underlined" v-model="file" label="Resume"></v-file-input>
              </v-col>
              <v-col cols="2" xl="2" lg="2" md="2" sm="2" class="text-center mr-4">
                <v-btn @click="submit" color="green" variant="outlined" :disabled="!validFile || loading">Upload</v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
        <!-- Extract checkbox and loading bar -->
        <div class="ma-3">
          <v-row>
            <v-checkbox
              class="ml-4"
              v-model="extractResume"
              label="Extract resume data and add data on profile"
              :disabled="loading"
            ></v-checkbox>
          </v-row>
          <div v-if="loading">
            <p align="center">{{ loadingMessage }}</p>
            <v-progress-linear color="#bc3825" indeterminate></v-progress-linear>
          </div>
          <div v-if="!loading && timeoutError">
            <p align="center" class="error-text">Timeout error, please try again.</p>
          </div>
        </div>
        <!-- Pending Changes Section -->
        <span
          v-if="
            resumeProcessed &&
            (showTech || showAddress || showPhoneNumber || showEducation || showGitHub || showLinkedIn)
          "
        >
          <v-row class="text-center pb-3">
            <v-col>
              <h1>Pending Changes</h1>
            </v-col>
          </v-row>
          <!-- Personal Info Section -->
          <span v-if="showAddress || showPhoneNumber || showGitHub || showLinkedIn">
            <v-container fluid>
              <v-row class="text-left">
                <v-col>
                  <h2>Personal Info Changes</h2>
                </v-col>
              </v-row>
              <v-row class="text-center">
                <v-col cols="6">
                  <h3>Personal Info Currently on Form</h3>
                </v-col>
                <v-col cols="6">
                  <h3>New Personal Info</h3>
                </v-col>
              </v-row>
              <!-- Address -->
              <v-row v-if="showAddress">
                <v-col xl="5" lg="5" md="5" sm="6" cols="6">
                  <v-text-field v-model="address" variant="underlined" disabled label="Old Address"> </v-text-field>
                </v-col>
                <v-col xl="5" lg="5" md="5" sm="6" cols="6">
                  <v-text-field v-model="newAddress" variant="underlined" readonly label="New Address"> </v-text-field>
                </v-col>
                <v-col xl="2" lg="2" md="2" sm="12" cols="12" class="pt-md-6 pt-0 text-center">
                  <v-btn @click="addressCanceled = true" icon="" variant="text">
                    <v-tooltip activator="parent" location="top">Ignore Pending Change</v-tooltip>
                    <v-icon size="large" color="red">mdi-close</v-icon>
                  </v-btn>

                  <v-btn
                    @click="
                      submitInfo('address', newAddress);
                      addressCanceled = true;
                    "
                    icon=""
                    variant="text"
                  >
                    <v-tooltip activator="parent" location="top">Add Pending Change</v-tooltip>
                    <v-icon size="large" color="green"> mdi-check </v-icon>
                  </v-btn>
                </v-col>
              </v-row>
              <!-- Phone Number -->
              <v-row v-if="showPhoneNumber" class="text-center">
                <v-col xl="7" lg="7" md="7" sm="8" cols="6">
                  <v-row>
                    <v-col sm="6" cols="12">
                      <v-autocomplete
                        label="Actions *"
                        v-model="phoneNumAction"
                        variant="underlined"
                        :items="getPhoneNumActionDropdowns()"
                        @update:model-value="toggleOldNumsDropdown()"
                      ></v-autocomplete>
                    </v-col>
                    <v-col sm="6" cols="12">
                      <v-autocomplete
                        :disabled="disableOldPhoneNums"
                        label="Number"
                        variant="underlined"
                        v-model="oldPhoneNumToReplace"
                        :items="getOldPhoneNums()"
                      ></v-autocomplete>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col xl="3" lg="3" md="3" sm="4" cols="6">
                  <v-text-field v-model="newPhoneNumber" variant="underlined" readonly label="New Phone Number">
                  </v-text-field>
                </v-col>
                <v-col xl="2" lg="2" md="2" sm="12" cols="12" class="pt-md-6 pt-0 text-center">
                  <v-btn @click="phoneCanceled = true" icon="" variant="text">
                    <v-tooltip activator="parent" location="top">Ignore Pending Change</v-tooltip>
                    <v-icon size="large" color="red">mdi-close</v-icon>
                  </v-btn>
                  <v-btn
                    @click="
                      submitInfo('phoneNumber', newPhoneNumber);
                      phoneCanceled = true;
                    "
                    icon=""
                    variant="text"
                    :disabled="phoneNumAction === null"
                  >
                    <v-tooltip activator="parent" location="top">Add Pending Change</v-tooltip>
                    <v-icon size="large" color="green"> mdi-check </v-icon>
                  </v-btn>
                </v-col>
              </v-row>
              <!-- GitHub -->
              <v-row v-if="showGitHub" class="text-center">
                <v-col xl="5" lg="5" md="5" sm="6" cols="6">
                  <v-text-field :model-value="employee.github" variant="underlined" disabled label="Old GitHub">
                  </v-text-field>
                </v-col>
                <v-col xl="5" lg="5" md="5" sm="6" cols="6">
                  <v-text-field v-model="newPersonal.github" variant="underlined" readonly label="New GitHub">
                  </v-text-field>
                </v-col>
                <v-col xl="2" lg="2" md="2" sm="12" cols="12" class="pt-md-6 pt-0 text-center">
                  <v-btn @click="gitHubCanceled = true" icon="" variant="text">
                    <v-tooltip activator="parent" location="top">Ignore Pending Change</v-tooltip>
                    <v-icon size="large" color="red">mdi-close</v-icon>
                  </v-btn>
                  <v-btn
                    @click="
                      submitInfo('github', newPersonal.github);
                      gitHubCanceled = true;
                    "
                    icon=""
                    variant="text"
                  >
                    <v-tooltip activator="parent" location="top">Add Pending Change</v-tooltip>
                    <v-icon size="large" color="green"> mdi-check </v-icon>
                  </v-btn>
                </v-col>
              </v-row>
              <!-- LinkedIn -->
              <v-row v-if="showLinkedIn" class="text-center">
                <v-col xl="5" lg="5" md="5" sm="6" cols="6">
                  <v-text-field :model-value="employee.linkedIn" variant="underlined" disabled label="Old LinkedIn">
                  </v-text-field>
                </v-col>
                <v-col xl="5" lg="5" md="5" sm="6" cols="6">
                  <v-text-field v-model="newPersonal.linkedIn" variant="underlined" readonly label="New LinkedIn">
                  </v-text-field>
                </v-col>
                <v-col xl="2" lg="2" md="2" sm="12" cols="12" class="pt-md-6 pt-0 text-center">
                  <v-btn @click="linkedInCanceled = true" icon="" variant="text">
                    <v-tooltip activator="parent" location="top">Ignore Pending Change</v-tooltip>
                    <v-icon size="large" color="red">mdi-close</v-icon>
                  </v-btn>
                  <v-btn
                    @click="
                      submitInfo('linkedIn', newPersonal.linkedIn);
                      linkedInCanceled = true;
                    "
                    icon=""
                    variant="text"
                  >
                    <v-tooltip activator="parent" location="top">Add Pending Change</v-tooltip>
                    <v-icon size="large" color="green"> mdi-check </v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </span>
          <!-- Technology -->
          <span v-if="showTech">
            <v-row class="text-left my-2">
              <v-col>
                <h2>Technology Additions</h2>
                <hr />
              </v-col>
            </v-row>
            <div v-for="(tech, index) in newTechnology" :key="index">
              <v-form :ref="'tech' + index">
                <div v-if="!tech.canceled" class="gray-border pt-3 pb-1 px-5 ma-1">
                  <!-- Loop Technologies -->
                  <!-- Name of Technology -->
                  <v-text-field
                    class="pb-5"
                    :model-value="tech.name"
                    variant="underlined"
                    readonly
                    label="Technology"
                  ></v-text-field>

                  <!-- Current and Years of Experience -->
                  <div class="mb-3">
                    <v-row justify="center" align="center" class="py-3">
                      <!-- Current Switch -->
                      <v-col cols="4" sm="4" md="4" lg="4">
                        <v-switch
                          :color="caseGray"
                          v-model="tech.current"
                          label="Currently know this technology"
                        ></v-switch>
                      </v-col>

                      <!-- Years of Experience -->
                      <v-col
                        cols="5"
                        sm="6"
                        md="4"
                        lg="3"
                        class="px-0 pb-0"
                        :class="{ 'px-4': $vuetify.display.sm, 'px-4': $vuetify.display.lg }"
                      >
                        <v-text-field
                          class="px-3"
                          v-model="tech.years"
                          flat
                          :rules="experienceRequired"
                          single-line
                          max="99"
                          min="0"
                          suffix="years"
                          density="compact"
                          type="number"
                          variant="outlined"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </div>

                  <v-row align="center" class="py-3" justify="center">
                    <v-btn @click="tech.canceled = true" icon="" variant="text">
                      <v-tooltip activator="parent" location="top">Ignore Pending Change</v-tooltip>
                      <v-icon size="large" color="red">mdi-close</v-icon>
                    </v-btn>
                    <v-btn @click="submitInfo('technology', index)" icon="" variant="text">
                      <v-tooltip activator="parent" location="top">Add Pending Change</v-tooltip>
                      <v-icon size="large" color="green"> mdi-check </v-icon>
                    </v-btn>
                  </v-row>
                </div>
              </v-form>
            </div>
          </span>
          <div v-if="showEducation" class="mt-4">
            <!-- Education -->
            <v-row class="text-left">
              <v-col>
                <h2>Education Additions</h2>
                <hr />
              </v-col>
            </v-row>
            <v-form
              v-for="(edu, index) in newEducation"
              :key="index"
              :ref="'education' + index"
              class="ma-xl-5 ma-lg-5 ma-md-0"
            >
              <university-form
                v-if="!edu.canceled && edu.type === 'university'"
                :parser="true"
                :school="edu"
                :schoolIndex="index"
                :attach="true"
                :index="index"
              ></university-form>
              <high-school-form
                v-else-if="!edu.canceled && edu.type === 'highSchool'"
                :parser="true"
                :school="edu"
                :schoolIndex="index"
                :attach="true"
                :index="index"
              ></high-school-form>
              <military-form
                v-else-if="!edu.canceled && edu.type === 'military'"
                :parser="true"
                :service="edu"
                :militaryIndex="index"
                :attach="true"
                :index="index"
              ></military-form>
            </v-form>
          </div>
        </span>
        <!-- End of Pending Changes Section -->
        <!-- No changes -->
        <v-row
          class="text-center mt-3"
          v-if="
            !changesMade &&
            resumeProcessed &&
            !(showTech || showAddress || showPhoneNumber || showEducation || showGitHub || showLinkedIn)
          "
        >
          <v-col>
            <h2>No new profile additions found!</h2>
          </v-col>
        </v-row>
        <v-row
          class="text-center"
          v-if="
            !changesMade &&
            resumeProcessed &&
            !(showTech || showAddress || showPhoneNumber || showEducation || showGitHub || showLinkedIn)
          "
        >
          <v-col>
            <v-btn color="red" variant="outlined" @click="clearForm">Close Form</v-btn>
          </v-col>
        </v-row>
        <!-- Changes exist -->
        <v-row
          class="text-center"
          v-if="
            resumeProcessed &&
            (showTech || showAddress || showPhoneNumber || showEducation || showGitHub || changesMade || showLinkedIn)
          "
        >
          <v-col class="text-right">
            <v-btn
              color="red"
              class="mx-0 my-3"
              variant="outlined"
              @click="confirmBackingOut = true"
              :size="isSmallScreen ? 'x-small' : 'default'"
            >
              Cancel Form Edits
            </v-btn>
          </v-col>
          <v-col class="text-left">
            <v-btn
              color="green"
              class="mx-0 my-3"
              variant="outlined"
              @click="submitForm"
              :size="isSmallScreen ? 'x-small' : 'default'"
            >
              Submit Form
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <!-- Failed to submit all pending changes Modal -->
    <v-dialog v-model="toggleResumeFormErrorModal" max-width="350">
      <v-card>
        <v-card-title> Please make sure you process all pending changes. </v-card-title>
        <v-btn variant="text" color="red" @click="toggleResumeFormErrorModal = false">Close</v-btn>
      </v-card>
    </v-dialog>
    <!-- Confirmation Modal -->
    <general-confirmation-modal
      title="Are you sure you want to submit?"
      :toggleModal="this.confirmingValid"
      type="parser"
    ></general-confirmation-modal>
    <!-- Cancel Confirmation Modal -->
    <cancel-confirmation :toggleSubmissionConfirmation="this.confirmBackingOut" type="parser"> </cancel-confirmation>
  </v-dialog>
</template>

<script>
import api from '@/shared/api.js';
import { generateUUID, isEmpty, isSmallScreen } from '@/utils/utils';
import { SCHOOLS } from '@/components/employees/form-tabs/dropdown-info/schools';
import _forEach from 'lodash/forEach';
import _isEmpty from 'lodash/isEmpty';
import _isEqual from 'lodash/isEqual';
import _cloneDeep from 'lodash/cloneDeep';
import _filter from 'lodash/filter';
import CancelConfirmation from '@/components/modals/CancelConfirmation.vue';
import UniversityForm from '@/components/employees/form-tabs/education-types/UniversityForm.vue';
import MilitaryForm from '@/components/employees/form-tabs/education-types/MilitaryForm.vue';
import HighSchoolForm from '@/components/employees/form-tabs/education-types/HighSchoolForm.vue';
import GeneralConfirmationModal from '@/components/modals/GeneralConfirmationModal.vue';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Sets up event listeners for confirming and canceling resume parser
 */
async function created() {
  this.emitter.on('confirmed-parser', async () => {
    // Create an audit of the success
    await api.createItem(api.AUDIT, {
      id: generateUUID(),
      type: 'resume',
      tags: ['submit'],
      employeeId: this.employee.id,
      description: `${this.employee.firstName} ${this.employee.lastName} made changes to their profile through the resume parser.`,
      timeToLive: 60
    });

    this.emitter.emit('resume', { newEmployeeForm: this.editedEmployeeForm, totalChanges: this.totalChanges });
    this.resumeProcessed = false;
    this.confirmingValid = false;
    this.activate = !this.activate;
    this.totalChanges = 0;
  });
  this.emitter.on('canceled-parser', () => {
    this.confirmingValid = false;
  });
  this.emitter.on('deny', (result) => (this.newEducation[result.index].canceled = true));
  this.emitter.on('confirm', (result) => this.submitInfo('education', result.index, result.value));
  this.emitter.on('backout-canceled-parser', () => {
    this.confirmBackingOut = false;
  });
  this.emitter.on('backout-confirmed-parser', () => {
    this.confirmBackingOut = false;
    this.clearForm();
  });
} // created

/**
 * destroy listeners
 */
function beforeUnmount() {
  this.emitter.off('confirmed-parser');
  this.emitter.off('canceled-parser');
  this.emitter.off('backout-canceled-parser');
  this.emitter.off('backout-confirmed-parser');
} // beforeUnmount

// |--------------------------------------------------|
// |                                                  |
// |                 COMPUTED                         |
// |                                                  |
// |--------------------------------------------------|

/**
 * Determines if any pending changes have been submitted
 *
 * @return boolean - if the changes have been submitted
 */
function changesMade() {
  return !_isEqual(this.editedEmployeeForm, this.employee);
} // changesMade

/**
 * Determines if the address should be shown, i.e. does one exist or has the pending
 * change been denied
 *
 * @return boolean - whether or not to show address
 */
function showAddress() {
  return this.newAddress && !this.addressCanceled;
} // showAddress

/**
 * Determines if the github username should be shown, i.e. does one exist or has the pending
 * change been denied
 *
 * @return boolean - whether or not to show github
 */
function showGitHub() {
  return this.newPersonal.github && !this.gitHubCanceled;
} // showGitHub

/**
 * Determines if the linkedIn should be shown, i.e. does one exist or has the pending
 * change been denied
 *
 * @return boolean - if the linkedIn should be showed
 */
function showLinkedIn() {
  return this.newPersonal.linkedIn && !this.linkedInCanceled;
} // showLinkedIn

/**
 * Formats the old employee address
 *
 * @return string - the formatted address
 */
function address() {
  let currentAddress = '';
  if (!this.isEmpty(this.employee.currentStreet)) {
    if (!this.isEmpty(this.employee.currentStreet2)) {
      currentAddress += `${this.employee.currentStreet} ${this.employee.currentStreet2}, `;
    } else {
      currentAddress += `${this.employee.currentStreet}, `;
    }
  }
  if (!this.isEmpty(this.employee.currentCity)) {
    currentAddress += `${this.employee.currentCity}, `;
  }
  if (!this.isEmpty(this.employee.currentState)) {
    currentAddress += `${this.employee.currentState} `;
  }
  if (!this.isEmpty(this.employee.currentZIP)) {
    currentAddress += `${this.employee.currentZIP} `;
  }
  if (currentAddress.charAt(currentAddress.length - 2) === ',') {
    currentAddress = currentAddress.slice(0, -2);
  } else {
    currentAddress = currentAddress.slice(0, -1);
  }
  return currentAddress === '' ? 'No address on form' : currentAddress;
} // address

/**
 * Formats the new employee address (if one exists)
 *
 * @return String - the formatted address
 */
function newAddress() {
  if (
    this.newPersonal.currentStreet &&
    this.newPersonal.currentCity &&
    this.newPersonal.currentState &&
    this.newPersonal.currentZIP
  ) {
    return `${this.newPersonal.currentStreet}, ${this.newPersonal.currentCity}, ${this.newPersonal.currentState} ${this.newPersonal.currentZIP}`;
  } else {
    return null;
  }
} // newAddress

/**
 * Checks if a the phone number should be shown
 *
 * @return boolean - whether to show number
 */
function showPhoneNumber() {
  return this.newPersonal.phoneNumber && !this.phoneCanceled;
} // showPhoneNumber

/**
 * Displays whether or not an old phone number existed
 *
 * @return boolean - whether or not employee old number existed
 */
function phoneNumber() {
  return this.employee.phoneNumber ? this.employee.phoneNumber : 'No phone number on form';
} // phoneNumber

/**
 * Shows the newPhoneNumber if it exists
 *
 * @return boolean - whether new phone number exists
 */
function newPhoneNumber() {
  return this.newPersonal.phoneNumber ? this.newPersonal.phoneNumber : null;
} // newPhoneNumber

/**
 * Determines if the tech should be show. Goes through all tech
 * and makes sure all of them have been canceled
 *
 * @return boolean - if there are any techs to show
 */
function showTech() {
  return this.newTechnology.filter((tech) => !tech.canceled).length != 0;
} // showTech

/**
 * Determines if the education section should be shown. Goes through all education
 * and makes sure all of them have been canceled
 *
 * @return boolean - if the education section should be shown
 */
function showEducation() {
  return this.newEducation.filter((education) => !education.canceled).length != 0;
} // showEducation

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Shows the right list of numbers based on the phone number action selection.
 * @return a list of phone numbers if replacing
 */
function getOldPhoneNums() {
  let nums = [];
  switch (this.phoneNumAction) {
    case 'Replace from Public':
      _forEach(this.employee.publicPhoneNumbers, (number) => {
        nums.push(number.number);
      });
      break;
    case 'Replace from Private':
      _forEach(this.employee.privatePhoneNumbers, (number) => {
        nums.push(number.number);
      });
      break;
    default:
      break;
  }
  return nums;
} //getOldPhoneNums

/**
 * Populates phone number dropdows based on if the user has public/private nums.
 * @return a list of action options
 */
function getPhoneNumActionDropdowns() {
  let options = ['Add to Private', 'Add to Public'];
  if (!_isEmpty(this.employee.publicPhoneNumbers)) {
    options.unshift('Replace from Public');
  }
  if (!_isEmpty(this.employee.privatePhoneNumbers)) {
    options.unshift('Replace from Private');
  }
  return options;
} // getPhoneNumActionDropdowns

/**
 * When the checkbox is not selected on the resume modal, it uploads the resume and closes the window upon
 * successful completion
 *
 * @param eId - the employee Id
 */
async function onlyUploadResume(eId) {
  try {
    this.loading = true;
    await api.uploadResume(eId, this.file?.[0] || this.file); //uploads resume to s3
    this.loading = false;

    //confirmation upload pop-up in employee.vue
    this.emitter.emit('uploaded', true);
    this.clearForm();
    this.activate = false;
  } catch (err) {
    this.loading = false;
    this.timeoutError = true;
  }
} //onlyUploadResume

/**
 * Submit new resume and parse it
 */
async function submit() {
  // If we only want to upload resume and not parse it
  if (!this.extractResume) {
    await this.onlyUploadResume(this.employee.id);
    return;
  }

  // Start of parsing resume -- reset the fields
  this.resumeObject = [];
  this.newEducation = [];
  this.newTechnology = [];
  this.newPersonal = {
    phoneNumber: null,
    location: null,
    currentCity: null,
    currentState: null,
    currentStreet: null,
    currentZIP: null
  };
  this.addressCanceled = false;
  this.phoneCanceled = false;
  this.timeoutError = false;
  this.editedEmployeeForm = _cloneDeep(this.employee);

  // checks if the file uploaded is a pdf/png/jpg
  if (this.validFile) {
    this.resumeObject.length = 0;
    this.loading = true;
    this.resumeProcessed = false;

    // The set timeouts are for the loading message (it's kind of buggy if you reopen the modal quickly)
    this.loadingMessage = 'Processing resume data, this may take up to 30 seconds';

    setTimeout(() => {
      if (this.loading && this.activate) {
        this.loadingMessage = 'Sooooooo, how are you doing?';
        setTimeout(() => {
          if (this.loading && this.activate) {
            this.loadingMessage = 'You must have a beefy resume!';
            setTimeout(() => {
              if (this.loading && this.activate) {
                this.loadingMessage = 'You may want to try again...';
              }
            }, 15000);
          }
        }, 15000);
      }
    }, 15000);

    this.resumeObject = (await api.extractResumeText(this.employee.id, this.file?.[0] || this.file)).comprehend;
    this.emitter.emit('uploaded', false);

    // If it takes too long it should timeout
    if (this.resumeObject instanceof Error || !this.resumeObject) {
      this.resumeObject = null;
      this.timeoutError = true;
      this.loading = false;

      // Create an audit of the timeout
      await api.createItem(api.AUDIT, {
        id: generateUUID(),
        type: 'resume',
        tags: ['upload', 'failure'],
        employeeId: this.employee.id,
        description: `${this.employee.firstName} ${this.employee.lastName} timed out on resume upload.`,
        timeToLive: 60
      });

      return;
    }

    // Create an audit of the success
    await api.createItem(api.AUDIT, {
      id: generateUUID(),
      type: 'resume',
      tags: ['upload', 'success'],
      employeeId: this.employee.id,
      description: `${this.employee.firstName} ${this.employee.lastName} successfully uploaded a resume.`,
      timeToLive: 60
    });

    // PERSONAL info
    let personalComprehend = this.resumeObject.filter((entity) => {
      return entity.Type === 'OTHER' || entity.Type === 'LOCATION';
    });

    let location = [];
    let locationCounter = 0;
    _forEach(personalComprehend, async (personalEntity) => {
      // // Links

      if (personalEntity.Text.includes('github')) {
        let githubURL = personalEntity.Text + '/';
        let githubUsername = githubURL.substring(
          githubURL.indexOf('/', 9) + 1,
          githubURL.indexOf('/', githubURL.indexOf('/', 9) + 1)
        );
        if (githubUsername !== this.employee.github) {
          this.newPersonal.github = githubUsername;
        }
      }

      if (
        personalEntity.Text.includes('https://www.linkedin.com/in') &&
        personalEntity.Text !== this.employee.linkedIn
      ) {
        this.newPersonal.linkedIn = personalEntity.Text;
      }

      // Phone Number
      if (personalEntity.Text.match(/^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/)) {
        let phoneNumber = '';
        for (let i = 0; i < personalEntity.Text.length; i++) {
          if (personalEntity.Text.charAt(i) >= '0' && personalEntity.Text.charAt(i) <= '9') {
            phoneNumber += personalEntity.Text.charAt(i);
          }
          if (phoneNumber.length == 3 || phoneNumber.length == 7) {
            phoneNumber += '-';
          }
        }
        if (phoneNumber !== this.employee.phoneNumber) {
          this.newPersonal.phoneNumber = phoneNumber;
        }
      }

      // Address
      if (personalEntity.Type === 'LOCATION') {
        if (locationCounter % 2 === 0) {
          location.push(personalEntity.Text + ' ');
        } else {
          location[location.length - 1] += personalEntity.Text + ' ';
        }
        locationCounter++;
      }
    });

    // Gets the locations from Google Maps
    let locations = await api.getLocation(location[0]);

    // We choose to go with the first thing that Google Maps gives us (if anything)
    if (locations.predictions.length >= 1) {
      let location = locations.predictions[0].description;
      let place_id = locations.predictions[0].place_id;

      let fullAddress = location.split(', ');
      let state = fullAddress[2].split(' ')[0];

      let res = await api.getZipCode(place_id);
      // Response contains an array of objects, with each object containing
      // a field title 'type'. 'Type' is another array and we want the one
      // containing the postal_code string
      let currentZIP = '';
      _forEach(res.result.address_components, (field) => {
        if (field.types.includes('postal_code')) {
          currentZIP = field.short_name;
        }
      });

      // Set info if we have all the necessary parts
      if (
        (fullAddress[0] != this.employee.currentStreet || fullAddress[1] != this.employee.currentCity) &&
        currentZIP &&
        this.states[state]
      ) {
        this.newPersonal.currentStreet = fullAddress[0];
        this.newPersonal.currentCity = fullAddress[1];
        this.newPersonal.currentState = this.states[state];
        this.newPersonal.currentZIP = currentZIP;
      }
    }

    // ---- THE EDUCATION AND TECH PARSING COULD BE CLEANED UP
    // EDUCATION
    let educationComprehend = this.resumeObject.filter((entity) => {
      return entity.Type === 'ORGANIZATION';
    });

    // Go through organization an see if they are a university, high school, or military
    let dodForces = ['Army', 'Marine Corps', 'Navy', 'Air Force', 'Space Force', 'Coast Guard', 'National Guard'];
    for (let i = 0; i < educationComprehend.length; i++) {
      let educationEntity = educationComprehend[i];
      let college = this.collegeList.find((c) => c.toLowerCase() === educationEntity.Text.toLowerCase());
      // If the exact college exists
      if (college) {
        // Remove duplicate
        if (
          (!this.employee.education ||
            this.employee.education.filter((e) => e.name && e.name === college).length == 0) &&
          this.newEducation.filter((e) => e.name && e.name === college).length == 0
        ) {
          this.newEducation.push({
            name: college,
            type: 'university',
            degrees: [
              {
                completionDate: null,
                concentrations: [],
                degreeType: null,
                majors: [null],
                minors: [],
                showEducationMenu: false
              }
            ],
            canceled: false
          });
        }
      } else if (
        educationEntity.Text.toLowerCase().includes('high school') &&
        (!this.employee.education ||
          this.employee.education.filter((e) => e.name && e.name.toLowerCase() == educationEntity.Text.toLowerCase())
            .length == 0) &&
        this.newEducation.filter((e) => e.name && e.name.toLowerCase() == educationEntity.Text.toLowerCase()).length ==
          0
      ) {
        this.newEducation.push({
          name: educationEntity.Text,
          type: 'highSchool',
          gradDate: null,
          canceled: false
        });
      } else {
        // check all military
        let mil = _filter(dodForces, (f) => {
          return educationEntity.Text.toLowerCase().includes(f.toLowerCase());
        });
        if (
          mil.length == 1 &&
          (!this.employee.education ||
            this.employee.education.filter((e) => e.branch && e.branch === mil[0]).length == 0) &&
          this.newEducation.filter((e) => e.branch && e.branch === mil[0]).length == 0
        ) {
          this.newEducation.push({
            branch: mil[0],
            type: 'military',
            startDate: null,
            completeDate: null,
            canceled: false
          });
        }
      }
    }

    // TECH
    let techComprehend = this.resumeObject.filter((entity) => {
      return entity.Type === 'TITLE' || entity.Type === 'OTHER';
    });

    let newTech = [];
    techComprehend.forEach(async (tech) => {
      let techList = [];
      if (!tech.Text.includes('/')) {
        techList = await api.getTechSkills(tech.Text);
      }
      // check if the tech list contains the tech from the resume
      let techs = techList.filter((item) => {
        return item.toLowerCase() === tech.Text.toLowerCase();
      });

      // add if there are no duplicates
      if (techs.length == 1 && !newTech.includes(techs[0])) {
        if (
          !this.employee.technologies ||
          (this.employee.technologies &&
            this.employee.technologies.length > 0 &&
            this.employee.technologies.filter((e) => e.name === techs[0]).length == 0)
        ) {
          this.newTechnology.push({
            name: techs[0],
            current: false,
            canceled: false,
            years: 0
          });
          newTech.push(techs[0]);
        }
      }
    });

    this.loading = false;
    this.resumeProcessed = true;
  }
} //submit

/**
 * Adds the submitted info into the editedEmployeeForms
 *
 * @param field - The type of info to be submitted (address/phoneNumber/education/technology)
 * @param value - For education and tech, the index of the education/technology in the parsed info arrays
 * @param newValue - Used for education the new d to be submitted
 */
function submitInfo(field, value, newValue) {
  this.totalChanges++;
  if (field === 'address') {
    // Create fields in editedEmployeeForm if they don't exist
    if (!this.editedEmployeeForm.currentStreet) {
      this.editedEmployeeForm['currentStreet'] = '';
      this.editedEmployeeForm['currentCity'] = '';
      this.editedEmployeeForm['currentState'] = '';
      this.editedEmployeeForm['currentZIP'] = '';
    }
    this.editedEmployeeForm.currentStreet = this.newPersonal.currentStreet;
    this.editedEmployeeForm.currentCity = this.newPersonal.currentCity;
    this.editedEmployeeForm.currentState = this.newPersonal.currentState;
    this.editedEmployeeForm.currentZIP = this.newPersonal.currentZIP;
  } else if (field === 'phoneNumber') {
    let phoneObj = { type: 'Cell', number: this.newPersonal.phoneNumber, valid: true };
    switch (this.phoneNumAction) {
      case 'Add to Private':
        phoneObj.private = true;
        this.editedEmployeeForm.privatePhoneNumbers.push(phoneObj);
        break;
      case 'Add to Public':
        phoneObj.private = false;
        this.editedEmployeeForm.publicPhoneNumbers.push(phoneObj);
        break;
      case 'Replace from Public':
        // find num object that matches num to replace
        this.editedEmployeeForm.publicPhoneNumbers.forEach((num) => {
          if (num.number === this.oldPhoneNumToReplace) {
            num.number = this.newPhoneNumber;
          }
        });
        break;
      case 'Replace from Private':
        // find num object that matches num to replace
        this.editedEmployeeForm.privatePhoneNumbers.forEach((num) => {
          if (num.number === this.oldPhoneNumToReplace) {
            num.number = this.newPhoneNumber;
          }
        });
        break;
      default:
        break;
    }
    if (!this.editedEmployeeForm.phoneNumber) {
      this.editedEmployeeForm['phoneNumber'] = '';
    }
    this.editedEmployeeForm.phoneNumber = this.newPersonal.phoneNumber;
  } else if (field === 'github') {
    if (!this.editedEmployeeForm.github) {
      this.editedEmployeeForm['github'] = '';
    }
    this.editedEmployeeForm.github = this.newPersonal.github;
  } else if (field === 'linkedIn') {
    if (!this.editedEmployeeForm.linkedIn) {
      this.editedEmployeeForm['linkedIn'] = '';
    }
    this.editedEmployeeForm.linkedIn = this.newPersonal.linkedIn;
  } else if (field === 'technology' && this.$refs['tech' + value][0].validate()) {
    this.newTechnology[value].canceled = true;
    // Create fields in editedEmployeeForm if they don't exist
    if (!this.editedEmployeeForm.technologies) {
      this.editedEmployeeForm['technologies'] = [];
    }
    // Add new tech
    this.editedEmployeeForm.technologies.push({
      name: this.newTechnology[value].name,
      current: this.newTechnology[value].current,
      years: this.newTechnology[value].years
    });
  } else if (field === 'education' && this.$refs['education' + value][0].validate()) {
    this.newEducation[value].canceled = true;
    this.newEducation[value].name = newValue.name;
    this.newEducation[value].degrees = newValue.degrees;
    // Create fields in editedEmployeeForm if they don't exist
    if (!this.editedEmployeeForm.education) {
      this.editedEmployeeForm['education'] = [];
    }
    // Build correct structure, filters out fields we don't care about
    let toAdd = {};
    if (this.newEducation[value].type === 'university') {
      toAdd = {
        type: newValue.type,
        degrees: newValue.degrees,
        name: newValue.name
      };
    } else if (this.newEducation[value].type === 'military') {
      toAdd = {
        type: newValue.type,
        branch: newValue.branch,
        startDate: newValue.startDate,
        completeDate: newValue.completeDate
      };
    } else if (this.newEducation[value].type === 'highSchool') {
      toAdd = {
        type: newValue.type,
        gradDate: newValue.gradDate,
        name: newValue.name
      };
    }
    // Add education
    this.editedEmployeeForm.education.push(toAdd);
  }
} // submitInfo

/**
 * Submits the form. Checks to see if all pending changes have been submitted.
 * If not, it displays a modal to do so.
 */
function submitForm() {
  if (this.showTech || this.showPhoneNumber || this.showAddress || this.showEducation) {
    this.toggleResumeFormErrorModal = true;
  } else {
    this.confirmingValid = true;
  }
} // submitForm

/**
 * Determine whether to enable the dropdown for replacing numbers.
 */
function toggleOldNumsDropdown() {
  if (this.phoneNumAction === 'Replace from Private' || this.phoneNumAction === 'Replace from Public') {
    this.disableOldPhoneNums = false;
  } else {
    this.disableOldPhoneNums = true;
  }
} // toggleOldNumsDropdown

/**
 * Clears the form
 */
function clearForm() {
  this.resumeObject = [];
  this.newEducation = [];
  this.newTechonlogy = [];
  this.newPersonal = {
    phoneNumber: null,
    location: null,
    currentCity: null,
    currentState: null,
    currentStreet: null,
    currentZIP: null
  };
  this.addressCanceled = false;
  this.phoneCanceled = false;
  this.editedEmployeeForm = _cloneDeep(this.employee);
  this.file = null;
  this.loading = false;
  this.validFile = false;
  this.resumeProcessed = false;
  this.toggleResumeFormErrorModal = false;
  this.timeoutError = false;
  this.confirmingValid = false;
  this.activate = false;
  this.totalChanges = 0;

  if (this.$refs.submit !== undefined) {
    this.$refs.submit.reset;
  }
  this.extractResume = false;
} // clearForm

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for toggleResumeParser
 */
function watchToggleResumeParser() {
  this.activate = true;
} // watchToggleResumeParser

/**
 * watcher for file
 */
function watchFile() {
  this.validFile = this.$refs.submit.validate();
} // watchFile

/**
 * watcher for watchActivate - set the editedEmployeeForm if activate is true
 */
function watchActivate() {
  if (this.activate) {
    this.editedEmployeeForm = _cloneDeep(this.employee);
  }
} // watchActivate

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  beforeUnmount,
  components: {
    CancelConfirmation,
    UniversityForm,
    MilitaryForm,
    HighSchoolForm,
    GeneralConfirmationModal
  },
  computed: {
    address,
    changesMade,
    isSmallScreen,
    newAddress,
    newPhoneNumber,
    phoneNumber,
    showAddress,
    showGitHub,
    showEducation,
    showLinkedIn,
    showPhoneNumber,
    showTech
  },
  created,
  data() {
    return {
      activate: false, // whether or not the modal is open
      addressCanceled: false,
      phoneCanceled: false,
      collegeList: SCHOOLS,
      confirmingValid: false,
      confirmBackingOut: false,
      editedEmployeeForm: null,
      extractResume: false, // whether or not we want to just upload resume or extract data too
      file: null,
      gitHubCanceled: false,
      linkedInCanceled: false,
      loading: false,
      loadingMessage: '',
      newEducation: [],
      newTechnology: [],
      fileRules: [
        (v) => {
          return !this.isEmpty(v) || 'File required (.png, .pdf, or .jpeg)';
        },
        (v) => {
          return (
            (!this.isEmpty(v) &&
              ((v?.[0] || v).type.includes('application/pdf') ||
                (v?.[0] || v).type.includes('image/png') ||
                (v?.[0] || v).type.includes('image/jpeg'))) ||
            'File unsupported, please submit a .png, .pdf, or a .jpeg file'
          );
        }
      ],
      experienceRequired: [
        (v) => !this.isEmpty(v) || 'This field is required',
        (v) => v > 0 || 'Value must be greater than 0',
        (v) => v < 100 || 'Value must be less than 100'
      ], // Used for technology years
      newPersonal: {
        phoneNumber: null,
        currentCity: null,
        currentState: null,
        currentStreet: null,
        currentZIP: null
      },
      disableOldPhoneNums: true,
      oldPhoneNumToReplace: null,
      phoneNumAction: null,
      toggleResumeFormErrorModal: false,
      totalChanges: 0,
      timeoutError: false,
      resumeObject: [],
      resumeProcessed: false,
      states: {
        AL: 'Alabama',
        AK: 'Alaska',
        AS: 'American Samoa',
        AZ: 'Arizona',
        AR: 'Arkansas',
        CA: 'California',
        CO: 'Colorado',
        CT: 'Connecticut',
        DE: 'Delaware',
        DC: 'District Of Columbia',
        FM: 'Federated States Of Micronesia',
        FL: 'Florida',
        GA: 'Georgia',
        GU: 'Guam',
        HI: 'Hawaii',
        ID: 'Idaho',
        IL: 'Illinois',
        IN: 'Indiana',
        IA: 'Iowa',
        KS: 'Kansas',
        KY: 'Kentucky',
        LA: 'Louisiana',
        ME: 'Maine',
        MH: 'Marshall Islands',
        MD: 'Maryland',
        MA: 'Massachusetts',
        MI: 'Michigan',
        MN: 'Minnesota',
        MS: 'Mississippi',
        MO: 'Missouri',
        MT: 'Montana',
        NE: 'Nebraska',
        NV: 'Nevada',
        NH: 'New Hampshire',
        NJ: 'New Jersey',
        NM: 'New Mexico',
        NY: 'New York',
        NC: 'North Carolina',
        ND: 'North Dakota',
        MP: 'Northern Mariana Islands',
        OH: 'Ohio',
        OK: 'Oklahoma',
        OR: 'Oregon',
        PW: 'Palau',
        PA: 'Pennsylvania',
        PR: 'Puerto Rico',
        RI: 'Rhode Island',
        SC: 'South Carolina',
        SD: 'South Dakota',
        TN: 'Tennessee',
        TX: 'Texas',
        UT: 'Utah',
        VT: 'Vermont',
        VI: 'Virgin Islands',
        VA: 'Virginia',
        WA: 'Washington',
        WV: 'West Virginia',
        WI: 'Wisconsin',
        WY: 'Wyoming'
      }, //states
      validFile: false
    };
  },
  methods: {
    clearForm,
    getOldPhoneNums,
    getPhoneNumActionDropdowns,
    isEmpty,
    submitForm,
    submitInfo,
    submit,
    toggleOldNumsDropdown,
    onlyUploadResume
  },
  props: ['toggleResumeParser', 'employee'],
  watch: {
    toggleResumeParser: watchToggleResumeParser,
    file: watchFile,
    activate: watchActivate
  }
};
</script>

<style>
.error-text {
  color: red;
}
</style>
