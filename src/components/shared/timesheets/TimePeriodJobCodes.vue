<template>
  <div>
    <h3 class="d-flex align-center justify-space-between">
      <div>
        <v-icon class="mr-2">mdi-briefcase-outline</v-icon>
        {{ isYearly ? (isCalendarYear ? 'Calendar Year' : 'Contract Year') : 'Pay Period' }} Job Codes
        <v-avatar
          v-if="isYearly && isCalendarYear"
          @click="openLink(BONUS_1860_POLICY)"
          class="ml-2 nudge-up pointer"
          size="x-small"
          density="compact"
        >
          <v-tooltip activator="parent" location="top">Click to see yearly bonus information</v-tooltip>
          <v-icon size="x-small" color="#3f51b5">mdi-information</v-icon>
        </v-avatar>
      </div>
      <div v-if="isYearly && !showAddJobCode">
        <v-btn icon variant="text" density="comfortable" :color="caseRed" @click="showAddJobCode = true">
          <v-icon>mdi-plus-circle-outline</v-icon>
          <v-tooltip activator="parent">Add legacy job code and duration</v-tooltip>
        </v-btn>
      </div>
    </h3>
    <add-job-code
      v-if="showAddJobCode"
      :employee="employee"
      :timeData="timeData"
      :periodType="periodType"
      class="ma-2"
    ></add-job-code>
    <div v-if="Object.entries(timeData || {})?.length === 0" class="my-3">No job codes for this time period</div>
    <div v-else>
      <div v-for="(duration, jobcode) in timeData" :key="jobcode">
        <div
          v-if="
            !isYearly || showNonBillables || (!showNonBillables && !supplementalData.nonBillables.includes(jobcode))
          "
          :class="isYearly && supplementalData.nonBillables.includes(jobcode) ? 'text-grey' : ''"
          class="d-flex justify-space-between my-3"
        >
          <div class="mr-3 truncate">{{ jobcode }}</div>
          <div class="dotted-line"></div>
          <div class="d-flex align-center ml-3">
            <div>{{ formatNumber(duration / 60 / 60) }}h</div>
            <v-btn
              v-if="showDelete(jobcode)"
              icon
              variant="text"
              :color="caseRed"
              density="compact"
              size="small"
              class="ml-1"
              @click="deleteJobCode(jobcode)"
            >
              <v-icon>mdi-trash-can-outline</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
      <span
        v-if="isYearly && hasNonBillables()"
        @click="showNonBillables = !showNonBillables"
        class="pointer text-blue"
      >
        {{ showNonBillables ? 'Hide non-billables' : 'Show non-billables' }}
        <v-icon>{{ showNonBillables ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
      </span>
    </div>
  </div>
</template>

<script setup>
import { BONUS_1860_POLICY } from '@/utils/links/basecampLinks';
import { onBeforeMount, onBeforeUnmount, inject, ref } from 'vue';
import { formatNumber, openLink } from '@/utils/utils';
import _cloneDeep from 'lodash/cloneDeep';
import _isEmpty from 'lodash/isEmpty';
import _findIndex from 'lodash/findIndex';
import api from '@/shared/api';
import AddJobCode from '@/components/shared/timesheets/AddJobCode';
import { useStore } from 'vuex';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['employee', 'isCalendarYear', 'isYearly', 'supplementalData', 'timeData', 'periodType']);
const emitter = inject('emitter');
const store = useStore();

const showAddJobCode = ref(false);
const showNonBillables = ref(false);

// |--------------------------------------------------|
// |                                                  |
// |                  LIFECYCLE HOOKS                 |
// |                                                  |
// |--------------------------------------------------|

onBeforeMount(() => {
  emitter.on('close-add-job-code', () => (showAddJobCode.value = false));
});

onBeforeUnmount(() => {
  emitter.off('close-add-job-code');
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Decides whether or not to show the delete (trash can) icon
 *
 * @param jobcode - jobcode to check for
 * @return true if the trash can should be deleted
 */
function showDelete(jobcode) {
  return (
    Object.prototype.hasOwnProperty.call(props.employee.legacyJobCodes || {}, jobcode) ||
    Object.prototype.hasOwnProperty.call(props.employee.legacyJobCodes?.[props.periodType] || {}, jobcode)
  );
}

/**
 * Deletes the job code object from the employee's legacy job codes and updates the store.
 *
 * @param {String} jobcode - The job code to delete
 */
async function deleteJobCode(jobcode) {
  let emp = _cloneDeep(props.employee);
  if (emp['legacyJobCodes'][props.periodType]?.[jobcode]) delete emp['legacyJobCodes'][props.periodType][jobcode];
  else delete emp['legacyJobCodes'][jobcode];
  if (_isEmpty(emp['legacyJobCodes'])) emp['legacyJobCodes'] = null;
  let value = { id: emp.id, ['legacyJobCodes']: emp['legacyJobCodes'] };
  await api.updateAttribute(api.EMPLOYEES, value, 'legacyJobCodes');
  // update store
  let employees = store.getters.employees;
  let index = _findIndex(employees, (e) => e.id === emp.id);
  employees[index] = emp;
} // deleteJobCode

/**
 * Whether or not the employee has non-billables entered in their timesheets within the set time period.
 *
 * @returns Boolean - True if the employee has non-billable jobcodes in their timesheets within the time period
 */
function hasNonBillables() {
  let hasNonBillable = false;
  let jobcodes = Object.keys(props.timeData || {});
  for (let i = 0; i < jobcodes.length && !hasNonBillable; i++) {
    if (props.supplementalData.nonBillables?.includes(jobcodes[i])) hasNonBillable = true;
  }
  return hasNonBillable;
} // hasNonBillables
</script>

<style scoped>
.dotted-line {
  height: 0.8em;
  background-image: linear-gradient(to right, rgb(210, 210, 210) 33%, rgba(184, 184, 184, 0) 0%);
  background-position: bottom;
  background-size: 7px 1px;
  background-repeat: repeat-x;
  flex-grow: 2;
}
.nudge-up {
  top: -7px;
}
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
