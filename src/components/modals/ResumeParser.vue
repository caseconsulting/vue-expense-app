<template>
  <v-dialog v-model="activate" max-width="1000" @click:outside="clearForm">
    <v-card>
      <v-card-title class="header_style"><strong>Upload Resume</strong></v-card-title>
      <v-card-text class="pa-5">
        <v-form ref="submit" class="ma-3">
          <v-container fluid>
            <v-row>
              <v-col class="text-center">
                <h1>Add Your Resume Here</h1>
              </v-col>
            </v-row>
            <v-row justify="center" align="center">
              <v-col xl="10" lg="10" md="10" sm="10" xs="2" class="pr-0"
                ><v-file-input :rules="fileRules" v-model="file" label="Resume"></v-file-input
              ></v-col>
              <v-col xl="2" lg="2" md="2" sm="2" xs="2" class="text-center">
                <v-btn @click="submit" color="green" outlined :disabled="!validFile || loading">Upload</v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-checkbox
                class="ml-4"
                v-model="extractResume"
                label="Extract resume data and add data on profile"
              ></v-checkbox>
            </v-row>
            <div v-if="loading">
              <p align="center">{{ loadingMessage }}</p>
              <v-progress-linear color="#bc3825" indeterminate></v-progress-linear>
            </div>
            <div v-if="!loading && timeoutError">
              <p align="center" class="error-text">Timeout error, please try again.</p>
            </div>
          </v-container>
        </v-form>
        <span v-if="resumeProcessed && (showTech || showAddress || showPhoneNumber || showEducation)">
          <v-row class="text-center pb-3">
            <v-col>
              <h1>Pending Changes</h1>
            </v-col>
          </v-row>
          <span v-if="showAddress || showPhoneNumber">
            <v-container fluid>
              <v-row class="text-left">
                <v-col>
                  <h2>Personal Info Changes</h2>
                </v-col>
              </v-row>
              <v-row class="text-center">
                <v-col xl="5" lg="5" md="5" sm="6" xs="6">
                  <h3>Personal Info Currently on Form</h3>
                </v-col>
                <v-col xl="5" lg="5" md="5" sm="6" xs="6">
                  <h3>New Personal Info</h3>
                </v-col>
              </v-row>
              <!-- Address -->
              <v-row v-if="showAddress">
                <v-col xl="5" lg="5" md="5" sm="6" cols="6">
                  <v-text-field v-model="address" disabled label="Old Address"> </v-text-field>
                </v-col>
                <v-col xl="5" lg="5" md="5" sm="6" cols="6">
                  <v-text-field v-model="newAddress" readonly label="New Address"> </v-text-field>
                </v-col>
                <v-col xl="2" lg="2" md="2" sm="12" cols="12" class="pt-md-6 pt-0 text-center">
                  <v-icon
                    large
                    left
                    color="green"
                    @click="
                      submitInfo('address', newAddress);
                      addressCanceled = true;
                    "
                    >done</v-icon
                  >
                  <v-icon large right color="red" @click="addressCanceled = true">close</v-icon>
                </v-col>
              </v-row>
              <!-- Phone Number -->
              <v-row v-if="showPhoneNumber" class="text-center">
                <v-col xl="5" lg="5" md="5" sm="6" cols="6">
                  <v-text-field v-model="phoneNumber" disabled label="Old Phone Number"> </v-text-field>
                </v-col>
                <v-col xl="5" lg="5" md="5" sm="6" cols="6">
                  <v-text-field v-model="newPhoneNumber" readonly label="New Phone Number"> </v-text-field>
                </v-col>
                <v-col xl="2" lg="2" md="2" sm="12" cols="12" class="pt-md-6 pt-0 text-center">
                  <v-icon
                    large
                    left
                    color="green"
                    @click="
                      submitInfo('phoneNumber', newPhoneNumber);
                      phoneCanceled = true;
                    "
                    >done</v-icon
                  >
                  <v-icon large right color="red" @click="phoneCanceled = true">close</v-icon>
                </v-col>
              </v-row>
            </v-container>
          </span>
          <span v-if="showTech">
            <!-- Technology -->
            <v-row class="text-left my-2">
              <v-col>
                <h2>Technology Additions</h2>
                <hr />
              </v-col>
            </v-row>
            <div v-for="(tech, index) in newTechnology" :key="index">
              <div v-if="!tech.canceled" style="border: 1px solid grey" class="pt-3 pb-1 px-5 ma-1">
                <!-- Loop Technologies -->
                <!-- Name of Technology -->
                <v-text-field class="pb-5" :value="tech.tech" readonly label="Technology"></v-text-field>

                <!-- Time Intervals -->
                <v-row justify="center">
                  <div
                    v-for="(dateInterval, intervalIndex) in tech.dateIntervals"
                    :key="'technology interval: ' + index + intervalIndex"
                    class="mb-3"
                  >
                    <date-interval-form
                      ref="dateInterval"
                      :startIntervalDate="dateInterval.startDate"
                      :endIntervalDate="dateInterval.endDate"
                      :allIntervals="tech.dateIntervals"
                      :technologyIndex="index"
                      :intervalIndex="intervalIndex"
                      @delete="deleteDateInterval"
                      @validated="validateDateInterval"
                      @start="updateStartInterval"
                      @end="updateEndInterval"
                    ></date-interval-form>
                  </div>
                </v-row>
                <!-- End of Time Intervals -->

                <!--Add a time interval button-->
                <div class="pt-4 mb-3" align="center">
                  <v-btn @click="addTimeInterval(index)" elevation="2"
                    ><v-icon class="pr-1">add</v-icon>Time Interval</v-btn
                  >
                </div>

                <v-row align="center" class="py-3" justify="center">
                  <v-icon large left color="green" @click="submitInfo('technology', index)">done</v-icon>
                  <v-icon large right color="red" @click="tech.canceled = true">close</v-icon>
                </v-row>
              </div>
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
            <v-form v-for="(education, index) in newEducation" :key="index" :ref="'education' + index" class="ma-5">
              <education-tab
                v-if="!education.canceled"
                :allowAdditions="false"
                :model="[education]"
                @deny="education.canceled = true"
                @confirm="submitInfo('education', index, $event)"
              ></education-tab>
            </v-form>
          </div>
        </span>
        <v-row class="text-center" v-if="resumeProcessed">
          <v-col>
            <v-btn color="green" class="ma-3" outlined @click="submitForm">Submit Form</v-btn>
            <v-btn color="red" outlined @click="clearForm">Cancel Form Edits</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-dialog v-model="toggleResumeFormErrorModal" max-width="350">
      <v-card>
        <v-card-title> Please make sure you process all pending changes. </v-card-title>
        <v-btn text color="red" @click="toggleResumeFormErrorModal = false">Close</v-btn>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script>
