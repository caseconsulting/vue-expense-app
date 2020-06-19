<template>
  <div id="balances">
    <v-card>
      <v-card-title class="header_style">
        <h4 class="white--text">Balances</h4>
      </v-card-title>
      <v-card-text class="px-7 pt-5 pb-1 black--text">
        <!-- If no avaible balances or inactive dislay message -->
        <v-row v-if="balanceData == 0 || isInactive" justify="center">
          <p>No available balances</p>
        </v-row>
        <span v-if="!isInactive">
          <!-- Loop through and display all balances -->
          <v-row v-for="balance in this.keysBalance" :key="balance">
            <p>{{ balance }}:</p>
            <v-spacer></v-spacer>
            <p>{{ balanceData[balance] }} h</p>
          </v-row>
        </span>
      </v-card-text>
    </v-card>
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
  this.ptoBalances = await api.getPTOBalances(this.employee.employeeNumber); // call api
  this.ptoBalances = this.ptoBalances.results.users[this.employee.employeeNumber];
  this.balanceData = this.ptoBalances['pto_balances'];
  this.keysBalance = Object.keys(this.balanceData);
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
      ptoBalances: [],
      balanceData: [],
      keysBalance: []
    };
  },
  props: ['employee']
};
</script>
