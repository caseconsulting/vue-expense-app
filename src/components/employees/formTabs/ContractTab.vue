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
          v-model="contract.prime"
          :rules="requiredRules"
          :items="primesDropDown"
          label="Prime"
          data-vv-name="Prime"
        >
        </v-combobox>
      </v-row>
      <v-row align="center">
        <v-col cols="3" class="mr-3">
          <div class="yearsBox">
            <input
              v-model="contract.years"
              type="text"
              oninput="this.value = this.value.replace(/[^0-9]/g, '');"
              maxlength="2"
              :rules="requiredRules"
            />
            <div>years</div>
          </div>
        </v-col>
        <v-col>
          <v-switch v-model="contract.current" label="Currently working with this customer organization"></v-switch>
        </v-col>
        <!-- Delete button  -->
        <v-col cols="1" class="mr-3">
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
}

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
        (v) => !!v || 'This field is required. You must enter information or delete the field if possible'
      ] // rules for required fields
    };
  },
  methods: {
    addContract,
    deleteContract,
    formatDate,
    getDropDownInfo,
    parseDate
  },
  props: ['model']
};
</script>

<style>
.yearsBox {
  margin-left: 10px;
  border: solid 1px gray;
  width: 70px;
  height: 34px;
  border-radius: 2px;
  font-size: 14px;
  display: flex;
}

.yearsBox div {
  padding-top: 6px;
  margin-left: 4px;
  margin-right: 3px;
}

.yearsBox input {
  outline: none;
  text-align: right;
  width: 33%;
}
</style>
