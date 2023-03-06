<template>
  <v-tooltip top>
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" @click.stop="download" text icon>
        <v-icon :class="{ 'white--text': color == 'white', 'gray-icon': color != 'white' }" scale="1.5"
          >mdi-download</v-icon
        >
      </v-btn>
    </template>
    <span>{{ tooltip }}</span>
  </v-tooltip>
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

<style scoped>
.download {
  font-size: 20px;
  cursor: pointer;
}

.icon-white {
  color: white;
}
</style>
