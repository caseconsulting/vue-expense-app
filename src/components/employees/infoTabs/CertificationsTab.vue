<template>
  <div class="infoTab">
    <!-- Employee has Certifications -->
    <div v-if="!isEmpty(model.certifications)">
      <!-- Loop Certifications -->
      <div v-for="(certification, index) in model.certifications" :key="certification.name">
        <p><b>Certification: </b>{{ certification.name }}</p>
        <p><b>Date Received: </b>{{ certification.dateReceived | monthDayYearFormat }}</p>
        <p v-if="certification.expirationDate">
          <b>Expiration Date: </b>{{ certification.expirationDate | monthDayYearFormat }}
        </p>
        <hr v-if="index < model.certifications.length - 1" class="mb-3" />
      </div>
      <!-- End Loop Certifications -->
    </div>
    <!-- Employee does not have Certifications -->
    <p v-else>No Certification information</p>
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
