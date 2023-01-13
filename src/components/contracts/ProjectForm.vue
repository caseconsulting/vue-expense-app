<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-dialog v-model="dialog" persistent max-width="700px">
      <v-card>
        <v-card-title class="header_style"><span class="text-h5">New Project</span></v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-text-field v-model="projectName" label="Project Name" required></v-text-field>
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
import { v4 as uuid } from 'uuid';

function cancel() {
  this.dialog = false;
  emit('canceled-project-form');
  this.$refs.form.reset();
  this.$refs.form.resetValidation();
} // cancel

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
}

async function createProject() {
  let project = { id: uuid(), projectName: this.projectName };
  console.log(this.contract.id);
  let contract = _.cloneDeep(this.contract);
  contract.projects = [project, ...contract.projects];
  await api.updateItem(api.CONTRACTS, contract);
  let contracts = _.cloneDeep(this.$store.getters.contracts);
  let contractIndex = contracts.findIndex((c) => c.id == contract.id);
  contracts[contractIndex] = contract;
  this.$store.dispatch('setContracts', { contracts: contracts });
}

/**
 * Emits a message and data if it exists.
 *
 * @param msg - Message to emit
 * @param data - The data to emit
 */
function emit(msg, data) {
  window.EventBus.$emit(msg, data);
} // emit

function watchToggleProjectForm() {
  this.dialog = this.toggleProjectForm;
}

export default {
  data() {
    return {
      valid: true,
      projectName: null,
      dialog: false,
      loading: false
    };
  },
  methods: {
    createProject,
    emit,
    cancel,
    submit
  },
  props: ['toggleProjectForm', 'contract'],
  watch: {
    toggleProjectForm: watchToggleProjectForm
  }
};
</script>