import api from '@/shared/api.js';
import { isEmpty } from '@/utils/utils';
import _ from 'lodash';
import dateIntervalForm from '@/components/employees/formTabs/DateIntervalForm';
import educationTab from '@/components/employees/formTabs/EducationTab';

function showAddress() {
  return this.newAddress && !this.addressCanceled;
}

function address() {
  let currentAddress = '';
  if (!isEmpty(this.employee.currentStreet)) {
    currentAddress += `${this.employee.currentStreet}, `;
  }
  if (!isEmpty(this.employee.currentCity)) {
    currentAddress += `${this.employee.currentCity}, `;
  }
  if (!isEmpty(this.employee.currentState)) {
    currentAddress += `${this.employee.currentState} `;
  }
  if (!isEmpty(this.employee.currentZIP)) {
    currentAddress += `${this.employee.currentZIP} `;
  }
  if (currentAddress.charAt(currentAddress.length - 2) === ',') {
    currentAddress = currentAddress.slice(0, -2);
  } else {
    currentAddress = currentAddress.slice(0, -1);
  }
  return currentAddress === '' ? 'No address on form' : currentAddress;
}

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
}

function showPhoneNumber() {
  return this.newPersonal.phoneNumber && !this.phoneCanceled;
}

function phoneNumber() {
  return this.employee.phoneNumber ? this.employee.phoneNumber : 'No phone number on form';
}

