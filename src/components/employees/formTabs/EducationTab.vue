Education
<template>
  <div>
    <!-- Loop Education -->
    <div class="gray-border ma-0 py-3 px-5" v-for="(school, index) in editedDegrees" :key="index">
      <!-- Name of School -->
      <v-autocomplete
        ref="formFields"
        v-model="school.name"
        :rules="[...getRequiredRules(), duplicateSchool(school.name)]"
        :items="schoolNamePlaceholder(school.name)"
        label="School"
        data-vv-name="School"
        clearable
      ></v-autocomplete>

      <div v-for="(degree, dIndex) in school.degrees" :key="`${index} , ${dIndex}`">
        <!-- Name of Degree -->
        <div v-if="school.degrees.length === 1">
          <v-select
            ref="formFields"
            v-model="degree.degreeType"
            :rules="getRequiredRules()"
            :items="degreeDropDown"
            label="Degree"
            data-vv-name="Degree"
            clearable
          >
          </v-select>
        </div>
        <div v-else>
          <v-select
            ref="formFields"
            v-model="degree.degreeType"
            :rules="getRequiredRules()"
            :items="degreeDropDown"
            label="Degree"
            data-vv-name="Degree"
            clearable
            append-outer-icon="delete"
          >
            <v-tooltip bottom slot="append-outer">
              <template v-slot:activator="{ on }">
                <v-btn v-on="on" @click="deleteDegree(index, dIndex)" text icon
                  ><v-icon class="case-gray pr-1">delete</v-icon></v-btn
                >
              </template>
              <span>Delete Degree</span>
            </v-tooltip>
          </v-select>
        </div>

        <!-- Month and Year of Completion -->
        <v-menu
          v-model="degree.showEducationMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              ref="formFields"
              :value="degree.completionDate | formatDateMonthYear"
              label="Completion Date"
              prepend-icon="event"
              :rules="getDateMonthYearRules()"
              hint="MM/YYYY format"
              v-mask="'##/####'"
              persistent-hint
              v-on="on"
              @blur="degree.completionDate = parseEventDate($event)"
              clearable
              @input="degree.showEducationMenu = false"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="degree.completionDate"
            no-title
            @input="degree.showEducationMenu = false"
            type="month"
          ></v-date-picker>
        </v-menu>
        <!-- End Month and Year of Completion -->

        <!-- Majors -->
        <!-- Loop Majors -->
        <div v-for="(major, mIndex) in degree.majors" :key="'major: ' + major + mIndex">
          <!-- Majors -->
          <v-combobox
            ref="formFields"
            v-model="degree.majors[mIndex]"
            :rules="[...getRequiredRules(), duplicateDiscipline('majors', major, index, dIndex)]"
            :items="majorDropDown"
            label="Major"
            data-vv-name="Major"
            clearable
          >
            <v-tooltip v-if="degree.majors.length > 1" bottom slot="append-outer">
              <template v-slot:activator="{ on }">
                <v-btn text icon v-on="on" @click="deleteItem(degree.majors, mIndex)"
                  ><v-icon class="case-gray">delete</v-icon></v-btn
                >
              </template>
              <span>Delete Major</span>
            </v-tooltip>
          </v-combobox>
        </div>
        <!-- End Loop Majors -->
        <!-- Button to Add Major -->
        <div align="center" class="py-2">
          <v-btn @click="addItem(degree.majors)" depressed outlined small>Add a Major</v-btn>
        </div>
        <!-- End Majors -->

        <!-- Minors -->
        <!-- Loops Minors -->
        <div v-for="(minor, mIndex) in degree.minors" :key="'minor: ' + minor + mIndex">
          <v-autocomplete
            ref="formFields"
            v-model="degree.minors[mIndex]"
            :rules="[...getRequiredRules(), duplicateDiscipline('minors', minor, index, dIndex)]"
            :items="minorDropDown"
            label="Minor"
            data-vv-name="Minor"
            clearable
          >
            <v-tooltip bottom slot="append-outer">
              <template v-slot:activator="{ on }">
                <v-btn text icon v-on="on" @click="deleteItem(degree.minors, mIndex)">
                  <v-icon class="case-gray">delete</v-icon>
                </v-btn>
              </template>
              <span>Delete Minor</span>
            </v-tooltip>
          </v-autocomplete>
        </div>
        <!-- End Loops Minors -->
        <!-- Button to Add Minor -->
        <div align="center" class="py-2">
          <v-btn @click="addItem(degree.minors)" depressed outlined small>Add a Minor</v-btn>
        </div>
        <!-- End Minors -->

        <!-- Concentrations -->
        <!-- Loop Concentrations -->
        <div v-for="(concentration, cIndex) in degree.concentrations" :key="'conc: ' + concentration + cIndex">
          <v-autocomplete
            ref="formFields"
            v-model="degree.concentrations[cIndex]"
            :rules="[...getRequiredRules(), duplicateDiscipline('concentrations', concentration, index, dIndex)]"
            :items="concentrationDropDown"
            data-vv-name="Concentration"
            clearable
            label="Concentration"
          >
            <v-tooltip bottom slot="append-outer">
              <template v-slot:activator="{ on }">
                <v-btn text icon v-on="on" @click="deleteItem(degree.concentrations, cIndex)">
                  <v-icon class="case-gray">delete</v-icon>
                </v-btn>
              </template>
              <span>Delete Concentration</span>
            </v-tooltip>
          </v-autocomplete>
        </div>
        <!-- End Loop Concentrations -->
        <!-- Button to Add Concentration -->
        <div align="center" class="py-2">
          <v-btn @click="addItem(degree.concentrations)" depressed outlined small>Add a Concentration</v-btn>
        </div>
        <!-- End Concentrations -->
      </div>
      <!-- Button to Add Degrees -->
      <div class="pt-4" align="center">
        <v-btn @click="addDegree(index)" elevation="2"><v-icon class="pr-1">add</v-icon>Degree</v-btn>
      </div>
      <div v-if="!allowAdditions" align="center" class="pb-4">
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-icon v-on="on" large right color="red" @click="denyEducation">close</v-icon>
          </template>
          <span>Ignore Pending Change</span>
        </v-tooltip>
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-icon v-on="on" large left color="green" @click="confirmEducation">done</v-icon>
          </template>
          <span>Add Pending Change</span>
        </v-tooltip>
      </div>
      <!-- Button to Delete School -->
      <div class="pb-4" align="center" v-if="allowAdditions">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" @click="deleteSchool(index)" text icon
              ><v-icon class="case-gray pr-1">delete</v-icon></v-btn
            >
          </template>
          <span>Delete School</span>
        </v-tooltip>
      </div>
    </div>
    <!-- End Loop Education -->

    <!-- Button to Add Degress -->
    <div v-if="allowAdditions" class="pt-4" align="center">
      <v-btn @click="addSchool()" elevation="2"><v-icon class="pr-1">add</v-icon>School</v-btn>
    </div>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';
