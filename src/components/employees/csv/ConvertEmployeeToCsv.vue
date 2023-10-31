<template>
  <span>
    <v-tooltip activator="parent" location="top" text="Download CSV" />
    <v-btn
      v-on="on"
      @click.stop="download"
      variant="text"
      density="comfortable"
      icon="mdi-download"
      :class="{ 'white--text': color == 'white', 'gray-icon': color != 'white' }"
    />
  </span>
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
