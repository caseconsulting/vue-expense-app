<template>
  <!-- Download CSV Button -->
  <v-btn :disabled="midAction" @click="download()" elevation="2" :x-small="isMobile || isSmallScreen"
    ><i class="material-icons">download</i>Download All</v-btn
  >
</template>

<script>
import { isMobile, isSmallScreen } from '@/utils/utils';
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
  employeeCsv.download(this.employees, this.contracts);
} // download

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  computed: {
    isMobile,
    isSmallScreen
  },
  methods: {
    download
  },
  props: ['contracts', 'employees', 'midAction']
};
</script>

<style scoped>
.download {
  font-size: 20px;
  cursor: pointer;
}
</style>
