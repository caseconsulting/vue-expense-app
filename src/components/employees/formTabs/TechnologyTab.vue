<template>
  <div>
    <!-- Loop technologies -->
    <div
      v-for="(technology, index) in model.technologies"
      class="pt-3 pb-1 px-5"
      :key="'technology: ' + technology.name + index"
      style="border: 1px solid grey;"
    >
      <v-row>
        <v-combobox
          ref="formFields"
          v-model="technology.name"
          :rules="requiredRules"
          :items="technologyDropDown"
          label="Technology"
          data-vv-name="Technology"
        >
        </v-combobox>
      </v-row>
      <v-row align="center" justify="center">
        <v-col cols="6" sm="7" md="6" lg="7">
          <v-switch v-model="technology.current" label="Currently working with this technology"></v-switch>
        </v-col>
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
            :value="technology.years"
            flat
            :rules="countRequired"
            single-line
            max="99"
            min="0"
            suffix="years"
            dense
            type="number"
            outlined
          ></v-text-field>
        </v-col>
        <!-- Delete button  -->
        <v-col cols="2" class="mb-3" align="center">
          <v-slide-x-reverse-transition mode="out-in">
            <v-btn text icon><v-icon @click="deleteTechnology(index)">delete</v-icon></v-btn>
          </v-slide-x-reverse-transition>
        </v-col>
      </v-row>
    </div>
    <!-- Add Technology button -->
    <div class="pt-4" align="center">
      <v-btn @click="addTechnology()"><v-icon class="pr-1">add</v-icon>Technology</v-btn>
    </div>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

async function created() {
  window.EventBus.$emit('created', 'technologies');
  this.employees = await api.getItems(api.EMPLOYEES); // get all employees
  this.getDropDownInfo();
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Add an technology to the form.
 */
function addTechnology() {
  this.model.technologies.push({
    name: '',
    years: 0,
    current: false
  });
} // addTechnology

/**
 * delete an technology from the form
 */
function deleteTechnology(index) {
  this.model.technologies.splice(index, 1);
} // deleteTechnology

function formatDate(date) {
  if (!date) {
    return null;
  }
  const [year, month, day] = date.split('-');
  return `${month}/${day}/${year}`;
} // formatDate

/**
 * Gets information that other employees have filled out.
 */
function getDropDownInfo() {
  let employeesTechnology = _.map(this.employees, (employee) => employee.technologies); //extract technology
  employeesTechnology = _.compact(employeesTechnology); //remove falsey values
  _.forEach(employeesTechnology, (technologies) => {
    _.forEach(technologies, (technology) => {
      this.technologyDropDown.push(technology.name);
    });
  });
} // getDropDownInfo

/**
 * Checks if a value is empty. Returns true if the value is null or an empty/blank string.
 *
 * @param value - value to check
 * @return boolean - value is empty
 */
function isEmpty(value) {
  return _.isNil(value) || (_.isString(value) && value.trim().length === 0);
} // isEmpty

/**
 * Parse a date to isoformat (YYYY-MM-DD).
 *
 * @param Date = date to parse
 * @return Date - date in isoformat
 */
function parseDate(date) {
  if (!date) {
    return null;
  }
  const [month, day, year] = date.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`; // parseDate
} // parseDate

/**
 * Validate all input fields are valid. Emit to parent the error status.
 */
function validateFields() {
  let hasErrors = false;

  if (_.isArray(this.$refs.formFields)) {
    let error = _.find(this.$refs.formFields, (field) => {
      return !field.validate();
    });
    hasErrors = _.isNil(error) ? false : true;
  } else if (this.$refs.formFields) {
    hasErrors = this.$refs.formFields.validate;
  }

  window.EventBus.$emit('doneValidating', 'technologies');
  window.EventBus.$emit('technologiesStatus', hasErrors);
} // validateFields

export default {
  created,
  data() {
    return {
      technologyDropDown: [],
      dateOptionalRules: [
        (v) => {
          return v ? /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) || 'Date must be valid. Format: MM/DD/YYYY' : true;
        }
      ], // rules for optional dates
      dateRules: [
        (v) => !!v || 'Date required',
        (v) => (!!v && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/DD/YYYY'
      ], // rules for date
      formFields: [],
      requiredRules: [
        (v) => !isEmpty(v) || 'This field is required. You must enter information or delete the field if possible'
      ], // rules for required fields
      countRequired: [
        (v) => !isEmpty(v) || 'This field is required',
        (v) => v >= 0 || 'Value cannot be negative',
        (v) => v < 100 || 'Value must be less than 100'
      ] // rules for year count
    };
  },
  methods: {
    addTechnology,
    deleteTechnology,
    formatDate,
    getDropDownInfo,
    parseDate,
    isEmpty,
    validateFields
  },
  props: ['model', 'validating'],
  watch: {
    validating: function (val) {
      if (val) {
        this.validateFields();
      }
    }
  }
};
</script>
