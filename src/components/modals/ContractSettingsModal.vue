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
<script>
import _ from 'lodash';
import api from '@/shared/api.js';
import { updateStoreContracts } from '@/utils/storeUtils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Created lifecyle hook
 */
function created() {
  if (!this.$store.getters.contracts) this.updateStoreContracts();
} // created

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
  this.emitter.emit(msg);
} // emit

/**
 * Save contract settings and dispatch updates to store.
 */
async function save() {
  this.loading = true;
  let data = { id: this.contract.id, contractViewEnabled: this.model.contractViewEnabled };
  await api.updateAttribute(api.CONTRACTS, data, 'contractViewEnabled');
  let contracts = this.$store.getters.contracts;
  let i = _.findIndex(contracts, (c) => c.id === this.model.id);
  contracts[i] = _.cloneDeep(this.model);
  this.$store.dispatch('setContracts', { contracts });
  this.emit('closed-contract-settings-modal');
  this.loading = false;
} // save

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Watcher for modal toggle
 */
function watchToggleModal() {
  this.model = _.cloneDeep(this.contract);
  if (this.toggleModal) this.activate = true;
} // watchEmployeesAssignedModal

export default {
  created,
  data() {
    return {
      loading: false,
      activate: false,
      model: _.cloneDeep(this.contract)
    };
  },
  methods: {
    emit,
    save,
    updateStoreContracts
  },
  props: ['toggleModal', 'contract'],
  watch: {
    toggleModal: watchToggleModal
  }
};
</script>
