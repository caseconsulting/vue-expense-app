<template>
  <!-- Download CSV Button -->
  <v-btn :disabled="midAction" @click="download()" elevation="2"
    >Download All<i class="material-icons ml-2">download</i></v-btn
  >
</template>
<script setup>
import { isMobile, isSmallScreen } from '@/utils/utils';
import contractsCsv from '@/utils/csv/contractsCsv.js';
import { computed } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['contracts', 'employees', 'midAction']);

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Downloads employees as CSV
 */
function download() {
  contractsCsv.download(props.contracts, props.employees);
} // download

// |--------------------------------------------------|
// |                                                  |
// |                    COMPUTED                      |
// |                                                  |
// |--------------------------------------------------|

computed(isMobile);
computed(isSmallScreen);
</script>
<style scoped>
.download {
  font-size: 20px;
  cursor: pointer;
}
</style>
