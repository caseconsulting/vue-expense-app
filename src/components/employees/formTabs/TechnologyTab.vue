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
        class="pb-5"
        ref="formFields"
        v-model="technology.name"
        :rules="requiredRules"
        :items="technologyDropDown"
        label="Technology"
        data-vv-name="Technology"
        @input.native="updateTechDropDown(index)"
        clearable
      >
      </v-combobox>

      <!-- Time Intervals -->
      <v-row align="center" class="py-3" justify="center">
        <!-- Current Switch -->
        <v-col cols="6" sm="7" md="6" lg="7">
          <v-switch
            @change="updateYears(technology)"
            v-model="technology.current"
            label="Currently know this technology"
          ></v-switch>
        </v-col>

        <!-- Years of Experience -->
        <v-col
          cols="3"
          sm="3"
          md="4"
          lg="3"
          class="px-0 pb-0"
          :class="{ 'px-4': $vuetify.breakpoint.sm, 'px-4': $vuetify.breakpoint.lg }"
        >
          <v-text-field
            ref="formFields"
            v-model="technology.years"
            flat
            :rules="experienceRequired"
            single-line
            max="99"
            min="0"
            suffix="years"
            dense
            type="number"
            outlined
            @input="updateYears(technology)"
          >
          </v-text-field>
        </v-col>
        <v-col cols="2" class="mb-3" align="center">
          <v-tooltip bottom slot="append-outer">
            <template v-slot:activator="{ on }">
              <v-btn text icon v-on="on" @click="deleteTechnology(index)"
                ><v-icon style="color: grey">delete</v-icon></v-btn
              >
            </template>
            <span>Delete Technology</span>
          </v-tooltip>
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
import { formatDateDashToSlash, formatDateSlashToDash, isEmpty } from '@/utils/utils';
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
  window.EventBus.$emit('created', 'technologies'); // emit technologies tab was created
  this.employees = await api.getItems(api.EMPLOYEES); // get all employees
  this.populateDropDowns();
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
  if (!this.editedTechnologies) this.editedTechnologies = [];
  this.editedTechnologies.push({
    name: '',
    years: 0,
    current: false
  });
}

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
 * Retrieves list of skills to display a dropdown
 * related to what the user just typed in
 */
async function updateTechDropDown() {
  let query = event.target.value;
  if (query.length > 2) {
    let techList = await api.getTechSkills(query);
    this.technologyDropDown = techList;
  } else if (this.technologyDropDown.length >= 0) {
    this.technologyDropDown = [];
  }
} //updateTechDropDown

/**
 * Used to respond to determining whether or not a technology has been set
 * to current. If it is current, a current start date will be assigned to calculate
 * the years field as time passes. If not current, it deletes the currentStartDate if
 * there was one
 */
function updateYears(tech) {
  if (tech.current) {
    tech.currentStartDate = moment().format('YYYY-MM-DD');
  } else if (tech.currentStartDate) {
    delete tech.currentStartDate;
  }
}

/**
 * Validate all input fields are valid. Emit to parent the error status.
 */
function validateFields() {
  let errorCount = 0;
  //ensures that refs are put in an array so we can reuse forEach loop
  let components = !_.isArray(this.$refs.formFields) ? [this.$refs.formFields] : this.$refs.formFields;
  _.forEach(components, (field) => {
    if (field && !field.validate()) {
      errorCount++;
    }
  });
  //we want the many errors modal to only appear if there are multiple errors, else show the duplicate red error modal
  if (errorCount === 0) {
    this.duplicateTechEntries().length > 0
      ? window.EventBus.$emit('technologiesErrStatus', 'Technology names MUST be UNIQUE. Please remove any duplicates')
      : null;
  } else {
    errorCount > 0 ? window.EventBus.$emit('technologiesStatus', errorCount) : null;
  }
  //emit error status with a custom message
  // emit error status

  window.EventBus.$emit('doneValidating', 'technologies', this.editedTechnologies); // emit done validating
} // validateFields

/**
 * Validates that all time intervals are error free, as well as if a tech is currently being used.
 * @returns boolean based on if all time intervals are valid
 */

export default {
  created,
  data() {
    return {
      technologyDropDown: [], // autocomplete technology name options
      editedTechnologies: _.cloneDeep(this.model), //stores edited technology info
      requiredRules: [
        (v) => !isEmpty(v) || 'This field is required. You must enter information or delete the field if possible'
      ], // rules for a required field
      experienceRequired: [
        (v) => !isEmpty(v) || 'This field is required',
        (v) => v > 0 || 'Value must be greater than 0',
        (v) => v < 100 || 'Value must be less than 100'
      ]
    };
  },
  methods: {
    addTechnology,
    deleteTechnology,
    duplicateTechEntries,
    formatDateDashToSlash,
    formatDateSlashToDash,
    isDuplicate,
    isEmpty,
    populateDropDowns,
    updateTechDropDown,
    updateYears,
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
