<template>
  <v-col>
    <v-row>
      <v-checkbox
        hide-details
        v-model="notes.desireToMove"
        class="font-black"
        label="Desires to move jobs"
      ></v-checkbox>
    </v-row>
    <v-row v-if="notes.desireToMove">
      <v-col class="pl-0" cols="5">
        <v-textarea
          v-model="notes.moveTo"
          label="Desired location"
          auto-grow
          rows="1"
          max-rows="3"
          variant="outlined"
        ></v-textarea>
      </v-col>
      <v-col class="pr-0" cols="7">
        <v-textarea
          v-model="notes.moveReason"
          label="Reason for move"
          auto-grow
          rows="1"
          max-rows="3"
          variant="outlined"
        ></v-textarea>
      </v-col>
    </v-row>
    <v-row>
      <v-textarea
        v-model="notes.jobDescription"
        variant="outlined"
        label="Job Description"
        auto-grow
        rows="2"
        max-rows="8"
        class="w-100"
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
      ></v-textarea>
    </v-row>
  </v-col>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, inject, watch } from 'vue';

const emitter = inject('emitter');
const props = defineProps(['notesModel', 'user']);
const notes = ref({});

onMounted(() => {
  notes.value = { ...props.notesModel };
});

onBeforeUnmount(() => {
  // autosave(true);
});

var saveTimer = null;
function autosave(saveNow = false) {
  // set timeout duration
  const bufferTime = saveNow ? 0 : 5000;

  // stop any old saves, make a new one
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(function () {
    console.log('A');
    emitter.emit('save-notes', {
      from: 'career',
      notes: notes.value
    });
  }, bufferTime);
}

// autosave if the notes var is changed at all
watch(() => notes.value, autosave(), { deep: true });
</script>
