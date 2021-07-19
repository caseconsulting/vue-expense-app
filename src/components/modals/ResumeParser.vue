<template>
  <v-dialog v-model="activate" max-width="1000">
    <v-card>
      <v-card-title class="header_style">Upload Resume</v-card-title>
      <v-card-text class="pa-5">
        <v-row> Drag your PDF here </v-row>
        <v-row>
          <v-col>Current</v-col>
          <v-col>New</v-col>
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
