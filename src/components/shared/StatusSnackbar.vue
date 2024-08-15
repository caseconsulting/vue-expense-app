<template>
  <!-- Status Alert -->
  <v-snackbar
    v-if="status.show"
    v-model="status.show"
    :color="status.color"
    :location="status.location"
    :timeout="status.timeout"
    :vertical="status.statusType == 'SUCCESS' || status.statusType == 'ERROR'"
    multi-line
  >
    <div v-if="status.statusType == 'SUCCESS' || status.statusType == 'ERROR'">
      <v-card-text color="white">
        <span class="text-h6 font-weight-medium">{{ status.statusMessage }}</span>
      </v-card-text>
    </div>
    <div v-else class="font-weight-bold text-body-2 text-center pa-0">
      {{ status.statusMessage }}
    </div>
    <template v-slot:actions v-if="status.closeColor">
      <v-btn :color="status.closeColor" variant="text" @click="clearStatus()"> Close </v-btn>
    </template>
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
  closeColor: 'white',
  timeout: 5000,
  location: ''
});

emitter.on('status-error', (data) => displayError(data.err, data.timeout, data.location, data.color));
emitter.on('status-success', (data) => displaySuccess(data.msg, data.timeout, data.location, data.color));
emitter.on('status-custom', (data) =>
  displayCustom(data.msg, data.type, data.timeout, data.location, data.color, data.closeColor)
);

onUnmounted(() => {
  emitter.off('status-error');
  emitter.off('status-success');
  emitter.off('status-custom');
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
  status.value['closeColor'] = 'white';
  status.value['location'] = '';
  status.value['timeout'] = 5000;

  emitter.emit('status-close');
} // clearStatus

/**
 * Displays success message
 * @param msg success message to display
 * @param timeout timeout in milliseconds
 * @param location location of snackbar
 * @param color color of snackbar
 * @param closeColor color of close button
 */
function displayCustom(msg, type, timeout, location, color, closeColor) {
  status.value['timeout'] = timeout;
  status.value['location'] = location;
  status.value['statusType'] = type;
  status.value['statusMessage'] = msg;
  status.value['color'] = color;
  status.value['closeColor'] = closeColor;
  status.value['show'] = true;
} // displyCustom

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
  status.value['closeColor'] = 'white';
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
  status.value['closeColor'] = 'white';
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
 * Displays success message
 * @param msg success message to display
 * @param type (OPTIONAL) type of message
 * @param timeout (OPTIONAL) timeout in milliseconds
 * @param color (OPTIONAL) color of snackbar
 * @param closeColor (OPTIONAL) color of close button
 * @param location (OPTIONAL) location of snackbar
 *
 * if no closeColor is noted, the close button will not render
 */
export function useDisplayCustom(
  msg,
  type = 'CUSTOM',
  timeout = 5000,
  color = 'green',
  closeColor = '',
  location = 'top right'
) {
  emitter.emit('status-custom', { msg, type, timeout, location, color, closeColor });
}

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
