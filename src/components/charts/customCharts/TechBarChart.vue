<template>
  <v-card v-if="dataReceived" class="pa-5">
    <v-btn :disabled="reachedMin" @click="oneLessColumn">-</v-btn>
    <v-btn :disabled="reachedMax" @click="oneMoreColumn">+</v-btn>
    <horizontal-bar :options="options" :chartData="chartData"></horizontal-bar>
  </v-card>
  <v-skeleton-loader v-else type="paragraph@5"></v-skeleton-loader>
</template>

<script>
import HorizontalBar from '../baseCharts/HorizontalBarChart.vue';
import api from '@/shared/api.js';

/**
 * Takes data that was captured upon load and displays it on the chart
 * @param that this passed as that (had issues with this being 'undefined')
 */
function fillData(that) {
  let pairs = that.technologyPairs.sort((a, b) => {
    return b[1] - a[1];
  });
  pairs = pairs.slice(0, that.numOfColumns);
  let labels = [];
  let values = [];

  for (let i = 0; i < pairs.length; i++) {
    labels.push(pairs[i][0]);
    values.push(pairs[i][1]);
  }
  //We cycle through these colors to get the bar colors
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

  //Set the background and border colors
  for (let i = 0; i < labels.length; i++) {
    backgroundColors[i] = colors[i];
    borderColors[i] = colors[i];
  }

  //Set the chart data
  that.chartData = {
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
  that.options = {
    scales: {
      xAxes: [
        {
          ticks: {
            beginAtZero: true
          },
          scaleLabel: {
            display: true,
            labelString: 'Number of Employees',
            fontStyle: 'bold'
          }
        }
      ],
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'Name of Technology',
            fontStyle: 'bold'
          }
        }
      ]
    },
    legend: {
      display: false
    },
    title: {
      display: true,
      text: `Top ${pairs.length} Technologies Used by Employees`,
      fontSize: 15
    },
    maintainAspectRatio: false
  };
  that.dataReceived = true;
} //fillData

/**
 * Increases the number of columns on the chart
 */
function oneMoreColumn() {
  if (this.numOfColumns < this.numOfColumnsMax && this.numOfColumns < this.technologyPairs.length) {
    this.reachedMin = false;
    this.numOfColumns++;
    fillData(this); // Refresh the chart
  }
  // Disable the "+" button if the max has been reached
  if (this.numOfColumns === this.numOfColumnsMax || this.numOfColumns === this.technologyPairs.length) {
    this.reachedMax = true;
  }
} //oneMoreColumn

/**
 * Decreases the number of columns on the chart
 */
function oneLessColumn() {
  if (this.numOfColumns > this.numOfColumnsMin) {
    this.reachedMax = false;
    this.numOfColumns--;
    fillData(this); // Refresh the chart
  }
  // Disable the "-" button if the min has been reached
  if (this.numOfColumns === this.numOfColumnsMin) {
    this.reachedMin = true;
  }
} //oneLessColumn

async function mounted() {
  //Get data
  //Put into dictionary where key is tech type and value is quantity
  let employees = await api.getItems(api.EMPLOYEES);

  let technologies = {};

  employees.forEach((employee) => {
    if (employee.technologies) {
      employee.technologies.forEach((currTech) => {
        if (!technologies[currTech.name]) {
          technologies[currTech.name] = 1;
        } else {
          technologies[currTech.name] += 1;
        }
      });
    }
  });

  //We now sort the entries
  this.technologyPairs = Object.entries(technologies);
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
  this.fillData(this);
}

export default {
  components: {
    HorizontalBar
  },
  data() {
    return {
      reachedMax: false,
      reachedMin: false,
      dataReceived: false,
      chartData: null,
      options: null,
      numOfColumns: 5,
      numOfColumnsMin: 2,
      numOfColumnsMax: 10
    };
  },
  methods: {
    fillData,
    oneMoreColumn,
    oneLessColumn
  },
  mounted
};
</script>

<style></style>
