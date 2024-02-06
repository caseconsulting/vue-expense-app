<template>
  <!-- Download CSV Button -->
  <v-btn :disabled="midAction" @click="download" elevation="2">
    <i class="material-icons">file_download</i> Download Items</v-btn
  >
</template>

<script>
const expensesCsv = require('@/utils/csv/expensesCsv.js');

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

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  methods: {
    download
  },
  props: ['expenses', 'midAction'] // expenses to export
};
</script>
