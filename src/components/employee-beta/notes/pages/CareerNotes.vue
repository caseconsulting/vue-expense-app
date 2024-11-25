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
      <v-col class="pl-0" :cols="isMobile() ? '12' : '5'" :class="isMobile() ? 'pr-0' : ''">
        <v-textarea
          v-model="notes.moveTo"
          label="Desired location"
          hide-details
          auto-grow
          rows="1"
          max-rows="3"
          variant="outlined"
        ></v-textarea>
      </v-col>
      <v-col class="pr-0" :cols="isMobile() ? '12' : '7'" :class="isMobile() ? 'pl-0' : ''">
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
import { ref, watch } from 'vue';
import { isMobile } from '@/utils/utils';

const props = defineProps(['modelValue']);
const notes = ref(props.modelValue);

// if desire to move is set to false, reset the desired location and reason for move to null
watch(
  () => notes.value.desireToMove,
  () => {
    if (notes.value.desireToMove === false) {
      notes.value.moveTo = null;
      notes.value.moveReason = null;
    }
  }
);
</script>
