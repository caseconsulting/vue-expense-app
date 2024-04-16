<template>
  <v-combobox :items="jobTitles" v-model="model" autofocus variant="underlined"></v-combobox>
</template>

<script setup>
import _ from 'lodash';
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
  let employeeJobTitles = _.map(store.getters.employees, (e) => e.jobRole);
  employeeJobTitles = _.compact(employeeJobTitles);
  _.forEach(employeeJobTitles, (jobTitle) => jobTitles.push(jobTitle));
  jobTitles = Array.from(new Set(jobTitles)); // remove duplicates
  return jobTitles.sort();
});
</script>
