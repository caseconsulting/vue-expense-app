<template>
  <!-- Download CSV Button -->
  <v-btn :disabled="midAction" @click="download()" elevation="2" :size="isMobile || (isSmallScreen && 'x-small')"
    ><i class="material-icons">download</i>Download All</v-btn
  >
</template>
<script>
import { isMobile, isSmallScreen } from '@/utils/utils';
import contractsCsv from '@/utils/csv/contractsCsv.js';
// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Downloads employees as CSV
 */
function download() {
  contractsCsv.download(this.contracts, this.employees);
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
