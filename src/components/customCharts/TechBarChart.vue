<template>
  <v-card>
    <v-btn @click="oneLessColumn">-</v-btn>
    <v-btn @click="oneMoreColumn">+</v-btn>
    <v-container>
      <horizontal-bar v-if="dataReceived" :options="options" :chartData="chartData" chartType="tech"></horizontal-bar>
    </v-container>
  </v-card>
</template>

<script>
import HorizontalBar from '../baseCharts/HorizontalBarChart.vue';
import api from '@/shared/api.js';

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
  console.log('PAIRS LENGTH: ' + pairs.length);
  //We cycle through these colors to get the bar colors
  let colors = [
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
            labelString: 'Number of Employees'
          }
        }
      ],
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'Name of Technology'
          }
        }
      ]
    },
    legend: {
      display: false
    },
    title: {
      display: true,
      text: `Top ${pairs.length} Technologies Used By Employees`
    }
  };
  that.dataReceived = true;
  window.EventBus.$emit('updateChart-tech', that.options);
} //fillData

/**
 * Increases the number of columns on the chart
 */
function oneMoreColumn() {
  console.log(this.numOfColumns);
  if (this.numOfColumns < 10 && this.numOfColumns < this.technologyPairs.length) {
    this.numOfColumns++;
    fillData(this);
  }
  console.log(this.numOfColumns);
} //oneMoreColumn

/**
 * Decreases the number of columns on the chart
 */
function oneLessColumn() {
  console.log(this.numOfColumns);
  if (this.numOfColumns > 2) {
    this.numOfColumns--;
    fillData(this);
  }
  console.log(this.numOfColumns);
} //oneLessColumn

async function mounted() {
  //Get data
  //Put into dictionary where key is kinda tech and value is quantity
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
  this.fillData(this);
}

export default {
  components: {
    HorizontalBar
  },
  data() {
    return {
      dataReceived: false,
      chartData: null,
      options: null,
      numOfColumns: 5,
      technologyPairs: 0
    };
  },
  computed: {
    a: function () {
      return this.numOfColumns;
    }
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
