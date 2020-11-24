<template>
  <div>
    <!-- Loop Technologies -->
    <div
      v-for="(technology, index) in model.technologies"
      class="pt-3 pb-1 px-5"
      :key="'technology: ' + technology.name + index"
      style="border: 1px solid grey;"
    >
      <!-- Name of Technology -->
      <v-combobox
        ref="formFields"
        v-model="technology.name"
        :rules="requiredRules"
        :items="technologyDropDown"
        label="Technology"
        data-vv-name="Technology"
      >
      </v-combobox>

      <v-row align="center" justify="center">
        <!-- Current Switch -->
        <v-col cols="6" sm="7" md="6" lg="7">
          <v-switch v-model="technology.current" label="Currently working with this technology"></v-switch>
        </v-col>

        <!-- Years of Experience -->
        <v-col
          cols="4"
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
          ></v-text-field>
        </v-col>

        <!-- Button to Delete Technology -->
        <v-col cols="2" class="mb-3" align="center">
          <v-btn text icon><v-icon @click="deleteTechnology(index)">delete</v-icon></v-btn>
        </v-col>
      </v-row>
    </div>
    <!-- End Loop Technologies -->

    <!-- Button to Add Technologies -->
    <div class="pt-4" align="center">
      <v-btn @click="addTechnology()"><v-icon class="pr-1">add</v-icon>Technology</v-btn>
    </div>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';
import { formatDateDashToSlash, formatDateSlashToDash, isEmpty } from '@/utils/utils';

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
  this.model.technologies.push({
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
  this.model.technologies.splice(index, 1);
} // deleteTechnology

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

  window.EventBus.$emit('doneValidating', 'technologies'); // emit done validating
  window.EventBus.$emit('technologiesStatus', hasErrors); // emit error status
} // validateFields

export default {
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
    deleteTechnology,
    formatDateDashToSlash,
    formatDateSlashToDash,
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
