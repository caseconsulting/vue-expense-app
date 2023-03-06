<template>
  <v-card v-if="enoughData" class="pa-5">
    <v-container v-if="dataReceived" class="ma-0">
      <div v-if="userRoleIsAdmin()" class="right">
        <DownloadCSV
          filename="technologies.csv"
          :generateData="generateCsvData"
          sortKey="Technology"
          :tooltip="'Download ' + showCurrent + ' Technologies to CSV'"
        ></DownloadCSV>
      </div>
      <v-row align="center" justify="end">
        <v-col cols="4" class="text-right">
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" v-if="!isMobile" :disabled="reachedMin" @click="oneLessColumn" small class="mr-2"
                ><v-icon>mdi-minus</v-icon></v-btn
              >
            </template>
            <span>Decrease Number of Columns Shown</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" v-if="!isMobile" :disabled="reachedMax" @click="oneMoreColumn" small class="mr-2"
                ><v-icon>mdi-plus</v-icon></v-btn
              >
            </template>
            <span>Increase Number of Columns Shown</span>
          </v-tooltip>
        </v-col>
      </v-row>
      <bar-chart ref="barChart" :key="chartKey" chartId="tech" :options="options" :chartData="chartData"></bar-chart>
      <v-row justify="center" no-gutters>
        <v-radio-group row v-model="showCurrent" class="mt-8 mb-0 mx-0">
          <v-radio label="All" value="All"></v-radio>
          <v-radio label="Current" value="Current"></v-radio>
          <v-radio label="Past" value="Past"></v-radio>
        </v-radio-group>
      </v-row>
    </v-container>
  </v-card>
  <v-card v-else>
    <div class="pa-15 text-center">
      <h2>Not Enough Data Avaliable.</h2>
      <h5 class="pt-3">Try adding some information to your profile!</h5>
    </div>
  </v-card>
</template>

<script>
import _ from 'lodash';
import BarChart from '../base-charts/BarChart.vue';
import DownloadCSV from '@/components/utils/DownloadCSV.vue';
import { isMobile, storeIsPopulated, userRoleIsAdmin } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Takes data that was captured upon load and displays it on the chart.
 */
function fillData() {
  let pairs = this.technologyPairs.sort((a, b) => {
    return b[1] - a[1];
  });
  pairs = pairs.slice(0, this.numOfColumns);
  let labels = [];
  let values = [];

  for (let i = 0; i < pairs.length; i++) {
    labels.push(pairs[i][0]);
    values.push(pairs[i][1]);
  }
  // We cycle through these colors to get the bar colors
  let colors = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)'
  ];

  let backgroundColors = [];
  let borderColors = [];

  // Set the background and border colors
  for (let i = 0; i < labels.length; i++) {
    backgroundColors[i] = colors[i];
    borderColors[i] = colors[i];
  }

  // Set the chart data
  this.chartData = {
    labels: labels,
    datasets: [
      {
        label: null,
        data: values,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1
      }
    ]
  };
  this.options = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        },
        title: {
          display: true,
          text: 'Number of Employees',
          font: {
            weight: 'bold'
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Name of Technology',
          font: {
            weight: 'bold'
          }
        }
      }
    },
    onClick: (x, y) => {
      if (_.first(y)) {
        let index = _.first(y).index;
        this.$router.push({
          path: '/reports',
          name: 'reports',
          params: { requestedDataType: 'technologies', requestedFilter: this.chartData.labels[index] }
        });
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: `Top ${pairs.length} ${
          this.showCurrent === 'All' ? '' : this.showCurrent + ' '
        }Technologies Used by Employees`,
        font: {
          size: 15
        }
      },
      subtitle: {
        display: true,
        text: '*Click on a bar to see employees',
        font: {
          style: 'italic'
        }
      }
    },
    maintainAspectRatio: false
  };
  this.chartKey++; // rerenders the chart
  this.dataReceived = true;
} // fillData

/**
 * Generates an object of data to be turned into a csv file.
 *
 * @returns Array - An array of objects
 */
function generateCsvData() {
  let csvData = [];
  this.employees.forEach((e) => {
    if (e.technologies) {
      e.technologies.forEach((t) => {
        if (
          this.showCurrent == 'All' ||
          (this.showCurrent == 'Current' && t.current) ||
          (this.showCurrent == 'Past' && !t.current)
        )
          csvData.push({ Technology: t.name, Employee: `${e.firstName} ${e.lastName}` });
      });
    }
  });
  return csvData;
} // generateCsvData

/**
 * Increases the number of columns on the chart
 */
function oneMoreColumn() {
  if (this.numOfColumns < this.numOfColumnsMax && this.numOfColumns < this.technologyPairs.length) {
    this.reachedMin = false;
    this.numOfColumns++;
    this.fillData(); // Refresh the chart
  }
  // Disable the "+" button if the max has been reached
  if (this.numOfColumns === this.numOfColumnsMax || this.numOfColumns === this.technologyPairs.length) {
    this.reachedMax = true;
  }
} // oneMoreColumn

/**
 * Decreases the number of columns on the chart
 */
