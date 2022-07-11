<template>
  <v-container fluid>
    <v-row>
      <v-col cols="6">
        <pie-chart
          v-if="chartLoaded"
          chartId="resume-1"
          :options="resumeChartOptions"
          :chartData="resumeChartData"
        ></pie-chart>
      </v-col>
      <v-col cols="6">
        <pie-chart
          v-if="chart2Loaded"
          chartId="resume-2"
          :options="resumeChart2Options"
          :chartData="resumeChart2Data"
        ></pie-chart>
      </v-col>
    </v-row>
    <v-divider class="mt-5"></v-divider>
    <audit-table :audits="resumeAudits"></audit-table>
  </v-container>
</template>

<script>
import api from '@/shared/api';
import _ from 'lodash';
import PieChart from '@/components/charts/baseCharts/PieChart.vue';
import AuditTable from '@/components/AuditTable';
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
  this.resumeAudits = [];
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
  this.chartLoaded = true;
  this.chart2Loaded = true;
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
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for queryStartDate - fillData
 */
async function watchQueryStartDate() {
  await this.fillData();
} // watchQueryStartDate

/**
 * watcher for queryEndDate - fillData
 */
async function watchQueryEndDate() {
  await this.fillData();
} // watchQueryEndDate

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: { AuditTable, PieChart },
  computed: {
    storeIsPopulated
  },
  created,
  data() {
    return {
      chartLoaded: false,
      chart2Loaded: false,
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
      resumeChart2Data: null,
      search: null
    };
  },
  methods: {
    fillData
  },
  props: ['queryStartDate', 'queryEndDate', 'show24HourTitle'],
  watch: {
    queryStartDate: watchQueryStartDate,
    queryEndDate: watchQueryEndDate,
    storeIsPopulated: async function () {
      if (this.storeIsPopulated) {
        this.employees = this.$store.getters.employees; // get all employees
        await this.fillData();
      }
    }
  }
};
</script>
