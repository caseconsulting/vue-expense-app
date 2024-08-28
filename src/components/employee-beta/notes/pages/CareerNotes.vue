<template>
  <v-col>
    <v-row>
      <v-checkbox hide-details v-model="desireToMove" class="font-black" label="Desires to move jobs"></v-checkbox>
    </v-row>
    <v-row v-if="desireToMove">
      <v-col cols="5">
        <v-textarea
          v-model="moveTo"
          label="Desired location"
          auto-grow
          rows="1"
          max-rows="3"
          variant="outlined"
        ></v-textarea>
      </v-col>
      <v-col cols="7">
        <v-textarea
          v-model="moveReason"
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
        v-model="jobDescription"
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

var desireToMove = ref(false);
var moveTo = ref('');
var moveReason = ref('');
var jobDescription = ref('');
var misc = ref('');
</script>
