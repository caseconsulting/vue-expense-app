<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="350">
      <v-card>
        <v-card-text class="font-weight-medium text-h6">Session Time Out Warning</v-card-text>
        <v-card-text>Warning: Your session expires in 5 minutes. Please complete any progress.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="gray darken-1" variant="text" @click="activate = false">Refresh Session</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                     SETUP                        |
// |                                                  |
// |--------------------------------------------------|

const activate = ref(false); // dialog activator
const props = defineProps(['toggleWarning']); // dialog activator

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for toggleWarning
 */
watch(
  () => props.toggleWarning,
  () => {
    activate.value = props.toggleWarning;
  }
); // watchToggleWarning
</script>
