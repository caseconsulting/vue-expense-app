<template>
  <div class="infoTab">
    <v-card>
      <v-card-title class="d-flex align-center header_style">
        <h3 class="text-white px-2">Certifications</h3>
      </v-card-title>
      <v-card-text class="px-7 pt-5 pb-1 text-black">
        <!-- Employee has Certifications -->
        <div v-if="!isEmpty(filteredList)">
          <!-- Loop Certifications -->
          <v-list>
            <v-list-item v-for="(certification, index) in filteredList" :key="certification.name + index">
              <v-list-item-title class="d-flex align-center">
                <v-icon class="mx-3">mdi-star-check</v-icon>
                <p class="ma-3">
                  <b>{{ certification.name }}</b>
                </p>
              </v-list-item-title>
              <div class="offset-1">
                <p><b>Date Received: </b>{{ monthDayYearFormat(certification.dateReceived) }}</p>
                <p v-if="certification.expirationDate">
                  <b>Expiration Date: </b>{{ monthDayYearFormat(certification.expirationDate) }}
                </p>
                <v-divider v-if="index < filteredList.length - 1" class="mb-3"></v-divider>
              </div>
            </v-list-item>
          </v-list>
          <!-- End Loop Certifications -->
        </div>
        <!-- Employee does not have Certifications -->
        <p v-else>No Certification Information</p>
        <div
          v-if="!isEmpty(model.certifications) && Math.ceil(model.certifications.length / 5) != 1"
          class="text-center"
        >
          <v-card-actions>
            <v-btn>Click To See More</v-btn>
          </v-card-actions>
          <!-- Pagination TODO: Remove Pagination to modal
           <v-pagination
            v-model="page"
            :length="Math.ceil(model.certifications.length / 5)"
            :total-visible="8"
          ></v-pagination> -->
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { isEmpty, monthDayYearFormat } from '@/utils/utils';

const props = defineProps(['model']);
const page = ref(1);
// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const filteredList = computed(() => {
  var startIndex = 5 * (page.value - 1); //each page contains 5 certification entries
  var endIndex = startIndex + 5;
  if (!isEmpty(props.model.certifications)) {
    return props.model.certifications.slice(startIndex, endIndex);
  }
  return [];
});
</script>

<style scoped>
p {
  margin-bottom: 12px;
}
</style>
