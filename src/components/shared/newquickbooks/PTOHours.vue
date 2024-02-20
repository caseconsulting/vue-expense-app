<template>
  <div>
    <div class="d-flex justify-space-between">
      <h3 class="d-flex align-center"><v-icon class="mr-2">mdi-palm-tree</v-icon> PTO Balances</h3>
      <v-btn
        v-if="Object.keys(ptoBalances || {}).length !== 0"
        variant="outlined"
        density="compact"
        class="px-2"
        :color="this.caseRed"
      >
        Cash Out PTO
      </v-btn>
    </div>
    <div v-if="Object.keys(ptoBalances || {}).length === 0" class="my-4">No balances to display</div>
    <div v-for="jobcode in sortedBalancesByDuration" :key="jobcode">
      <div
        v-if="
          !excludeIfZero.includes(jobcode) || (excludeIfZero.includes(jobcode) && Number(ptoBalances[jobcode]) !== 0)
        "
        class="d-flex justify-space-between my-3"
      >
        <div class="mr-3">{{ jobcode }}</div>
        <div class="dotted-line"></div>
        <div class="ml-3">{{ convertToHours(ptoBalances[jobcode]) }}h</div>
      </div>
    </div>
  </div>
</template>

<script>
function convertToHours(seconds) {
  return Number(seconds / 60 / 60)
    ?.toFixed(2)
    ?.replace(/[.,]00$/, ''); // removes decimals if a whole number
}

function sortedBalancesByDuration() {
  let balances = this.ptoBalances;
  let orderedKeys = Object.keys(balances || {}).sort(function (a, b) {
    return balances[b] - balances[a];
  });
  return orderedKeys;
}

export default {
  computed: {
    sortedBalancesByDuration
  },
  data() {
    return {
      excludeIfZero: ['Jury Duty', 'Maternity/Paternity Time Off']
    };
  },
  methods: {
    convertToHours
  },
  props: ['ptoBalances']
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
</style>
