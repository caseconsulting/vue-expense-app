<template>
  <!-- Download CSV Button -->
  <v-btn
    :disabled="midAction || loading"
    @click="download()"
    elevation="2"
    :size="isMobile || isSmallScreen ? 'small' : 'default'"
  >
    <i class="material-icons">Download</i>{{ downloadText || 'Download All' }}
  </v-btn>
</template>

<script>
import { isMobile, isSmallScreen } from '@/utils/utils';
import employeeCsv from '@/utils/csv/employeeCsv.js';

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|
/**
 * Downloads employees as CSV
 */
function download() {
  employeeCsv.download(this.employees, this.contracts, this.tags);
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
  props: ['contracts', 'employees', 'tags', 'midAction', 'loading', 'downloadText']
};
</script>

<style scoped>
.download {
  font-size: 20px;
  cursor: pointer;
}
</style>
