<template>
  <div id="balances">
    <v-card>
      <v-card-title class="header_style">
        <h4 class="white--text">Balances</h4>
      </v-card-title>
      <v-card-text class="px-7 pt-5 pb-1 black--text">
        <!-- <v-row v-for="balance in balanceData" :key="balance.id">
          {{ balance.name }}:
          <v-spacer></v-spacer>
          <p>{{ this.trainingBalance }}</p>
        </v-row> -->
        <v-row>
          Training:
          <v-spacer></v-spacer>
          <p>{{ this.trainingBalance }}</p>
        </v-row>
        <v-row>
          Holiday:
          <v-spacer></v-spacer>
          <p>{{ this.holidayBalance }}</p>
        </v-row>
        <v-row>
          Case Connections:
          <v-spacer></v-spacer>
          <p>{{ this.caseConnectBalance }}</p>
        </v-row>
        <v-row>
          Case Cares:
          <v-spacer></v-spacer>
          <p>{{ this.caseCareBalance }}</p>
        </v-row>
        <v-row>
          Vacation:
          <v-spacer></v-spacer>
          <p>{{ this.caseCareBalance }}</p>
        </v-row>
        <v-row>
          COVID-19 PTO:
          <v-spacer></v-spacer>
          <p>{{ this.covidPTO }}</p>
        </v-row>
        <v-row>
          Sabbatical:
          <v-spacer></v-spacer>
          <p>{{ this.sabbaticalBalance }}</p>
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
  this.trainingBalance = this.balanceData['Training'];
  this.holidayBalance = this.balanceData['Holiday'];
  this.caseConnectBalance = this.balanceData['Case Connections'];
  this.caseCareBalance = this.balanceData['Case Cares'];
  this.vacationBalance = this.balanceData['PTO'];
  this.covidPTO = this.balanceData['COVID-19 PTO'];
  this.sabbaticalBalance = this.balancedData['Sabbatical'];
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
      trainingBalance: 0,
      holidayBalance: 0,
      caseConnectBalance: 0,
      caseCareBalance: 0,
      vacationBalance: 0,
      covidPTO: 0,
      sabbaticalBalance: 0
    };
  },
  props: ['employee']
};
</script>
