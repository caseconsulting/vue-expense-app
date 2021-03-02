<template>
  <div>
    <!-- Loop Technologies -->
    <div
      v-for="(technology, index) in editedTechnologies"
      class="pt-3 pb-1 px-5"
      v-bind:class="{ errorBox: isDuplicate(technology.name) }"
      :key="'technology: ' + index"
      style="border: 1px solid grey"
    >
      <!--Duplicate chip if tech name is already entered by user-->
      <v-row v-if="isDuplicate(technology.name)" justify="end">
        <v-chip class="ma-2" color="error" text-color="white"> Duplicate </v-chip>
      </v-row>

      <!-- Name of Technology -->
      <v-combobox
        ref="formFields"
        v-model="technology.name"
        :rules="requiredRules"
        :items="technologyDropDown"
        label="Technology"
        data-vv-name="Technology"
        class="pb-5"
      >
      </v-combobox>

      <!-- Time Intervals -->
      <v-row v-if="technology.dateIntervals" justify="center">
        <div
          v-for="(dateInterval, intervalIndex) in technology.dateIntervals"
          class="pt-3 pb-1 px-5"
          :key="'technology interval: ' + index + intervalIndex"
          style="border: 1px solid grey"
        >
          <date-interval-form
            :startIntervalDate="dateInterval.startDate"
            :endIntervalDate="dateInterval.endDate"
            :technologyIndex="index"
            :intervalIndex="intervalIndex"
          ></date-interval-form>
        </div>
      </v-row>

      <!--Add a time interval button-->
      <div class="pt-4" align="center">
        <v-btn @click="addTimeInterval(index)" elevation="2"><v-icon class="pr-1">add</v-icon>Time Interval</v-btn>
      </div>

      <!--TODO: remove Current Switch-->
      <v-row align="center" class="py-3" justify="center">
        <!-- Current Switch -->
        <!-- <v-col cols="6" sm="7" md="6" lg="7">
          <v-switch v-model="technology.current" label="Currently working with this technology"></v-switch>
        </v-col> -->

        <!-- Button to Delete Technology -->
        <v-col cols="2" class="mb-3" align="center">
          <v-btn text icon><v-icon @click="deleteTechnology(index)">delete</v-icon></v-btn>
        </v-col>
      </v-row>
      <!-- End Loop Technologies -->
    </div>
    <!-- Button to Add Technologies -->
    <div class="pt-4" align="center">
      <v-btn @click="addTechnology()" elevation="2"><v-icon class="pr-1">add</v-icon>Technology</v-btn>
    </div>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';
//import moment from 'moment-timezone';
import { formatDateDashToSlash, formatDateSlashToDash, isEmpty } from '@/utils/utils';

import DateIntervalForm from '@/components/employees/formTabs/DateIntervalForm';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data.
 */
