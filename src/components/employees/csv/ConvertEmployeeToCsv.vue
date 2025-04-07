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
import EmployeeCsv from '@/utils/csv/employeeCsv.js';
import { updateStoreContracts, updateStoreTags } from '@/utils/storeUtils';
import { useStore } from 'vuex';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['employee', 'midAction', 'color', 'filename']);
const store = useStore();

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|
/**
 * Downloads employees as CSV
 */
async function download() {
  await Promise.all([
    !store.getters.contracts ? updateStoreContracts() : '',
    !store.getters.tags ? updateStoreTags() : ''
  ]);
  EmployeeCsv.download(props.employee, {
    filename: props.filename,
    preloaded: {
      contracts: store.getters.contracts,
      tags: store.getters.tags
    }
  });
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
