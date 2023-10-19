<template>
  <v-btn @click.stop="download" density="comfortable" variant="text" icon="">
    <v-tooltip activator="parent" location="top">Download CSV</v-tooltip>
    <v-icon size="large" color="white">mdi-download</v-icon>
  </v-btn>
</template>

<script>
const employeeCsv = require('@/utils/csv/employeeCsv.js');

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|
/**
 * Downloads employees as CSV
 */
function download() {
  employeeCsv.download(this.employee, this.contracts, this.tags);
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
  props: ['contracts', 'employee', 'tags', 'midAction', 'color']
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
