<template>
  <div :class="parser ? 'gray-border py-3' : ''">
    <div v-for="i in [0]" :key="i">
      <!-- Name of School -->
      <v-autocomplete
        ref="formFields"
        v-model="uni.name"
        :rules="getRequiredRules()"
        :items="schoolNamePlaceholder(uni.name)"
        :attach="isAttached"
        label="School"
        data-vv-name="School"
        clearable
      ></v-autocomplete>
      <div v-for="(degree, dIndex) in uni.degrees" :key="`${dIndex}`">
        <!-- Name of Degree -->
        <div v-if="uni.degrees.length === 1">
          <v-select
            ref="formFields"
            v-model="degree.degreeType"
            :rules="getRequiredRules()"
            :items="degreeDropDown"
            :attach="isAttached"
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
            :attach="isAttached"
            label="Degree"
            data-vv-name="Degree"
            clearable
            append-outer-icon="delete"
          >
            <v-tooltip bottom slot="append-outer">
              <template v-slot:activator="{ on }">
                <v-btn v-on="on" @click="deleteDegree(dIndex)" text icon
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
          :attach="isAttached"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              ref="formFields"
              :value="format(degree.completionDate, null, 'MM/YYYY')"
              label="Completion Date"
              prepend-icon="event"
              :rules="getDateMonthYearOptionalRules()"
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
            :rules="[...getRequiredRules(), duplicateDiscipline('majors', major, dIndex)]"
            :items="majorDropDown"
            :attach="isAttached"
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
            :rules="[...getRequiredRules(), duplicateDiscipline('minors', minor, dIndex)]"
            :items="minorDropDown"
            :attach="isAttached"
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
            :rules="[...getRequiredRules(), duplicateDiscipline('concentrations', concentration, dIndex)]"
            :items="concentrationDropDown"
            :attach="isAttached"
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
        <v-btn @click="addDegree()" elevation="2"><v-icon class="pr-1">add</v-icon>Degree</v-btn>
      </div>
    </div>
    <!-- Resume Parser Buttons -->
    <div v-if="parser" class="center">
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-icon v-on="on" large right color="red" @click="emitToParser(false)">close</v-icon>
        </template>
        <span>Ignore Pending Change</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-icon v-on="on" large left color="green" @click="emitToParser(true)">done</v-icon>
        </template>
        <span>Add Pending Change</span>
      </v-tooltip>
    </div>
  </div>
  <!-- End Loop Education -->
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';
import { getDateMonthYearOptionalRules, getRequiredRules } from '@/shared/validationUtils.js';
import { format } from '@/shared/dateUtils';
import { mask } from 'vue-the-mask';
import { majorsAndMinors } from '../dropdown-info/majorsAndMinors';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data.
 */
async function created() {
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
 * Emits confirmation to resume parser.
 *
 * @param include - whether or not to include this education
 */
function emitToParser(include) {
  this.emitter.emit(include ? 'confirm' : 'deny', include ? this.uni : undefined);
} // emitToParser

/**
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM format
 */
function parseEventDate() {
  return this.format(event.target.value, 'MM/YYYY', 'YYYY-MM');
} //parseEventDate

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
 */
function addDegree() {
  this.uni.degrees.push({
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
 * @param dIndex - array index of degree to delete
 */
function deleteDegree(dIndex) {
  this.uni.degrees.splice(dIndex, 1);
} // deleteDegree

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
 * Uses the last saved school as a placeholder for the dropdown until the API loads.
 *
 * @param schoolName - value of the last saved school
 * @returns one-item array or result of getColleges API call
 */
function schoolNamePlaceholder(schoolName) {
  return _.isEmpty(this.schoolDropDown) ? [schoolName] : this.schoolDropDown;
} // confirmEducation

/**
 * Changes the format of the string to title case.
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
 * updates the dropdowns with employee data.
 */
function updateDropdowns() {
  let employeesMajorsAndMinors = _.map(this.employees, (employee) => {
    let majorsAndMinors = _.map(employee.education, (edu) => {
      if (edu.type === 'university') {
        return _.map(edu.degrees, (degree) => {
          if (degree.majors && degree.minors) {
            return degree.majors.concat(degree.minors);
          } else if (degree.majors) {
            return degree.majors;
          } else {
            return degree.minors;
          }
        });
      }
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
 * Validate all input fields are valid.
 */
function validateFields() {
  let errorCount = 0;
  //ensures that refs are put in an array so we can reuse forEach loop
  let components = !_.isArray(this.$refs.formFields) ? [this.$refs.formFields] : this.$refs.formFields;
  _.forEach(components, (field) => {
    if (field && !field.validate()) errorCount++;
  });
  this.emitter.emit('doneValidatingEducation', this.uni, this.schoolIndex, errorCount); // emit done validating
} // validateFields

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Determines if the fields are in modals and should be assign the attached prop.
 */
function isAttached() {
  return this.attach;
} // isAttached

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for validating - validates fields
 */
function watchValidating() {
  if (this.validating) this.validateFields();
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
      duplicateDiscipline: (title, discipline, degreeIndex) => {
        let disciplines = this.uni.degrees[degreeIndex][title];
        let count = _.countBy(disciplines, (dis) => {
          return dis === discipline;
        });
        return count.true === 1 || 'Duplicate field found, please remove duplicate entries';
      },
      uni: _.cloneDeep(this.$props.school),
      degreeDropDown: ['Associates', 'Bachelors', 'Masters', 'PhD/Doctorate', 'Other (trade school, etc)'], // autocomplete degree name options
      majorDropDown: _.map(majorsAndMinors, (elem) => titleCase(elem)), // autocomplete major options
      minorDropDown: _.map(majorsAndMinors, (elem) => titleCase(elem)), // autocomplete minor options
      schoolDropDown: [] // autocomplete school options
    };
  },
  directives: { mask },
  computed: {
    isAttached
  },
  methods: {
    emitToParser,
    format,
    getDateMonthYearOptionalRules,
    getRequiredRules,
    parseEventDate,
    addItem,
    addDegree,
    deleteDegree,
    deleteItem,
    schoolNamePlaceholder,
    titleCase,
    updateDropdowns,
    validateFields
  },
  //Education index is only used in the resume parser
  props: ['parser', 'validating', 'allowAdditions', 'school', 'schoolIndex', 'attach'],
  watch: {
    validating: watchValidating
  }
};
</script>