function newPhoneNumber() {
  return this.newPersonal.phoneNumber ? this.newPersonal.phoneNumber : null;
}

function showTech() {
  return this.newTechnology.filter((tech) => !tech.canceled).length != 0;
}

function showEducation() {
  let filtered = this.newEducation.filter((education) => !education.canceled);
  return filtered.length != 0;
}

/**
 * Add a time interval.
 * @param index - index the index in array of the technology
 */
async function addTimeInterval(index) {
  this.newTechnology[index].dateIntervals.push({ startDate: null, endDate: null });
  this.newTechnology = _.cloneDeep(this.newTechnology); //ensures that technologies intervals render properly
} // addTimeInterval

/**
 * When the checkbox is not selected on the resume modal, it uploads the resume and closes the window upon
 * successful completion
 */
async function onlyUploadResume() {
  this.loading = true;
  let uploadResult = await api.uploadResume(this.$route.params.id, this.file);
  this.loading = false;
  if (uploadResult instanceof Error) {
    this.timeoutError = true;
  } else {
    window.EventBus.$emit('uploaded', true);
    this.clearForm();
  }
}

/**
 * Clear the action status that is displayed in the snackbar.
 */

async function submit() {
  if (!this.extractResume) {
    this.onlyUploadResume();
    return;
  }
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
  this.editedEmployeeForm = _.cloneDeep(this.employee);

  if (this.validFile) {
    this.resumeObject.length = 0;
    // and is png or jpg or jpeg or pdf
    this.loading = true;
    this.resumeProcessed = false;

    this.loadingMessage = 'Processing resume data, this may take up to 30 seconds';

    setTimeout(() => {
      if (!this.resumeProcessed && this.activate) {
        this.loadingMessage = 'Sooooooo, how are you doing?';
        setTimeout(() => {
          if (!this.resumeProcessed && this.activate) {
            this.loadingMessage = 'You must have a beefy resume!';
            setTimeout(() => {
              if (!this.resumeProcessed && this.activate) {
                this.loadingMessage = 'You may want to try again...';
              }
            }, 15000);
          }
        }, 15000);
      }
    }, 15000);

    this.resumeObject = (await api.extractResumeText(this.$route.params.id, this.file)).comprehend;
    if (this.resumeObject instanceof Error || !this.resumeObject) {
      this.isInactive = false;
      this.resumeObject = null;
      this.timeoutError = true;
      this.loading = false;
      return;
    }
    window.EventBus.$emit('updated-resume-parser', 'true');
    window.EventBus.$emit('updated-resume-parser-form', 'true');

    // PERSONAL info
    let personalComprehend = this.resumeObject.filter((entity) => {
      return entity.Type === 'OTHER' || entity.Type === 'LOCATION';
    });

    let location = [];
    let locationCounter = 0;
    _.forEach(personalComprehend, async (personalEntity) => {
      // Links
      // if (
      //   personalEntity.Text.includes('github') ||
      //   personalEntity.Text.includes('linkedIn') ||
      //   personalEntity.Text.includes('twitter')
      // ) {
      //   this.newPersonal.github = personalEntity.Text;
      // }

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

    let locations = await api.getLocation(location[0]);
    if (locations.predictions.length >= 1) {
      let location = locations.predictions[0].description;
      let place_id = locations.predictions[0].place_id;

      let fullAddress = location.split(', ');
      let state = fullAddress[2].split(' ')[0];

      let res = await api.getZipCode(place_id);
      //Response contains an array of objects, with each object containing
      //a field title 'type'. 'Type' is another array and we want the one
      //containing the postal_code string
      let currentZIP = '';
      _.forEach(res.result.address_components, (field) => {
        if (field.types.includes('postal_code')) {
          currentZIP = field.short_name;
        }
      });
      if (
        fullAddress[0] != this.employee.currentStreet &&
        fullAddress[1] != this.employee.currentCity &&
        this.states[state] != this.employee.currentState &&
        currentZIP != this.employee.currentZIP
      ) {
        this.newPersonal.currentStreet = fullAddress[0];
        this.newPersonal.currentCity = fullAddress[1];
        this.newPersonal.currentState = this.states[state];
        this.newPersonal.currentZIP = currentZIP;
      }
    }

    // EDUCATION
    let educationComprehend = this.resumeObject.filter((entity) => {
      return entity.Type === 'ORGANIZATION';
    });

    for (let i = 0; i < educationComprehend.length; i++) {
      let educationEntity = educationComprehend[i];
      let collegeList = await api.getColleges(educationEntity.Text);
      if (collegeList.length == 1) {
        // Remove duplicate
        if (
          (!this.employee.degrees ||
            (this.employee.degrees &&
              this.employee.degrees.length > 0 &&
              this.employee.degrees.filter((e) => e.school === collegeList[0]).length == 0)) &&
          this.newEducation.filter((e) => e.school === collegeList[0]).length == 0
        ) {
          this.newEducation.push({
            school: collegeList[0],
            concentrations: [],
            minors: [],
            majors: [''],
            canceled: false,
            showEducationMenu: false,
            name: '',
            date: null
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
            tech: techs[0],
            dateIntervals: [{ startDate: null, endDate: null }],
            canceled: false
          });
          newTech.push(techs[0]);
        }
      }
    });

    this.loading = false;
    this.resumeProcessed = true;
  }
}

function isCurrent(tech) {
  return tech.dateIntervals.filter((dateInterval) => !dateInterval.endDate).length > 0;
} //isCurrent

function submitInfo(field, value, newValue) {
  if (field === 'address') {
    this.editedEmployeeForm.currentStreet = this.newPersonal.currentStreet;
    this.editedEmployeeForm.currentCity = this.newPersonal.currentCity;
    this.editedEmployeeForm.currentState = this.newPersonal.currentState;
    this.editedEmployeeForm.currentZIP = this.newPersonal.currentZIP;
  } else if (field === 'phoneNumber') {
    this.editedEmployeeForm.phoneNumber = this.newPersonal.phoneNumber;
  } else if (field === 'technology') {
    let techHasErrors = this.newTechnology[value].dateIntervals.filter((dateInterval) => dateInterval.hasErrors);
    if (techHasErrors.length == 0 && this.newTechnology[value].dateIntervals.length > 0) {
      this.newTechnology[value].canceled = true;
      if (!this.editedEmployeeForm.technologies) {
        this.editedEmployeeForm.technologies = [];
      }
      this.editedEmployeeForm.technologies.push({
        name: this.newTechnology[value].tech,
        current: isCurrent(this.newTechnology[value]),
        dateIntervals: this.newTechnology[value].dateIntervals
      });
    }
  } else if (field === 'education' && this.$refs['education' + value][0].validate()) {
    this.newEducation[value].canceled = true;
    this.newEducation[value].date = newValue[0].date;
    this.newEducation[value].majors = newValue[0].majors;
    this.newEducation[value].minors = newValue[0].minors;
    this.newEducation[value].name = newValue[0].name;
    this.newEducation[value].school = newValue[0].school;
    this.newEducation[value].canceled = true;
    if (!this.editedEmployeeForm.degrees) {
      this.editedEmployeeForm.degrees = [];
    }
    this.editedEmployeeForm.degrees.push({
      concentrations: this.newEducation[value].concentrations,
      date: this.newEducation[value].date,
      majors: this.newEducation[value].majors,
      minors: this.newEducation[value].minors,
      name: this.newEducation[value].name,
      school: this.newEducation[value].school
    });
  }
}

function deleteDateInterval(technologyIndex, dateIntervalIndex) {
  if (
    this.newTechnology.length > technologyIndex &&
    this.newTechnology[technologyIndex].dateIntervals.length > dateIntervalIndex
  ) {
    this.newTechnology[technologyIndex].dateIntervals.splice(dateIntervalIndex, 1);
  }
}

function validateDateInterval(technologyIndex, dateIntervalIndex, hasErrors) {
  if (
    this.newTechnology &&
    this.newTechnology[technologyIndex] &&
    this.newTechnology[technologyIndex].dateIntervals &&
    this.newTechnology[technologyIndex].dateIntervals[dateIntervalIndex]
  ) {
    this.newTechnology[technologyIndex].dateIntervals[dateIntervalIndex].hasErrors = _.cloneDeep(hasErrors);
  }
} // validateDateInterval

function updateStartInterval(technologyIndex, dateIntervalIndex, editedStartDate) {
  if (
    this.newTechnology &&
    this.newTechnology[technologyIndex] &&
    this.newTechnology[technologyIndex].dateIntervals &&
    this.newTechnology[technologyIndex].dateIntervals[dateIntervalIndex]
  )
    this.newTechnology[technologyIndex].dateIntervals[dateIntervalIndex].startDate = _.cloneDeep(editedStartDate);
  this.newTechnology = _.cloneDeep(this.newTechnology);
} //updateStartInterval

function updateEndInterval(technologyIndex, dateIntervalIndex, editedEndDate) {
  if (
    this.newTechnology &&
    this.newTechnology[technologyIndex] &&
    this.newTechnology[technologyIndex].dateIntervals &&
    this.newTechnology[technologyIndex].dateIntervals[dateIntervalIndex]
  ) {
    this.newTechnology[technologyIndex].dateIntervals[dateIntervalIndex].endDate = _.cloneDeep(editedEndDate);
    this.newTechnology = _.cloneDeep(this.newTechnology);
  }
}

function submitForm() {
  if (this.showTech || this.showPhoneNumber || this.showAddress || this.showEducation) {
    this.toggleResumeFormErrorModal = true;
  } else {
    window.EventBus.$emit('resume', this.editedEmployeeForm);
    this.activate = !this.activate;
    this.resumeProcessed = false;
  }
}

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
  this.activate = false;
  this.addressCanceled = false;
  this.phoneCanceled = false;
  this.editedEmployeeForm = _.cloneDeep(this.employee);
  this.file = null;
  this.loading = false;
  this.validFile = false;
  this.resumeProcessed = false;
  this.toggleResumeFormErrorModal = false;
  this.$refs.submit.reset();
}

