<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-row justify="center">
      <v-dialog v-model="dialog" persistent max-width="700px">
        <v-card>
          <!-- Title -->
          <v-card-title class="header_style">
            <v-icon color="white" class="mr-2">mdi-file-document-plus</v-icon>
            <span class="text-h5">New Contract</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <!-- Contract Name -->
                <v-col cols="12" sm="6" md="6">
                  <v-text-field
                    v-model="contractName"
                    :rules="[(v) => !!v || 'Field is required', duplicateContractPrimeCombo()]"
                    label="Contract Name*"
                    prepend-icon="mdi-script-outline"
                    required
                  ></v-text-field>
                </v-col>
                <!-- Prime Name -->
                <v-col cols="12" sm="6" md="6">
                  <v-text-field
                    v-model="primeName"
                    :rules="[(v) => !!v || 'Field is required', duplicateContractPrimeCombo()]"
                    label="Prime Name*"
                    prepend-icon="mdi-domain"
                    required
                  ></v-text-field>
                </v-col>
                <!-- Directorate -->
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="directorate"
                    label="Directorate"
                    prepend-icon="mdi-office-building-outline"
                  ></v-text-field>
                </v-col>
                <!-- PoP Start Date  -->
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="popStartDate" prepend-icon="event" label="PoP Start Date"></v-text-field>
                </v-col>
                <!-- Pop End Date -->
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="popEndDate" prepend-icon="event" label="PoP End Date"></v-text-field>
                </v-col>
                <!-- Projects -->
                <v-col cols="12">
                  <v-combobox
                    v-model="projects"
                    :rules="[
                      (v) => projects.length != 0 || 'Field is required: type and press tab/enter to add a project'
                    ]"
                    hide-selected
                    hint="Type and press tab/enter to add a project"
                    label="Projects*"
                    multiple
                    persistent-hint
                    prepend-icon="mdi-briefcase-outline"
                    small-chips
                    deletable-chips
                    required
                  >
                  </v-combobox>
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
            <v-btn @click="cancel()" :disabled="loading" color="danger" text> Cancel </v-btn>
            <v-btn @click="submit()" :loading="loading" color="success" text> Submit </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </v-form>
</template>

<script>
import _ from 'lodash';
import api from '@/shared/api.js';
import { updateStoreContracts } from '@/utils/storeUtils';
import { generateUUID } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Resets the form and closes the form dialog.
 */
function cancel() {
  this.dialog = false;
  emit('canceled-contract-form');
  this.$refs.form.reset();
  this.$refs.form.resetValidation();
} // cancel

/**
 * Organizes the data and creates a contract.
 *
 * @returns Object - The contract that was created
 */
async function createContract() {
  let contractProjects = this.projects.map((project) => {
    return { id: generateUUID(), projectName: project, status: api.CONTRACT_STATUSES.ACTIVE };
  });
  let contract = await api.createItem(api.CONTRACTS, {
    id: generateUUID(),
    contractName: this.contractName,
    primeName: this.primeName,
    directorate: this.directorate,
    popStartDate: this.popStartDate,
    popEndDate: this.popEndDate,
    projects: contractProjects,
    description: this.description,
    status: api.CONTRACT_STATUSES.ACTIVE
  });
  this.$store.dispatch('setContracts', { contracts: [contract, ...this.$store.getters.contracts] });
} // createContract

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
 * Creates a validated contract.
 */
async function submit() {
  this.valid = this.$refs.form.validate();
  if (this.valid) {
    this.loading = true;
    let contract = await this.createContract();
    this.$refs.form.reset();
    this.$refs.form.resetValidation();
    this.dialog = false;
    this.loading = false;
    emit('submitted-contract-form', contract);
  }
} // submit

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Watches the dialog toggle from the Contracts.vue page.
 */
function watchToggleContractForm() {
  this.dialog = this.toggleContractForm;
} // watchToggleContractForm

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  data() {
    return {
      contractName: null,
      primeName: null,
      directorate: null,
      popStartDate: null,
      popEndDate: null,
      projects: [],
      description: null,
      dialog: false,
      loading: false,
      valid: true,
      duplicateContractPrimeCombo: () => {
        let found = _.some(
          this.$store.getters.contracts,
          (c) => c.contractName === this.contractName && c.primeName === this.primeName
        );
        return !found || 'Duplicate contract and prime combination';
      }
    };
  },
  methods: {
    cancel,
    createContract,
    emit,
    submit,
    updateStoreContracts
  },
  props: ['toggleContractForm'],
  watch: {
    toggleContractForm: watchToggleContractForm
  }
};
</script>
