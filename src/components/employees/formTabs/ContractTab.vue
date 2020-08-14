<template>
  <div>
    <!-- Loop contracts -->
    <div
      v-for="(contract, index) in model.contracts"
      class="pt-3 pb-1 px-5"
      :key="'contract: ' + contract.name + index"
      style="border: 1px solid grey;"
    >
      <v-row>
        <v-combobox
          ref="formFields"
          v-model="contract.name"
          :rules="requiredRules"
          :items="contractsDropDown"
          label="Contract"
          data-vv-name="Contract"
        >
        </v-combobox>
      </v-row>
      <v-row>
        <v-combobox
          ref="formFields"
          v-model="contract.prime"
          :rules="requiredRules"
          :items="primesDropDown"
          label="Prime"
          data-vv-name="Prime"
        >
        </v-combobox>
      </v-row>
      <v-row align="center" justify="center">
        <v-col cols="6" sm="7" md="6" lg="7">
          <v-switch v-model="contract.current" label="Currently working with this customer organization"></v-switch>
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
            :value="contract.years"
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
            <v-btn text icon><v-icon @click="deleteContract(index)">delete</v-icon></v-btn>
          </v-slide-x-reverse-transition>
        </v-col>
      </v-row>
    </div>
    <!-- Add Contract button -->
    <div class="pt-4" align="center">
      <v-btn @click="addContract()"><v-icon class="pr-1">add</v-icon>Contract</v-btn>
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
  window.EventBus.$emit('created', 'contracts');
  this.employees = await api.getItems(api.EMPLOYEES); // get all employees
  this.getDropDownInfo();
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Add a Contract to the form.
 */
function addContract() {
  this.model.contracts.push({
    name: '',
    prime: '',
    years: 0,
    current: false
  });
} // addContract

/**
 * delete a Contract from the form
 */
function deleteContract(index) {
  this.model.contracts.splice(index, 1);
} // deleteContract

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
  let employeesContracts = _.map(this.employees, (employee) => employee.contracts); //extract Contracts
  employeesContracts = _.compact(employeesContracts); //remove falsey values
  _.forEach(employeesContracts, (contracts) => {
    _.forEach(contracts, (contract) => {
      this.contractsDropDown.push(contract.name);
    });
  });
  employeesContracts = _.map(this.employees, (employee) => employee.contracts); //extract Contracts
  employeesContracts = _.compact(employeesContracts); //remove falsey values
  _.forEach(employeesContracts, (contracts) => {
    _.forEach(contracts, (contract) => {
      this.primesDropDown.push(contract.prime);
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

  window.EventBus.$emit('doneValidating', 'contracts');
  window.EventBus.$emit('contractsStatus', hasErrors);
} // validateFields

export default {
  created,
  data() {
    return {
      contractsDropDown: [],
      dateOptionalRules: [
        (v) => {
          return v ? /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) || 'Date must be valid. Format: MM/DD/YYYY' : true;
        }
      ], // rules for optional dates
      dateRules: [
        (v) => !!v || 'Date required',
        (v) => (!!v && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/DD/YYYY'
      ], // rules for date
      primesDropDown: [],
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
    addContract,
    deleteContract,
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
