<template>
  <div class="infoTab">
    <!-- Employee has Awards -->
    <div v-if="!isEmpty(model.awards)">
      <!-- Loop Awards -->
      <div v-for="(award, index) in model.awards" :key="award.name + index">
        <p><b>Award: </b>{{ award.name }}</p>
        <p><b>Date Received: </b>{{ award.dateReceived | monthDayYearFormat }}</p>
        <hr v-if="index < model.awards.length - 1" class="mb-3" />
      </div>
      <!-- End Loop Awards -->
    </div>
    <!-- Employee does not have Awards -->
    <p v-else>No Award Information</p>
  </div>
</template>

<script>
import { isEmpty, monthDayYearFormat } from '@/utils/utils';

export default {
  filters: {
    monthDayYearFormat
  },
  methods: {
    isEmpty
  },
  props: ['model']
};
</script>
