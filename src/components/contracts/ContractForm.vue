<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-row justify="center">
      <v-dialog v-model="dialog" persistent max-width="700px">
        <v-card>
          <!-- Title -->
          <v-card-title class="d-flex align-center header_style">
            <v-icon class="mr-1" color="white">mdi-file-document-plus</v-icon>
            <span class="text-h5">New Contract</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <!-- Contract Name -->
                <v-col cols="12" sm="6" md="6">
                  <v-text-field
                    variant="underlined"
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
                    variant="underlined"
                    v-model="primeName"
                    :rules="[(v) => !!v || 'Field is required', duplicateContractPrimeCombo()]"
                    label="Prime Name*"
                    prepend-icon="mdi-domain"
                    required
                  ></v-text-field>
                </v-col>

                <!-- Directorate -->
                <v-col cols="12" sm="6" md="6">
                  <v-combobox
                    v-model="directorate"
                    :items="getOrgList('directorate', { org2, org3 })"
                    label="Directorate (Org 1)"
                    variant="underlined"
                    prepend-icon="mdi-office-building-outline"
                  ></v-combobox>
                </v-col>
                <!-- Org 2 -->
                <v-col cols="12" sm="6" md="6">
                  <v-combobox
                    v-model="org2"
                    :items="getOrgList('org2', { directorate, org3 })"
                    label="Org 2"
                    variant="underlined"
                    prepend-icon="mdi-office-building-outline"
                  ></v-combobox>
                </v-col>
                <!-- Org 3 -->
                <v-col cols="12" sm="6" md="6">
                  <v-combobox
                    v-model="org3"
                    :items="getOrgList('org3', { directorate, org2 })"
                    label="Org 3"
                    variant="underlined"
                    prepend-icon="mdi-office-building-outline"
                  ></v-combobox>
                </v-col>

                <!-- spacer to put PoPs on the same line -->
                <v-col class="d-none d-sm-block"></v-col>

                <!-- PoP Start Date  -->
                <v-col cols="12" sm="6" md="6">
                  <v-text-field
                    variant="underlined"
                    v-model="popStartDate"
                    prepend-icon="mdi-calendar"
                    label="PoP Start Date"
                  ></v-text-field>
                </v-col>
                <!-- Pop End Date -->
                <v-col cols="12" sm="6" md="6">
                  <v-text-field
                    variant="underlined"
                    v-model="popEndDate"
                    prepend-icon="mdi-calendar"
                    label="PoP End Date"
                  ></v-text-field>
                </v-col>
                <!-- Projects -->
                <v-col cols="12">
                  <v-combobox
                    variant="underlined"
                    chips
                    v-model="projects"
                    :rules="[
                      (v) => projects.length != 0 || 'Field is required: type and press tab/enter to add a project'
                    ]"
                    hide-selected
                    hint="Type and press enter/tab to add a project"
                    label="Projects*"
                    multiple
                    persistent-hint
                    prepend-icon="mdi-briefcase-outline"
                    closable-chips
                    required
                  >
                  </v-combobox>
                </v-col>
                <!-- Description -->
                <v-col cols="12">
                  <v-textarea
                    v-model="description"
                    auto-grow
                    variant="underlined"
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
            <v-btn @click="cancel()" :disabled="loading" color="danger" variant="text"> Cancel </v-btn>
            <v-btn @click="submit()" :loading="loading" :disabled="!valid" color="success" variant="text">
              Submit
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </v-form>
</template>

<script setup>
import _some from 'lodash/some';
import api from '@/shared/api.js';
import { generateUUID } from '@/utils/utils';
import { useStore } from 'vuex';
import { ref, watch, inject } from 'vue';
import { getOrgList } from '@/shared/contractUtils';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['toggleContractForm']);
const store = useStore();
const emitter = inject('emitter');
const contractName = ref(null);
const primeName = ref(null);
const directorate = ref(null);
const org2 = ref(null);
const org3 = ref(null);
const popStartDate = ref(null);
const popEndDate = ref(null);
const projects = ref([]);
const description = ref(null);
const dialog = ref(false);
const loading = ref(false);
const valid = ref(false);
const duplicateContractPrimeCombo = ref(() => {
  let found = _some(
    store.getters.contracts,
    (c) => c.contractName === contractName.value && c.primeName === primeName.value
  );
  return !found || 'Duplicate contract and prime combination';
});
const form = ref(null);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Resets the form and closes the form dialog.
 */
function cancel() {
  dialog.value = false;
  emitter.emit('canceled-contract-form');
  form.value.reset();
  form.value.resetValidation();
} // cancel

/**
 * Organizes the data and creates a contract.
 *
 * @returns Object - The contract that was created
 */
async function createContract() {
  let contractProjects = projects.value.map((project) => {
    return { id: generateUUID(), projectName: project, status: api.CONTRACT_STATUSES.ACTIVE };
  });
  let contract = await api.createItem(api.CONTRACTS, {
    id: generateUUID(),
    contractName: contractName.value,
    primeName: primeName.value,
    directorate: directorate.value,
    org2: org2.value,
    org3: org3.value,
    popStartDate: popStartDate.value,
    popEndDate: popEndDate.value,
    projects: contractProjects,
    description: description.value,
    status: api.CONTRACT_STATUSES.ACTIVE
  });
  store.dispatch('setContracts', { contracts: [contract, ...store.getters.contracts] });
} // createContract

/**
 * Creates a validated contract.
 */
async function submit() {
  valid.value = await form.value.validate();
  valid.value = valid.value.valid;
  if (valid.value) {
    loading.value = true;
    let contract = await createContract();
    form.value.reset();
    form.value.resetValidation();
    dialog.value = false;
    loading.value = false;
    emitter.emit('submitted-contract-form', contract);
  }
} // submit

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

watch(
  () => props.toggleContractForm,
  () => watchToggleContractForm()
);

/**
 * Watches the dialog toggle from the Contracts.vue page.
 */
function watchToggleContractForm() {
  dialog.value = props.toggleContractForm;
} // watchToggleContractForm
</script>
