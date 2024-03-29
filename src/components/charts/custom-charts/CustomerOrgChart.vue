<template>
  <v-card v-if="dataReceived" class="pa-5">
    <pie-chart ref="pieChart" :key="chartKey" chartId="cust-org" :options="options" :chartData="chartData"></pie-chart>
    <v-container class="ma-0">
      <v-row justify="center" no-gutters>
        <v-radio-group inline v-model="showCurrent" class="d-flex justify-center">
          <v-radio label="All" value="All"></v-radio>
          <v-radio label="Current" value="Current"></v-radio>
          <v-radio label="Past" value="Past"></v-radio>
        </v-radio-group>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import PieChart from '../base-charts/PieChart.vue';
import _ from 'lodash';
import { storeIsPopulated } from '@/utils/utils.js';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Created lifecycle hook
 */
async function created() {
  if (this.storeIsPopulated) {
    await this.fetchData();
    await this.fillData();
  }
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Get all cust org data.
 */
function fetchData() {
  let allCompOrgExp = {};
  // access store
  this.employees = this.$store.getters.employees;
  // tally up customer org experience for active employees
  this.employees.forEach((emp) => {
    if (emp.customerOrgExp && emp.workStatus != 0) {
      _.forEach(emp.customerOrgExp, (org) => {
        let orgName = org.name;
        let orgYears = org.years;
        // We get whether or not we want to show current or past info
        let orgCurrent = this.showCurrent === 'Current' ? org.current : !org.current;

        // error checks if orgYears is undefined
        if (orgYears && (orgCurrent || this.showCurrent === 'All')) {
          if (allCompOrgExp[orgName]) {
            allCompOrgExp[orgName] += Math.round(Number(orgYears) * 100) / 100;
          } else {
            allCompOrgExp[orgName] = Math.round(Number(orgYears) * 100) / 100;
          }
        }
      });
    }
  });
  let labels = Object.keys(allCompOrgExp);
  this.quantities = [];

  _.forEach(labels, (label) => {
    this.quantities.push(allCompOrgExp[label]);
  });
  this.labels = labels;
} // fetchData

/**
 * Sets up the chart formatting and data options.
 */
function fillData() {
  let text = '';
  let colors = [];
  let enabled = true;
  if (_.isEmpty(this.quantities)) {
    text = 'No Customer Org Data Found';
    this.quantities.push(1);
    enabled = false;
    colors = ['grey'];
  } else {
    colors = [
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 99, 132, 1)',
      'rgba(230, 184, 156, 1)',
      'rgba(234, 210, 172, 1)',
      'rgba(156, 175, 183, 1)',
      'rgba(66, 129, 164, 1)'
    ];
    text = `${this.showCurrent} Customer Org Experience (Years)`;
  }
  this.chartData = {
    labels: this.labels,
    datasets: [
      {
        data: this.quantities,
        backgroundColor: colors
      }
    ]
  };

  this.options = {
    onClick: (x, y) => {
      let index = _.first(y).index;
      let labelClicked = this.chartData.labels[index];
      localStorage.setItem('requestedDataType', 'customer orgs');
      localStorage.setItem('requestedFilter', labelClicked);
      this.$router.push({
        path: '/reports',
        name: 'reports'
      });
    },
    plugins: {
      title: {
        display: true,
        text: text,
        font: {
          size: 15
        }
      },
      subtitle: {
        display: true,
        text: '*Click on a segment of the pie chart to see employees',
        font: {
          style: 'italic'
        }
      },
      tooltip: {
        enabled: enabled
      }
    },
    maintainAspectRatio: false
  };

  this.dataReceived = true;
} // fillData

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Watcher for showCurrent - fills data.
 */
function watchShowCurrent() {
  this.fetchData();
  this.fillData(); // renders a different chart every time the radio button changes
  this.chartKey++; // rerenders the chart
} // watchShowCurrent

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: { PieChart },
  computed: {
    storeIsPopulated
  },
  data() {
    return {
      dataReceived: false,
      chartData: null,
      options: null,
      employees: null,
      showCurrent: 'All',
      chartKey: 0,
      labels: [],
      quantities: []
    };
  },
  methods: { fetchData, fillData },
  created,
  watch: {
    showCurrent: watchShowCurrent,
    storeIsPopulated: function () {
      if (this.storeIsPopulated) {
        this.fetchData();
        this.fillData();
      }
    }
  }
};
</script>
