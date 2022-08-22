<template>
  <v-container fluid>
    <v-row v-if="chartsLoaded">
      <v-col sm="12" md="6">
        <pie-chart chartId="resume-1" :options="resumeChartOptions" :chartData="resumeChartData"></pie-chart>
      </v-col>
      <v-col sm="12" md="6">
        <pie-chart chartId="resume-2" :options="resumeChart2Options" :chartData="resumeChart2Data"></pie-chart>
      </v-col>
    </v-row>
    <v-divider class="mt-5"></v-divider>
    <audits-table :audits="resumeAudits"></audits-table>
  </v-container>
</template>

<script>
import api from '@/shared/api';
import _ from 'lodash';
import PieChart from '@/components/charts/base-charts/PieChart.vue';
import AuditsTable from '@/components/audits/AuditsTable.vue';
import { storeIsPopulated } from '@/utils/utils.js';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');
const IsoFormat = 'MMMM Do YYYY, h:mm:ss a';

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Generates chart data and table
 */
async function fillData() {
  let resumeData = await api.getAudits('resume', this.queryStartDate, this.queryEndDate);

  _.forEach(resumeData, (audit) => {
    audit.dateCreated = moment(audit.dateCreated).format(IsoFormat);
    let employee = _.find(this.employees, (emp) => {
      return emp.id === audit.employeeId;
    });

    this.resumeAudits.push({
      dateCreated: audit.dateCreated,
      description: audit.description,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      nickname: employee.nickname ? employee.nickname : ''
    });
  });

  let resumeParseSuccesses = resumeData.filter((audit) => {
    if (audit.tags) {
      return audit.tags.includes('success') && audit.tags.includes('upload');
    }
  });
  let resumeParseFailures = resumeData.filter((audit) => {
    if (audit.tags) {
      return audit.tags.includes('failure') && audit.tags.includes('upload');
    }
  });

  // For resume chart 1
  let successes = resumeParseSuccesses.length;
  let failures = resumeParseFailures.length;

  let labels = [];
  let data;
  let backgroundColor;
  let text;
  let showToolTips;

  if (successes > 0 || failures > 0) {
    labels = ['Successful', 'Failed'];
    data = [successes, failures];
    backgroundColor = ['rgba(50, 168, 82, 1)', 'rgba(230, 61, 55, 1)'];
    text = this.show24HourTitle
      ? 'Proportion of Resumes Successfully Parsed In Last 24 Hours'
      : 'Proportion of Resumes Successfully Parsed';
    showToolTips = true;
  } else {
    data = [1];
    backgroundColor = ['grey'];
    text = this.show24HourTitle ? 'No Resume Parser Audits In Last 24 Hours' : 'No Resume Parser Audits in Date Range';
    showToolTips = false;
  }

  this.resumeChartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: backgroundColor
      }
    ]
  };

  this.resumeChartOptions = {
    plugins: {
      title: {
        display: true,
        text: text,
        font: {
          size: 15
        }
      },
      tooltip: {
        enabled: false
      }
    },
    maintainAspectRatio: false
  };

  // For resume chart 2
  let resumeParseSubmits = resumeData.filter((audit) => {
    if (audit.tags) {
      return audit.tags.includes('submit');
    }
  });

  let numSubmits = resumeParseSubmits.length;

  if (successes > 0 || numSubmits > 0) {
    labels = ['Only Successful Parse', 'Submitted Changes'];
    data = [successes - numSubmits, numSubmits];
    backgroundColor = ['rgba(134, 31, 65, 1)', 'rgba(232, 119, 34, 1)'];
    text = this.show24HourTitle
      ? 'Proportion of People Who Submitted Changes In Last 24 Hours'
      : 'Proportion of People Who Submitted Changes';
    showToolTips = true;
  } else {
    data = [1];
    backgroundColor = ['grey'];
    text = this.show24HourTitle ? 'No Resume Parser Audits In Last 24 Hours' : 'No Resume Parser Audits Date Range';
    showToolTips = false;
  }

  this.resumeChart2Data = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: backgroundColor
      }
    ]
  };

  this.resumeChart2Options = {
    plugins: {
      title: {
        display: true,
        text: text,
        font: {
          size: 15
        }
      },
      tooltip: {
        enabled: showToolTips
      }
    },
    maintainAspectRatio: false
  };
  this.chartsLoaded = true;
} // fillData

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * created lifecycle hook
 */
async function created() {
  if (this.storeIsPopulated) {
    this.employees = this.$store.getters.employees; // get all employees
    await this.fillData();
  }
} //created

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * returns the combined date range computed value
 *
 * @return - full date range
 */
function dateRange() {
  return `${this.queryStartDate} ${this.queryEndDate}`;
} // dateRange

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * fills data when dateRange changes
 */
async function watchDateRange() {
  await this.fillData();
} // watchDateRange

/**
 * fills data when store is populated since employees are needed to fill data
 */
async function watchStoreIsPopulated() {
  if (this.storeIsPopulated) {
    this.employees = this.$store.getters.employees; // get all employees
    await this.fillData();
  }
}

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: { AuditsTable, PieChart },
  computed: {
    storeIsPopulated,
    dateRange
  },
  created,
  data() {
    return {
      chartsLoaded: false,
      employees: [],
      headers: [
        {
          text: 'Event Date',
          value: 'dateCreated'
        },
        {
          text: 'Employee Name',
          value: 'employeeName'
        },
        {
          text: 'Description',
          value: 'description'
        },
        {
          text: '',
          value: 'nickname',
          width: 0,
          cellClass: 'clear'
        }
      ], // datatable headers
      resumeAudits: [],
      resumeChartOptions: null,
      resumeChartData: null,
      resumeChart2Options: null,
      resumeChart2Data: null
    };
  },
  methods: {
    fillData
  },
  props: ['queryStartDate', 'queryEndDate', 'show24HourTitle'],
  watch: {
    dateRange: watchDateRange,
    storeIsPopulated: watchStoreIsPopulated
  }
};
</script>
