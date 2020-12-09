<template>
  <div>
    <!-- Loop Contracts -->
    <div
      v-for="(contract, index) in model.contracts"
      class="pt-3 pb-1 px-5"
      :key="'contract: ' + contract.name + index"
      style="border: 1px solid grey"
    >
      <!-- Name of Contract -->
      <v-combobox
        ref="formFields"
        v-model="contract.name"
        :rules="requiredRules"
        :items="contractsDropDown"
        label="Contract"
        data-vv-name="Contract"
      >
      </v-combobox>

      <!-- Name of Prime -->
      <v-combobox
        ref="formFields"
        v-model="contract.prime"
        :rules="requiredRules"
        :items="primesDropDown"
        label="Prime"
        data-vv-name="Prime"
      >
      </v-combobox>

      <v-row align="center" justify="center">
        <!-- Current Switch -->
        <v-col cols="6" sm="7" md="6" lg="7">
          <v-switch v-model="contract.current" label="Currently working with this customer organization"></v-switch>
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
            :value="contract.years"
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

        <!-- Button to Delete Contract -->
        <v-col cols="2" class="mb-3" align="center">
          <v-btn text icon><v-icon @click="deleteContract(index)">delete</v-icon></v-btn>
        </v-col>
      </v-row>
    </div>
    <!-- End Loop Contracts -->

    <!-- Button to Add Contracts -->
    <div class="pt-4" align="center">
      <v-btn @click="addContract()"><v-icon class="pr-1">add</v-icon>Contract</v-btn>
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
  window.EventBus.$emit('created', 'contracts'); // emit contracts tab was created
  this.employees = await api.getItems(api.EMPLOYEES); // get all employees
  this.populateDropDowns(); // get autocomplete drop down data
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Adds a Contract.
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
 * Deletes a Contract.
 *
 * @param index - array index of contract to delete
 */
function deleteContract(index) {
  this.model.contracts.splice(index, 1);
} // deleteContract

/**
 * Populate drop downs with information that other employees have filled out.
 */
function populateDropDowns() {
  let employeesContracts = _.map(this.employees, (employee) => employee.contracts); // extract contracts
  employeesContracts = _.compact(employeesContracts); // remove falsey values
  // loop employees
  _.forEach(employeesContracts, (contracts) => {
    // loop contracts
    _.forEach(contracts, (contract) => {
      this.contractsDropDown.push(contract.name); // add contract name
      this.primesDropDown.push(contract.prime); // add contract prime
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

  window.EventBus.$emit('doneValidating', 'contracts'); // emit done validating
  window.EventBus.$emit('contractsStatus', hasErrors); // emit error status
} // validateFields

export default {
  created,
  data() {
    return {
      contractsDropDown: [], // autocomplete contract name options
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
      primesDropDown: [], // autocomplete contract prime options
      requiredRules: [
        (v) => !isEmpty(v) || 'This field is required. You must enter information or delete the field if possible'
      ] // rules for a required field
    };
  },
  methods: {
    addContract,
    deleteContract,
    formatDateSlashToDash,
    formatDateDashToSlash,
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
