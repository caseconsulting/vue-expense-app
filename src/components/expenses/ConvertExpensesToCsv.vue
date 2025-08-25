<template>
  <div>
    <!-- Download CSV Buttons -->
    <v-btn :disabled="midAction" @click="download" elevation="2">
      <i class="material-icons">file_download</i> Download Grid Items</v-btn
    >
    <v-btn :disabled="midAction" @click="unanetReport" elevation="2" prepend-icon="mdi-file-download"
      >Export Unanet Data</v-btn
    >
  </div>
</template>

<script>
import expensesCsv from '@/utils/csv/expensesCsv.js';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Downloads expenses as CSV
 */
function download() {
  expensesCsv.download(this.expenses);
} // download

/**
 * Downloads expenses as CSV
 */
function unanetReport() {
  expensesCsv.unanetReport(this.expenses);
} // download

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  methods: {
    download,
    unanetReport
  },
  props: ['expenses', 'midAction'] // expenses to export
};
</script>
