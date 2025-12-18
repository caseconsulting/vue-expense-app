<template>
  <v-row>
    <v-col cols="8">
      <!-- Download CSV Buttons -->
      <v-btn :disabled="midAction" @click="download" elevation="2" prepend-icon="mdi-download" class="mr-2">
        Download Grid Items
      </v-btn>
      <v-btn :disabled="midAction" @click="unanetReport" elevation="2" prepend-icon="mdi-file-download">
        Download Unanet Data
      </v-btn>
    </v-col>
  
    <v-col cols="4">
      <v-btn :disabled="midAction" @click="console.log('Upload to Unanet')" elevation="2" prepend-icon="mdi-cloud-upload-outline" class="float-right">
        Export Data to Unanet
      </v-btn>
    </v-col>
  </v-row>
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
