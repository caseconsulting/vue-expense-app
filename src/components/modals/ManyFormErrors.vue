<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="330">
      <v-card>
        <!-- Errors across tabs -->
        <v-card-text class="font-weight-medium text-h6">Error(s) found across tabs</v-card-text>
        <v-card-text>
          <ul>
            <li v-for="tab in Object.keys(errorTabs)" :key="tab">
              {{ tab }}: found {{ errorTabs[tab] }} invalid entr{{ isPlural(errorTabs[tab]) }}
            </li>
          </ul>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="
              emit('canceled-form');
              activate = false;
            "
          >
            Ok
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
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const activate = ref(false); // dialog activator
const emitter = inject('emitter');
const props = defineProps([
  'errorTabs',
  'toggleSubmissionConfirmation' // dialog activator
]);

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
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
 * changes text based on if there is one or if there is more than one
 *
 * @param val - the number that we go off of
 * @return String - the ending of the text
 */
function isPlural(val) {
  if (val === 1) {
    return 'y';
  }
  return 'ies';
} // isPlural

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

<style scoped>
li {
  color: red;
}
</style>
