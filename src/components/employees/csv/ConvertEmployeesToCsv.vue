<template>
  <!-- Download CSV Button -->
  <v-btn
    :disabled="midAction || loading"
    @click="download()"
    elevation="2"
    :size="isMobile() || isSmallScreen() ? 'small' : 'default'"
  >
    <i class="material-icons">Download</i>{{ downloadText || 'Download All' }}
  </v-btn>
</template>

<script setup>
import { isMobile, isSmallScreen } from '@/utils/utils';
import employeeCsv from '@/utils/csv/employeeCsv.js';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['contracts', 'employees', 'tags', 'midAction', 'loading', 'downloadText']);

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|
/**
 * Downloads employees as CSV
 */
function download() {
  employeeCsv.download(props.employees, props.contracts, props.tags);
} // download
</script>

<style scoped>
.download {
  font-size: 20px;
  cursor: pointer;
}
</style>
