<template>
  <v-card v-if="dataReceived" class="pa-5 pb-0">
    <pie-chart ref="pieChart" chartId="highest-degree" :options="options" :chartData="chartData" />
    <p class="text-center">Total Degrees: {{ degreeCount }}</p>
  </v-card>
</template>

<script>
import PieChart from '../baseCharts/PieChart.vue';
import _ from 'lodash';
import { storeIsPopulated } from '@/utils/utils';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');

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
    this.degrees = await this.initDegrees();
    await this.fillData();
  }
} // mounted

/**
 * Calls the destroy chart function in the base chart.
 */
function beforeDestroy() {
  this.$refs.pieChart.destroyChart();
} // beforeDestroy

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Initializes the degrees data field, this function retrieves the highest
 * degree for each employee.
 *
 * @return array of objects - key: employee name, value: another array
 * containing objects w/ degree names + majors
 */
function initDegrees() {
  let education = {};
  this.employees = this.$store.getters.employees;
  this.employees.forEach((emp) => {
    let highestDegrees = [];
    if (emp.education && emp.workStatus != 0) {
      _.forEach(emp.education, (edu) => {
        // handle universities
        if (edu.type === 'university') {
          _.forEach(edu.degrees, (degree) => {
            if (moment(degree.completionDate).isBefore(moment(new Date()))) {
              if (highestDegrees.length != 0) {
                let result = this.compareDegree(highestDegrees[0].name, degree.degreeType);
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
                  majors: degree.majors,
                  type: edu.type
                });
              }
            }
          });
        } else if (edu.type === 'highSchool') {
          highestDegrees.push({
            type: edu.type
          });
        }
      });
      education = this.addToEducation(education, highestDegrees);
    }
  });
  return education;
} // initDegrees

/**
 * Helper function that parses through the existing data
 * in education and adds onto it.
 *
 * @param education - The array of the highest education tallied up
 * @param highestEdus - The array of all highest educations
 * @return Array - The final tally of each highest educations
 */
function addToEducation(education, highestEdus) {
  highestEdus.forEach((highestEdu) => {
    if (highestEdu.type === 'university') {
      if (!education[highestEdu.name]) {
        //if the name of the degree isnt in collection
        let majors = {};
        highestEdu.majors.forEach((major) => {
          majors[major] = 1;
        });
        education[highestEdu.name] = majors;
      } else {
        //if the name of the degree is in the collection
        highestEdu.majors.forEach((major) => {
          if (!education[highestEdu.name][major]) {
            //used to update the count of each major
            education[highestEdu.name][major] = 1;
          } else {
            education[highestEdu.name][major] += 1;
          }
        });
      }
    } else {
      if (!education[highestEdu.type]) {
        //if the name of the degree isnt in collection
        education[highestEdu.type] = 1;
      } else {
        education[highestEdu.type] += 1;
      }
    }
  });
  return education;
} // addToEducation

/**
 * Compares the relationship between two degrees,
 *
 * @param oldDegree - first degree to compare
 * @param newDegree - second degree to compare
 * @return 1: newDegree is more prestigious
 * @return -1: oldDegree is more presitigious
 * @return 0: degrees have the same prestige
 */
function compareDegree(oldDegree, newDegree) {
  oldDegree = this.getDegreeValue(oldDegree);
  newDegree = this.getDegreeValue(newDegree);
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
 *
 * @param degreeName - The name of the degree
 * @return Object - An object of concentrations with the number of occurrences found
 */
function getDegreeConcentrations(degreeName) {
  let concentrationsData = {};
  // loop through each employee
  this.employees.forEach((employee) => {
    if (employee.education) {
      // loop through each employee's educations
      employee.education.forEach((edu) => {
        if (edu.type === 'university') {
          //loop through each degree for the school
          edu.degrees.forEach((degree) => {
            // generalize each degree name to match pie chart categories (Bachelors of Science = Bachelors)
            if (this.getDegreeName(this.getDegreeValue(degree.degreeType)) === degreeName) {
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
    }
  });
  return concentrationsData;
} // getDegreeConcentrations

/**
 * Get the object of minors for a degree and the count of each minor.
 *
 * @param degreeName - The name of the degree
 * @return Object - An object of minors with the number of occurrences found
 */
function getDegreeMinors(degreeName) {
  let minorsData = {};
  // loop through each employee
  this.employees.forEach((employee) => {
    if (employee.education) {
      // loop through each employee's educations
      employee.education.forEach((edu) => {
        if (edu.type === 'university') {
          edu.degrees.forEach((degree) => {
            // generalize each degree name to match pie chart categories (Bachelors of Science = Bachelors)
            if (this.getDegreeName(this.getDegreeValue(degree.degreeType)) === degreeName) {
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
 *
 * @param degree - degree
 * @return int - number assigned to degree for ordering
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
 *
 * @param value - The number that the degree is associated with
 * @return String - The name of the degree
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
} // getDegreeName

/**
 * Populates the data to display
 */
function fillData() {
  let quantities = [];
  let labels = Object.keys(this.degrees);
  _.forEach(labels, (degree) => {
    let counts = 0;
    _.forEach(this.degrees[degree], (count) => {
      counts += count;
      this.degreeCount += count;
    });
    quantities.push(counts);
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
    onClick: (x, y) => {
      if (_.first(y)) {
        let index = _.first(y).index;
        // emits to MajorsChart.vue when pie slice is clicked
        this.majorsEmit(this.chartData.labels[index]);
        // emits to MinorsChart.vue when pie slice is clicked
        this.minorsEmit(this.chartData.labels[index]);
        // emits to ConcentrationsChart.vue when pie slice is clicked
        this.concentrationsEmit(this.chartData.labels[index]);
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Highest Degrees Obtained by Employees',
        font: {
          size: 15
        }
      }
    },
    maintainAspectRatio: false
  };
  this.dataReceived = true;
} // fillData

/**
 * Sends data to create the second pie chart that displays
 * info about degree majors
 *
 * @param degree - object that holds the name of the degree as a key and holds
 * a nested object w/ key of the major and value of the quantity
 */
function majorsEmit(degree) {
  let majorsData = {};
  majorsData.majors = this.degrees[degree];
  majorsData.degree = degree;
  this.showMajors = true;
  window.EventBus.$emit('majors-update', majorsData);
} // majorsEmit

/**
 * Send data to create a pie chart to display the minors for a degree.
 *
 * @param degree - The name of the degree
 */
function minorsEmit(degree) {
  let minorsData = {};
  minorsData.minors = this.getDegreeMinors(degree);
  minorsData.degree = degree;
  window.EventBus.$emit('minors-update', minorsData);
} // minorsEmit

/**
 * Send data to create a pie chart to display the concentrations for a degree.
 *
 * @param degree - The name of the degree
 */
function concentrationsEmit(degree) {
  let concentrationsData = {};
  concentrationsData.concentrations = this.getDegreeConcentrations(degree);
  concentrationsData.degree = degree;
  window.EventBus.$emit('concentrations-update', concentrationsData);
} // concentrationsEmit

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
      options: null,
      chartData: null,
      degrees: null,
      showMajors: false,
      degreeCount: 0
    };
  },
  methods: {
    addToEducation,
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
  beforeDestroy,
  mounted,
  watch: {
    storeIsPopulated: function () {
      if (this.storeIsPopulated) {
        this.degrees = this.initDegrees();
        this.fillData();
      }
    }
  }
};
</script>

<style>
.center {
  padding-top: 15px;
  text-align: center;
}
</style>
