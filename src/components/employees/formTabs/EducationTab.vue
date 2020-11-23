<template>
  <div>
    <!-- Loop Education -->
    <div
      class="py-3 px-5"
      style="border: 1px solid grey;"
      v-for="(degree, index) in model.degrees"
      :key="'degree: ' + degree.name + index"
    >
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
            :value="degree.date"
            label="Completion Date"
            prepend-icon="event"
            :rules="dateRules"
            readonly
            hint="YYYY-MM format"
            persistent-hint
            v-on="on"
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
        <v-btn @click="addItem(degree.majors)" depressed outlined small color="#3f3f3c">Add a Major</v-btn>
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
        <v-btn @click="addItem(degree.minors)" depressed outlined small color="#3f3f3c">Add a Minor</v-btn>
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
        <v-btn @click="addItem(degree.concentrations)" depressed outlined small color="#3f3f3c"
          >Add a Concentration</v-btn
        >
      </div>
      <!-- End Concentrations -->
    </div>
    <!-- End Loop Education -->

    <!-- Button to Add Degress -->
    <div class="pt-4" align="center">
      <v-btn @click="addDegree()"><v-icon class="pr-1">add</v-icon>Degree</v-btn>
    </div>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';
import { isEmpty } from '@/utils/utils';

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
 * Adds a Degree.
 */
function addDegree() {
  this.model.degrees.push({
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
  this.model.degrees.splice(index, 1);
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

  if (_.isArray(this.$refs.formFields)) {
    // more than one TYPE of vuetify component used
    let error = _.find(this.$refs.formFields, (field) => {
      return !field.validate();
    });
    hasErrors = _.isNil(error) ? false : true;
  } else if (this.$refs.formFields) {
    // single vuetify component
    hasErrors = !this.$refs.formFields.validate();
  }

  window.EventBus.$emit('doneValidating', 'education'); // emit done validating
  window.EventBus.$emit('educationStatus', hasErrors); // emit error status
} // validateFields

export default {
  created,
  data() {
    return {
      concentrationDropDown: [], // autocomplete concentration options
      dateRules: [
        (v) => !isEmpty(v) || 'Date must be valid. Format: YYYY-MM',
        (v) => (!isEmpty(v) && /^\d{4}[-](0?[1-9]|1[0-2])$/.test(v)) || 'Date must be valid. Format: YYYY-MM'
      ], // rules for a required date
      degreeDropDown: [], // autocomplete degree name options
      majorDropDown: [], // autocomplete major options
      minorDropDown: [], // autocomplete minor options
      requiredRules: [
        (v) => !isEmpty(v) || 'This field is required. You must enter information or delete the field if possible.'
      ], // rules for a required field
      schoolDropDown: [] // autocomplete school options
    };
  },
  methods: {
    addDegree,
    addItem,
    deleteDegree,
    deleteItem,
    isEmpty,
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
    }
  }
};
</script>
