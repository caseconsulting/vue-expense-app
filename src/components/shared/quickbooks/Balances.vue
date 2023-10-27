<template>
  <div id="pto-balances">
    <h3 class="pt-5" align="center">
      PTO Balances
      <v-avatar @click="toFAQ()" class="mb-4" size="small">
        <v-tooltip activator="parent" location="top">Click for FAQ</v-tooltip>
        <v-icon color="#3f51b5" size="small">mdi-information</v-icon>
      </v-avatar>
    </h3>

    <!-- Error Getting Balances -->
    <div v-if="balancesError" class="pt-2 pb-6" align="center">
      <span>
        <v-tooltip activator="parent" location="right">Error</v-tooltip>
        <v-icon size="large">mdi-alert</v-icon>
      </span>
    </div>
    <!-- End Error -->

    <!-- Successfully Getting Balances -->
    <div v-else>
      <v-card-text>
        <!-- Loading Bar -->
        <div v-if="this.loadingBar" class="pb-4">
          <v-progress-linear :indeterminate="true"></v-progress-linear>
        </div>
        <div v-else>
          <!-- No Available Balances -->
          <v-row v-if="balanceData == 0 || isInactive" justify="center">
            <p>No available balances</p>
          </v-row>

          <!-- Employee Inactive -->
          <div v-if="!isInactive">
            <!-- Loop through and display all balances -->
            <v-row v-for="balance in this.availableBalances" :key="balance" class="mb-2">
              <p>{{ balance }}:</p>
              <v-spacer></v-spacer>
              <p>{{ formatHours(balanceData[balance]) }}</p>
            </v-row>
          </div>

          <!-- Showing Available Balances -->
          <div v-if="!showMore && !showAll" class="d-flex justify-center">
            <v-btn @click="showMore = true" variant="text" size="small" class="my-2"> Show More &#9662; </v-btn>
          </div>

          <!-- Showing All Balances -->
          <div v-if="showMore && !showAll" class="d-flex justify-center">
            <v-btn @click="showMore = false" variant="text" size="small" class="my-2"> Show Less &#9650; </v-btn>
          </div>
          <div class="d-flex align-items-center justify-center">
            <button class="home_buttons my-1" @click="showPTOCashOutFormModal = true">Cash Out PTO</button>
          </div>
        </div>
      </v-card-text>
    </div>
    <v-dialog v-model="showPTOCashOutFormModal" persistent max-width="500">
      <p-t-o-cash-out-form :employee="passedEmployee" />
    </v-dialog>
  </div>
</template>

<script>
import { isEmpty } from '@/utils/utils';
import { updateStorePtoCashOuts, updateStoreEmployees, updateStoreTags } from '@/utils/storeUtils';
import _ from 'lodash';
import api from '@/shared/api';
import PTOCashOutForm from '@/components/shared/PTOCashOutForm.vue';

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
  await Promise.all([!this.$store.getters.employees ? this.updateStoreEmployees() : '', this.setPTOBalances()]);
} // created

/**
 * destroy listeners
 */
function beforeDestroy() {
  this.emitter.off('refresh-quickbooks-data');
  this.emitter.off('close-pto-cash-out-form');
} // beforeDestroy

/**
 * Mounted lifecycle hook.
 */
async function mounted() {
  this.emitter.on('refresh-quickbooks-data', async () => {
    this.refresh = true;
    this.loadingBar = true;
    await this.setPTOBalances();
    this.refresh = false;
  });

  this.emitter.on('close-pto-cash-out-form', () => {
    this.showPTOCashOutFormModal = false;
  });
} // mounted

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
 *
 * @return array - the balances that are shown
 */
function availableBalances() {
  this.pendingPtoCashOuts = _.filter(
    this.$store.getters.ptoCashOuts,
    (p) => !p.approvedDate && this.employee.id === p.employeeId
  );
  let avaibleBalances = [];
  this.keysBalance.forEach((balance) => {
    if (this.balanceData[balance] > 0 || this.showMore) {
      avaibleBalances.push(balance);
    }
  });
  if (this.pendingPtoCashOuts.length > 0) {
    let balance = 'Pending PTO Cash Out';
    if (!avaibleBalances.includes(balance)) {
      avaibleBalances.push(balance);
    }
    this.balanceData[balance] = this.pendingPtoCashOuts.reduce((n, { amount }) => n + amount, 0);
  }
  return avaibleBalances;
} // availableBalances

