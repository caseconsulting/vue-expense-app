<template>
  <div>
    <!-- Loop Education -->
    <div
      class="py-3 px-5"
      style="border: 1px solid grey"
      v-for="(degree, index) in editedDegrees"
      v-bind:class="{ errorBox: isDuplicate(degree) }"
      :key="'degree: ' + degree.name + index"
    >
      <!--Duplicate chip if tech name is already entered by user-->
      <v-row v-if="isDuplicate(degree)" justify="end">
        <v-chip class="ma-2" color="error" text-color="white"> Duplicate </v-chip>
      </v-row>

      <!-- Name of Degree -->
      <v-select
        ref="formFields"
        v-model="degree.name"
        :rules="requiredRules"
        :items="degreeDropDown"
        label="Degree"
        data-vv-name="Degree"
        append-outer-icon="delete"
        @click:append-outer="deleteDegree(index)"
      >
      </v-select>

      <!-- Name of School -->
      <v-autocomplete
        ref="formFields"
        v-model="degree.school"
        :rules="requiredRules"
        :items="schoolDropDown"
        label="School"
        @input.native="updateSchoolDropDown()"
        @change="addSelectedCollege"
        data-vv-name="School"
      ></v-autocomplete>

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
            :value="degree.date | formatDateMonthYear"
            label="Completion Date"
            prepend-icon="event"
            :rules="dateRules"
            hint="MM/YYYY format"
            v-mask="'##/####'"
            persistent-hint
            v-on="on"
            @blur="degree.date = parseEventDate($event)"
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="degree.date"
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
        <v-autocomplete
          ref="formFields"
          v-model="degree.majors[mIndex]"
          :rules="requiredRules"
          :items="majorDropDown"
          label="Major"
          data-vv-name="Major"
          :append-outer-icon="degree.majors.length > 1 ? 'delete' : undefined"
          @click:append-outer="deleteItem(degree.majors, mIndex)"
        ></v-autocomplete>
      </div>
      <!-- End Loop Majors -->
      <!-- Button to Add Major -->
      <div align="center" class="pb-4">
        <v-btn @click="addItem(degree.majors)" depressed outlined small>Add a Major</v-btn>
      </div>
      <!-- End Majors -->

      <!-- Minors -->
      <!-- Loops Minors -->
      <div v-for="(minor, mIndex) in degree.minors" :key="'minor: ' + minor + mIndex">
        <!-- Name of School -->
        <v-autocomplete
          ref="formFields"
          v-model="degree.minors[mIndex]"
          :rules="requiredRules"
          :items="minorDropDown"
          label="Minor"
          append-outer-icon="delete"
          @click:append-outer="deleteItem(degree.minors, mIndex)"
          data-vv-name="Minor"
        ></v-autocomplete>
      </div>
      <!-- End Loops Minors -->
      <!-- Button to Add Minor -->
      <div align="center" class="pb-4">
        <v-btn @click="addItem(degree.minors)" depressed outlined small>Add a Minor</v-btn>
      </div>
      <!-- End Minors -->

      <!-- Concentrations -->
      <!-- Loop Concentrations -->
      <div v-for="(concentration, cIndex) in degree.concentrations" :key="'conc: ' + concentration + cIndex">
        <v-autocomplete
          ref="formFields"
          v-model="degree.concentrations[cIndex]"
          :rules="requiredRules"
          :items="concentrationDropDown"
          label="Concentration"
          data-vv-name="Concentration"
          append-outer-icon="delete"
          @click:append-outer="deleteItem(degree.concentrations, cIndex)"
        ></v-autocomplete>
      </div>
      <!-- End Loop Concentrations -->
      <!-- Button to Add Concentration -->
      <div align="center" class="pb-4">
        <v-btn @click="addItem(degree.concentrations)" depressed outlined small>Add a Concentration</v-btn>
      </div>
      <!-- End Concentrations -->
    </div>
    <!-- End Loop Education -->

    <!-- Button to Add Degress -->
    <div class="pt-4" align="center">
      <v-btn @click="addDegree()" elevation="2"><v-icon class="pr-1">add</v-icon>Degree</v-btn>
    </div>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';
import { isEmpty, formatDateMonthYear, parseDateMonthYear } from '@/utils/utils';
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
  this.employees = await api.getItems(api.EMPLOYEES); // get all employees
  this.populateDropDowns(); // get autocomplete drop down data
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Parse the date after losing focus.
 */
function parseEventDate() {
  return parseDateMonthYear(event.target.value);
} //parseEventDate

/**
 * Adds a Degree.
 */
function addDegree() {
  this.editedDegrees.push({
    concentrations: [],
    date: null,
    majors: [''],
    minors: [],
    name: '',
    school: '',
    showEducationMenu: false
  });
} // addDegree

/**
 * Add a minor/major/concentration.
 *
 * @param array - array to add item to.
 */
function addItem(array) {
  array.push('');
} //addItem

/**
 * Deletes a Degree.
 *
 * @param index - array index of degree to delete
 */
