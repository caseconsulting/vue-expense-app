<template>
  <v-col>
    <v-row>
      <v-textarea
        v-model="notes.familial"
        variant="outlined"
        label="Family"
        auto-grow
        rows="2"
        max-rows="8"
        class="w-100"
        @update:model-value="autosave()"
      ></v-textarea>
    </v-row>
    <v-row>
      <v-textarea
        v-model="notes.medical"
        variant="outlined"
        label="Medical"
        auto-grow
        rows="2"
        max-rows="8"
        class="w-100"
        @update:model-value="autosave()"
      ></v-textarea>
    </v-row>
    <v-row>
      <v-textarea
        v-model="notes.misc"
        variant="outlined"
        label="Miscellaneous"
        auto-grow
        max-rows="8"
        class="w-100"
        @update:model-value="autosave()"
      ></v-textarea>
    </v-row>
  </v-col>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, inject } from 'vue';

const emitter = inject('emitter');
const props = defineProps(['notesModel', 'user']);
const notes = ref({});

onMounted(() => {
  notes.value = { ...props.notesModel };
});

onBeforeUnmount(() => {
  autosave(true);
});

/**
 * Autosaves the notes. Default is to set a timer of 5 seconds and save after the timer is up,
 * but setting `saveNow` to true will skip this timer.
 * @param saveNow whether or not to skip the timer
 */
var saveTimer = null;
function autosave(saveNow = false) {
  // set timeout duration
  const bufferTime = saveNow ? 0 : 5000;

  // stop any old saves, make a new one
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    emitter.emit('save-notes', {
      from: 'personal',
      notes: notes.value
    });
  }, bufferTime);
}
</script>
