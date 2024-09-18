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
        class="w-100 pt-1"
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
import { ref } from 'vue';

const props = defineProps(['modelValue']);
const notes = ref(props.modelValue);
</script>
