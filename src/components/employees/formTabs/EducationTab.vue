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
      <v-combobox
        ref="formFields"
        v-model="degree.name"
        :rules="requiredRules"
        :items="degreeDropDown"
        label="Degree"
        data-vv-name="Degree"
        append-outer-icon="delete"
        @click:append-outer="deleteDegree(index)"
      >
      </v-combobox>

      <!-- Name of School -->
      <v-combobox
        ref="formFields"
        v-model="degree.school"
        :rules="requiredRules"
        :items="schoolDropDown"
        label="School"
        data-vv-name="School"
      ></v-combobox>

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
            v-model="degreeDatesFormatted[index]"
            label="Completion Date"
            prepend-icon="event"
            :rules="dateRules"
            hint="MM/YYYY format"
            persistent-hint
            v-mask="'##/####'"
            v-on="on"
            @blur="degree.date = parseDateMonthYear(degreeDatesFormatted[index])"
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
      <div v-for="(major, index) in degree.majors" :key="'major: ' + major + index">
        <v-combobox
          ref="formFields"
          v-model="degree.majors[index]"
          :rules="requiredRules"
          :items="majorDropDown"
          label="Major"
          data-vv-name="Major"
        >
          <!-- Button to Delete Major  -->
          <template v-slot:append-outer>
            <v-icon v-if="index > 0" @click="deleteItem(degree.majors, index)">delete</v-icon>
          </template>
        </v-combobox>
      </div>
      <!-- End Loop Majors -->
      <!-- Button to Add Major -->
      <div align="center" class="pb-4">
        <v-btn @click="addItem(degree.majors)" depressed outlined small>Add a Major</v-btn>
      </div>
      <!-- End Majors -->

      <!-- Minors -->
      <!-- Loops Minors -->
      <div v-for="(minor, index) in degree.minors" :key="'minor: ' + minor + index">
        <v-combobox
          ref="formFields"
          v-model="degree.minors[index]"
          :rules="requiredRules"
          :items="minorDropDown"
          label="Minor"
          data-vv-name="Minor"
          append-outer-icon="delete"
          @click:append-outer="deleteItem(degree.minors, index)"
        >
        </v-combobox>
      </div>
      <!-- End Loops Minors -->
      <!-- Button to Add Minor -->
      <div align="center" class="pb-4">
        <v-btn @click="addItem(degree.minors)" depressed outlined small>Add a Minor</v-btn>
      </div>
      <!-- End Minors -->

      <!-- Concentrations -->
      <!-- Loop Concentrations -->
      <div v-for="(concentration, index) in degree.concentrations" :key="'conc: ' + concentration + index">
        <v-combobox
          ref="formFields"
          v-model="degree.concentrations[index]"
          :rules="requiredRules"
          :items="concentrationDropDown"
          label="Concentration"
          data-vv-name="Concentration"
          append-outer-icon="delete"
          @click:append-outer="deleteItem(degree.concentrations, index)"
        >
        </v-combobox>
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
import { moment } from 'moment';

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
  this.editedDegrees.forEach((degree) => {
    this.degreeDatesFormatted.push(formatDateMonthYear(degree.date));
    // fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
    if (degree.date !== null && !formatDateMonthYear(degree.date)) {
      // clear educationDate date if fails to format
      degree.date = null;
    }
  });
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

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
  this.degreeDatesFormatted.push(null);
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
  this.degreeDatesFormatted.splice(index, 1);
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
function populateDropDowns() {
  let employeesDegrees = _.map(this.employees, (employee) => employee.degrees); //extract contracts
  employeesDegrees = _.compact(employeesDegrees); //remove falsey values
  // loop employees
  _.forEach(employeesDegrees, (degrees) => {
    // loop degrees
    _.forEach(degrees, (degree) => {
      this.degreeDropDown.push(degree.name); // add degree name
      this.schoolDropDown.push(degree.school); // add school
      // loop majors
      _.forEach(degree.majors, (major) => {
        this.majorDropDown.push(major); // add major
      });
      // loop minors
      _.forEach(degree.minors, (minor) => {
        this.minorDropDown.push(minor); // add minor
      });
      // loop concentrations
      _.forEach(degree.concentrations, (conc) => {
        this.concentrationDropDown.push(conc); // add concentration
      });
    });
  });
} // populateDropDowns

/**
 * Validate all input fields are valid. Emit to parent the error status.
 */
function validateFields() {
  let hasErrors = false;

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
    let error = _.find(this.$refs.formFields, (field) => {
      return !field.validate();
    });
    hasErrors = _.isNil(error) ? false : true;
  } else if (this.$refs.formFields) {
    // single vuetify component
    hasErrors = !this.$refs.formFields.validate();
  }

  window.EventBus.$emit('doneValidating', 'education', this.editedDegrees); // emit done validating
  window.EventBus.$emit('educationStatus', hasErrors); // emit error status
} // validateFields

export default {
  created,
  data() {
    return {
      concentrationDropDown: [], // autocomplete concentration options
      dateRules: [
        (v) => !isEmpty(v) || 'Date must be valid. Format: MM/YYYY',
        (v) => (!isEmpty(v) && /^\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/YYYY'
      ], // rules for a required date
      degreeDatesFormatted: [],
      editedDegrees: _.cloneDeep(this.model), // stores edited degree info
      degreeDropDown: [], // autocomplete degree name options
      majorDropDown: [], // autocomplete major options
      minorDropDown: [], // autocomplete minor options
      requiredRules: [
        (v) => !isEmpty(v) || 'This field is required. You must enter information or delete the field if possible.'
      ], // rules for a required field
      schoolDropDown: [] // autocomplete school options
    };
  },
  directives: { mask },
  filters: {
    formatDate: function (date) {
      if (!date) return null;
      else {
        const [year, month] = date.split('-');
        if (moment(`${month}/${year}`, 'MM/YYYY', true).isValid()) {
          return `${month}/${year}`;
        } else {
          return null;
        }
      }
    }
  },
  methods: {
    addDegree,
    addItem,
    deleteDegree,
    deleteItem,
    detectDuplicateEducation,
    formatDateMonthYear,
    isDuplicate,
    isEmpty,
    parseDateMonthYear,
    populateDropDowns,
    validateFields
  },
  props: ['model', 'validating'],
  watch: {
    validating: function (val) {
      if (val) {
        // parent component triggers validation
        this.validateFields();
      }
    },
    editedDegrees: {
      handler: function () {
        this.editedDegrees.forEach((degree, index) => {
          this.degreeDatesFormatted[index] = formatDateMonthYear(degree.date) || this.degreeDatesFormatted[index];
          // fixes v-date-picker error so that if the format of date is incorrect the date is set to null
          if (degree.date !== null && !formatDateMonthYear(degree.date)) {
            // clear degree date if fails to format
            degree.date = null;
          }
        });
      },
      deep: true
    }
  }
};
</script>
