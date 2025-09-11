<template>
  <v-btn @click.stop="download" variant="text" icon>
    <v-tooltip activator="parent" location="top">{{ tooltip }}</v-tooltip>
    <v-icon :class="{ 'white--text': color == 'white', 'gray-icon': color != 'white' }" scale="1.5">
      mdi-download
    </v-icon>
  </v-btn>
</template>

<script setup>
import baseCsv from '@/utils/csv/baseCsv.js';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['color', 'filename', 'csv', 'generateData', 'sortKey', 'tooltip', 'xlsxFormat']);

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|
/**
 * Downloads employees as CSV
 */
function download() {
  let csv = props.csv;
  if (!csv) {
    console.log(csv);
    let csvData = props.generateData();
    if (props.sortKey) csvData = baseCsv.sort(csvData, props.sortKey);
    csv = baseCsv.generate(csvData);
  }
  baseCsv.download(csv, props.filename, props.xlsxFormat ?? true);
} // download
</script>
