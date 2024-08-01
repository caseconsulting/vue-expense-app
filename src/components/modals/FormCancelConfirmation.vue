<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-title align="center">Are you sure you want to cancel?</v-card-title>
        <slot></slot>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            id="submitNoBtn"
            color="red"
            variant="text"
            @click="
              emit(`canceled-${type}`);
              activate = false;
            "
            :loading="!activate || submitting"
            :disabled="!activate || submitting"
          >
            No
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            id="submitYesBtn"
            color="green-darken-1"
            variant="text"
            @click="
              emit(`confirmed-${type}`);
              activate = false;
            "
            :loading="!activate || submitting"
            :disabled="!activate || submitting"
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
import { ref, inject, watch } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const activate = ref(false); // dialog activator
const emitter = inject('emitter');
const props = defineProps([
  'submitting',
  'toggleSubmissionConfirmation', // dialog activator,
  'type' //sends appropriate emits based on where its called
]);

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

/**
 * watcher for toggleSubmissionConfirmation
 */
watch(
  () => props.toggleSubmissionConfirmation,
  () => {
    activate.value = props.toggleSubmissionConfirmation;
  }
); // watchToggleSubmissionConfirmation
</script>
