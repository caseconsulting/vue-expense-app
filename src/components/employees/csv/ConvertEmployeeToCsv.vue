<template>
  <v-tooltip top>
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" @click.stop="download" text icon>
        <v-icon :class="{ 'white--text': color == 'white', 'gray-icon': color != 'white' }" scale="1.5"
          >mdi-download</v-icon
        >
      </v-btn>
    </template>
    <span>Download CSV</span>
  </v-tooltip>
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
