<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-text class="text-h5">Are you sure you want to cancel?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <!-- id needed for nigthwatch tests -->
          <v-btn
            id="submitNoBtn"
            color="red"
            variant="text"
            @click="
              activate = false;
              loading = true;
              emit(`backout-canceled-${type}`);
            "
            :loading="loading"
            :disabled="loading"
          >
            No
          </v-btn>
          <v-spacer></v-spacer>
          <!-- id needed for nigthwatch tests -->
          <v-btn
            id="submitYesBtn"
            color="green-darken-1"
            variant="text"
            @click="
              emit(`backout-confirmed-${type}`);
              activate = false;
              loading = true;
            "
            :loading="loading"
            :disabled="loading"
          >
            Yes
          </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { inject, ref, watch } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|
const props = defineProps([
  'toggleSubmissionConfirmation', // dialog activator,
  'type' //sends appropriate emits based on where its called
]);
const emitter = inject('emitter');

const activate = ref(false); // dialog activator
const loading = ref(false); // loading circle

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

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

// watcher for toggleSubmissionConfirmation
watch(
  () => props.toggleSubmissionConfirmation,
  () => {
    activate.value = props.toggleSubmissionConfirmation;
    loading.value = false;
  }
);
</script>
