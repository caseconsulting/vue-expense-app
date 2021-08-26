<template>
  <v-card>
    <v-container fluid>
      <v-row>
        <v-col>
          <pie-chart v-if="chartLoaded" :options="mifiChartOptions" :chartData="mifiChartData"></pie-chart>
        </v-col>
      </v-row>
      <audit-table :audits="mifiAudits"></audit-table>
    </v-container>
  </v-card>
</template>

<script>
import _ from 'lodash';
import api from '@/shared/api';
import PieChart from '../charts/baseCharts/PieChart.vue';
import AuditTable from '@/components/AuditTable';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');
const IsoFormat = 'MMMM Do YYYY, h:mm:ss a';

/**
 * Generates chart data and table
 */
async function fillData() {
  //obtains all login related entries in dev-audits
  //set to null so its data is reset each time the chart renders (changing date ranges)
  this.mifiAudits = [];
  let mifiData = await api.getAudits('mifi', this.queryStartDate, this.queryEndDate);
  _.forEach(mifiData, (audit) => {
    audit.dateCreated = moment(audit.dateCreated).format(IsoFormat);
    let employee = _.find(this.employees, (emp) => {
      return emp.id === audit.employeeId;
    });
    //adds mifi audit object into array
    this.mifiAudits.push({
      dateCreated: audit.dateCreated,
      description: audit.description,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      nickname: employee.nickname ? employee.nickname : ''
    });
  });
  console.log(this.mifiAudits);
  let haveMifiEnabled = mifiData.filter((audit) => {
    if (audit.tags) {
      return audit.tags.includes('mifi set to true');
    }
  });
  let haveMifiDisabled = mifiData.filter((audit) => {
    if (audit.tags) {
      return audit.tags.includes('mifi set to false');
    }
  });
  let numberOfEnabled = haveMifiEnabled.length;
  let numberOfDisabled = haveMifiDisabled.length;

  let data;
  let title;
  let colors;
  let showToolTips;
  let labels = ['Enabled', 'Disabled'];
  if (mifiData.length === 0) {
    colors = 'grey';
    title = 'No Login Trend Data Found For Selected Date Range';
    showToolTips = false;
  } else {
    data = [numberOfEnabled, numberOfDisabled];
    colors = ['#450084', '#CBB677'];
    title = `Login Trend Data From ${moment(this.queryStartDate).format('MM/DD/YY')} to ${moment(
      this.queryEndDate
    ).format('MM/DD/YY')}`;
    showToolTips = true;
  }

  this.mifiChartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: colors
      }
    ]
  };

  this.mifiChartOptions = {
    title: {
      display: true,
      text: title,
      fontSize: 15
    },

    maintainAspectRatio: false,
    tooltips: {
      enabled: showToolTips
    }
  };
  this.chartLoaded = true;
}

export default {
  components: { PieChart, AuditTable },
  async created() {
    this.employees = await api.getItems(api.EMPLOYEES); // get all employees
    this.fillData();
  },
  data() {
    return {
      chartLoaded: false,
      mifiAudits: [],
      mifiChartOptions: null,
      mifiChartData: null
    };
  },
  computed: {
    dateRange() {
      return `${this.queryStartDate} ${this.queryEndDate}`;
    }
  },
  methods: { fillData },
  props: ['queryStartDate', 'queryEndDate'],
  watch: {
    dateRange() {
      this.fillData();
    }
  }
};
</script>

<style></style>
