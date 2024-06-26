<template>
  <div>
    <v-dialog v-model="activate" @click:outside="closeModal()" max-width="350">
      <v-card>
        <v-card-text class="font-weight-medium text-h6">Error: cannot delete {{ type }}</v-card-text>
        <v-card-text>Cannot delete {{ type }}. Expenses for this {{ type }} exist.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="gray darken-1" variant="text" @click="closeModal()"> Ok </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
<<<<<<< HEAD
import { inject } from 'vue';
=======
import { inject, onBeforeUnmount, ref, watch } from 'vue';
>>>>>>> 95406fae (POR 2720 - sync with master (#232))

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

<<<<<<< HEAD
const activate = defineModel();
const props = defineProps([
=======
const props = defineProps([
  'toggleDeleteErrorModal', // dialog activator
>>>>>>> 95406fae (POR 2720 - sync with master (#232))
  'type' // type of object being deleted
]);
const emitter = inject('emitter');

<<<<<<< HEAD
=======
const activate = ref(false); // dialog activator

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

// The watcher above and this emitter kind of do the same thing, but the watcher didn't update when it should've in
// some cases. To fix this, I used this event instead (fired in ExpenseTypes.vue), but I didn't delete the watcher to
// avoid breaking anything else.
// this and the watcher that sets `activate` to true do the same thing, except the watcher broke under certain cases.
// to avoid more issues, I've left it there
emitter.on('delete-expense-type-error-show', () => {
  activate.value = true;
});

/**
 * Before Unmount lifecycle hook - removes event listeners
 */
onBeforeUnmount(() => {
  emitter.off('delete-expense-type-error-show');
});

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
  }
);

>>>>>>> 95406fae (POR 2720 - sync with master (#232))
// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Closes modal and emits invalid delete event
 */
<<<<<<< HEAD
function closeModal() {
  emitter.emit(`invalid-${props.type}-delete`);
  activate.value = false;
}
=======
function emit(msg) {
  emitter.emit(msg);
} // emit
>>>>>>> 95406fae (POR 2720 - sync with master (#232))
</script>