function deleteDegree(index) {
  this.editedDegrees.splice(index, 1);
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
 * Creates an education object that a user has entered multiple times (based on degree, school, completion date, and major.
 * @returns an object of an education that a user has entered multiple times
 */
function detectDuplicateEducation() {
  // get the currently entered education
  const curEduIndex = this.editedDegrees.length - 1;
  let duplicateEdu = undefined;
  // checks if there are more than 1 entry total, including the current entry
  if (curEduIndex > 0) {
    const curEdu = this.editedDegrees[curEduIndex];
    const submittedEdus = this.editedDegrees.slice(0, curEduIndex);
    // find any duplicate education with the currently entered on
    duplicateEdu = submittedEdus.filter(
      (edu) =>
        edu.date === curEdu.date &&
        _.isEmpty(_.xor(edu.majors, curEdu.majors)) &&
        edu.name === curEdu.name &&
        edu.school === curEdu.school
    );
    // convert from array of one element to object
    duplicateEdu = duplicateEdu[0];
  }
  return duplicateEdu;
} // detectDuplicateEducation

/**
 * Checks to see if an education is a duplicate of one that is already entered by a user.
 * @param edu Object - the education object
 * @returns boolean - true if the education was already entered by user (duplicate) false otherwise
 */
function isDuplicate(edu) {
  let duplicate = this.detectDuplicateEducation();

  //checks to see if tech is in duplicates array
  if (duplicate && duplicate !== undefined) {
    return (
      duplicate.date === edu.date &&
      _.isEmpty(_.xor(duplicate.majors, edu.majors)) &&
      duplicate.name === edu.name &&
      duplicate.school === edu.school
    );
  }
  return false;
} // isDuplicate

/**
 * Populate drop downs with information that other employees have filled out.
 */
async function populateDropDowns() {
  //This is pretty expensive, but I couldn't find a better way
  //This gets all colleges and filters out the previous colleges so that they are only legal
  //ones from the list
  let colleges = await api.getColleges('');

  let employeesDegrees = _.map(this.employees, (employee) => employee.degrees); //extract contracts
  employeesDegrees = _.compact(employeesDegrees); //remove falsey values

  this.prevColleges = [];

  _.forEach(employeesDegrees, (degrees) => {
    _.forEach(degrees, (degree) => {
      _.forEach(colleges, (college) => {
        if (college === degree.school) {
          this.schoolDropDown.push(degree.school);
          this.prevColleges.push(degree.school);
        }
      });
    });
  });
} // populateDropDowns

/**
 * Fills the college dropdown as the user is typing
 */
async function updateSchoolDropDown() {
  let eventInfo = event.target.value;
  let res = await api.getColleges(eventInfo);
  this.schoolDropDown = [...res, ...this.prevColleges];
}

/**
 * This function adds a selected college to the drop down menu, so it does
 * not disappear when editing another school
 *
 * @param selectedCollege the newly selected college
 */
function addSelectedCollege(selectedCollege) {
  this.prevColleges.push(selectedCollege);
}

/**
 * Changes the format of the string to title case
 * @param str - the string to be converted
 * @return the title case formatted string
 */
function titleCase(str) {
  str = str.toLowerCase().split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(' ');
} //titleCase

/**
 * Validate all input fields are valid. Emit to parent the error status.
 */
function validateFields() {
  let hasErrors = false;
  let errorCount = 0;
  if (this.detectDuplicateEducation() !== undefined) {
    hasErrors = true;
    //emit error status with a custom message
    window.EventBus.$emit(
      'educationDuplicateStatus',
      hasErrors,
      'Educations MUST be UNIQUE. Please remove any duplicates'
    ); // emit error status
  } else if (_.isArray(this.$refs.formFields)) {
    // more than one TYPE of vuetify component used
    _.forEach(this.$refs.formFields, (field) => {
      if (!field.validate()) {
        errorCount++;
      }
    });
    if (errorCount > 0) {
      hasErrors = true;
    }
  } else if (this.$refs.formFields) {
    // single vuetify component
    hasErrors = !this.$refs.formFields.validate();
  }

  window.EventBus.$emit('doneValidating', 'education', this.editedDegrees); // emit done validating
  window.EventBus.$emit('educationStatus', [hasErrors, errorCount]); // emit error status
} // validateFields

export default {
  created,
  data() {
    return {
      concentrationDropDown: _.map(majorsAndMinors, (elem) => titleCase(elem)), // autocomplete concentration options
      dateRules: [
        (v) => !isEmpty(v) || 'Date must be valid. Format: MM/YYYY',
        (v) => (!isEmpty(v) && /[\d]{2}\/[\d]{4}/.test(v)) || 'Date must be valid. Format: MM/YYYY',
        (v) => moment(v, 'MM/YYYY').isValid() || 'Date must be valid'
      ], // rules for a required date
      editedDegrees: _.cloneDeep(this.model), // stores edited degree info
      degreeDropDown: ['Associates', 'Bachelors', 'Masters', 'PhD/Doctorate', 'Other (trade school, etc)'], // autocomplete degree name options
      majorDropDown: _.map(majorsAndMinors, (elem) => titleCase(elem)), // autocomplete major options
      minorDropDown: _.map(majorsAndMinors, (elem) => titleCase(elem)), // autocomplete minor options
      prevColleges: [],
      requiredRules: [
        (v) => !isEmpty(v) || 'This field is required. You must enter information or delete the field if possible.'
      ], // rules for a required field
      schoolDropDown: [] // autocomplete school options
    };
  },
  directives: { mask },
  filters: {
    formatDateMonthYear
  },
  methods: {
    parseEventDate,
    addDegree,
    addItem,
    addSelectedCollege,
    deleteDegree,
    deleteItem,
    detectDuplicateEducation,
    isDuplicate,
    isEmpty,
    parseDateMonthYear,
    populateDropDowns,
    titleCase,
    updateSchoolDropDown,
    validateFields
  },
  props: ['model', 'validating'],
  watch: {
    validating: function (val) {
      if (val) {
        // parent component triggers validation
        this.validateFields();
      }
    }
  }
};
</script>
