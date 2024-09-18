<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-dialog v-model="dialog" persistent max-width="800px">
      <v-card>
        <v-card-title class="d-flex align-center header_style"
          ><v-icon color="white" class="mr-2">mdi-briefcase-outline</v-icon
          ><span class="text-h5">New Project</span></v-card-title
        >
        <v-card-text>
          <v-container>
            <v-row>
              <!-- Project Name -->
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="projectName"
                  label="Project Name*"
                  variant="underlined"
                  prepend-icon="mdi-briefcase-outline"
                  required
                  :rules="[(v) => !!v || 'Field is required', duplicateProjects()]"
                ></v-text-field>
              </v-col>
              <!-- Location -->
              <v-col cols="12" sm="6" md="4">
                <v-combobox
                  v-model="location"
                  :items="getProjectLocations()"
                  label="Location"
                  variant="underlined"
                  prepend-icon="mdi-map-marker-radius"
                  clearable
                ></v-combobox>
              </v-col>

              <!-- Work Type -->
              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="workType"
                  :items="['On-site', 'Hybrid', 'Remote']"
                  label="Work Type"
                  variant="underlined"
                  clearable
                  prepend-icon="mdi-key-chain-variant"
                ></v-select>
              </v-col>

              <!-- Customer Org -->
              <v-col cols="12" sm="6" md="6">
                <v-combobox
                  v-model="customerOrg"
                  :items="getOrgList('customerOrg', { directorate, org2, org3 })"
                  label="Customer Org"
                  variant="underlined"
                  prepend-icon="mdi-office-building-outline"
                ></v-combobox>
              </v-col>
              <!-- Directorate -->
              <v-col cols="12" sm="6" md="6">
                <v-combobox
                  v-model="directorate"
                  :items="getOrgList('directorate', { customerOrg, org2, org3 })"
                  label="Directorate (Org 1)"
                  variant="underlined"
                  prepend-icon="mdi-office-building-outline"
                ></v-combobox>
              </v-col>
              <!-- Org 2 -->
              <v-col cols="12" sm="6" md="6">
                <v-combobox
                  v-model="org2"
                  :items="getOrgList('org2', { customerOrg, directorate, org3 })"
                  label="Org 2"
                  variant="underlined"
                  prepend-icon="mdi-office-building-outline"
                ></v-combobox>
              </v-col>
              <!-- Org 3 -->
              <v-col cols="12" sm="6" md="6">
                <v-combobox
                  v-model="org3"
                  :items="getOrgList('org3', { customerOrg, directorate, org2 })"
                  label="Org 3"
                  variant="underlined"
                  prepend-icon="mdi-office-building-outline"
                ></v-combobox>
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
import _find from 'lodash/find';
import _some from 'lodash/some';
import _cloneDeep from 'lodash/cloneDeep';
import { generateUUID } from '@/utils/utils';
import { ref, watch, inject } from 'vue';
import { useStore } from 'vuex';
import { getOrgList, getProjectLocations } from '@/shared/contractUtils';

const props = defineProps(['toggleProjectForm', 'contract']);
const emitter = inject('emitter');
const store = useStore();
const valid = ref(false);
const popStartDate = ref(null);
const popEndDate = ref(null);
const projectName = ref(null);
const location = ref(null);
const workType = ref(null);
const description = ref(null);
const dialog = ref(false);
const customerOrg = ref(null);
const directorate = ref(null);
const org2 = ref(null);
const org3 = ref(null);
const loading = ref(false);
const duplicateProjects = ref(() => {
  if (props.contract) {
    let contract = _find(store.getters.contracts, (c) => c.id == props.contract.id);
    let found = _some(contract.projects, (p) => p.projectName === projectName.value);
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
    location: location.value,
    workType: workType.value,
    customerOrg: customerOrg.value,
    directorate: directorate.value,
    org2: org2.value,
    org3: org3.value,
    popStartDate: popStartDate.value,
    popEndDate: popEndDate.value,
    description: description.value,
    status: api.CONTRACT_STATUSES.ACTIVE
  };
  let contract = _cloneDeep(props.contract);
  contract.projects = [project, ...contract.projects];
  await api.updateItem(api.CONTRACTS, contract);
  let contracts = _cloneDeep(store.getters.contracts);
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
