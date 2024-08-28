<template>
  <v-col>
    <v-row>
      <v-textarea
        v-model="familial"
        variant="outlined"
        label="Family"
        auto-grow
        rows="2"
        max-rows="8"
        class="w-100"
      ></v-textarea>
    </v-row>
    <v-row>
      <v-textarea
        v-model="medical"
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
        v-model="misc"
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

// var props = defineProps('notes');

var familial = ref('');
var medical = ref('');
var misc = ref('');
</script>
