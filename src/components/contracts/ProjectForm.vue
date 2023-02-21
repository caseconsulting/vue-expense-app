<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-dialog v-model="dialog" persistent max-width="700px">
      <v-card>
        <v-card-title class="header_style"
          ><v-icon color="white" class="mr-2">mdi-briefcase-outline</v-icon
          ><span class="text-h5">New Project</span></v-card-title
        >
        <v-card-text>
          <v-container>
            <v-row>
              <!-- Project Name -->
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="projectName"
                  label="Project Name*"
                  prepend-icon="mdi-briefcase-outline"
                  required
                  :rules="[(v) => !!v || 'Field is required', duplicateProjects()]"
                ></v-text-field>
              </v-col>
              <!-- Directorate -->
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="directorate"
                  label="Directorate"
                  prepend-icon="mdi-office-building-outline"
                ></v-text-field>
              </v-col>
              <!-- PoP Start Date  -->
              <v-col cols="12" sm="6" md="6">
                <v-menu
                  ref="popStartDateMenu"
                  :close-on-content-click="false"
                  v-model="startDateMenu"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      :value="format(popStartDate, null, 'MM/DD/YYYY')"
                      v-mask="'##/##/####'"
                      v-on="on"
                      prepend-icon="event"
                      @blur="popStartDate = parseEventDate($event)"
                      @input="startDateMenu = false"
                      :rules="[...getDateOptionalRules(), startDateRules()]"
                      label="PoP Start Date"
                      hint="MM/DD/YYYY format"
                      persistent-hint
                    ></v-text-field>
                  </template>
                  <v-date-picker v-model="popStartDate" no-title @input="startDateMenu = false"></v-date-picker>
                </v-menu>
              </v-col>
              <!-- Pop End Date -->
              <v-col cols="12" sm="6" md="6">
                <v-menu
                  ref="popEndDateMenu"
                  :close-on-content-click="false"
                  v-model="endDateMenu"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      :value="format(popEndDate, null, 'MM/DD/YYYY')"
                      v-mask="'##/##/####'"
                      v-on="on"
                      prepend-icon="event"
                      @blur="popEndDate = parseEventDate($event)"
                      @input="endDateMenu = false"
                      :rules="[...getDateOptionalRules(), endDateRules()]"
                      label="PoP End Date"
                      hint="MM/DD/YYYY format"
                      persistent-hint
                    ></v-text-field>
                  </template>
                  <v-date-picker v-model="popEndDate" no-title @input="endDateMenu = false"></v-date-picker>
                </v-menu>
              </v-col>
              <!-- Description -->
              <v-col cols="12">
                <v-textarea
                  v-model="description"
                  auto-grow
                  label="Description"
                  prepend-icon="mdi-text"
                  rows="1"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
          <small>*indicates required field</small>
        </v-card-text>
        <!-- Actions -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="cancel()" :disabled="loading" color="danger" text>Cancel</v-btn>
          <v-btn @click="submit()" :loading="loading" color="success" text>Submit</v-btn>
        </v-card-actions>
      </v-card></v-dialog
    >
  </v-form>
</template>
<script>
import api from '../../shared/api';
import _ from 'lodash';
import { format, isAfter, isBefore } from '@/shared/dateUtils';
import { getDateOptionalRules } from '@/shared/validationUtils.js';
import { mask } from 'vue-the-mask';
import { v4 as uuid } from 'uuid';

/**
 * Resets the form and closed the form dialog.
 */
function cancel() {
  this.dialog = false;
  emit('canceled-project-form');
  this.$refs.form.reset();
  this.$refs.form.resetValidation();
} // cancel

/**
 * Creates a validated project.
 */
async function submit() {
  this.valid = this.$refs.form.validate();
  if (this.valid) {
    this.loading = true;
    await this.createProject();
    this.$refs.form.reset();
    this.$refs.form.resetValidation();
    this.dialog = false;
    this.loading = false;
    emit('submitted-project-form');
  }
} // submit

/**
 * Creates project upon submission.
 */
async function createProject() {
  let project = {
    id: uuid(),
    projectName: this.projectName,
    directorate: this.directorate,
    popStartDate: this.popStartDate,
    popEndDate: this.popEndDate,
    description: this.description
  };
  let contract = _.cloneDeep(this.contract);
  contract.projects = [project, ...contract.projects];
  await api.updateItem(api.CONTRACTS, contract);
  let contracts = _.cloneDeep(this.$store.getters.contracts);
  let contractIndex = contracts.findIndex((c) => c.id == contract.id);
  contracts[contractIndex] = contract;
  this.$store.dispatch('setContracts', { contracts: contracts });
} // createProject

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits a message and data if it exists.
 *
 * @param msg - Message to emit
 * @param data - The data to emit
 */
function emit(msg, data) {
  window.EventBus.$emit(msg, data);
} // emit

/**
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM-DD format
 */
function parseEventDate() {
  return this.format(event.target.value, 'MM/DD/YYYY', 'YYYY-MM-DD');
} // parseEventDate

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Watches the dialog toggle from the ContractsTable.
 */
function watchToggleProjectForm() {
  this.dialog = this.toggleProjectForm;
} // watchToggleContractForm

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  data() {
    return {
      valid: true,
      popStartDate: null,
      startDateMenu: false,
      popEndDate: null,
      endDateMenu: false,
      projectName: null,
      description: null,
      dialog: false,
      directorate: null,
      loading: false,
      duplicateProjects: () => {
        if (this.contract) {
          let contract = _.find(this.$store.getters.contracts, (c) => c.id == this.contract.id);
          let found = _.some(contract.projects, (p) => p.projectName === this.projectName);
          return !found || 'Duplicate project names';
        }
      },
      endDateRules: () => {
        return this.popStartDate && this.popEndDate
          ? isAfter(this.popEndDate, this.popStartDate) || 'End date must be after the start date'
          : true;
      },
      startDateRules: () => {
        return this.popStartDate && this.popEndDate
          ? isBefore(this.popStartDate, this.popEndDate) || 'Start date must be before the end date'
          : true;
      }
    };
  },
  directives: { mask },
  methods: {
    cancel,
    createProject,
    emit,
    format,
    getDateOptionalRules,
    parseEventDate,
    submit
  },
  props: ['toggleProjectForm', 'contract'],
  watch: {
    toggleProjectForm: watchToggleProjectForm
  }
};
</script>
