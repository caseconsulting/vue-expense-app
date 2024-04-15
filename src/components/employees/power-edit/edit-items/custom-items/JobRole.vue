<template>
  <v-combobox :items="jobTitles" v-model="model" variant="underlined"></v-combobox>
</template>

<script setup>
import _ from 'lodash';
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { JOB_TITLES } from '@/components/employees/form-tabs/dropdown-info/jobTitles.js';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['field', 'item']);
const model = ref(props.item[props.field.key]);
const store = useStore();

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const jobTitles = computed(() => {
  let jobTitles = JOB_TITLES;
  let employeeJobTitles = _.map(store.getters.employees, (e) => e.jobRole);
  employeeJobTitles = _.compact(employeeJobTitles);
  _.forEach(employeeJobTitles, (jobTitle) => jobTitles.push(jobTitle));
  jobTitles = Array.from(new Set(jobTitles)); // remove duplicates
  return jobTitles.sort();
});
</script>
