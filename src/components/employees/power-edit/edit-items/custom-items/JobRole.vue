<template>
  <v-combobox :items="jobTitles" v-model="model" autofocus variant="underlined" class="job-role-field"></v-combobox>
</template>

<script setup>
import _map from 'lodash/map';
import _compact from 'lodash/compact';
import _forEach from 'lodash/forEach';
import { computed, inject, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { JOB_TITLES } from '@/components/employees/form-tabs/dropdown-info/jobTitles.js';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['field', 'item']);
const emitter = inject('emitter');
const model = ref(props.item[props.field.key]);
const store = useStore();

// |--------------------------------------------------|
// |                                                  |
// |                      WATCH                       |
// |                                                  |
// |--------------------------------------------------|

watch(
  () => [model.value],
  () => {
    emitter.emit('update-item', {
      field: props.field,
      item: { ...props.item, [`${props.field.key}`]: model.value }
    });
  }
);

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const jobTitles = computed(() => {
  let jobTitles = JOB_TITLES;
  let employeeJobTitles = _map(store.getters.employees, (e) => e.jobRole);
  employeeJobTitles = _compact(employeeJobTitles);
  _forEach(employeeJobTitles, (jobTitle) => jobTitles.push(jobTitle));
  jobTitles = Array.from(new Set(jobTitles)); // remove duplicates
  return jobTitles.sort();
});
</script>

<style>
.job-role-field {
  width: 180px !important;
  min-width: 180px !important;
  max-width: 180px !important;
}
.job-role-field .v-field__input {
  font-size: 14px;
}
</style>
