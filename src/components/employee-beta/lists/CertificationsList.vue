<template>
  <v-list>
    <v-list-item v-for="(certification, index) in list" :key="certification.name + index" class="px-0">
      <v-list-item-title class="align-center pb-2">
        <v-icon class="d-inline mx-3">mdi-star-check</v-icon>
        <p class="d-inline mt-3">
          <b>{{ certification.name }}</b>
        </p>
      </v-list-item-title>
      <v-row class="ml-12 gray-text">
        <p class="mb-1"><b>Date Received: </b>{{ monthDayYearFormat(certification.dateReceived) }}</p>
      </v-row>
      <v-row class="ml-12 mb-1 gray-text">
        <p v-if="certification.expirationDate">
          <b>Expiration Date: </b>{{ monthDayYearFormat(certification.expirationDate) }}
        </p>
      </v-row>
      <v-row no-gutters class="mx-5">
        <v-divider v-if="index < list.length - 1" />
      </v-row>
    </v-list-item>
  </v-list>
</template>

<script setup>
import { monthDayYearFormat } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
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
