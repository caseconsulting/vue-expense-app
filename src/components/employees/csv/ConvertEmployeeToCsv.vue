<template>
  <span>
    <v-tooltip activator="parent" location="top" text="Download CSV" />
    <v-btn
      @click.stop="download()"
      variant="text"
      density="comfortable"
      icon="mdi-download"
      :class="{ 'white--text': color == 'white', 'gray-icon': color != 'white' }"
    />
  </span>
</template>

<script setup>
import employeeCsv from '@/utils/csv/employeeCsv.js';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['contracts', 'employee', 'tags', 'midAction', 'color', 'filename']);

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|
/**
 * Downloads employees as CSV
 */
function download() {
  employeeCsv.download(props.employee, props.contracts, props.tags, props.filename);
} // download
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
