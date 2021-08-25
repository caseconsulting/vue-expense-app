<template>
  <v-card>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <pie-chart :options="resumeChartOptions" :chartData="resumeChartData"></pie-chart>
        </v-col>
        <v-col>
          <pie-chart :options="resumeChart2Options" :chartData="resumeChart2Data"></pie-chart>
        </v-col>
      </v-row>
      <v-divider class="mt-5"></v-divider>
      <audit-table :audits="resumeAudits"></audit-table>
    </v-container>
  </v-card>
</template>

<script>
import api from '@/shared/api';
import _ from 'lodash';
import PieChart from '@/components/charts/baseCharts/PieChart.vue';
import AuditTable from '@/components/AuditTable';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');
const IsoFormat = 'MMMM Do YYYY, h:mm:ss a';

async function fillData() {
  this.resumeAudits = [];
  let resumeAudits = await api.getAudits('resume', this.queryStartDate, this.queryEndDate);

  _.forEach(resumeAudits, (audit) => {
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

  let resumeParseSuccesses = resumeAudits.filter((audit) => {
    if (audit.tags) {
      return audit.tags.includes('success') && audit.tags.includes('upload');
    }
  });
  let resumeParseFailures = resumeAudits.filter((audit) => {
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
    text = 'Proportion of Resumes Successfully Parsed';
    showToolTips = true;
  } else {
    data = [1];
    backgroundColor = ['grey'];
    text = 'No Resume Parser Audits in Time Frame';
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
    title: {
      display: true,
      text: text,
      fontSize: 15
    },

    maintainAspectRatio: false,
    tooltips: {
      enabled: showToolTips
    }
  };

  // For resume chart 2
  let resumeParseSubmits = resumeAudits.filter((audit) => {
    if (audit.tags) {
      return audit.tags.includes('submit');
    }
  });

  let numSubmits = resumeParseSubmits.length;

  if (successes > 0 || numSubmits > 0) {
    labels = ['Only Successful Parse', 'Submitted Changes'];
    data = [successes - numSubmits, numSubmits];
    backgroundColor = ['rgba(134, 31, 65, 1)', 'rgba(232, 119, 34, 1)'];
    text = 'Proportion of People Who Submitted Changes';
    showToolTips = true;
  } else {
    data = [1];
    backgroundColor = ['grey'];
    text = 'No Resume Parser Audits in Time Frame';
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
    title: {
      display: true,
      text: text,
      fontSize: 15
    },

    maintainAspectRatio: false,
    tooltips: {
      enabled: showToolTips
    }
  };
}

/**
 * created lifecycle hook
 */
async function created() {
  this.employees = await api.getItems(api.EMPLOYEES); // get all employees
  await this.fillData();
} //created

export default {
  components: { AuditTable, PieChart },
  created,
  data() {
    return {
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
  props: ['queryStartDate', 'queryEndDate'],
  watch: {
    async queryStartDate() {
      await this.fillData();
    },
    async queryEndDate() {
      await this.fillData();
    }
  }
};
</script>
