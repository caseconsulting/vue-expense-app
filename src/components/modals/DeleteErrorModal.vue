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
import { inject } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const activate = defineModel();
const props = defineProps([
  'type' // type of object being deleted
]);
const emitter = inject('emitter');

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Closes modal and emits invalid delete event
 */
function closeModal() {
  emitter.emit(`invalid-${props.type}-delete`);
  activate.value = false;
}
</script>
