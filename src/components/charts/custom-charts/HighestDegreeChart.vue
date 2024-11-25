<template>
  <v-card v-if="dataReceived" class="pa-5 pb-0">
    <pie-chart ref="pieChart" chartId="highest-degree" :options="option" :chartData="chartData" />
    <p class="text-center">Total Degrees: {{ degreeCount }}</p>
  </v-card>
</template>

<script setup>
import PieChart from '../base-charts/PieChart.vue';
import _forEach from 'lodash/forEach';
import _filter from 'lodash/filter';
import _first from 'lodash/first';
import { onMounted, ref, watch, inject } from 'vue';
import { useStore } from 'vuex';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const chartData = ref(null);
const dataReceived = ref(false);
const degreeCount = ref(0);
const educations = ref(null);
const emitter = inject('emitter');
const employees = ref(null);
const option = ref(null);
const showMajors = ref(null);
const store = useStore();

// |--------------------------------------------------|
// |                                                  |
// |                LIFECYCLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * mounted lifecycle hook
 */
onMounted(async () => {
  if (store.getters.storeIsPopulated) {
    educations.value = await initDegrees();
    await fillData();
  }
}); // mounted

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Initializes the educations data field, this function retrieves the highest
 * degree for each employee.
 *
 * @return array of objects - key: employee name, value: another array
 * containing objects w/ degree names + majors
 */
