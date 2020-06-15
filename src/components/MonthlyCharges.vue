<template>
  <div id="monthly-charges">
    <v-card>
      <v-card-title class="header_style">
        <h4 class="white--text">Hours for {{ month }} {{ year }}</h4>
      </v-card-title>
      <v-card-text class="px-7 pt-5 pb-1 black--text">
        <v-row></v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import moment from 'moment';
import api from '@/shared/api.js';

const IsoFormat = 'YYYY-MM-DD';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Set budget information for employee. Creates event listeners.
 */
async function created() {
  // get the current day & time in the proper format
  let now = moment().format(IsoFormat);
  // set the current month
  this.month = moment().format('MMMM');
  // set the current year
  this.year = moment().format('YYYY');
  // get the first day of the month in the proper format
  let firstDay = moment().set('date', 1).format(IsoFormat);
  // get timesheets from api
  this.timeSheets = await api.getTimeSheets(this.employee.employeeNumber, firstDay, now);
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
      month: '',
      timeSheets: [],
      year: ''
    };
  },
  props: ['employee'] // employee
};
</script>
