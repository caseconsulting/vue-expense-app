<template>
  <v-container fluid>
    <v-row class="mb-3">
      <h1>Audits</h1>
    </v-row>
    <v-row class="mx-2">
      <v-text-field type="number" label="Number of Days Back" v-model="numDaysBackToQuery"></v-text-field>
    </v-row>
    <resume-parser-audit-page :numDaysBackToQuery="numDaysBackToQuery"></resume-parser-audit-page>
  </v-container>
</template>

<script>
import ResumeParserAuditPage from '@/components/audit pages/ResumeParserAuditPage.vue';

export default {
  components: {
    ResumeParserAuditPage
  },
  data() {
    return {
      numDaysBackToQuery: 1
    };
  },
  watch: {
    numDaysBackToQuery: function (val) {
      this.numDaysBackToQuery = Number(val);
    }
  }
};
</script>

<style></style>
