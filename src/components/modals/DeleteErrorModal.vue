<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-text class="font-weight-medium text-h6">Error: cannot delete {{ type }}</v-card-text>
        <v-card-text>Cannot delete {{ type }}. Expenses for this {{ type }} exist.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="gray darken-1"
            variant="text"
            @click="
              emit(`invalid-${type}-delete`);
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
import { inject, ref, watch } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps([
  'toggleDeleteErrorModal', // dialog activator
  'type' // type of object being deleted
]);
const emitter = inject('emitter');

const activate = ref(false); // dialog activator

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

// Watcher for toggleDeleteErrorModal
watch(
  () => props.toggleDeleteErrorModal,
  () => {
    activate.value = props.toggleDeleteErrorModal;
    console.log(activate.value); // TODO debug
  }
);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits a message.
 *
 * @param msg - Message to emit
 */
function emit(msg) {
  emitter.emit(msg);
} // emit
</script>
