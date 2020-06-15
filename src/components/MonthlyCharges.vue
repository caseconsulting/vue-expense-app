<template>
  <div id="monthly-charges">
    <v-card>
      <v-card-title class="header_style">
        <h4 class="white--text">Monthly Charges</h4>
      </v-card-title>
      <v-card-text class="px-7 pt-5 pb-1 black--text">
        <!-- Loop all budgets -->
        <v-row></v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import moment from 'moment';
// import api from '@/shared/api.js';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Get the next anniversary date for the employee based on their hire date.
 *
 * @return String - next employee anniversary date (day of year, month, day, year)
 */
function getMonthlyTimeCharges() {
  let now = moment();
  console.log(now);
} // getMonthlyTimeCharges

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  methods: {
    getMonthlyTimeCharges
  },
  props: ['employee'] // employee
};
</script>
