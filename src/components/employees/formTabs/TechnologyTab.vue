<template>
  <div>
    <!-- Loop Technologies -->
    <div
      v-for="(technology, index) in editedTechnologies"
      class="pt-3 pb-1 px-5"
      :key="'technology: ' + index"
      style="border: 1px solid grey"
    >
      <!-- Name of Technology -->
      <v-combobox
        class="pb-5"
        ref="formFields"
        v-model="technology.name"
        :rules="[duplicateRules(technology.name), ...getRequiredRules()]"
        :items="technologyDropDown"
        label="Technology"
        data-vv-name="Technology"
        @input.native="updateTechDropDown(index)"
        clearable
      >
      </v-combobox>

      <!-- Time Intervals -->
      <v-row justify="center">
        <!-- Current Switch -->
        <v-col cols="10" sm="6" md="6" lg="6" class="ml-3 ml-sm-0">
          <v-tooltip top nudge-left="75" nudge-bottom="10" max-width="300">
            <template v-slot:activator="{ on }">
              <div v-on="on">
                <v-switch v-model="technology.current" label="Currently know this technology"></v-switch>
              </div>
            </template>
            <span>Enabling this will auto-increment the years of experience every month</span>
          </v-tooltip>
        </v-col>

        <!-- Years of Experience -->
        <v-col
          cols="8"
          sm="4"
          md="4"
          lg="4"
          class="px-0 px-sm-0 pb-0"
          :class="{ 'px-4': $vuetify.breakpoint.sm, 'px-4': $vuetify.breakpoint.lg }"
        >
          <v-text-field
            ref="formFields"
            v-model="technology.years"
            flat
            :rules="[...getRequiredRules(), experienceRequired[0](technology.years, index), experienceRequired[1]]"
            single-line
            max="99"
            min="0"
            suffix="years"
            dense
            type="number"
            outlined
            @input="technology.years = Number(technology.years)"
          >
          </v-text-field>
        </v-col>
        <v-col cols="2" class="mt-0 mb-5 text-center">
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
import { getRequiredRules } from '@/shared/validationUtils.js';
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
} // addTechnology

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
      if (it.name !== '') {
        acc[it.name] = acc[it.name] + 1 || 1;
      }
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
  //emit error status with a custom message
  // emit error status
  window.EventBus.$emit('technologiesStatus', errorCount);
  window.EventBus.$emit('doneValidating', 'technologies', this.editedTechnologies); // emit done validating
} // validateFields

export default {
  created,
  data() {
    return {
      technologyDropDown: [], // autocomplete technology name options
      editedTechnologies: _.cloneDeep(this.model), //stores edited technology info
      duplicateRules: (tech) => {
        return !this.isDuplicate(tech) || 'Duplicate technology found, please remove duplicate entries';
      },
      experienceRequired: [
        (v, index) => v > 0 || this.editedTechnologies[index].current || 'Value must be greater than 0',
        (v) => v < 100 || 'Value must be less than 100'
      ]
    };
  },
  methods: {
    addTechnology,
    deleteTechnology,
    duplicateTechEntries,
    getRequiredRules,
    isDuplicate,
    populateDropDowns,
    updateTechDropDown,
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