export default {
  components: {
    dateIntervalForm,
    educationTab
  },
  computed: {
    address,
    newAddress,
    newPhoneNumber,
    phoneNumber,
    showAddress,
    showEducation,
    showPhoneNumber,
    showTech
  },
  data() {
    return {
      activate: false,
      addressCanceled: false,
      phoneCanceled: false,
      editedEmployeeForm: null,
      file: null,
      loading: false,
      loadingMessage: '',
      validFile: false,
      resumeObject: [],
      newEducation: [],
      newTechnology: [],
      fileRules: [
        (v) => {
          return !isEmpty(v) || 'File required (.png, .pdf, or .jpeg)';
        },
        (v) => {
          return (
            (!isEmpty(v) &&
              (v.type.includes('application/pdf') || v.type.includes('image/png') || v.type.includes('image/jpeg'))) ||
            'File unsupported, please submit a .png, .pdf, or a .jpeg file'
          );
        }
      ],
      newPersonal: {
        phoneNumber: null,
        currentCity: null,
        currentState: null,
        currentStreet: null,
        currentZIP: null
      },
      toggleResumeFormErrorModal: false,
      timeoutError: false,
      resumeProcessed: false,
      extractResume: true,
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
      } //states
    };
  },
  methods: {
    addTimeInterval,
    clearForm,
    deleteDateInterval,
    isCurrent,
    submitForm,
    submitInfo,
    submit,
    updateStartInterval,
    updateEndInterval,
    onlyUploadResume,
    validateDateInterval
  },
  props: ['toggleResumeParser', 'employee'],
  watch: {
    toggleResumeParser: function () {
      this.activate = true;
    },
    file: function () {
      this.validFile = this.$refs.submit.validate();
    },
    activate: function () {
      if (this.activate) {
        this.editedEmployeeForm = _.cloneDeep(this.employee);
        if (!this.editedEmployeeForm.technologies) {
          this.editedEmployeeForm.technologies = [];
        }
        if (!this.editedEmployeeForm.phoneNumber) {
          this.editedEmployeeForm.phoneNumber = '';
        }
        if (!this.editedEmployeeForm.address) {
          this.editedEmployeeForm.address = '';
        }
      }
    }
  }
};
</script>

<style>
.error-text {
  color: red;
}
</style>
