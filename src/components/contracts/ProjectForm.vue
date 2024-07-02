<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-dialog v-model="dialog" persistent max-width="700px">
      <v-card>
        <v-card-title class="d-flex align-center header_style"
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
                  variant="underlined"
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
                  variant="underlined"
                  prepend-icon="mdi-office-building-outline"
                ></v-text-field>
              </v-col>
              <!-- PoP Start Date  -->
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="popStartDate"
                  prepend-icon="mdi-calendar"
                  variant="underlined"
                  label="PoP Start Date"
                ></v-text-field>
              </v-col>
              <!-- Pop End Date -->
              <v-col cols="12" sm="6" md="6">
                <v-text-field
                  v-model="popEndDate"
                  prepend-icon="mdi-calendar"
                  variant="underlined"
                  label="PoP End Date"
                ></v-text-field>
              </v-col>
              <!-- Description -->
              <v-col cols="12">
                <v-textarea
                  v-model="description"
                  auto-grow
                  label="Description"
                  variant="underlined"
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
          <v-btn @click="cancel()" :disabled="loading" color="danger" variant="text">Cancel</v-btn>
          <v-btn @click="submit()" :loading="loading" :disabled="!valid" color="success" variant="text">Submit</v-btn>
        </v-card-actions>
      </v-card></v-dialog
    >
  </v-form>
</template>

<script setup>
import api from '../../shared/api';
import _ from 'lodash';
import { generateUUID } from '@/utils/utils';
import { ref, watch, inject } from 'vue';
import { useStore } from 'vuex';

const props = defineProps(['toggleProjectForm', 'contract']);
const emitter = inject('emitter');
const store = useStore();
const valid = ref(false);
const popStartDate = ref(null);
const popEndDate = ref(null);
const projectName = ref(null);
const description = ref(null);
const dialog = ref(false);
const directorate = ref(null);
const loading = ref(false);
const duplicateProjects = ref(() => {
  if (props.contract) {
    let contract = _.find(store.getters.contracts, (c) => c.id == props.contract.id);
    let found = _.some(contract.projects, (p) => p.projectName === projectName.value);
    return !found || 'Duplicate project names';
  }
});
const form = ref(null);

/**
 * Resets the form and closed the form dialog.
 */
function cancel() {
  dialog.value = false;
  emitter.emit('canceled-project-form');
  form.value.reset();
  form.value.resetValidation();
} // cancel

/**
 * Creates a validated project.
 */
async function submit() {
  valid.value = form.value.validate();
  if (valid.value) {
    loading.value = true;
    await createProject();
    form.value.reset();
    form.value.resetValidation();
    dialog.value = false;
    loading.value = false;
    emitter.emit('submitted-project-form');
  }
} // submit

/**
 * Creates project upon submission.
 */
async function createProject() {
  let project = {
    id: generateUUID(),
    projectName: projectName.value,
    directorate: directorate.value,
    popStartDate: popStartDate.value,
    popEndDate: popEndDate.value,
    description: description.value,
    status: api.CONTRACT_STATUSES.ACTIVE
  };
  let contract = _.cloneDeep(props.contract);
  contract.projects = [project, ...contract.projects];
  await api.updateItem(api.CONTRACTS, contract);
  let contracts = _.cloneDeep(store.getters.contracts);
  let contractIndex = contracts.findIndex((c) => c.id == contract.id);
  contracts[contractIndex] = contract;
  store.dispatch('setContracts', { contracts: contracts });
} // createProject

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

watch(
  () => props.toggleProjectForm,
  () => watchToggleProjectForm()
);

/**
 * Watches the dialog toggle from the ContractsTable.
 */
function watchToggleProjectForm() {
  dialog.value = props.toggleProjectForm;
} // watchToggleContractForm
</script>
