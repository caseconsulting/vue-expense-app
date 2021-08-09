<template>
  <v-card v-if="dataReceived" class="pa-5">
    <bar-chart :options="options" :chartData="chartData"></bar-chart>
  </v-card>
  <v-skeleton-loader v-else type="paragraph@5"></v-skeleton-loader>
</template>

<script>
import api from '@/shared/api.js';
import BarChart from '../baseCharts/BarChart.vue';
async function fillCertData() {
  let employees = await api.getItems(api.EMPLOYEES);
  //Get data
  //Put into dictionary where key is kinda tech and value is quantity
  let certifications = {};

  employees.forEach((employee) => {
    if (employee.certifications) {
      employee.certifications.forEach((currCert) => {
        if (!certifications[currCert.name]) {
          certifications[currCert.name] = 1;
        } else {
          certifications[currCert.name] += 1;
        }
      });
    }
  });

  //We now sort the entries
  let certificationPairs = Object.entries(certifications);
  certificationPairs = certificationPairs.sort((a, b) => {
    return b[1] - a[1];
  });

  certificationPairs = certificationPairs.slice(0, 5);

  let labels = [];
  let values = [];

  for (let i = 0; i < certificationPairs.length; i++) {
    if (certificationPairs[i][0].length > 30) {
      labels.push(breakSentence(certificationPairs[i][0]));
    } else {
      labels.push(certificationPairs[i][0]);
    }
    values.push(certificationPairs[i][1]);
  }

  //We cycle through these colors to get the bar colors
  let colors = [
    'rgba(254, 147, 140, 1)',
    'rgba(230, 184, 156, 1)',
    'rgba(234, 210, 172, 1)',
    'rgba(156, 175, 183, 1)',
    'rgba(66, 129, 164, 1)'
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
            labelString: 'Name of Certification',
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
            labelString: 'Number of Employees',
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
      text: 'Top ' + values.length + ' Certifications Used by Employees',
      fontSize: 15
    },
    maintainAspectRatio: false
  };
  this.dataReceived = true;
} //fillCertData

function breakSentence(s) {
  var middle = Math.floor(s.length / 2);
  var before = s.lastIndexOf(' ', middle);
  var after = s.indexOf(' ', middle + 1);

  if (middle - before < after - middle) {
    middle = before;
  } else {
    middle = after;
  }
  var returnArr = [s.substr(0, middle), s.substr(middle + 1)];
  return returnArr;
} //breakSentence

export default {
  components: { BarChart },
  data() {
    return {
      options: null,
      chartData: null,
      dataReceived: false
    };
  },
  methods: {
    fillCertData,
    breakSentence
  },
  mounted() {
    this.$forceUpdate();
    this.fillCertData();
  }
};
</script>

<style></style>
