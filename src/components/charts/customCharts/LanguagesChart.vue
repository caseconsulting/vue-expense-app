<template>
  <v-card v-if="dataReceived" class="pa-5">
    <bar-chart chartId="foreign-languages" :options="options" :chartData="chartData" />
  </v-card>
</template>

<script>
import BarChart from '../baseCharts/BarChart.vue';
import { storeIsPopulated, isEmpty } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * mounted lifecycle hook
 */
async function mounted() {
  if (this.storeIsPopulated) {
    await this.fetchData();
    await this.fillData();
  }
} // mounted

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Extracts the language array from each employee and tallies up each language for active employees.
 */
function fetchData() {
  this.employees = this.$store.getters.employees;
  this.employees.forEach((emp) => {
    if (!isEmpty(emp.languages) && emp.workStatus != 0) {
      emp.languages.forEach((lang) => {
        if (lang.name !== 'English') {
          if (this.languageOptions[lang.name]) {
            this.languageOptions[lang.name] += 1;
          } else {
            this.languageOptions[lang.name] = 1;
          }
        }
      });
    }
  });

  //sorts contents from most common languages to least
  let sortedLangs = Object.entries(this.languageOptions);
  sortedLangs = sortedLangs.sort((a, b) => {
    return b[1] - a[1];
  });

  //10 is just a limit to prevent an extremely long and crammed graph
  for (let i = 0; i < 10; i++) {
    if (sortedLangs.length > i) {
      this.languages.push(sortedLangs[i][0]);
      this.jobQuantities.push(sortedLangs[i][1]);
    }
  }
} //fetchData

/**
 * Sets the chart formatting and options data.
 */
function fillData() {
  let colors = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(230, 184, 156, 1)',
    'rgba(234, 210, 172, 1)',
    'rgba(156, 175, 183, 1)',
    'rgba(66, 129, 164, 1)'
  ];

  this.chartData = {
    labels: this.languages,
    datasets: [
      {
        data: this.jobQuantities,
        backgroundColor: colors
      }
    ]
  };

  this.options = {
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Language',
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
          text: 'Number of Employees',
          font: {
            weight: 'bold'
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Top Foreign Languages Case Consulting',
        font: {
          size: 15
        }
      }
    },
    maintainAspectRatio: false
  };
  this.dataReceived = true;
} // fillData

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: { BarChart },
  computed: {
    storeIsPopulated
  },
  data() {
    return {
      options: null,
      chartData: null,
      dataReceived: false,
      employees: null,
      languageOptions: {},
      languages: [],
      jobQuantities: []
    };
  },
  methods: { fetchData, fillData },
  mounted,
  watch: {
    storeIsPopulated: function () {
      if (this.storeIsPopulated) {
        this.fetchData();
        this.fillData();
      }
    }
  }
};
</script>
