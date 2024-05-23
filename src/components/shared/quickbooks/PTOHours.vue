<template>
  <div>
    <div class="d-flex justify-space-between">
      <h3 class="d-flex align-center">
        <v-icon class="mr-2">mdi-palm-tree</v-icon>
        PTO Balances
        <v-avatar
          @click="openLink('https://3.basecamp.com/3097063/buckets/179119/messages/6950289713')"
          class="ml-2 nudge-up pointer"
          size="x-small"
          density="compact"
        >
          <v-tooltip activator="parent" location="top">Click for more information</v-tooltip>
          <v-icon size="x-small" color="#3f51b5">mdi-information</v-icon>
        </v-avatar>
      </h3>
      <v-btn
        v-if="ptoBalances['PTO'] || ptoBalances['PTO'] === 0"
        @click="showPTOPlanningFormModal = true"
        variant="outlined"
        density="compact"
        class="px-2 mr-2 ml-auto"
        :color="caseRed"
      >
        Plan PTO
      </v-btn>
      <v-btn
        v-if="ptoBalances['PTO'] || ptoBalances['PTO'] === 0"
        @click="showPTOCashOutFormModal = true"
        variant="outlined"
        density="compact"
        class="px-2"
        :color="caseRed"
      >
        Cash Out PTO
      </v-btn>
    </div>
    <div v-if="Object.keys(ptoBalances || []).length === 0" class="my-4">No balances to display</div>
    <div v-for="jobcode in sortedBalancesByDuration" :key="jobcode">
      <div v-if="showMore || ptoBalances[jobcode] !== 0" class="d-flex justify-space-between my-3">
        <div class="mr-3">{{ jobcode }}</div>
        <div class="dotted-line"></div>
        <div class="ml-3">{{ convertToHours(ptoBalances[jobcode].value || ptoBalances[jobcode]) }}h</div>
      </div>
      <div v-if="(showMore || ptoBalances[jobcode] !== 0) && ptoBalances[jobcode].items">
        <div
          v-for="subcode in Object.keys(ptoBalances[jobcode].items)"
          :key="subcode"
          class="d-flex justify-space-between ml-6 my-3"
        >
          <div class="mr-3 font-italic">{{ subcode }}</div>
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
        :pto="convertToHours(ptoBalances['PTO'].value || ptoBalances['PTO'])"
        :holiday="convertToHours(ptoBalances['Holiday'].value || ptoBalances['Holiday'])"
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

<script>
import PTOCashOutForm from '@/components/shared/PTOCashOutForm.vue';
import PTOPlanningForm from '@/components/shared/PTOPlanningForm.vue';
import { openLink } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * The Mounted lifecycle hook.
 */
function mounted() {
  this.emitter.on('close-pto-cash-out-form', () => {
    this.showPTOCashOutFormModal = false;
  });
  this.emitter.on('close-pto-planning-form', () => {
    this.showPTOPlanningFormModal = false;
  });
} // mounted

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
function sortedBalancesByDuration() {
  let balances = this.ptoBalances;
  let orderedKeys = Object.keys(balances || {}).sort(function (a, b) {
    return balances[b] - balances[a];
  });
  return orderedKeys;
} // sortedBalancesByDuration

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

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    PTOCashOutForm,
    PTOPlanningForm
  },
  computed: {
    sortedBalancesByDuration
  },
  data() {
    return {
      excludeIfZero: ['Jury Duty', 'Maternity/Paternity Time Off'],
      showPTOCashOutFormModal: false,
      showPTOPlanningFormModal: false,
      showMore: false
    };
  },
  methods: {
    convertToHours,
    openLink
  },
  mounted,
  props: ['ptoBalances', 'employee']
};
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
