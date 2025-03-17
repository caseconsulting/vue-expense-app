<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="650">
      <v-card>
        <v-card-title class="d-flex align-center header_style">
          <v-icon class="mr-1" color="white">mdi-cog-outline</v-icon>
          <span>Settings for {{ contract.primeName }} {{ contract.contractName }}</span>
        </v-card-title>
        <v-card-text>
          <h3>Employee Timesheets Contract View</h3>
          <div class="pa-6">
            <v-row v-for="(value, key) of timesheetsContractViewOptions" :key="value">
              <v-col cols="8" class="d-flex align-center pa-0">
                {{ value.title }}
              </v-col>
              <v-col cols="4" class="pa-0">
                <div>
                  <v-switch
                    color="primary"
                    density="compact"
                    :model-value="model.settings?.timesheetsContractViewOption === key"
                    :label="model.settings?.timesheetsContractViewOption === key ? 'Enabled' : 'Disabled'"
                    class="d-inline-block"
                    hide-details
                    @update:model-value="updateSetting('timesheetsContractViewOption', key)"
                  />
                  <v-tooltip v-if="value.tooltip" activator="parent" location="top">
                    {{ value.tooltip }}
                  </v-tooltip>
                </div>
              </v-col>
            </v-row>
          </div>
          <h3>Employee Timesheet Reminder Texts</h3>
          <div class="pa-6">
            <v-row v-for="(value, key) of timesheetsReminderOptions" :key="value">
              <v-col cols="8" class="d-flex align-center pa-0">
                {{ value.title }}
              </v-col>
              <v-col cols="4" class="pa-0">
                <div>
                  <v-switch
                    color="primary"
                    density="compact"
                    :model-value="model.settings?.timesheetsReminderOption === key"
                    :label="model.settings?.timesheetsReminderOption === key ? 'Enabled' : 'Disabled'"
                    class="d-inline-block"
                    hide-details
                    @update:model-value="updateSetting('timesheetsReminderOption', key)"
                  />
                  <v-tooltip v-if="value.tooltip" activator="parent" location="top">
                    {{ value.tooltip }}
                  </v-tooltip>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="
              emitter.emit('closed-contract-settings-modal');
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
import _cloneDeep from 'lodash/cloneDeep';
import _findIndex from 'lodash/findIndex';
import _set from 'lodash/set';
import api from '@/shared/api.js';
import { inject, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { updateStoreContracts } from '@/utils/storeUtils';

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
const model = ref(_cloneDeep(props.contract));
const timesheetsContractViewOptions = ref({
  0: {
    title: 'Employee current project start date',
    tooltip: "Displays yearly data based on employee's current project start date"
  },
  1: { title: 'Contract project start date', tooltip: "Displays yearly data baed on contract's project start date" },
  2: { title: 'Contract PoP date', tooltip: 'Displays yearly data based on contract PoP start date' }
});
const timesheetsReminderOptions = ref({
  0: {
    title: 'Enable weekly reminders',
    tooltip: 'Texts employees every Friday to enter their weekly hours, and maintains monthly submission reminders'
  }
});

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Mounted lifecyle hook
 */
onMounted(() => {
  if (!store.getters.contracts) updateStoreContracts();
});

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Watcher for modal toggle
 */
watch(
  () => props.toggleModal,
  () => {
    model.value = _cloneDeep(props.contract);
    activate.value = props.toggleModal;
  }
);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Save contract settings and dispatch updates to store.
 */
async function save() {
  loading.value = true;
  let data = { id: props.contract.id, settings: model.value.settings };
  await api.updateAttribute(api.CONTRACTS, data, 'settings');
  let contracts = store.getters.contracts;
  let i = _findIndex(contracts, (c) => c.id === model.value.id);
  contracts[i] = _cloneDeep(model.value);
  store.dispatch('setContracts', { contracts });
  emitter.emit('closed-contract-settings-modal');
  loading.value = false;
} // save

/**
 * Updates the settings timesheetsContractViewOption model to the options key.
 *
 * @param {Object} setting - the setting to update
 * @param {Number} value - the value to update the setting to
 */
function updateSetting(setting, value) {
  _set(model.value, `settings.${setting}`, model.value.settings?.[setting] === value ? null : value);
} // updateSettings
</script>