function oneLessColumn() {
  if (this.numOfColumns > this.numOfColumnsMin) {
    this.reachedMax = false;
    this.numOfColumns--;
    this.fillData(); // Refresh the chart
  }
  // Disable the "-" button if the min has been reached
  if (this.numOfColumns === this.numOfColumnsMin) {
    this.reachedMin = true;
  }
} // oneLessColumn

/**
 * Sets num of columns to show when radio buttons are changed
 *
 * @param techArray - The array of different technologies
 */
function setNumOfColumns(techArray) {
  if (techArray.length <= 5) {
    this.numOfColumns = techArray.length;
    this.reachedMax = true;
  } else {
    this.numOfColumns = 5;
    this.reachedMax = false;
    this.reachedMin = false;
  }
} // setNumOfColumns

/**
 * Sorts array of tech skills
 *
 * @param techArray - The array of different technologies
 */
function sortTech(techArray) {
  // We now sort the entries
  this.technologyPairs = Object.entries(techArray);
  if (this.technologyPairs.length <= this.numOfColumnsMin) {
    this.numOfColumns = this.technologyPairs.length;
    this.numOfColumnsMin = this.technologyPairs.length;
    this.reachedMin = true;
    this.reachedMax = true;
  }
  if (this.technologyPairs.length <= this.numOfColumns) {
    this.numOfColumns = this.technologyPairs.length;
    this.reachedMax = true;
  }
  // Set number of columns to display
  this.setNumOfColumns(techArray);
} // sortTech

/**
 * Parse through employee data to get technologies
 *
 */
function parseEmployeeData() {
  this.employees = this.$store.getters.employees;
  // Put into dictionary where key is tech type and value is quantity
  this.employees.forEach((employee) => {
    if (employee.technologies && employee.workStatus != 0) {
      employee.technologies.forEach((currTech) => {
        // **** ALL TECH ****
        if (!this.technologies[currTech.name]) {
          this.technologies[currTech.name] = 1;
        } else {
          this.technologies[currTech.name] += 1;
        }
        // **** CURRENT TECH ****
        // Not in array yet, but is current
        if (!this.currentTechnologies[currTech.name] && currTech.current) {
          this.currentTechnologies[currTech.name] = 1;
        }
        // Already in array, but is current
        else if (this.currentTechnologies[currTech.name] && currTech.current) {
          this.currentTechnologies[currTech.name] += 1;
        }
        // **** NON CURRENT TECH ****
        // Not in array yet, and is not current
        else if (!this.nonCurrentTechnologies[currTech.name] && !currTech.current) {
          this.nonCurrentTechnologies[currTech.name] = 1;
        }
        // Already in array, and is not current
        else if (this.nonCurrentTechnologies[currTech.name] && !currTech.current) {
          this.nonCurrentTechnologies[currTech.name] += 1;
        }
      });
    }
  });

  // Check if there is enough data to display chart
  if (this.technologies.length >= 2) {
    this.enoughData = false;
  }
} // parseEmployeeData

// |--------------------------------------------------|
// |                                                  |
// |                  LIFECYCLE HOOKS                 |
// |                                                  |
// |--------------------------------------------------|

/**
 * Calls the destroy chart function in the base chart.
 */
function beforeDestroy() {
  this.$refs.barChart.destroyChart();
} // beforeDestroy

/**
 * Mounted lifecycle hook - get items, organize them and fill data.
 */
async function mounted() {
  if (this.storeIsPopulated) {
    await this.parseEmployeeData();
    // Sort tech by number of occurances
    await this.sortTech(this.technologies);

    await this.fillData();
  }
} // mounted

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Watcher for showCurrent - sorts tech info and then fills data.
 */
function watchShowCurrent() {
  if (this.showCurrent === 'All') {
    this.sortTech(this.technologies);
  } else if (this.showCurrent === 'Current') {
    this.sortTech(this.currentTechnologies);
  } else {
    this.sortTech(this.nonCurrentTechnologies);
  }
  this.fillData();
} // watchShowCurrent

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    BarChart,
    DownloadCSV
  },
  computed: {
    isMobile,
    storeIsPopulated
  },
  data() {
    return {
      reachedMax: false,
      reachedMin: false,
      dataReceived: false,
      employees: null,
      chartData: null,
      options: null,
      numOfColumns: 5,
      numOfColumnsMin: 2,
      numOfColumnsMax: 10,
      technologies: {},
      currentTechnologies: {},
      nonCurrentTechnologies: {},
      showCurrent: 'All',
      enoughData: true,
      chartKey: 0
    };
  },
  methods: {
    fillData,
    generateCsvData,
    oneMoreColumn,
    oneLessColumn,
    sortTech,
    parseEmployeeData,
    setNumOfColumns,
    userRoleIsAdmin
  },
  beforeDestroy,
  mounted,
  watch: {
    showCurrent: watchShowCurrent,
    storeIsPopulated: function () {
      if (this.storeIsPopulated) {
        this.parseEmployeeData();
        // Sort tech by number of occurances
        this.sortTech(this.technologies);

        this.fillData();
      }
    }
  }
};
</script>

<style scoped>
button {
  top: 30px;
}

.right {
  float: right;
}
</style>
