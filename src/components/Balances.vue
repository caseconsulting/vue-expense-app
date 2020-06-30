<template>
  <div id="pto-balances">
    <h3 class="pt-5">PTO Balances</h3>
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
        <v-row v-for="balance in this.keysBalance" :key="balance">
          <p>{{ balance }}:</p>
          <v-spacer></v-spacer>
          <p>{{ balanceData[balance] }} h</p>
        </v-row>
      </div>
    </v-card-text>
  </div>
</template>

<script>
import api from '@/shared/api.js';
// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Set Balances information for employee.
 */
async function created() {
  this.loadingBar = true;
  this.employee = await api.getUser();
  this.ptoBalances = await api.getPTOBalances(this.employee.employeeNumber); // call api
  this.ptoBalances = this.ptoBalances.results.users[this.employee.employeeNumber];
  this.balanceData = this.ptoBalances['pto_balances'];
  this.keysBalance = Object.keys(this.balanceData);
  this.loadingBar = false;
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
 * @param employee - employee to check
 * @return boolean - employee is inactive
 */
function isInactive() {
  return this.employee.workStatus == 0;
} // isInactive

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  computed: {
    isInactive
  },
  created,
  data() {
    return {
      employee: {},
      ptoBalances: [],
      balanceData: [],
      keysBalance: [],
      loadingBar: false
    };
  }
};
</script>
