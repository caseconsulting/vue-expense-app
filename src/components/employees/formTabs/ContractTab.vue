<template>
  <div>
    <!-- Loop Contracts -->
    <div
      v-for="(contract, index) in editedContracts"
      class="pt-3 pb-1 px-5"
      :key="index"
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
        clearable
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
        clearable
      >
      </v-combobox>
      <!-- Start of project loop -->
      <div v-for="(project, projIndex) in contract.projects" class="pt-3 pb-1" :key="index + '-' + projIndex">
        <v-combobox
          ref="formFields"
          :id="'proj-' + projIndex + '-' + index"
          v-model.trim="project.name"
          :rules="requiredRules"
          :label="'Project ' + (projIndex + 1)"
          data-vv-name="Project"
          clearable
        >
          <v-tooltip v-if="contract.projects.length > 1" bottom slot="append-outer">
            <template v-slot:activator="{ on }">
              <v-btn text icon v-on="on" @click="deleteProject(index, projIndex)"
                ><v-icon style="color: grey">delete</v-icon></v-btn
              >
            </template>
            <span>Delete Project</span>
          </v-tooltip>
        </v-combobox>
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
                  :value="project.startDate | formatDate"
                  label="Start Date"
                  hint="MM/DD/YYYY format"
                  v-mask="'##/##/####'"
                  prepend-icon="event_available"
                  :rules="[requiredRules[0], dateRules[0], dateRules[1], dateOrderRule(index, projIndex)]"
                  v-bind="attrs"
                  v-on="on"
                  @blur="project.startDate = parseEventDate($event)"
                  clearable
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="project.startDate"
                :max="project.endDate"
                no-title
                @input="project.showStartMenu = false"
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
                  :value="project.endDate | formatDate"
                  label="End Date"
                  prepend-icon="event_busy"
                  :rules="[
                    dateOptionalRules[0],
                    dateOptionalRules[1],
                    dateOrderRule(index, projIndex),
                    endDatePresentRule(index, projIndex)
                  ]"
                  hint="MM/DD/YYYY format"
                  v-mask="'##/##/####'"
                  v-bind="attrs"
                  v-on="on"
                  clearable
                  @click:clear="project.endDate = null"
                  @blur="project.endDate = parseEventDate($event)"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="project.endDate"
                :min="project.startDate"
                no-title
                @input="project.showEndMenu = false"
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
              ><v-icon style="color: grey" class="pr-1">delete</v-icon></v-btn
            >
          </template>
          <span>Delete Certification</span>
        </v-tooltip>
      </div>
      <!-- <v-row v-if="!hasEndDatesFilled(index)" class="py-5 px-5 caption text--darken-2 grey--text">
        Note that leaving the end date blank means you are currently working on that project.
      </v-row> -->
    </div>
    <!-- End Loop Contracts -->

    <!-- Button to Add Contracts -->
    <div class="pt-4" align="center">
      <v-btn @click="addContract()" elevation="2"><v-icon class="pr-1">add</v-icon>Contract</v-btn>
    </div>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';
import { mask } from 'vue-the-mask';
import { formatDateDashToSlash, formatDateSlashToDash, isEmpty, formatDate, parseDate } from '@/utils/utils';
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
  this.employees = await api.getItems(api.EMPLOYEES); // get all employees
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
 * Adds a project to a given contract
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
}

/**
 * Deletes a Contract.
 *
 * @param index - array index of contract to delete
 */
function deleteContract(index) {
  this.editedContracts.splice(index, 1);
} // deleteContract

function deleteProject(contractIndex, projectIndex) {
  if (this.editedContracts[contractIndex].projects.length === 1) {
    this.editedContracts[contractIndex].projects.splice(contractIndex, 1);
  } else {
    this.editedContracts[contractIndex].projects.splice(projectIndex, 1);
  }
}

/**
 * Checks if the current contract has any projects without an end date
 *
 * @param index The index of the contract in this.editedContracts
 * @return whether or not the projects for that contract have all their end dates filled
 */
function hasEndDatesFilled(index) {
  let hasEndDatesFilled = true;
  _.forEach(this.editedContracts[index].projects, (position) => {
    hasEndDatesFilled &= !!position.endDate;
  });

  return hasEndDatesFilled;
}

/**
 * Parse the date after losing focus.
 */
function parseEventDate() {
  return parseDate(event.target.value);
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
  let hasErrors = false;
  let errorCount = 0;
  if (_.isArray(this.$refs.formFields)) {
    // more than one TYPE of vuetify component used
    _.forEach(this.$refs.formFields, (field) => {
      if (!field.validate()) {
        errorCount++;
      }
    });

    if (errorCount > 0) {
      hasErrors = true;
    }
  } else if (this.$refs.formFields) {
    // single vuetify component
    hasErrors = !this.$refs.formFields.validate();
  }

  window.EventBus.$emit('doneValidating', 'contracts', this.editedContracts); // emit done validating and sends edited data back to parent
  window.EventBus.$emit('contractsStatus', [hasErrors, errorCount]); // emit error status
} // validateFields

export default {
  computed: {
    isMobile() {
      return this.$vuetify.breakpoint.sm;
    }
  },
  created,
  data() {
    return {
      contractsDropDown: [], // autocomplete contract name options
      dateOrderRule: (compIndex, projIndex) => {
        if (this.editedContracts) {
          let project = this.editedContracts[compIndex].projects[projIndex];
          return !isEmpty(project.endDate) && moment(project.endDate) && project.startDate
            ? moment(project.endDate).add(1, 'd').isAfter(moment(project.startDate)) ||
                'End date must be at or after start date'
            : true;
        } else {
          return true;
        }
      },
      dateOptionalRules: [
        //end date validation
        (v) => {
          return !isEmpty(v) ? /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) || 'Date must be valid. Format: MM/DD/YYYY' : true;
        },
        (v) => (!isEmpty(v) ? moment(v, 'MM/DD/YYYY').isValid() || 'Date must be valid' : true)
      ], // rules for an optional date
      dateRules: [
        (v) => (!isEmpty(v) && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/DD/YYYY',
        (v) => moment(v, 'MM/DD/YYYY').isValid() || 'Date must be valid'
      ], // rules for an optional date
      editedContracts: _.cloneDeep(this.model), // stores edited contracts info
      endDatePresentRule: (compIndex, projIndex) => {
        if (this.editedContracts !== undefined) {
          let position = this.editedContracts[compIndex].projects[projIndex];
          if (position.presentDate == false && isEmpty(position.endDate)) {
            return 'End Date is required';
          } else {
            return true;
          }
        } else {
          return false;
        }
      },
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
  directives: { mask },
  filters: {
    formatDate
  },
  methods: {
    addContract,
    addProject,
    deleteContract,
    deleteProject,
    formatDateSlashToDash,
    formatDateDashToSlash,
    hasEndDatesFilled,
    isEmpty,
    parseDate,
    parseEventDate,
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
