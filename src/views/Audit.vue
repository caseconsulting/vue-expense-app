<template>
  <v-container fluid>
    <v-row class="mb-3">
      <h1>Audits</h1>
    </v-row>
    <v-row class="mx-2 mb-2">
      <v-text-field
        type="number"
        :rules="numDaysBackRules"
        label="Number of Days Back"
        v-model="editedNumDaysBackToQuery"
      ></v-text-field>
      <v-btn class="mt-3 ml-2" @click="numDaysBackToQuery = editedNumDaysBackToQuery">Apply</v-btn>
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
      editedNumDaysBackToQuery: 1,
      numDaysBackToQuery: 1,
      numDaysBackRules: [(v) => v >= 0 || 'Number of days back cannot be negative']
    };
  },
  watch: {
    editedNumDaysBackToQuery: function (val) {
      this.editedNumDaysBackToQuery = Number(val);
    }
  }
};
</script>

<style></style>
