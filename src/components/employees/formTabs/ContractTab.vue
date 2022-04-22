<template>
  <div>
    <!-- Loop Contracts -->
    <div v-for="(contract, index) in editedContracts" class="gray-border ma-0 pt-3 pb-1 px-5" :key="index">
      <!-- Name of Contract -->
      <v-combobox
        ref="formFields"
        v-model="contract.name"
        :rules="[...getRequiredRules(), duplicateContractName(index)]"
        :items="contractsDropDown"
        label="Contract"
        data-vv-name="Contract"
        clearable
      >
      </v-combobox>

      <!-- Name of Prime -->
      <v-combobox
        ref="formFields"
        v-model="contract.prime"
        :rules="getRequiredRules()"
        :items="primesDropDown"
        label="Prime"
        data-vv-name="Prime"
        clearable
      >
      </v-combobox>
      <!-- Start of project loop -->
      <div v-for="(project, projIndex) in contract.projects" class="pt-3 pb-1" :key="index + '-' + projIndex">
        <v-text-field
          ref="formFields"
          :id="'proj-' + projIndex + '-' + index"
          v-model.trim="project.name"
          :rules="getRequiredRules()"
          :label="'Project ' + (projIndex + 1)"
          data-vv-name="Project"
          clearable
        >
          <v-tooltip v-if="contract.projects.length > 1" bottom slot="append-outer">
            <template v-slot:activator="{ on }">
              <v-btn text icon v-on="on" @click="deleteProject(index, projIndex)"
                ><v-icon class="case-gray">delete</v-icon></v-btn
              >
            </template>
            <span>Delete Project</span>
          </v-tooltip>
        </v-text-field>
        <v-row>
          <v-col cols="12" sm="6" md="12" lg="6" class="pt-3">
            <!-- Start Date -->
            <v-menu
              v-model="project.showStartMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  :id="'start-field-' + index + '-' + projIndex"
                  ref="formFields"
                  :value="project.startDate | formatDateMonthYear"
                  label="Start Date"
                  hint="MM/YYYY format"
                  v-mask="'##/####'"
                  prepend-icon="event_available"
                  :rules="[...getRequiredRules(), ...getDateMonthYearRules(), dateOrderRule(index, projIndex)]"
                  v-bind="attrs"
                  v-on="on"
                  @blur="project.startDate = parseEventDate($event)"
                  clearable
                  @input="project.showStartMenu = false"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="project.startDate"
                :max="project.endDate"
                no-title
                @input="project.showStartMenu = false"
                type="month"
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="12" sm="6" md="12" lg="6" class="pt-3">
            <!-- End Date -->
            <v-menu
              v-model="project.showEndMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  :id="'end-field-' + index + '-' + projIndex"
                  ref="formFields"
                  :disabled="project.presentDate"
                  :value="project.endDate | formatDateMonthYear"
                  label="End Date"
                  prepend-icon="event_busy"
                  :rules="[
                    ...getDateMonthYearOptionalRules(),
                    dateOrderRule(index, projIndex),
                    endDatePresentRule(index, projIndex)
                  ]"
                  hint="MM/YYYY format"
                  v-mask="'##/####'"
                  v-bind="attrs"
                  v-on="on"
                  clearable
                  @click:clear="project.endDate = null"
                  @blur="project.endDate = parseEventDate($event)"
                  @input="project.showEndMenu = false"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="project.endDate"
                :min="project.startDate"
                no-title
                @input="project.showEndMenu = false"
                type="month"
              ></v-date-picker>
            </v-menu>
            <!-- End End Date -->
          </v-col>
          <v-col v-if="!isMobile"></v-col>
          <v-col>
            <v-layout justify-start class="pl-2">
              <v-checkbox
                class="ma-0 pa-0"
                v-model="project.presentDate"
                :label="`Present`"
                @click="project.endDate = null"
              ></v-checkbox>
            </v-layout>
          </v-col>
        </v-row>
      </div>
      <!-- End of project loop -->

      <div class="pb-4" align="center">
        <v-btn @click="addProject(index)" :id="'add-proj-' + index" elevation="2"
          ><v-icon class="pr-1">add</v-icon>Project</v-btn
        >
      </div>

      <div class="pb-4" align="center">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" @click="deleteContract(index)" icon text
              ><v-icon class="case-gray pr-1">delete</v-icon></v-btn
            >
          </template>
          <span>Delete Contract</span>
        </v-tooltip>
      </div>
    </div>
    <!-- End Loop Contracts -->

    <!-- Button to Add Contracts -->
    <div class="pt-4" align="center">
      <v-btn @click="addContract()" elevation="2"><v-icon class="pr-1">add</v-icon>Contract</v-btn>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import { mask } from 'vue-the-mask';
import { getDateMonthYearRules, getDateMonthYearOptionalRules, getRequiredRules } from '@/shared/validationUtils.js';
import { isEmpty, formatDateMonthYear, parseDateMonthYear, isMobile } from '@/utils/utils';
const moment = require('moment');

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
  this.employees = this.$store.getters.employees; // get all employees
  this.populateDropDowns(); // get autocomplete drop down data
  this.editedContracts.forEach((contract) => {
    if (!contract.projects) {
      contract.projects = [
        {
          name: '',
          endDate: null,
          presentDate: false,
          startDate: null,
          showStartMenu: false,
          showEndMenu: false
        }
      ];
    }
  });
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
  if (!this.editedContracts) this.editedContracts = [];
  this.editedContracts.push({
    name: '',
    prime: '',
    years: 0,
    current: false,
    projects: [
      {
        name: ''
      }
    ]
  });
} // addContract

