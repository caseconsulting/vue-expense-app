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
          :key="'technology interval: ' + index + intervalIndex"
        >
          <date-interval-form
            :startIntervalDate="dateInterval.startDate"
            :endIntervalDate="dateInterval.endDate"
            :allIntervals="technology.dateIntervals"
            :technologyIndex="index"
            :intervalIndex="intervalIndex"
          ></date-interval-form>
        </div>
      </v-row>
      <!-- End of Time Intervals -->

      <!--Add a time interval button-->
      <div class="pt-4" align="center">
        <v-btn @click="addTimeInterval(index)" elevation="2"><v-icon class="pr-1">add</v-icon>Time Interval</v-btn>
      </div>

      <v-row align="center" class="py-3" justify="center">
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
import moment from 'moment-timezone';
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

  for (let i = 0; i < this.editedTechnologies.length; i++) {
    if (_.isEmpty(this.editedTechnologies[i].dateIntervals)) {
      this.editedTechnologies[i].dateIntervals = [];
    }
  }
  //delete a date interval based on technology index and dateIntervalIndex
  window.EventBus.$on('date-interval-delete-technology', (technologyIndex, dateIntervalIndex) => {
    this.deleteDateInterval(technologyIndex, dateIntervalIndex);
  });

  //update a start date interval based on technology index and dateIntervalIndex
  window.EventBus.$on('update-start-interval-technology', (technologyIndex, dateIntervalIndex, editedStartDate) => {
    if (
      this.editedTechnologies &&
      this.editedTechnologies[technologyIndex] &&
      this.editedTechnologies[technologyIndex].dateIntervals &&
      this.editedTechnologies[technologyIndex].dateIntervals[dateIntervalIndex]
    )
      this.editedTechnologies[technologyIndex].dateIntervals[dateIntervalIndex].startDate = _.cloneDeep(
        editedStartDate
      );
    this.editedTechnologies = _.cloneDeep(this.editedTechnologies);
  });

  //update a end date interval based on technology index and dateIntervalIndex
  window.EventBus.$on('update-end-interval-technology', (technologyIndex, dateIntervalIndex, editedEndDate) => {
    if (
      this.editedTechnologies &&
      this.editedTechnologies[technologyIndex] &&
      this.editedTechnologies[technologyIndex].dateIntervals &&
      this.editedTechnologies[technologyIndex].dateIntervals[dateIntervalIndex]
    ) {
      this.editedTechnologies[technologyIndex].dateIntervals[dateIntervalIndex].endDate = _.cloneDeep(editedEndDate);
      this.editedTechnologies = _.cloneDeep(this.editedTechnologies);
    }
  });

  //update validation results of interval based on technology index and dateIntervalIndex
  window.EventBus.$on('validated-technology-interval', (technologyIndex, dateIntervalIndex, hasErrors) => {
    if (
      this.editedTechnologies &&
      this.editedTechnologies[technologyIndex] &&
      this.editedTechnologies[technologyIndex].dateIntervals &&
      this.editedTechnologies[technologyIndex].dateIntervals[dateIntervalIndex]
    ) {
      this.editedTechnologies[technologyIndex].dateIntervals[dateIntervalIndex].hasErrors = _.cloneDeep(hasErrors);
    }
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
  this.editedTechnologies = _.cloneDeep(this.editedTechnologies); //ensures that technologies intervals render properly
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
  } else if (!this.validateTimeIntervals()) {
    hasErrors = true;
  } else {
    window.EventBus.$emit('technologiesStatus', hasErrors); // emit error status
  }
  window.EventBus.$emit('doneValidating', 'technologies', this.editedTechnologies); // emit done validating
} // validateFields

/**
 * Validates that all time intervals are error free, also calculates months of experience in a tech, as well as if a tech is currently being used.
 * @returns boolean based on if all time intervals are valid
 */
function validateTimeIntervals() {
  //iterates over each tech
  for (let tech = 0; tech < this.editedTechnologies.length; tech++) {
    let dateIntervals = this.editedTechnologies[tech].dateIntervals; //date intervals for tech
    this.editedTechnologies[tech].current = false; //reset current variable

    let monthsOfExperience = 0;

    if (_.isEmpty(dateIntervals)) {
      //emit error status with a custom message
      window.EventBus.$emit(
        'technologiesStatus',
        true,
        `Tecnology ${this.editedTechnologies[tech].name} NEEDS at least one time interval.`
      ); // emit error status
      return false;
    }

    //checks each date interval within a tech
    for (let x = 0; x < dateIntervals.length; x++) {
      if (dateIntervals[x].hasErrors) {
        //emit error status with a custom message
        window.EventBus.$emit('technologiesStatus', true, `Tecnology intervals must NOT OVERLAP`); // emit error status
        return false; //ends validation if finds any interval has errors
      }

      monthsOfExperience += monthsPassed(dateIntervals[x].startDate, dateIntervals[x].endDate); // adds number of months of experience for each interval
      if (!dateIntervals[x].endDate) {
        this.editedTechnologies[tech].current = true; //sets current tech to true if no end date
      }
    }

    this.editedTechnologies[tech].monthsOfExperience = monthsOfExperience; //sets calculated months of experience for the technology
  }

  return true;
} //validateTimeIntervals

/**
 * Calculates the number of months that have passed between 2 dates in YYYY-MM format.
 *
 * @param start - the time interval starting date
 * @param end - the time interval ending date
 */
function monthsPassed(start, end) {
  let startDate = start;
  let endDate = end;
  let totalTimePassed = 0;

  //if there is no end date use interval start - now
  if (_.isEmpty(endDate)) {
    endDate = moment().format('YYYY-MM');
  }

  //makes sure that the start and end date are both not empty
  if (!_.isEmpty(startDate) && !_.isEmpty(endDate)) {
    let monthsStart = Number(moment(startDate, 'YYYY-MM').format('MM'));
    let yearsStart = Number(moment(startDate, 'YYYY-MM').format('YYYY'));

    let monthsEnd = Number(moment(endDate, 'YYYY-MM').format('MM'));
    let yearsEnd = Number(moment(endDate, 'YYYY-MM').format('YYYY'));

    let absoluteStartMonths = monthsStart + yearsStart * 12; //calculates absolute number of months for start date
    let absoluteEndMonths = monthsEnd + yearsEnd * 12; //calculates absolute number of years for end date

    totalTimePassed = absoluteEndMonths - absoluteStartMonths; //total number of months
  }

  return totalTimePassed;
} //monthsPassed

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
    validateFields,
    validateTimeIntervals
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
