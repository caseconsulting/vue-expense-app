<template>
  <!-- Status Alert -->
  <v-snackbar
    v-model="status.show"
    :color="status.color"
    :location="status.location"
    :timeout="status.timeout"
    vertical
    multi-line
  >
    <v-card-text color="white">
      <span class="text-h6 font-weight-medium">{{ status.statusMessage }}</span>
    </v-card-text>
    <v-btn color="white" variant="text" @click="clearStatus()"> Close </v-btn>
  </v-snackbar>
</template>

<script setup>
import { emitter } from '@/main.js';
import { onUnmounted, ref } from 'vue';
// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const status = ref({
  show: false,
  statusType: undefined,
  statusMessage: null,
  color: null,
  timeout: 5000,
  location: ''
});

emitter.on('status-error', (data) => displayError(data.err, data.timeout, data.location, data.color));
emitter.on('status-success', (data) => displaySuccess(data.msg, data.timeout, data.location, data.color));

onUnmounted(() => {
  emitter.off('status-error');
  emitter.off('status-success');
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Clear the action status that is displayed in the snackbar.
 */
function clearStatus() {
  status.value['show'] = false;
  status.value['statusType'] = undefined;
  status.value['statusMessage'] = null;
  status.value['color'] = null;
  status.value['location'] = '';
  status.value['timeout'] = 5000;
} // clearStatus

/**
 * Set and display an error action status in the snackbar.
 *
 * @param err String error message
 * @param timeout timeout in milliseconds
 * @param location location of snackbar
 * @param color color of snackbar
 */
function displayError(err, timeout, location, color) {
  status.value['timeout'] = timeout;
  status.value['location'] = location;
  status.value['statusType'] = 'ERROR';
  status.value['statusMessage'] = err;
  status.value['color'] = color;
  status.value['show'] = true;
} //displayError

/**
 * Displays success message
 * @param msg success message to display
 * @param timeout timeout in milliseconds
 * @param location location of snackbar
 * @param color color of snackbar
 */
function displaySuccess(msg, timeout, location, color) {
  status.value['timeout'] = timeout;
  status.value['location'] = location;
  status.value['statusType'] = 'SUCCESS';
  status.value['statusMessage'] = msg;
  status.value['color'] = color;
  status.value['show'] = true;
} // displySuccess
</script>

<script>
// |--------------------------------------------------|
// |                                                  |
// |                       EXPORT                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Set and display an error action status in the snackbar.
 *
 * @param err String error message
 * @param timeout (OPTIONAL) timeout in milliseconds
 * @param location (OPTIONAL) location of snackbar
 * @param color (OPTIONAL) color of snackbar
 */
export function useDisplayError(err, timeout = 5000, location = 'top right', color = 'red') {
  emitter.emit('status-error', { err, timeout, location, color });
}

/**
 * Displays success message
 * @param msg success message to display
 * @param timeout (OPTIONAL) timeout in milliseconds
 * @param location (OPTIONAL) location of snackbar
 * @param color (OPTIONAL) color of snackbar
 */
export function useDisplaySuccess(msg, timeout = 5000, location = 'top right', color = 'green') {
  emitter.emit('status-success', { msg, timeout, location, color });
}
</script>