/**
 * Adds a project to a given contract.
 *
 * @param contractIndex The index of the contract
 */
function addProject(contractIndex) {
  this.editedContracts[contractIndex].projects.push({
    name: '',
    endDate: null,
    presentDate: false,
    startDate: null,
    showStartMenu: false,
    showEndMenu: false
  });
} // addProject

/**
 * Deletes a Contract.
 *
 * @param index - array index of contract to delete
 */
function deleteContract(index) {
  this.editedContracts.splice(index, 1);
} // deleteContract

/**
 * Deletes a project.
 *
 * @param contractIndex - The index of the contract
 * @param projectIndex - The index of the project
 */
function deleteProject(contractIndex, projectIndex) {
  if (this.editedContracts[contractIndex].projects.length === 1) {
    this.editedContracts[contractIndex].projects.splice(contractIndex, 1);
  } else {
    this.editedContracts[contractIndex].projects.splice(projectIndex, 1);
  }
} // deleteProject

/**
 * Checks if the current contract has any projects without an end date
 *
 * @param index The index of the contract in this.editedContracts
 * @return boolean - whether or not the projects for that contract have all their end dates filled
 */
function hasEndDatesFilled(index) {
  let hasEndDatesFilled = true;
  _.forEach(this.editedContracts[index].projects, (position) => {
    hasEndDatesFilled &= !!position.endDate;
  });

  return hasEndDatesFilled;
} // hasEndDatesFilled

/**
 * Parse the date after losing focus.
 * @return String - The date in YYYY-MM-DD format
 */
function parseEventDate() {
  return this.parseDateMonthYear(event.target.value);
} //parseEventDate

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
  let errorCount = 0;
  //ensures that refs are put in an array so we can reuse forEach loop
  let components = !_.isArray(this.$refs.formFields) ? [this.$refs.formFields] : this.$refs.formFields;
  _.forEach(components, (field) => {
    if (field && !field.validate()) errorCount++;
  });

  // fail safe if someone tries to force a contract that's present and has an end date
  _.forEach(this.editedContracts, (contract) => {
    _.forEach(contract.projects, (project) => {
      if (project.endDate && project.presentDate) {
        project.presentDate = false;
      }
    });
  });

  window.EventBus.$emit('doneValidating', 'contracts', this.editedContracts); // emit done validating and sends edited data back to parent
  window.EventBus.$emit('contractsStatus', errorCount); // emit error status
} // validateFields

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for validating - validates fields
 *
 * @param val - val prop that needs to exist before validating
 */
function watchValidating(val) {
  if (val) {
    // parent component triggers validation
    this.validateFields();
  }
} // watchValidating

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  computed: {
    isMobile
  },
  created,
  data() {
    return {
      contractsDropDown: [], // autocomplete contract name options
      dateOrderRule: (compIndex, projIndex) => {
        if (this.editedContracts) {
          let project = this.editedContracts[compIndex].projects[projIndex];
          return !this.isEmpty(project.endDate) && moment(project.endDate) && project.startDate
            ? moment(project.endDate).add(1, 'd').isAfter(moment(project.startDate)) ||
                'End date must be at or after start date'
            : true;
        } else {
          return true;
        }
      },
      duplicateContractName: (conIndex) => {
        let contractNames = _.map(this.editedContracts, (contract) => contract.name);
        let primeNames = _.map(this.editedContracts, (contract) => contract.prime);
        let contractName = contractNames[conIndex];
        let primeName = primeNames[conIndex];
        contractNames.splice(conIndex, 1);
        primeNames.splice(conIndex, 1);
        return (
          !contractNames.includes(contractName) ||
          (contractNames.includes(contractName) && !primeNames.includes(primeName)) ||
          'Duplicate contract name'
        );
      },
      editedContracts: _.cloneDeep(this.model), // stores edited contracts info
      endDatePresentRule: (compIndex, projIndex) => {
        if (this.editedContracts !== undefined) {
          let position = this.editedContracts[compIndex].projects[projIndex];
          if (!position.presentDate && this.isEmpty(position.endDate)) {
            return 'End Date is required';
          } else {
            return true;
          }
        } else {
          return false;
        }
      },
      experienceRequired: [
        (v) => !this.isEmpty(v) || 'This field is required',
        (v) => v >= 0 || 'Value cannot be negative',
        (v) => v < 100 || 'Value must be less than 100'
      ], // rules for years of experience
      primesDropDown: [] // autocomplete contract prime options
    };
  },
  directives: { mask },
  filters: {
    formatDateMonthYear
  },
  methods: {
    addContract,
    addProject,
    deleteContract,
    deleteProject,
    getDateMonthYearRules,
    getDateMonthYearOptionalRules,
    getRequiredRules,
    hasEndDatesFilled,
    isEmpty,
    parseDateMonthYear,
    parseEventDate,
    populateDropDowns,
    validateFields
  },
  props: ['model', 'validating'],
  watch: {
    validating: watchValidating
  }
};
</script>
