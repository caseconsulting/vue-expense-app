<template>
  <v-dialog v-model="activate" max-width="1000">
    <v-card>
      <v-card-title class="header_style">Upload Resume</v-card-title>
      <v-card-text class="pa-5">
        <div class="pa-3">
          <v-row class="text-center">
            <h3>Drag your PDF here</h3>
          </v-row>
          <v-row>
            <v-col cols="10" class="pr-0"><v-file-input label="Resume"></v-file-input></v-col>
            <v-col cols="2" class="text-center">
              <v-btn color="green" outlined>Submit</v-btn>
            </v-col>
          </v-row>
        </div>
        <v-row class="text-center">
          <v-col cols="6">
            <v-card flat outlined>
              <v-card-title>Current</v-card-title>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card flat outlined>
              <v-card-title>New</v-card-title>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      activate: false
    };
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
