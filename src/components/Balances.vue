<template>
  <div id="pto-balances">
    <h3 class="pt-5">PTO Balances</h3>
    <div v-if="balancesError" class="pt-2 pb-6" align="center">
      <v-tooltip right>
        <template v-slot:activator="{ on }">
          <v-icon v-on="on">warning</v-icon>
        </template>
        <span>Error</span>
      </v-tooltip>
    </div>
    <div v-else>
      <v-card-text>
        <div v-if="this.loadingBar" class="pb-4">
          <v-progress-linear :indeterminate="true"></v-progress-linear>
        </div>
        <div v-else>
          <!-- If no avaible balances or inactive dislay message -->
          <v-row v-if="balanceData == 0 || isInactive" justify="center">
            <p>No available balances</p>
          </v-row>
        </div>
        <div v-if="!isInactive">
          <!-- Loop through and display all balances -->
          <v-row v-for="balance in this.availableBalances" :key="balance">
            <p>{{ balance }}:</p>
            <v-spacer></v-spacer>
            <p>{{ formatHours(balanceData[balance]) }}</p>
          </v-row>
        </div>
        <template v-if="!showMore && !showAll">
          <v-btn @click="showMore = true" top text small class="my-2">Show More &#9662; </v-btn>
        </template>

        <template v-if="showMore && !showAll">
          <v-btn @click="showMore = false" top text small class="my-2">Show Less &#9650; </v-btn>
        </template>
      </v-card-text>
    </div>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Set Balances information for employee.
 */
async function created() {
  this.isEmployeeView = this.$route.name === 'employee';
  this.loadingBar = true;
  await this.setPTOBalances();
} // created

// |--------------------------------------------------|
// |                                                  |
// |                 COMPUTED                         |
// |                                                  |
// |--------------------------------------------------|

/**
 * Checks if an employee is inactive. Sets isInactive as true if the employee is inactive with a work status of 0, otherwise
 * sets it to false.
 *
 * @return boolean - employee is inactive
 */
function isInactive() {
  return this.employee.workStatus == 0;
} // isInactive

/**
 * Returns the balances that are currently shown on the screen.
 * Balances > 0 will always show.
 */
function availableBalances() {
  let avaibleBalances = [];
  this.keysBalance.forEach((balance) => {
    if (this.balanceData[balance] > 0 || this.showMore) {
      avaibleBalances.push(balance);
    }
  });
  return avaibleBalances;
} // availableBalances

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * changes hours from a decimal number to hours and minutes
 */
function formatHours(hours) {
  if (this.showMinutes) {
    let hrs = parseInt(Number(hours));
    let min = Math.round((Number(hours) - hrs) * 60);
    if (min == 60) {
      min = 0;
      hrs++;
    }
    hours = hrs + 'h ' + min + 'm';
    return hours;
  }
  return `${hours}h`;
} // formatHours

/**
 * Checks if a value is empty. Returns true if the value is null or an empty/blank string.
 *
 * @param value - value to check
 * @return boolean - value is empty
 */
function isEmpty(value) {
  return _.isNil(value) || (_.isString(value) && value.trim().length === 0);
} // isEmpty

/**
 * Sets the PTO balances for the employee (or user if no employee is specified)
 */
async function setPTOBalances() {
  this.employee = this.isEmployeeView ? this.passedEmployee : await api.getUser();
  if (!isEmpty(this.employee.id)) {
    let ptoBalances = await api.getPTOBalances(this.employee.employeeNumber); // call api
    if (_.isNil(ptoBalances.results)) {
      this.balancesError = true;
    } else {
      ptoBalances = ptoBalances.results.users[this.employee.employeeNumber];
      this.balanceData = ptoBalances['pto_balances'];
      this.keysBalance = Object.keys(this.balanceData);
      this.loadingBar = false;
      let emptyBalances = 0;
      this.keysBalance.forEach((balance) => {
        if (this.balanceData[balance] == 0) {
          emptyBalances++;
        }
      });
      if (emptyBalances > 0) {
        this.showAll = false;
      }
    }
    this.loading = false;
  }
} // setPTOBalances

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  computed: {
    isInactive,
    availableBalances
  },
  created,
  data() {
    return {
      balanceData: [],
      balancesError: false,
      employee: {},
      isEmployeeView: false,
      keysBalance: [],
      loadingBar: false,
      showAll: true,
      showMore: false
    };
  },
  methods: {
    formatHours,
    isEmpty,
    setPTOBalances
  },
  props: ['passedEmployee', 'showMinutes'],
  watch: {
    'passedEmployee.id': async function () {
      if (this.isEmployeeView) {
        await this.setPTOBalances();
      }
    }
  }
};
</script>
