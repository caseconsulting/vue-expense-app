<template>
  <v-dialog v-model="activate" max-width="1000">
    <v-card>
      <v-card-title class="header_style"><strong>Upload Resume</strong></v-card-title>
      <v-card-text class="pa-5">
        <v-container fluid>
          <v-form ref="submit">
            <v-row>
              <v-col class="text-center">
                <h1>Add Your Resume Here</h1>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="10" class="pr-0"
                ><v-file-input :rules="fileRules" v-model="file" label="Resume"></v-file-input
              ></v-col>
              <v-col cols="2" class="text-center mt-2">
                <v-btn @click="submit" color="green" outlined :disabled="!validFile">Submit</v-btn>
              </v-col>
            </v-row>
            <div v-if="loading">
              <p align="center">Processing resume data, this may take up to 20 seconds</p>
              <v-progress-linear color="#bc3825" indeterminate></v-progress-linear>
            </div>
            <div v-if="resumeObject.length !== 0">
              <v-row class="text-center">
                <v-col>
                  <h1>Pending Changes</h1>
                </v-col>
              </v-row>
              <v-row class="text-center">
                <v-col cols="5">
                  <h3>Currently on the Form</h3>
                </v-col>
                <v-col cols="5">
                  <h3>New Content</h3>
                </v-col>
              </v-row>
              <v-row class="text-center">
                <v-col cols="5">
                  <v-text-field disabled label="Main"> </v-text-field>
                </v-col>
                <v-col cols="5">
                  <v-text-field label="Main"> </v-text-field>
                </v-col>
                <v-col cols="2" class="pt-7">
                  <v-icon large left color="green">done</v-icon>
                  <v-icon large right color="red">close</v-icon>
                </v-col>
              </v-row>
            </div>
          </v-form>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import api from '@/shared/api.js';
<<<<<<< HEAD
import { isEmpty } from '@/utils/utils';

async function submit() {
  if (this.validFile) {
    this.resumeObject.length = 0;
=======
import _ from 'lodash';

async function submit() {
  if (this.file) {
    // and is png or jpg or jpeg or pdf
>>>>>>> extracted data from resume
    this.loading = true;
    this.resumeObject = (await api.extractResumeText(this.$route.params.id, this.file)).comprehend;
    if (this.resumeObject instanceof Error) {
      this.isInactive = false;
      this.resumeObject = null;
      return;
    }
<<<<<<< HEAD
    window.EventBus.$emit('updated-resume-parser', 'true');
    window.EventBus.$emit('updated-resume-parser-form', 'true');
    // let techComprehend = this.resumeObject.filter((entity) => {
    //   return entity.Type === 'TITLE';
    // });
=======

    this.loading = false;

    // EMPLOYEE
    // NAME
    //   ONLY ADMIN

    let personalComprehend = this.resumeObject.filter((entity) => {
      return entity.Type === 'OTHER' || entity.Type === 'LOCATION';
    });
    let location = [];
    let locationCounter = 0;
    _.forEach(personalComprehend, async (personalEntity) => {
      // Links
      if (
        personalEntity.Text.includes('github') ||
        personalEntity.Text.includes('linkedIn') ||
        personalEntity.Text.includes('twitter')
      ) {
        this.newPersonal.github = personalEntity.Text;
      }
>>>>>>> extracted data from resume

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
        this.newPersonal.phoneNumber = phoneNumber;
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
    console.log(location[0]);
    console.log(locations);
    if (locations.predictions.length == 1) {
      this.newPersonal.location = location.description;
    }

    // PERSONAL
    // GITHUB
    // TWITTER
    // LINKEDIN
    // CURRENT ADDRESS
    // PHONE NUMBER

    let educationComprehend = this.resumeObject.filter((entity) => {
      return entity.Type === 'ORGANIZATION';
    });
    educationComprehend.forEach(async (educationEntity) => {
      let collegeList = await api.getColleges(educationEntity.Text);
      console.log(collegeList);
      if (collegeList.some((item) => item.name === educationEntity.Text)) {
        this.newEducation.push(educationEntity.Text);
      }
    });
    // EDUCATION
    // SCHOOL

    let techComprehend = this.resumeObject.filter((entity) => {
      return entity.Type === 'TITLE' || entity.Type === 'OTHER';
    });
    techComprehend.forEach(async (tech) => {
      let techList = await api.getTechSkills(tech.Text);
      if (techList.some((item) => item.toLowerCase() === tech.Text.toLowerCase())) {
        this.newTechnology.push(tech.Text);
      }
    });
    // TECHNOLOGY
    // TECH NAMES
    console.log(this.newTechnology);
    console.log(this.newEducation);
    console.log(this.newPersonal);
    console.log(this.newEmployee);
  }
}

export default {
  data() {
    return {
      activate: false,
      file: null,
      loading: false,
<<<<<<< HEAD
      validFile: false,
      resumeObject: [],
      newEducation: [],
      newTechnology: [],
      newPersonal: [],
      newEmployee: [],
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
      ]
=======
      validFileType: true,
      resumeObject: [],
      newEducation: [],
      newTechnology: [],
      newPersonal: {},
      newEmployee: []
>>>>>>> extracted data from resume
    };
  },
  methods: {
    submit
  },
  props: ['toggleResumeParser', 'employee'],
  watch: {
    toggleResumeParser: function () {
      this.activate = true;
    },
    file: function () {
      this.validFile = this.$refs.submit.validate();
    }
  }
};
</script>

<style></style>
