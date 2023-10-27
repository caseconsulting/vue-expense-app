<template>
  <v-btn @click.stop="download" variant="text" icon>
    <v-tooltip activator="parent" location="top">{{ tooltip }}</v-tooltip>
    <v-icon :class="{ 'white--text': color == 'white', 'gray-icon': color != 'white' }" scale="1.5"
      >mdi-download</v-icon
    >
  </v-btn>
</template>

<script>
const baseCsv = require('@/utils/csv/baseCsv.js');

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|
/**
 * Downloads employees as CSV
 */
function download() {
  let csvData = this.generateData();
  if (this.sortKey) csvData = baseCsv.sort(csvData, this.sortKey);
  let csv = baseCsv.generate(csvData);
  baseCsv.download(csv, this.filename);
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
  props: ['color', 'filename', 'generateData', 'sortKey', 'tooltip']
};
</script>