function initDegrees() {
  let education = {};
  employees.value = store.getters.employees;
  employees.value.forEach((emp) => {
    let highestDegrees = [];
    if (emp.education && emp.workStatus != 0) {
      _forEach(emp.education, (edu) => {
        // handle universities
        if (edu.type === 'university') {
          _forEach(edu.degrees, (degree) => {
            if (highestDegrees.length != 0) {
              if (highestDegrees[0].type === 'Military') {
                highestDegrees.unshift({
                  name: getDegreeName(getDegreeValue(degree.degreeType)),
                  majors: degree.majors,
                  type: edu.type,
                  value: getDegreeValue(degree.degreeType)
                });
              } else {
                let result = compareDegree(highestDegrees[0].value, getDegreeValue(degree.degreeType));
                //if a degree of a higher prestige is found, remove all previous entries except militaries
                if (result === 1) {
                  highestDegrees = _filter(highestDegrees, (education) => {
                    return education.type === 'Military';
                  });
                  highestDegrees.unshift({
                    name: getDegreeName(getDegreeValue(degree.degreeType)),
                    majors: degree.majors,
                    type: edu.type,
                    value: getDegreeValue(degree.degreeType)
                  });
                }
                //Adds to highestDegrees, excluding degrees with a lower prestige
                if (result > -1 && result !== 1) {
                  highestDegrees.push({
                    name: getDegreeName(getDegreeValue(degree.degreeType)),
                    majors: degree.majors,
                    type: edu.type,
                    value: getDegreeValue(degree.degreeType)
                  });
                }
              }
            } else {
              //Adds the first degree found to the array
              highestDegrees.push({
                name: getDegreeName(getDegreeValue(degree.degreeType)),
                majors: degree.majors,
                type: edu.type,
                value: getDegreeValue(degree.degreeType)
              });
            }
          });
        } else if (edu.type === 'highSchool') {
          if (highestDegrees.length != 0) {
            if (highestDegrees[0].type === 'Military') {
              highestDegrees.unshift({
                type: 'High School',
                name: edu.name,
                value: getDegreeValue(edu.type)
              });
            } else {
              let result = compareDegree(highestDegrees[0].value, getDegreeValue(edu.type));
              //if a degree of a higher prestige is found, remove all previous entries except militaries
              if (result === 1) {
                highestDegrees = _filter(highestDegrees, (education) => {
                  return education.type === 'Military';
                });
                highestDegrees.unshift({
                  type: 'High School',
                  name: edu.name,
                  value: getDegreeValue(edu.type)
                });
              }
              //Adds to highestDegrees, excluding degrees with a lower prestige
              if (result > -1) {
                highestDegrees.push({
                  type: 'High School',
                  name: edu.name,
                  value: getDegreeValue(edu.type)
                });
              }
            }
          } else {
            //Adds the first degree found to the array
            highestDegrees.push({
              type: 'High School',
              name: edu.name,
              value: getDegreeValue(edu.type)
            });
          }
        } else if (edu.type === 'military') {
          highestDegrees.push({
            type: 'Military',
            name: edu.branch,
            value: getDegreeValue(edu.type)
          });
        }
      });
      education = addToEducation(education, highestDegrees);
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
        let schools = { [highestEdu.name || highestEdu.branch]: 1 };
        //if the name of the degree isnt in collection
        education[highestEdu.type] = schools;
      } else {
        if (!education[highestEdu.type][highestEdu.name || highestEdu.branch]) {
          //used to update the count of each major
          education[highestEdu.type][highestEdu.name || highestEdu.branch] = 1;
        } else {
          education[highestEdu.type][highestEdu.name || highestEdu.branch] += 1;
        }
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
  employees.value.forEach((employee) => {
    if (employee.education) {
      // loop through each employee's educations
      employee.education.forEach((edu) => {
        if (edu.type === 'university') {
          //loop through each degree for the school
          edu.degrees.forEach((degree) => {
            // generalize each degree name to match pie chart categories (Bachelors of Science = Bachelors)
            if (getDegreeName(getDegreeValue(degree.degreeType)) === degreeName) {
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
  employees.value.forEach((employee) => {
    if (employee.education) {
      // loop through each employee's educations
      employee.education.forEach((edu) => {
        if (edu.type === 'university') {
          edu.degrees.forEach((degree) => {
            // generalize each degree name to match pie chart categories (Bachelors of Science = Bachelors)
            if (getDegreeName(getDegreeValue(degree.degreeType)) === degreeName) {
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
  if (degreeLower.includes('high')) {
    return 0;
  }
  if (degreeLower.includes('associate')) {
    return 1;
  }
  if (degreeLower.includes('bachelor')) {
    return 2;
  }
  if (degreeLower.includes('master')) {
    return 3;
  }
  if (degreeLower.includes('doctor') || degreeLower.includes('phd')) {
    return 4;
  }
  if (degreeLower.includes('military')) {
    return 25;
  } else {
    return 5;
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
      return 'High School';
    case 1:
      return 'Associate';
    case 2:
      return 'Bachelor';
    case 3:
      return 'Master';
    case 4:
      return 'PhD/Doctorate';
    case 25:
      return 'Military';
    default:
      return 'Other';
  }
} // getDegreeName

/**
 * Populates the data to display.
 */
function fillData() {
  let quantities = [];
  let labels = Object.keys(educations.value);
  _forEach(labels, (education) => {
    let counts = 0;
    _forEach(educations.value[education], (count) => {
      counts += count;
      degreeCount.value += count;
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
  chartData.value = {
    labels: labels,
    datasets: [
      {
        data: quantities,
        backgroundColor: colors
      }
    ]
  };

  option.value = {
    onClick: (x, y) => {
      if (_first(y)) {
        let index = _first(y).index;
        // emits to MajorsChart.vue when pie slice is clicked
        majorsEmit(chartData.value.labels[index]);
        // emits to MinorsChart.vue when pie slice is clicked
        minorsEmit(chartData.value.labels[index]);
        // emits to ConcentrationsChart.vue when pie slice is clicked
        concentrationsEmit(chartData.value.labels[index]);
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Highest Educations Obtained by Employees',
        font: {
          size: 15
        }
      },
      subtitle: {
        display: true,
        font: {
          style: 'italic'
        }
      }
    },
    maintainAspectRatio: false
  };
  dataReceived.value = true;
} // fillData

/**
 * Sends data to create the second pie chart that displays
 * info about education majors/schools.
 *
 * @param edu - object that holds the name of the education as a key and holds
 * a nested object w/ key of the major/school and value of the quantity
 */
function majorsEmit(edu) {
  let majorsOrSchoolsData = {};
  majorsOrSchoolsData.majorsOrSchools = educations.value[edu];
  majorsOrSchoolsData.eduKind = edu;
  showMajors.value = true;
  let title = edu === 'High School' ? 'Top High Schools' : edu === 'Military' ? 'Top Military Branches' : '';

  emitter.emit('majors-update', majorsOrSchoolsData, title);
} // majorsEmit

/**
 * Send data to create a pie chart to display the minors for a degree.
 *
 * @param degree - The name of the degree
 */
function minorsEmit(degree) {
  let minorsData = {};
  minorsData.minors = getDegreeMinors(degree);
  minorsData.degree = degree;
  emitter.emit('minors-update', minorsData);
} // minorsEmit

/**
 * Send data to create a pie chart to display the concentrations for a degree.
 *
 * @param degree - The name of the degree
 */
function concentrationsEmit(degree) {
  let concentrationsData = {};
  concentrationsData.concentrations = getDegreeConcentrations(degree);
  concentrationsData.degree = degree;
  emitter.emit('concentrations-update', concentrationsData);
} // concentrationsEmit

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

watch(
  () => store.getters.storeIsPopulated,
  () => {
    educations.value = initDegrees();
    fillData();
  }
);
</script>

<style>
.center {
  padding-top: 15px;
  text-align: center;
}
</style>
