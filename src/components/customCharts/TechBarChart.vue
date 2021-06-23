<template>
  <horizontal-bar v-if="dataReceived" :options="options" :chartData="chartData"></horizontal-bar>
</template>

<script>
import HorizontalBar from '../baseCharts/HorizontalBarChart.vue';
import api from '@/shared/api.js';

async function fillData() {
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
  let technologyPairs = Object.entries(technologies);
  technologyPairs = technologyPairs.sort((a, b) => {
    return b[1] - a[1];
  });

  technologyPairs = technologyPairs.slice(0, 5);

  let labels = [];
  let values = [];

  for (let i = 0; i < technologyPairs.length; i++) {
    labels.push(technologyPairs[i][0]);
    values.push(technologyPairs[i][1]);
  }

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
      text: 'Top 5 Technologies Used By Employees'
    }
  };
  this.dataReceived = true;
} //fillData
export default {
  components: {
    HorizontalBar
  },
  data() {
    return {
      dataReceived: false,
      chartData: null,
      options: null
    };
  },
  methods: {
    fillData
  },
  mounted() {
    this.fillData();
  }
};
</script>

<style></style>
