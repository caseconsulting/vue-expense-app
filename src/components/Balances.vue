<template>
  <div id="balances">
    <v-card>
      <v-card-title class="header_style">
        <h4 class="white--text">Balances</h4>
      </v-card-title>
      <v-card-text class="px-7 pt-5 pb-1 black--text">
        <!-- If no avaible balances dislay message -->
        <v-row v-if="balanceData == 0" justify="center">
          <p>No available balances</p>
        </v-row>
        <!-- Loop through and display all balances -->
        <v-row v-for="balance in this.keysBalance" :key="balance">
          <p>{{ balance }}:</p>
          <v-spacer></v-spacer>
          <p>${{ balanceData[balance] }}</p>
        </v-row>
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
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
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
