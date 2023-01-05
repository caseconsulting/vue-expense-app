<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-row justify="center">
      <v-dialog v-model="dialog" persistent max-width="600px">
        <v-card>
          <v-card-title>
            <span class="text-h5">New Contract</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6" md="6">
                  <v-text-field
                    v-model="contractName"
                    :rules="[(v) => !!v || 'Field is required']"
                    label="Contract Name*"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <v-text-field
                    v-model="primeName"
                    :rules="[(v) => !!v || 'Field is required']"
                    label="Prime Name*"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="popStartDate"
                    :rules="[(v) => !!v || 'Field is required']"
                    label="PoP Start Date*"
                    hint="MM/DD/YYYY format"
                    persistent-hint
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="popEndDate"
                    :rules="[(v) => !!v || 'Field is required']"
                    label="PoP End Date*"
                    hint="MM/DD/YYYY format"
                    persistent-hint
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="costType"
                    :rules="[(v) => !!v || 'Field is required']"
                    label="Cost Type*"
                    required
                  ></v-text-field>
                </v-col>
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
                    small-chips
                    deletable-chips
                    required
                  >
                  </v-combobox>
                </v-col>
              </v-row>
            </v-container>
            <small>*indicates required field</small>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="cancel()" color="danger" text> Cancel </v-btn>
            <v-btn @click="submit()" color="success" text> Submit </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </v-form>
</template>

<script>
//import api from '@/shared/api';
import { v4 as uuid } from 'uuid';

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

async function createContract() {
  this.projects.map((project) => {
    return { id: uuid(), projectName: project };
  });
  //   let contract = {
  //     id: uuid(),
  //     contractName: this.contractName,
  //     primeName: this.primeName,
  //     popStartDate: this.popStartDate,
  //     popEndDate: this.popEndDate,
  //     costType: this.costType,
  //     projects: this.projects
  //   };
  //   api.createItem()
}

/**
 * Emits a message and data if it exists.
 *
 * @param msg - Message to emit
 */
function emit(msg) {
  window.EventBus.$emit(msg);
} // emit

/**
 * Creates a validated contract.
 */
async function submit() {
  this.valid = this.$refs.form.validate();
  if (this.valid) {
    await this.createContract();
    this.dialog = false;
    emit('submitted-contract-form');
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
      popStartDate: null,
      popEndDate: null,
      costType: null,
      projects: [],
      dialog: false,
      valid: true
    };
  },
  methods: {
    cancel,
    createContract,
    emit,
    submit
  },
  props: ['toggleContractForm'],
  watch: {
    toggleContractForm: watchToggleContractForm
  }
};
</script>
