<template>
  <div>
    <div class="d-flex justify-space-between">
      <h3 class="d-flex align-center"><v-icon class="mr-2">mdi-palm-tree</v-icon> PTO Balances</h3>
      <v-btn variant="outlined" density="compact" class="px-2" :color="this.caseRed"> Cash Out PTO </v-btn>
    </div>
    <div v-for="[name, balance] in Object.entries(ptoBalances)" :key="name">
      <div
        v-if="!excludeIfZero.includes(name) || (excludeIfZero.includes(name) && Number(balance) !== 0)"
        class="d-flex justify-space-between my-3"
      >
        <div class="mr-3">{{ name }}</div>
        <div class="dotted-line"></div>
        <div class="ml-3">{{ convertToHours(balance) }}h</div>
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

export default {
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