/**
 * Determines if an employee is a legacy FireTeam employee.
 *
 * @returns Boolean - whether the employee was FireTeam or not
 */
function isLegacyFireTeam() {
  if (!this.passedEmployee) {
    return parseInt(this.employee.employeeNumber, 10) < 100;
  } else {
    return parseInt(this.passedEmployee.employeeNumber, 10) < 100;
  }
} // isLegacyFireTeam

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * changes hours from a decimal number to hours and minutes
 *
 * @param hours - the number of hours
 * @return string - formatted number of hours
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
  return `${Number(hours)}h`;
} // formatHours

/**
 * Sets the PTO balances for the employee (or user if no employee is specified)
 */
async function setPTOBalances() {
  this.employee = this.isEmployeeView ? this.passedEmployee : this.$store.getters.user;
  if (this.employee && !this.isEmpty(this.employee.id)) {
    // employee exists
    let ptoBalances;
    if (
      !this.$store.getters.quickbooksPTO ||
      !this.$store.getters.ptoCashOuts ||
      this.$store.getters.user.id != this.employee.id ||
      this.refresh
    ) {
      [ptoBalances] = await Promise.all([api.getPTOBalances(this.employee.employeeNumber), updateStorePtoCashOuts()]); // call api
      if (!(ptoBalances instanceof Error) && this.$store.getters.user.id == this.employee.id) {
        // only set vuex store if the user is looking at their own quickbooks data
        this.$store.dispatch('setQuickbooksPTO', { quickbooksPTO: ptoBalances });
      }
    } else {
      ptoBalances = this.$store.getters.quickbooksPTO;
    }
    if (_.isNil(ptoBalances.results) || _.isNil(ptoBalances.results.users[this.employee.employeeNumber])) {
      // error getting pto balances
      this.balancesError = true;
    } else {
      // successfully got pto balances
      ptoBalances = ptoBalances.results.users[this.employee.employeeNumber];
      this.balanceData = ptoBalances['pto_balances'];
      // find if there are empty balances to hide
      this.keysBalance = Object.keys(this.balanceData);
      this.loadingBar = false;
      let emptyBalances = 0;
      this.keysBalance.forEach((balance) => {
        if (this.balanceData[balance] == 0) {
          // found empty balance
          emptyBalances++;
        }
      });
      if (emptyBalances > 0) {
        // set show all to false if there are empty balances
        this.showAll = false;
      }
    }
    this.loading = false;
  }
} // setPTOBalances

/**
 * Opens new tab when info icon is selected w/in Quickbooks time box
 */
function toFAQ() {
  let link = this.isLegacyFireTeam
    ? 'https://3.basecamp.com/3097063/buckets/179119/messages/6450437179'
    : 'https://3.basecamp.com/3097063/buckets/179119/messages/939259168';
  window.open(link, '_blank');
} // toFAQ

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for passedEmployee.id - if it is employee view it will set or reset PTOBalances
 */
async function watchPassedEmployeeID() {
  if (this.passedEmployee) {
    this.loadingBar = true;
    this.balancesError = false;
    this.refresh = true;
    this.isEmployeeView = true;
    await this.setPTOBalances();
  }
} // watchPassedEmployeeID

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: { PTOCashOutForm },
  computed: {
    isInactive,
    availableBalances,
    isLegacyFireTeam
  },
  beforeDestroy,
  created,
  data() {
    return {
      balanceData: [], // employee balances
      balancesError: false, // error getting balances
      employee: {}, // employee info
      isEmployeeView: false, // viewing from employee route
      keysBalance: [], // balance names
      loadingBar: false, // display loading bar
      pendingPtoCashOuts: [], // pending employee PTO cash outs
      refresh: false, // if the data has been refreshed
      showAll: true, // show all balances
      showMore: false, // toggle to show hidden balances
      showPTOCashOutFormModal: false // toggle to show PTO Cash Out form
    };
  },
  methods: {
    formatHours,
    isEmpty,
    setPTOBalances,
    toFAQ,
    updateStoreEmployees,
    updateStoreTags
  },
  mounted,
  props: ['passedEmployee', 'showMinutes'],
  watch: {
    'passedEmployee.id': watchPassedEmployeeID
  }
};
</script>
