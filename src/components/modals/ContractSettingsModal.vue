<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="650">
      <v-card>
        <v-card-title class="d-flex align-center header_style">
          <v-icon class="mr-1" color="white">mdi-cog-outline</v-icon>
          <span>Settings for {{ contract.primeName }} {{ contract.contractName }}</span>
        </v-card-title>
        <v-card-text>
          <v-row class="d-flex align-center">
            <span> Employee Timesheets Contract View: </span>
            <div>
              <v-switch
                v-model="model.contractViewEnabled"
                color="primary"
                :label="model.contractViewEnabled ? 'Enabled' : 'Disabled'"
                class="d-inline-block ml-5"
                hide-details
              />
              <v-tooltip activator="parent" location="top">
                Displays yearly data based on employee's current project start date
              </v-tooltip>
            </div>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="
              emit('closed-contract-settings-modal');
              activate = false;
            "
            :disabled="loading"
            >Close</v-btn
          >
          <v-btn
            variant="text"
            class="text-green"
            @click="
              save();
              activate = false;
            "
            :disabled="loading"
            :loading="loading"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import _ from 'lodash';
import api from '@/shared/api.js';
import { updateStoreContracts } from '@/utils/storeUtils';
import { inject, ref, watch } from 'vue';
import { useStore } from 'vuex';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['toggleModal', 'contract']);
const emitter = inject('emitter');
const store = useStore();

const loading = ref(false);
const activate = ref(false);
const model = ref(_.cloneDeep(props.contract));

if (!store.getters.contracts) updateStoreContracts();

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

// Watcher for modal toggle
watch(
  () => props.toggleModal,
  () => {
    model.value = _.cloneDeep(props.contract);
    if (props.toggleModal) activate.value = props.toggleModal;
  }
);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits a message and data if it exists.
 *
 * @param msg - Message to emit
 */
function emit(msg) {
  emitter.emit(msg);
} // emit

/**
 * Save contract settings and dispatch updates to store.
 */
async function save() {
  loading.value = true;
  let data = { id: props.contract.id, contractViewEnabled: model.value.contractViewEnabled };
  await api.updateAttribute(api.CONTRACTS, data, 'contractViewEnabled');
  let contracts = store.getters.contracts;
  let i = _.findIndex(contracts, (c) => c.id === model.value.id);
  contracts[i] = _.cloneDeep(model.value);
  store.dispatch('setContracts', { contracts });
  emit('closed-contract-settings-modal');
  loading.value = false;
} // save
</script>
