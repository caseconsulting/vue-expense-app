<template>
  <v-list>
    <v-list-item v-for="(awards, index) in list" :key="awards.name + index" class="px-0">
      <v-list-item-title class="d-flex align-center pb-4">
        <v-icon class="mx-3">mdi-trophy-award</v-icon>
        <p class="mt-3">
          <b>{{ awards.name }}</b>
        </p>
      </v-list-item-title>
      <v-row class="ml-12 mb-1 gray-text">
        <p><b>Date Received: </b>{{ monthYearFormat(awards.dateReceived) }}</p>
      </v-row>
      <v-row no-gutters class="mx-5">
        <v-divider v-if="index < list.length - 1" />
      </v-row>
    </v-list-item>
  </v-list>
</template>

<script setup>
import { monthYearFormat } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

defineProps({
  list: {
    type: Array,
    required: true
  }
});
</script>

<style scoped>
.gray-text {
  color: #828282;
}
</style>
