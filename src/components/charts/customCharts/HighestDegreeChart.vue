<template>
  <v-card v-if="dataReceived">
    <pie-chart :options="options" :chartData="chartData" />
    <div class="center">
      <p class="font-weight-normal">Total Degrees: {{ degreeCount }}</p>
    </div>
  </v-card>
  <v-skeleton-loader v-else type="paragraph@5"></v-skeleton-loader>
</template>

<script>
import PieChart from '../baseCharts/PieChart.vue';
import api from '@/shared/api.js';
import _ from 'lodash';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');

/**
 * Initializes the degrees data field, this function retrieves the highest
 * degree for each employee.
 * @return array of objects - key: employee name, value: another array
 * containing objects w/ degree names + majors
 */
function initDegrees() {
  let degrees = {};
  this.employees.forEach((emp) => {
    let highestDegrees = [];
    if (emp.schools && emp.workStatus != 0) {
      _.forEach(emp.schools, (school) => {
        _.forEach(school.degrees, (degree) => {
          if (moment(degree.completionDate).isBefore(moment(new Date()))) {
            if (highestDegrees.length != 0) {
              let result = compareDegree(highestDegrees[0].name, degree.degreeType);
              //if a degree of a higher prestige is found, remove all previous entries
              if (result === 1) {
                highestDegrees.length = 0;
              }
              //Adds to highestDegrees, excluding degrees with a lower prestige
              if (result > -1) {
                highestDegrees.push({
                  name: this.getDegreeName(this.getDegreeValue(degree.degreeType)),
                  majors: degree.majors
                });
              }
            } else {
              //Adds the first degree found to the array
              highestDegrees.push({
                name: this.getDegreeName(this.getDegreeValue(degree.degreeType)),
                majors: degree.majors
              });
            }
          }
        });
      });
      degrees = addToDegrees(degrees, highestDegrees);
    }
  });
  return degrees;
} // initDegrees

/**
 * Helper function that parses through the existing data
 * in degrees and adds onto it.
 * @param degrees - The array of the highest degrees tallied up
 * @param highestDegrees - The array of all highest degrees
 * @returns Array - The finaly tally of each highest degrees
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
} // addToDegrees

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
} // compareDegree

/**
 * Get the object of concentrations for a degree and the count of each concentration.
 * @param degreeName - The name of the degree
 * @return Object - An object of concentrations with the number of occurrences found
 */
function getDegreeConcentrations(degreeName) {
  let concentrationsData = {};
  // loop through each employee
  this.employees.forEach((employee) => {
    if (employee.degrees) {
      // loop through each employee's degree
      employee.degrees.forEach((degree) => {
        // generalize each degree name to match pie chart categories (Bachelors of Science = Bachelors)
        if (getDegreeName(getDegreeValue(degree.name)) === degreeName) {
          // loop through each concentration
          degree.concentrations.forEach((concentration) => {
            /// count up each occurrence of a concentration
            if (concentrationsData[concentration]) {
              concentrationsData[concentration] += 1;
            } else {
              concentrationsData[concentration] = 1;
            }
          });
        }
      });
    }
  });
  return concentrationsData;
} // getDegreeConcentrations

/**
 * Get the object of minors for a degree and the count of each minor.
 * @param degreeName - The name of the degree
 * @return Object - An object of minors with the number of occurrences found
 */
function getDegreeMinors(degreeName) {
  let minorsData = {};
  // loop through each employee
  this.employees.forEach((employee) => {
    if (employee.degrees) {
      // loop through each employee's degree
      employee.degrees.forEach((degree) => {
        // generalize each degree name to match pie chart categories (Bachelors of Science = Bachelors)
        if (getDegreeName(getDegreeValue(degree.name)) === degreeName) {
          // loop through each minor
          degree.minors.forEach((minor) => {
            /// count up each occurrence of a minor
            if (minorsData[minor]) {
              minorsData[minor] += 1;
            } else {
              minorsData[minor] = 1;
            }
          });
        }
      });
    }
  });
  return minorsData;
} // getDegreeMinors

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
  if (degreeLower.includes('doctor') || degreeLower.includes('phd')) {
    return 3;
  } else {
    return 4;
  }
} // getDegreeValue

/**
 * Used to standardize the names of degrees
 * for labels
 * @param value - The number that the degree is associated with
 * @returns String - The name of the degree
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
      return 'PhD/Doctorate';
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
      text: 'Highest Degrees Obtained by Employees',
      fontSize: 15
    },
    maintainAspectRatio: false,
    responsive: true,
    onClick: (_, item) => {
      if (item[0]) {
        // emits to MajorsChart.vue when pie slice is clicked
        this.majorsEmit(labels[item[0]._index]);
        // emits to MinorsChart.vue when pie slice is clicked
        this.minorsEmit(labels[item[0]._index]);
        // emits to ConcentrationsChart.vue when pie slice is clicked
        this.concentrationsEmit(labels[item[0]._index]);
      }
    }
  };
  this.dataReceived = true;
  window.EventBus.$emit('hello');
} // fillData

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
/**
 * Send data to create a pie chart to display the minors for a degree.
 * @param degree - The name of the degree
 */
function minorsEmit(degree) {
  let minorsData = {};
  minorsData.minors = this.getDegreeMinors(degree);
  minorsData.degree = degree;
  window.EventBus.$emit('minors-update', minorsData);
}

/**
 * Send data to create a pie chart to display the concentrations for a degree.
 * @param degree - The name of the degree
 */
function concentrationsEmit(degree) {
  let concentrationsData = {};
  concentrationsData.concentrations = this.getDegreeConcentrations(degree);
  concentrationsData.degree = degree;
  window.EventBus.$emit('concentrations-update', concentrationsData);
}

export default {
  components: { PieChart },
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
    getDegreeMinors,
    getDegreeConcentrations,
    getDegreeName,
    majorsEmit,
    minorsEmit,
    concentrationsEmit
  },
  async created() {
    this.$forceUpdate();
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
