<template>
  <div>
    <v-textarea
      v-model="notes.misc"
      variant="outlined"
      auto-grow
      rows="15"
      max-rows="15"
      class="w-100"
      @update:model-value="autosave()"
    ></v-textarea>
  </div>
</template>

<script setup>
import { ref, onMounted, inject, onBeforeUnmount } from 'vue';

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
      from: 'general',
      notes: notes.value
    });
  }, bufferTime);
}
</script>