import { getDateMonthYearRules, getRequiredRules } from '@/shared/validationUtils.js';
import { formatDateMonthYear, parseDateMonthYear } from '@/utils/utils';
import { mask } from 'vue-the-mask';
import { majorsAndMinors } from './Dropdown Info/majorsAndMinors';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data.
 */
async function created() {
  window.EventBus.$emit('created', 'education'); // emit education tab was created
  this.employees = this.$store.getters.employees; // get all employees
  this.schoolDropDown = await api.getColleges('');

  let alias = this.schoolDropDown.indexOf('Virginia Polytechnic Institute and State University');
  this.schoolDropDown[alias] = 'Virginia Polytechnic Institute and State University (Virginia Tech)';
  alias = this.schoolDropDown.indexOf('University of Mississippi');
  this.schoolDropDown[alias] = 'University of Mississippi (Ole Miss)';
  alias = this.schoolDropDown.indexOf('United States Military Academy');
  this.schoolDropDown[alias] = 'United States Military Academy (West Point)';
  alias = this.schoolDropDown.indexOf('Northern Virginia Community College');
  this.schoolDropDown[alias] = 'Northern Virginia Community College (NoVa)';
  alias = this.schoolDropDown.indexOf('Georgia Institute of Technology');
  this.schoolDropDown[alias] = 'Georgia Institute of Technology (Georgia Tech)';
  alias = this.schoolDropDown.indexOf('Florida Institute of Technology');
  this.schoolDropDown[alias] = 'Florida Institute of Technology (Florida Tech)';
  alias = this.schoolDropDown.indexOf('City University of New York');
  this.schoolDropDown[alias] = 'City University of New York (City Tech)';
  alias = this.schoolDropDown.indexOf('California Institute of Technology');
  this.schoolDropDown[alias] = 'California Institute of Technology (Caltech)';

  // add schools not included in getColleges api call
  this.schoolDropDown.push('Belmont Abbey College');

  //update drop downs with majors and minors not on the list
  this.updateDropdowns();
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits the degrees.
 */
function confirmEducation() {
  this.$emit('confirm', this.editedDegrees);
} // confirmEducation

/**
 * Emits a message if the education is denied by user.
 */
function denyEducation() {
  this.$emit('deny');
} // denyEducation

/**
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM format
 */
function parseEventDate() {
  return this.parseDateMonthYear(event.target.value);
} //parseEventDate

/**
 * Adds a school.
 */
function addSchool() {
  if (!this.editedDegrees) this.editedDegrees = [];
  this.editedDegrees.push({
    name: '',
    degrees: [
      {
        completionDate: null,
        concentrations: [],
        degreeType: '',
        majors: [''],
        minors: [],
        showEducationMenu: false
      }
    ]
  });
} // addSchool

/**
 * Add an empty minor/major/concentration.
 *
 * @param array - array to add item to.
 */
function addItem(array) {
  array.push('');
} //addItem

/**
 * Add an empty Degree for a school.
 *
 * @param index - index of school to add degree to
 */
function addDegree(index) {
  let school = this.editedDegrees[index];
  school.degrees.push({
    completionDate: null,
    concentrations: [],
    degreeType: '',
    majors: [''],
    minors: [],
    showEducationMenu: false
  });
} // addDegree

/**
 * Deletes a Degree.
 *
 * @param index - array index of school
 * @param dIndex - array index of degree to delete
 */
function deleteDegree(index, dIndex) {
  let school = this.editedDegrees[index];
  school.degrees.splice(dIndex, 1);
} // deleteDegree

/**
 * Deletes a School
 *
 * @param index - array index of school
 */
function deleteSchool(index) {
  this.editedDegrees.splice(index, 1);
} // deleteSchool

/**
 * Deletes a minor/major/concentration.
 *
 * @param array - array to remove item from.
 * @param index - array index of item to delete
 */
function deleteItem(array, index) {
  array.splice(index, 1);
} // deleteItem

/**
 * Uses the last saved school as a placeholder for the dropdown until the API loads
 * @param schoolName - value of the last saved school
 * @returns one-item array or result of getColleges API call
 */
function schoolNamePlaceholder(schoolName) {
  return _.isEmpty(this.schoolDropDown) ? [schoolName] : this.schoolDropDown;
} // confirmEducation

/**
 * Changes the format of the string to title case
 *
 * @param str - the string to be converted
 * @return string - the title case formatted string
 */
function titleCase(str) {
  str = str.toLowerCase().split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(' ');
} // titleCase

/**
 * updates the dropdowns with employee data
 */
function updateDropdowns() {
  let employeesMajorsAndMinors = _.map(this.employees, (employee) => {
    let majorsAndMinors = _.map(employee.schools, (school) => {
      return _.map(school.degrees, (degree) => {
        if (degree.majors && degree.minors) {
          return degree.majors.concat(degree.minors);
        } else if (degree.majors) {
          return degree.majors;
        } else {
          return degree.minors;
        }
      });
    });

    return _.flattenDeep(majorsAndMinors);
  }); //extract technology

  //remove empty arrays
  let majorsAndMinors = _.remove(employeesMajorsAndMinors, (degrees) => {
    return degrees.length != 0;
  });

  majorsAndMinors = _.flattenDeep(majorsAndMinors);
  majorsAndMinors = _.compact(majorsAndMinors);

  // //combine with no duplicates
  this.concentrationDropDown = _.uniq([...this.concentrationDropDown, ...majorsAndMinors]);
  this.majorDropDown = _.uniq([...this.majorDropDown, ...majorsAndMinors]);
  this.minorDropDown = _.uniq([...this.minorDropDown, ...majorsAndMinors]);
} // updateDropdowns

/**
 * Validate all input fields are valid. Emit to parent the error status.
 */
function validateFields() {
  let errorCount = 0;
  //ensures that refs are put in an array so we can reuse forEach loop
  let components = !_.isArray(this.$refs.formFields) ? [this.$refs.formFields] : this.$refs.formFields;

  _.forEach(components, (field) => {
    if (field && !field.validate()) errorCount++;
  });
  window.EventBus.$emit('educationStatus', errorCount); // emit error status
  window.EventBus.$emit('doneValidating', 'education', this.editedDegrees); // emit done validating
} // validateFields

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for validating - validates fields
 *
 * @param val - val prop that needs to exist before validating
 */
function watchValidating(val) {
  if (val) {
    // parent component triggers validation
    this.validateFields();
  }
} // watchValidating

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  data() {
    return {
      concentrationDropDown: _.map(majorsAndMinors, (elem) => titleCase(elem)), // autocomplete concentration options
      duplicateDiscipline: (title, discipline, schoolIndex, degreeIndex) => {
        let disciplines = this.editedDegrees[schoolIndex].degrees[degreeIndex][title];
        let count = _.countBy(disciplines, (dis) => {
          return dis === discipline;
        });
        return count.true === 1 || 'Duplicate field found, please remove duplicate entries';
      },
      duplicateSchool: (name) => {
        let count = _.countBy(this.editedDegrees, (sch) => {
          return sch.name === name;
        });
        return count.true === 1 || 'Duplicate school found, please remove duplicate entries';
      },
      editedDegrees: _.cloneDeep(this.model), // stores edited degree info
      degreeDropDown: ['Associates', 'Bachelors', 'Masters', 'PhD/Doctorate', 'Other (trade school, etc)'], // autocomplete degree name options
      majorDropDown: _.map(majorsAndMinors, (elem) => titleCase(elem)), // autocomplete major options
      minorDropDown: _.map(majorsAndMinors, (elem) => titleCase(elem)), // autocomplete minor options
      schoolDropDown: [] // autocomplete school options
    };
  },
  directives: { mask },
  filters: {
    formatDateMonthYear
  },
  methods: {
    confirmEducation,
    denyEducation,
    getDateMonthYearRules,
    getRequiredRules,
    parseEventDate,
    addSchool,
    addItem,
    addDegree,
    deleteDegree,
    deleteSchool,
    deleteItem,
    parseDateMonthYear,
    schoolNamePlaceholder,
    titleCase,
    updateDropdowns,
    validateFields
  },
  //Education index is only used in the resume parser
  props: ['model', 'validating', 'allowAdditions'],
  watch: {
    validating: watchValidating
  }
};
</script>
