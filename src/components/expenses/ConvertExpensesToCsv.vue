<template>
  <div>
    <!-- Download CSV Buttons -->
    <v-btn :disabled="midAction" @click="download" elevation="2">
<<<<<<< HEAD
      <i class="material-icons">file_download</i> Download Grid Items
    </v-btn>
    <v-btn :disabled="midAction" @click="unanetReport" elevation="2" prepend-icon="mdi-file-download">
      Export Unanet Data
    </v-btn>
=======
      <i class="material-icons">file_download</i> Download Grid Items</v-btn
    >
    <v-btn :disabled="midAction" @click="unanetReport" elevation="2" prepend-icon="mdi-file-download"
      >Export Unanet Data</v-btn
    >
>>>>>>> 119413f2 (POR-3259 Expenses CSV export for Unanet (#750) (#755))
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
<<<<<<< HEAD
async function unanetReport() {
  await expensesCsv.unanetReport(this.expenses);
=======
function unanetReport() {
  expensesCsv.unanetReport(this.expenses);
>>>>>>> 119413f2 (POR-3259 Expenses CSV export for Unanet (#750) (#755))
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
