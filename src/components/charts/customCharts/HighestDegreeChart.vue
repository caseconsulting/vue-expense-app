<template>
  <v-container>
    <v-row>
      <v-col md="6" sm="12">
        <pie-chart v-if="dataReceived" :options="options" :chartData="chartData" />
        <!-- <h4 v-if="degrees">Total Degrees: {{ degreeCount }}</h4> -->
        <div class="center">
          <p class="font-weight-normal">Total Degrees: {{ degreeCount }}</p>
        </div>
      </v-col>
      <v-col md="6" sm="12">
        <MajorsChart />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import PieChart from '../baseCharts/PieChart.vue';
import MajorsChart from './MajorsChart.vue';
import api from '@/shared/api.js';
import _ from 'lodash';

/**
 * Initializes the degrees data field, this function retrieves the highest
 * degree for each employee
 * @return array of objects - key: employee name, value: another array
 * containing objects w/ degree names + majors
 */
function initDegrees() {
  let degrees = {};
  this.employees.forEach((emp) => {
    let highestDegrees = [];
    if (emp.degrees) {
      let first = false;
      _.forEach(emp.degrees, (degree) => {
        //iterates thru all degrees per employees
        if (highestDegrees.length === 0) {
          highestDegrees.push({
            name: this.getDegreeName(this.getDegreeValue(degree.name)),
            majors: degree.majors
          });
        }
        let result = compareDegree(highestDegrees[0].name, degree.name);
        if (result === 1) {
          //if a higher level degree is found
          highestDegrees = [];
          highestDegrees.push({
            name: this.getDegreeName(this.getDegreeValue(degree.name)),
            majors: degree.majors
          });
        } else if (result === 0 && first) {
          //if another degree of the same presitige is found
          highestDegrees.push({
            name: this.getDegreeName(this.getDegreeValue(degree.name)),
            majors: degree.majors
          });
        }
        first = true;
      });
      degrees = addToDegrees(degrees, highestDegrees);
    }
  });
  return degrees;
}

/**
 * Helper function that parses through the existing data
 * in degrees and adds onto it
 */
function addToDegrees(degrees, highestDegrees) {
  highestDegrees.forEach((highestDegree) => {
    if (!degrees[highestDegree.name]) {
      //if the name of the degree isnt in collection
      let majors = {};
      highestDegree.majors.forEach((major) => {
        majors[major] = 1;
      });
      degrees[highestDegree.name] = majors;
    } else {
      //if the name of the degree is in the collection
      highestDegree.majors.forEach((major) => {
        if (!degrees[highestDegree.name][major]) {
          //used to update the count of each major
          degrees[highestDegree.name][major] = 1;
        } else {
          degrees[highestDegree.name][major] += 1;
        }
      });
    }
  });
  return degrees;
}

/**
 * Compares the relationship between two degrees,
 * @return 1: newDegree is more prestigious
 * @return -1: oldDegree is more presitigious
 * @return 0: degrees have the same prestige
 */
function compareDegree(oldDegree, newDegree) {
  oldDegree = getDegreeValue(oldDegree);
  newDegree = getDegreeValue(newDegree);
  if (oldDegree > newDegree) {
    return -1;
  }
  if (oldDegree < newDegree) {
    return 1;
  }
  if (oldDegree === newDegree) {
    return 0;
  }
}

/**
 * Assigns a value to each degree. If a degree is
 * not matched to a traditional college degree, it assumes
 * that the employee attended a different institution by
 * returning 5.
 * (trade school, etc.)
 */
function getDegreeValue(degree) {
  let degreeLower = degree.toLowerCase();
  if (degreeLower.includes('associate')) {
    return 0;
  }
  if (degreeLower.includes('bachelor')) {
    return 1;
  }
  if (degreeLower.includes('master')) {
    return 2;
  }
  if (degreeLower.includes('doctor')) {
    return 3;
  }
  if (degreeLower.includes('phd')) {
    return 4;
  } else {
    return 5;
  }
}

/**
 * Used to standardize the names of degrees
 * for labels
 */
function getDegreeName(value) {
  switch (value) {
    case 0:
      return 'Associate';
    case 1:
      return 'Bachelor';
    case 2:
      return 'Master';
    case 3:
      return 'Doctorate';
    case 4:
      return 'PHD';
    default:
      return 'Other';
  }
}

/**
 * Populates the data to display
 */
function fillData() {
  let labels = Object.keys(this.degrees);
  let quantities = [];
  _.forEach(this.degrees, (degree) => {
    let quantity = 0;
    _.forEach(Object.keys(degree), (major) => {
      quantity += degree[major];
      this.degreeCount += degree[major];
    });
    quantities.push(quantity);
  });

  let colors = [
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 99, 132, 1)'
  ];
  this.chartData = {
    labels: labels,
    datasets: [
      {
        data: quantities,
        backgroundColor: colors
      }
    ]
  };
  this.options = {
    title: {
      display: true,
      text: 'Highest Degrees Obtained by Employees'
    },
    maintainAspectRatio: false,
    responsive: true,
    onClick: (_, item) => {
      this.majorsEmit(labels[item[0]._index]);
    }
  };
  this.dataReceived = true;
}

/**
 * Sends data to create the second pie chart that displays
 * info about degree majors
 * @param degree - object that holds the name of the degree as a key and holds
 * a nested object w/ key of the major and value of the quantity
 */
function majorsEmit(degree) {
  let majorsData = {};
  majorsData.majors = this.degrees[degree];
  majorsData.degree = degree;
  this.showMajors = true;
  window.EventBus.$emit('majors-update', majorsData);
}

export default {
  components: { PieChart, MajorsChart },
  data() {
    return {
      dataReceived: false,
      options: null,
      chartData: null,
      degrees: null,
      showMajors: false,
      degreeCount: 0
    };
  },
  methods: {
    addToDegrees,
    fillData,
    compareDegree,
    initDegrees,
    getDegreeValue,
    getDegreeName,
    majorsEmit
  },
  async created() {
    this.employees = await api.getItems(api.EMPLOYEES);
    this.degrees = this.initDegrees();
    this.fillData();
  }
};
</script>

<style>
.center {
  padding-top: 15px;
  text-align: center;
}
</style>
