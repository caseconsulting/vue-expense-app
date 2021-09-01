<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <bar-chart v-if="chartLoaded" :options="loginChartOptions" :chartData="loginChartData"></bar-chart>
      </v-col>
    </v-row>
    <audit-table :audits="loginAudits"></audit-table>
  </v-container>
</template>

<script>
import _ from 'lodash';
import api from '@/shared/api';
import BarChart from '../charts/baseCharts/BarChart.vue';
import AuditTable from '@/components/AuditTable';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');
const IsoFormat = 'MMMM Do YYYY, h:mm:ss a';

async function created() {
  this.employees = await api.getItems(api.EMPLOYEES); // get all employees
  this.fillData();
}

/**
 * Generates chart data and table
 */
async function fillData() {
  //obtains all login related entries in dev-audits
  //set to null so its data is reset each time the chart renders (changing date ranges)
  this.loginAudits = [];
  let loginData = await api.getAudits('login', this.queryStartDate, this.queryEndDate);
  _.forEach(loginData, (audit) => {
    audit.dateCreated = moment(audit.dateCreated).format(IsoFormat);
    let employee = _.find(this.employees, (emp) => {
      return emp.id === audit.employeeId;
    });
    //adds login audit object into array
    this.loginAudits.push({
      dateCreated: audit.dateCreated,
      description: audit.description,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      nickname: employee.nickname ? employee.nickname : ''
    });
  });
  let title;
  let colors;
  let showTooltips;
  if (this.loginAudits.length === 0) {
    colors = 'grey';
    title = this.show24HourTitle
      ? 'No Login Trend Data In Last 24 Hours'
      : 'No Login Trend Data In Selected Date Range';
    showTooltips = false;
  } else {
    colors = '#bc3825';
    title = this.show24HourTitle
      ? 'Login Trend Data For Last 24 Hours'
      : `Login Trend Data From ${moment(this.queryStartDate).format('MM/DD/YY')} to ${moment(this.queryEndDate).format(
          'MM/DD/YY'
        )}`;
    showTooltips = true;
  }
  //used to collect login time data, with the keys representing a specific hour and
  //each respective value representing the number of users logged in at that hour
  let hoursAndLogins = {
    '1am': 0,
    '2am': 0,
    '3am': 0,
    '4am': 0,
    '5am': 0,
    '6am': 0,
    '7am': 0,
    '8am': 0,
    '9am': 0,
    '10am': 0,
    '11am': 0,
    '12pm': 0,
    '1pm': 0,
    '2pm': 0,
    '3pm': 0,
    '4pm': 0,
    '5pm': 0,
    '6pm': 0,
    '7pm': 0,
    '8pm': 0,
    '9pm': 0,
    '10pm': 0,
    '11pm': 0,
    '12am': 0
  };
  //gets the dateCreated attribute for each login audit and grabs the hour and meidiem (am or pm)
  //to accumulate on the hoursAndLogins map
  _.forEach(this.loginAudits, (login) => {
    let time = login.dateCreated.split(', ')[1];
    let hour = time.split(':')[0];
    let meridiem = time.split(' ')[1];
    hoursAndLogins[hour + meridiem]++;
  });
  //1am 2am 3am..... 12pm
  let labels = Object.keys(hoursAndLogins);
  //# of users logged on at each hour
  let data = Object.values(hoursAndLogins);

  this.loginChartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: colors
      }
    ]
  };

  this.loginChartOptions = {
    scales: {
      xAxes: [
        {
          ticks: {
            beginAtZero: true
          },
          scaleLabel: {
            display: true,
            labelString: 'Time of Login',
            fontStyle: 'bold'
          }
        }
      ],
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            stepSize: 1
          },
          scaleLabel: {
            display: true,
            labelString: 'Number of Logins',
            fontStyle: 'bold'
          }
        }
      ]
    },
    title: {
      display: true,
      text: title,
      fontSize: 15
    },
    legend: {
      display: false
    },
    maintainAspectRatio: false,
    tooltips: {
      enabled: showTooltips
    }
  };
  this.chartLoaded = true;
}

/**
 * returns the combined date range computed value
 */
function dateRange() {
  return `${this.queryStartDate} ${this.queryEndDate}`;
} //dateRange

export default {
  components: { BarChart, AuditTable },
  created,
  data() {
    return {
      chartLoaded: false,
      loginAudits: [],
      loginChartOptions: null,
      loginChartData: null
    };
  },
  computed: {
    dateRange
  },
  methods: { fillData },
  props: ['queryStartDate', 'queryEndDate', 'show24HourTitle'],
  watch: {
    dateRange() {
      this.fillData();
    }
  }
};
</script>

<style></style>