async function created() {
  window.EventBus.$emit('created', 'technologies'); // emit technologies tab was created
  this.employees = await api.getItems(api.EMPLOYEES); // get all employees
  this.populateDropDowns();

  //delete a date interval based on technology index and dateIntervalIndex
  window.EventBus.$on('date-interval-delete-technology', (technologyIndex, dateIntervalIndex) => {
    this.deleteDateInterval(technologyIndex, dateIntervalIndex);
  });

  //update a start date interval based on technology index and dateIntervalIndex
  window.EventBus.$on('update-start-interval-technology', (technologyIndex, dateIntervalIndex, editedStartDate) => {
    this.editedTechnologies[technologyIndex].dateIntervals[dateIntervalIndex].startDate = _.cloneDeep(editedStartDate);
  });

  //update a end date interval based on technology index and dateIntervalIndex
  window.EventBus.$on('update-end-interval-technology', (technologyIndex, dateIntervalIndex, editedEndDate) => {
    this.editedTechnologies[technologyIndex].dateIntervals[dateIntervalIndex].endDate = _.cloneDeep(editedEndDate);
  });
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Add a Technology.
 */
function addTechnology() {
  this.editedTechnologies.push({
    name: '',
    dateIntervals: [{ startDate: null, endDate: null }],
    years: 0,
    current: false
  });
}

/**
 * Add a time interval.
 * @param index - index the index in array of the technology
 */
async function addTimeInterval(index) {
  this.editedTechnologies[index].dateIntervals.push({ startDate: null, endDate: null });
} // addTimeInterval

/**
 * Deletes a time interval for a technology.
 * @param technologyIndex - index of the technology you want to remove time interval from
 * @param dateIntervalIndex - index of the date interval you want to remove
 */
function deleteDateInterval(technologyIndex, dateIntervalIndex) {
  if (
    this.editedTechnologies.length > technologyIndex &&
    this.editedTechnologies[technologyIndex].dateIntervals.length > dateIntervalIndex
  ) {
    this.editedTechnologies[technologyIndex].dateIntervals.splice(dateIntervalIndex, 1);
  }
} //deleteDateInterval
/**
 * Deletes a Technology.
 *
 * @param index - array index of technology to delete
 */
function deleteTechnology(index) {
  this.editedTechnologies.splice(index, 1);
} // deleteTechnology

/**
 * Creates an array of all technologies that a user has entered multiple times (based on name).
 * @returns an array of technology names that a user has entered multiple times
 */
function duplicateTechEntries() {
  //declares function to count unique name properties of js objects
  const count = (names) =>
    names.reduce((acc, it) => {
      acc[it.name] = acc[it.name] + 1 || 1;
      return acc;
    }, {});

  //returns an array of objects that had a count of over 1
  const duplicates = (dict) => Object.keys(dict).filter((a) => dict[a] > 1);

  return this.editedTechnologies ? duplicates(count(this.editedTechnologies)) : [];
} // duplicateTechEntries

/**
 * Checks to see if a technology is a duplicate of one that is already entered by a user.
 * @param tech String - the name of the technology
 * @returns boolean - true if technology was already entered by user (duplicate) false otherwise
 */
function isDuplicate(tech) {
  let duplicates = this.duplicateTechEntries();

  //checks to see if tech is in duplicates array
  if (duplicates && _.isArray(duplicates) && duplicates.length > 0) {
    return duplicates.includes(tech);
  }
  return false;
} // isDuplicate

/**
 * Gets information that other employees have filled out.
 */
function populateDropDowns() {
  let employeesTechnology = _.map(this.employees, (employee) => employee.technologies); //extract technology
  employeesTechnology = _.compact(employeesTechnology); //remove falsey values
  // loop employees
  _.forEach(employeesTechnology, (technologies) => {
    // loop technologies
    _.forEach(technologies, (technology) => {
      this.technologyDropDown.push(technology.name); // add technology name
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

  //checks to see if there are duplicate entries with the same name
  if (this.duplicateTechEntries().length > 0) {
    hasErrors = true;
    //emit error status with a custom message
    window.EventBus.$emit(
      'technologiesStatus',
      hasErrors,
      'Technology names MUST be UNIQUE. Please remove any duplicates'
    ); // emit error status
  } else {
    window.EventBus.$emit('technologiesStatus', hasErrors); // emit error status
  }
  window.EventBus.$emit('doneValidating', 'technologies', this.editedTechnologies); // emit done validating
} // validateFields

export default {
  components: {
    DateIntervalForm
  },
  created,
  data() {
    return {
      technologyDropDown: [], // autocomplete technology name options
      dateOptionalRules: [
        (v) => {
          return !isEmpty(v) ? /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) || 'Date must be valid. Format: MM/DD/YYYY' : true;
        }
      ], // rules for an optional date
      dateRules: [
        (v) => !isEmpty(v) || 'Date required',
        (v) => (!isEmpty(v) && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/DD/YYYY'
      ], // rules for a required date
      editedTechnologies: _.cloneDeep(this.model), //stores edited technology info
      experienceRequired: [
        (v) => !isEmpty(v) || 'This field is required',
        (v) => v >= 0 || 'Value cannot be negative',
        (v) => v < 100 || 'Value must be less than 100'
      ], // rules for years of experience
      requiredRules: [
        (v) => !isEmpty(v) || 'This field is required. You must enter information or delete the field if possible'
      ] // rules for a required field
    };
  },
  methods: {
    addTechnology,
    addTimeInterval,
    deleteDateInterval,
    deleteTechnology,
    duplicateTechEntries,
    formatDateDashToSlash,
    formatDateSlashToDash,
    isDuplicate,
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
<style>
.errorBox {
  color: red !important;
  border: 2px solid red !important;
}
</style>
