<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <bar-chart
          v-if="chartLoaded"
          chartId="login-audits"
          :key="chartKey"
          :options="loginChartOptions"
          :chartData="loginChartData"
        ></bar-chart>
      </v-col>
    </v-row>
    <audits-table :audits="loginAudits"></audits-table>
  </v-container>
</template>

<script>
import _ from 'lodash';
import api from '@/shared/api';
import BarChart from '../charts/base-charts/BarChart.vue';
import AuditsTable from '@/components/audits/AuditsTable.vue';
import { storeIsPopulated } from '@/utils/utils.js';
import { format, isBefore, getHour, add } from '../../shared/dateUtils';
const IsoFormat = 'MMMM Do YYYY, h:mm:ss a';

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
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Generates chart data and table
 */
async function fillData() {
  //obtains all login related entries in dev-audits
  //set to null so its data is reset each time the chart renders (changing date ranges)
  this.loginAudits = [];
  let loginData = await api.getAudits('login', this.queryStartDate, this.queryEndDate);

  _.forEach(loginData, (audit) => {
    audit.dateCreated = format(audit.dateCreated, null, IsoFormat);
    let employee = _.find(this.employees, (emp) => {
      return emp.id === audit.employeeId;
    });
    let employeeName = '';
    let nickname = '';
    if (employee) {
      employeeName = `${employee.firstName} ${employee.lastName}`;
      nickname = employee.nickname ? employee.nickname : '';
    }
    //adds login audit object into array
    this.loginAudits.push({
      dateCreated: audit.dateCreated,
      description: audit.description,
      employeeName: employeeName,
      nickname: nickname
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
      : `Login Trend Data From ${format(this.queryStartDate, null, 'MM/DD/YYYY hh:mm')} to ${format(
          this.queryEndDate,
          null,
          'MM/DD/YYYY hh:mm'
        )}`;
    showTooltips = true;
  }
  //used to collect login time data, with the keys representing a specific hour and
  //each respective value representing the number of users logged in at that hour TODO: make this reactive to the current time
  let hoursAndLogins = generateTimeLabels(this.queryStartDate, this.queryEndDate);
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
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Time of Login',
          font: {
            weight: 'bold'
          }
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        },
        title: {
          display: true,
          text: 'Number of Logins',
          font: {
            weight: 'bold'
          }
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: title,
        font: {
          size: 15
        }
      },
      legend: {
        display: false
      },
      tooltip: {
        enabled: showTooltips
      }
    },
    maintainAspectRatio: false
  };
  this.chartKey++; // rerenders the chart
  this.chartLoaded = true;
} // fillData

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
} //dateRange

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * returns an object for the hours based on the most recent 24 hour period
 *
 * @param queryStart - start of the 24 hour period
 * @param queryEnd - end of the 24 hour period
 * @return - object with the last 24 hours as keys
 */
function generateTimeLabels(queryStart, queryEnd) {
  let returnObj = {};
  let currentTime = queryStart;
  while (isBefore(currentTime, queryEnd, null, 'YYYY-MM-DDTHH:mm:ssZ')) {
    let currentHour = getHour(currentTime);
    let suffix = currentHour >= 12 ? 'pm' : 'am';
    if (currentHour > 12) {
      currentHour -= 12;
    }
    if (currentHour == 0) {
      currentHour = 12;
    }

    returnObj[currentHour + suffix] = 0;
    currentTime = add(currentTime, 1, 'hour');
  }
  return returnObj;
} // generateTimeLabels

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
  components: { BarChart, AuditsTable },
  created,
  data() {
    return {
      chartKey: 0,
      chartLoaded: false,
      loginAudits: [],
      loginChartOptions: null,
      loginChartData: null
    };
  },
  computed: {
    dateRange,
    storeIsPopulated
  },
  methods: {
    fillData,
    generateTimeLabels
  },
  props: ['queryStartDate', 'queryEndDate', 'show24HourTitle'],
  watch: {
    dateRange: watchDateRange,
    storeIsPopulated: watchStoreIsPopulated
  }
};
</script>
