<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="375">
      <v-card>
        <v-card-text class="font-weight-medium text-h6">Are you sure you want to unreimburse?</v-card-text>
        <v-card-text>
          This will unreimburse the expense to pending and uncarry any overdrafts due to this expense
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="red"
            variant="text"
            @click="
              emit(`canceled-unreimburse-expense`);
              activate = false;
            "
          >
            No, keep reimbursed
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="green-darken-1"
            id="confirmUnreimbursed"
            variant="text"
            @click="
              emit(`confirm-unreimburse-expense`);
              activate = false;
            "
          >
            Unreimburse
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
const props = defineProps(['toggleUnreimburseModal']); // dialog activator

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits a message and data if it exists.
 *
 * @param msg - Message to emit
 * @param data - Data to emit
 */
function emit(msg, data) {
  if (data) {
    // data exists
    emitter.emit(msg, data);
  } else {
    // data does not exist
    emitter.emit(msg);
  }
} // emit

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for toggleUnreimburseModal
 */
watch(
  () => props.toggleUnreimburseModal,
  () => {
    activate.value = true;
  }
); // watchToggleUnreimburseModal
</script>
