<template>
  <div>
    <div class="d-flex flex-wrap justify-space-between">
      <div class="mb-2">
        <h3>
          <v-icon>mdi-palm-tree</v-icon>
          PTO Balances
          <v-avatar @click="openLink(PTO_POLICY)" class="ml-2 mr-2 nudge-up pointer" size="x-small" density="compact">
            <v-tooltip activator="parent" location="top">Click for more information</v-tooltip>
            <v-icon size="x-small" color="#3f51b5">mdi-information</v-icon>
          </v-avatar>
        </h3>
      </div>
      <div>
        <v-btn
          v-if="ptoBalances['PTO'] || ptoBalances['PTO'] === 0"
          @click="showPTOPlanningFormModal = true"
          variant="outlined"
          density="compact"
          class="px-2 mb-2 mr-2 ml-auto"
          :color="caseRed"
          width="135"
        >
          Plan PTO
        </v-btn>
        <v-btn
          v-if="(ptoBalances['PTO'] || ptoBalances['PTO'] === 0) && system !== 'ADP'"
          @click="showPTOCashOutFormModal = true"
          variant="outlined"
          density="compact"
          class="px-2 mb-2"
          :color="caseRed"
          width="135"
        >
          Cash Out PTO
        </v-btn>
      </div>
    </div>
    <div v-if="Object.keys(ptoBalances || []).length === 0" class="my-4">No balances to display</div>
    <div v-for="jobcode in sortedBalancesByDuration" :key="jobcode">
      <div v-if="showMore || ptoBalances[jobcode] !== 0" class="d-flex justify-space-between my-3">
        <div class="mr-3">{{ formatJobCode(jobcode) }}</div>
        <div class="dotted-line"></div>
        <div class="ml-3">{{ convertToHours(ptoBalances[jobcode].value ?? ptoBalances[jobcode]) }}h</div>
      </div>
      <div v-if="(showMore || ptoBalances[jobcode] !== 0) && ptoBalances[jobcode].items">
        <div
          v-for="subcode in Object.keys(ptoBalances[jobcode].items)"
          :key="subcode"
          class="d-flex justify-space-between ml-6 my-3"
        >
          <div class="mr-3 font-italic">{{ formatJobCode(subcode) }}</div>
          <div class="dotted-line"></div>
          <div class="ml-3 mr-1 font-italic">{{ convertToHours(ptoBalances[jobcode].items[subcode]) }}h</div>
        </div>
      </div>
    </div>
    <span v-if="Object.values(ptoBalances || []).includes(0)" @click="showMore = !showMore" class="pointer text-blue">
      {{ showMore ? 'Show less' : 'Show more' }}
      <v-icon>{{ showMore ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
    </span>
    <v-dialog v-model="showPTOPlanningFormModal" persistent max-width="800">
      <p-t-o-planning-form
        :employeeId="employee.id"
        :isCyk="system === 'ADP'"
        :pto="convertToHours(ptoBalances['PTO']?.value ?? ptoBalances['PTO'] ?? 0)"
        :holiday="convertToHours(ptoBalances['Holiday']?.value ?? ptoBalances['Holiday'] ?? 0)"
      />
    </v-dialog>
    <v-dialog v-model="showPTOCashOutFormModal" persistent max-width="500">
      <p-t-o-cash-out-form
        :employeeId="employee.id"
        :pto="convertToHours(ptoBalances.PTO?.value || ptoBalances['PTO'])"
      />
    </v-dialog>
  </div>
</template>

<script setup>
import { PTO_POLICY } from '@/utils/links/basecampLinks';
import PTOCashOutForm from '@/components/shared/PTOCashOutForm.vue';
import PTOPlanningForm from '@/components/shared/PTOPlanningForm.vue';
import { computed, inject, ref, onMounted, onBeforeUnmount } from 'vue';
import { openLink } from '@/utils/utils';
import capitalize from 'lodash/capitalize';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['ptoBalances', 'employee', 'system']);
const emitter = inject('emitter');

const showPTOCashOutFormModal = ref(false);
const showPTOPlanningFormModal = ref(false);
const showMore = ref(false);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * The Mounted lifecycle hook.
 */
onMounted(() => {
  emitter.on('close-pto-cash-out-form-hours', () => {
    showPTOCashOutFormModal.value = false;
  });
  emitter.on('close-pto-planning-form', () => {
    showPTOPlanningFormModal.value = false;
  });
}); // mounted

/**
 * The Mounted lifecycle hook.
 */
onBeforeUnmount(() => {
  emitter.off('close-pto-cash-out-form-hours');
  emitter.off('close-pto-planning-form');
}); // mounted

// |--------------------------------------------------|
// |                                                  |
// |                 COMPUTED                         |
// |                                                  |
// |--------------------------------------------------|

/**
 * Sorts the pto balances by duration.
 *
 * @returns Array - The array of pto jobcodes in sorted order
 */
const sortedBalancesByDuration = computed(() => {
  let balances = props.ptoBalances;
  let orderedKeys = Object.keys(balances || {}).sort(function (a, b) {
    return balances[b] - balances[a];
  });
  return orderedKeys;
}); // sortedBalancesByDuration

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Converts seconds to hours with 2 decimal places if needed.
 *
 * @param {Number} seconds - The number of seconds
 */
function convertToHours(seconds) {
  return Number(seconds / 60 / 60)
    ?.toFixed(2)
    ?.replace(/[.,]00$/, ''); // removes decimals if a whole number
} // convertToHours

/**
 * Changes casing of job codes to be more natural looking for reading

 * @param {string} jobcode The job code key as found in ptoBalances
 * @returns {string} The formatted job code
 */
function formatJobCode(jobcode) {
  return jobcode
    .split('_') // split words
    .map((str) => (str != 'PTO' ? capitalize(str) : str)) // only capitalize first letter
    .join(' '); // separate with spaces
}
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
</style>
