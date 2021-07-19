<template>
  <v-dialog v-model="activate" max-width="1000">
    <v-card>
      <v-card-title class="header_style">Upload Resume</v-card-title>
      <v-card-text class="pa-5">
        <v-container fluid>
          <v-row>
            <v-col class="text-center">
              <h1>Add Your Resume Here</h1>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="10" class="pr-0"><v-file-input v-model="file" label="Resume"></v-file-input></v-col>
            <v-col cols="2" class="text-center">
              <v-btn @click="submit" color="green" outlined>Submit</v-btn>
            </v-col>
          </v-row>
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
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import api from '@/shared/api.js';

async function submit() {
  console.log(this.file);
  if (this.file) {
    this.resumeObject = await api.extractResumeText(this.$route.params.id, this.file);
    console.log(this.resumeObject);
    if (this.resumeObject instanceof Error) {
      this.isInactive = false;
      this.resumeObject = null;
      return;
    }
  }
}

export default {
  data() {
    return {
      activate: false,
      file: null,
      resumeObject: null
    };
  },
  methods: {
    submit
  },
  props: ['toggleResumeParser'],
  watch: {
    toggleResumeParser: function () {
      this.activate = true;
    }
  }
};
</script>

<style></style>
