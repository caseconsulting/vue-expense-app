<template>
  <!-- Download CSV Button -->
  <v-card>
    <!-- Modal Title -->
    <v-card-title class="d-flex align-center text-h5 header_style">Employee Export</v-card-title>
    <!-- Modal Content -->
    <v-card-text class="px-5 pa-md-4 mt-4">
      <!-- EEO vs Employee export type -->
      <h3>Export Type</h3>
      <v-radio-group v-model="exportType" inline>
        <v-radio label="Employee Data" value="employee"></v-radio>
        <v-radio label="EEO Data" value="eeo"></v-radio>
      </v-radio-group>

      <!-- Year selector -->
      <h3>Report Year</h3>
      <v-select
        class="d-inline-block w-25"
        label="Year"
        v-model="year"
        :items="yearOptions"
        variant="underlined"
      ></v-select>

      <br />

      <!-- Action Button (Close) -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="outlined" @click="download()"
          >Download <v-icon size="large">mdi-download</v-icon></v-btn
        >
        <v-btn color="grey-darken-3" variant="text" @click="close()"> Close </v-btn>
      </v-card-actions>
    </v-card-text>
  </v-card>
</template>

<script>
import { isMobile, isSmallScreen } from '@/utils/utils';
import dateUtils from '@/shared/dateUtils';
import _ from 'lodash';
const employeeCsv = require('@/utils/csv/employeeCsv.js');
const eeoCsv = require('@/utils/csv/eeoCsv.js');

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to close modal
 */
function close() {
  this.emitter.emit(`close-employee-export`);
}

/**
 * Downloads employees as CSV
 */
function download() {
  // filter CSV info
  let csvInfo = _.filter(this.employees, (e) => {
    // include employees hired and active (not departured) at least one day that year
    if (this.year != 'All') {
      let hireYearValid = !!e.hireDate && dateUtils.isSameOrBefore(e.hireDate, this.year, 'year');
      let deptYearValid = !this.deptDate || dateUtils.isSameOrAfter(e.deptDate, this.year, 'year');
      console.log(`${e.hireDate} ${this.year} ${hireYearValid}`);
      // if (!(!hireYearValid || !deptYearValid)) console.log(`${e.firstname}`);
      // else console.log(`${hireYearValid} :: ${deptYearValid}`);
      if (!hireYearValid || !deptYearValid) return false;
    }

    // passed all conditions, return this employee
    return true;
  });

  console.log(csvInfo);

  // download from proper csv util
  if (this.exportType == 'employee') {
    employeeCsv.download(csvInfo, this.contracts, this.tags);
  } else if (this.exportType == 'eeo') {
    eeoCsv.download(csvInfo);
  }

  // close the modal
  this.close();
} // download

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Options for EEO years
 */
function yearOptions() {
  // get unique years from hire dates
  let years = _.uniq(_.map(this.employees, (e) => dateUtils.format(e.hireDate, null, 'YYYY')));
  // now sort the years highest to lowest
  years = _.orderBy(years, null, ['desc']);
  // add "All" option and return result
  years.unshift('All');
  return years;
}

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  computed: {
    isMobile,
    isSmallScreen,
    yearOptions
  },
  data() {
    return {
      exportType: 'employee',
      year: 'All'
    };
  },
  methods: {
    close,
    download
  },
  props: ['employees', 'contracts', 'tags']
};
</script>

<style scoped>
.download {
  font-size: 20px;
  cursor: pointer;
}
</style>
