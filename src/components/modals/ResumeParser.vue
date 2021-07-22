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
import { isEmpty } from '@/utils/utils';

async function submit() {
  if (this.validFile) {
    this.resumeObject.length = 0;
    this.loading = true;
    this.resumeObject = (await api.extractResumeText(this.$route.params.id, this.file)).comprehend;
    if (this.resumeObject instanceof Error) {
      this.isInactive = false;
      this.resumeObject = null;
      return;
    }

    let techComprehend = this.resumeObject.filter((entity) => {
      return entity.Type === 'TITLE';
    });
    techComprehend;

    this.loading = false;
  }
}

export default {
  data() {
    return {
      activate: false,
      file: null,
      loading: false,
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
    };
  },
  methods: {
    submit
  },
  props: ['toggleResumeParser'],
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
