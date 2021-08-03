Education
<template>
  <div>
    <!-- Loop Education -->
    <div
      class="py-3 px-5"
      style="border: 1px solid grey"
      v-for="(degree, index) in editedDegrees"
      v-bind:class="[{ errorBox: isDuplicate(degree) }]"
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
        clearable
      >
      </v-select>

      <!-- Name of School -->
      <v-autocomplete
        ref="formFields"
        v-model="degree.school"
        :rules="requiredRules"
        :items="schoolDropDown"
        label="School"
        data-vv-name="School"
        clearable
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
            clearable
            @input="degree.showEducationMenu = false"
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
          :rules="[requiredRules[0], duplicateDiscipline('majors', major, index)]"
          :items="majorDropDown"
          label="Major"
          data-vv-name="Major"
          clearable
        >
          <v-tooltip v-if="degree.majors.length > 1" bottom slot="append-outer">
            <template v-slot:activator="{ on }">
              <v-btn text icon v-on="on" @click="deleteItem(degree.majors, mIndex)"
                ><v-icon style="color: grey">delete</v-icon></v-btn
              >
            </template>
            <span>Delete Major</span>
          </v-tooltip>
        </v-autocomplete>
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
        <!-- Name of School -->
        <v-autocomplete
          ref="formFields"
          v-model="degree.minors[mIndex]"
          :rules="[requiredRules[0], duplicateDiscipline('minors', minor, index)]"
          :items="minorDropDown"
          label="Minor"
          data-vv-name="Minor"
          clearable
        >
          <v-tooltip bottom slot="append-outer">
            <template v-slot:activator="{ on }">
              <v-btn text icon v-on="on" @click="deleteItem(degree.minors, mIndex)">
                <v-icon style="color: grey">delete</v-icon>
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
          :rules="[requiredRules[0], duplicateDiscipline('concentrations', concentration, index)]"
          :items="concentrationDropDown"
          data-vv-name="Concentration"
          clearable
        >
          <v-tooltip bottom slot="append-outer">
            <template v-slot:activator="{ on }">
              <v-btn text icon v-on="on" @click="deleteItem(degree.concentrations, cIndex)">
                <v-icon style="color: grey">delete</v-icon>
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
      <div v-if="allowAdditions" align="center" class="pb-4">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" @click="deleteDegree(index)" text icon
              ><v-icon style="color: grey" class="pr-1">delete</v-icon></v-btn
            >
          </template>
          <span>Delete Education</span>
        </v-tooltip>
      </div>
      <div v-else align="center" class="pb-4">
        <v-icon large left color="green" @click="confirmEducation">done</v-icon>
        <v-icon large right color="red" @click="denyEducation">close</v-icon>
      </div>
    </div>
    <!-- End Loop Education -->

    <!-- Button to Add Degress -->
    <div v-if="allowAdditions" class="pt-4" align="center">
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
  this.schoolDropDown = await api.getColleges('');
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function confirmEducation() {
  this.$emit('confirm', this.editedDegrees);
}

function denyEducation() {
  this.$emit('deny');
}

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
  if (!this.editedDegrees) this.editedDegrees = [];
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
  if (this.detectDuplicateEducation() !== undefined) {
    //emit error status with a custom message
    window.EventBus.$emit('educationDuplicateStatus', 'Educations MUST be UNIQUE. Please remove any duplicates'); // emit error status
  }
  let errorCount = 0;
  //ensures that refs are put in an array so we can reuse forEach loop
  let components = !_.isArray(this.$refs.formFields) ? [this.$refs.formFields] : this.$refs.formFields;
  _.forEach(components, (field) => {
    if (field && !field.validate()) {
      errorCount++;
    }
  });
  window.EventBus.$emit('doneValidating', 'education', this.editedDegrees); // emit done validating
  window.EventBus.$emit('educationStatus', errorCount); // emit error status
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
      duplicateDiscipline: (title, discipline, schoolIndex) => {
        let disciplines = this.editedDegrees[schoolIndex][title];
        let count = _.countBy(disciplines, (dis) => {
          return dis === discipline;
        });
        return count.true === 1 || 'Duplicate field found, please remove duplicate entries';
      },
      editedDegrees: _.cloneDeep(this.model), // stores edited degree info
      degreeDropDown: ['Associates', 'Bachelors', 'Masters', 'PhD/Doctorate', 'Other (trade school, etc)'], // autocomplete degree name options
      majorDropDown: _.map(majorsAndMinors, (elem) => titleCase(elem)), // autocomplete major options
      minorDropDown: _.map(majorsAndMinors, (elem) => titleCase(elem)), // autocomplete minor options
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
    confirmEducation,
    denyEducation,
    parseEventDate,
    addDegree,
    addItem,
    deleteDegree,
    deleteItem,
    detectDuplicateEducation,
    isDuplicate,
    isEmpty,
    parseDateMonthYear,
    titleCase,
    validateFields
  },
  //Education index is only used in the resume parser
  props: ['model', 'validating', 'allowAdditions'],
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
