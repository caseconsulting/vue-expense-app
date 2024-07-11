<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-text class="font-weight-medium text-h6">{{ title }}</v-card-text>
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
  'title',
  'toggleModal', // dialog activator,
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
  () => props.toggleModal,
  () => {
    activate.value = props.toggleModal;
  }
); // watchToggleSubmissionConfirmation
</script>
