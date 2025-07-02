<template>
  <v-form v-model="valid" lazy-validation>
    <v-row class="d-flex justify-space-between">
      <v-col cols="4" class="pl-1 pb-0">
        <v-text-field
          v-model="jobCode"
          :rules="[...jobCodeRules(), ...getRequiredRules()]"
          label="Job code"
          density="compact"
          variant="outlined"
        ></v-text-field>
      </v-col>
      <v-col cols="4" class="pb-0">
        <v-text-field
          v-model="duration"
          :rules="[...durationRules(), ...getRequiredRules()]"
          label="Duration (h)"
          density="compact"
          variant="outlined"
        ></v-text-field>
      </v-col>
      <v-col cols="4" class="d-flex justify-end pb-0 pr-0">
        <v-btn
          icon
          color="green"
          density="comfortable"
          :disabled="!valid || loading"
          :loading="loading"
          variant="text"
          @click="save()"
        >
          <v-icon>mdi-content-save</v-icon>
          <v-tooltip activator="parent">Save job code</v-tooltip>
        </v-btn>
        <v-btn
          icon
          class="ml-1"
          color="gray"
          density="comfortable"
          :disabled="loading"
          variant="text"
          @click="cancel()"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { ref, inject } from 'vue';
import { getRequiredRules } from '@/shared/validationUtils';
import api from '@/shared/api';
import _cloneDeep from 'lodash/cloneDeep';
import _findIndex from 'lodash/findIndex';
import { useStore } from 'vuex';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['employee', 'timeData', 'periodType', 'title']);
const emitter = inject('emitter');
const store = useStore();

const localEmployee = ref(_cloneDeep(props.employee));
const duration = ref(null);
const jobCode = ref(null);
const loading = ref(false);
const valid = ref(false);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent to close add job code logic.
 */
function cancel() {
  emitter.emit('close-add-job-code');
} // cancel

/**
 * Saves the added job code to the employee object and updates the store.
 */
async function save() {
  if (valid.value) {
    // set loading status
    loading.value = true;
    // create new legacyJobCodes object in local employee
    let legacyJobCodes = localEmployee.value['legacyJobCodes'] || {};
    if (!legacyJobCodes[props.periodType]) legacyJobCodes[props.periodType] = {};
    legacyJobCodes[props.periodType][jobCode.value] = {
      duration: Number(duration.value) * 60 * 60,
      title: props.title
    };
    localEmployee.value['legacyJobCodes'] = legacyJobCodes;
    // push new local employee value to the API and store
    let value = { id: props.employee.id, ['legacyJobCodes']: localEmployee.value['legacyJobCodes'] };
    await api.updateAttribute(api.EMPLOYEES, value, 'legacyJobCodes');
    let index = _findIndex(store.getters.employees, (e) => e.id === localEmployee.value.id);
    store.getters.employees[index] = localEmployee.value;
    // reset loading status and emit to close input box
    loading.value = false;
    emitter.emit('close-add-job-code');
  }
} // save

/**
 * Only allows positive numbers with up to 2 decimal places.
 *
 * @returns Array - the duration rules
 */
function durationRules() {
  return [
    (v) => /^\d+(?:\.\d{0,2})?$/.test(v) || 'Must be a valid number',
    (v) => Number(v) < 10000000000 || 'Duration is too large'
  ];
} // durationRules

/**
 * Only unique job code names.
 *
 * @returns Array - the job code rules
 */
function jobCodeRules() {
  return [
    (v) => !(v in props.timeData) || 'Job code already exists',
    (v) => v?.length < 41 || 'Job code has too many characters'
  ];
} // jobCodeRules
</script>
