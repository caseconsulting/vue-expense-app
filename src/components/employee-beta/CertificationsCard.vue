<template>
  <div class="infoTab">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between header_style">
        <h3 class="text-white px-2">Certifications</h3>
        <v-btn v-if="isAdmin || isUser" density="comfortable" variant="text">
          <v-tooltip activator="parent" location="top"> Edit Profile </v-tooltip>
          <v-icon id="edit" color="white"> mdi-pencil </v-icon>
        </v-btn>
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
              <div class="pl-10">
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
        <p v-else class="pt-6 pl-6">No Certification Information</p>
        <div
          v-if="!isEmpty(model.certifications) && Math.ceil(model.certifications.length / 5) != 1"
          class="text-center"
        >
          <v-card-actions class="d-flex justify-center">
            <v-btn @click="toggleCertificationsModal()">Click To See More</v-btn>
          </v-card-actions>
        </div>
      </v-card-text>
      <certifications-modal v-model="toggleModal" :model="model"></certifications-modal>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue';
import { isEmpty, monthDayYearFormat } from '@/utils/utils';
import CertificationsModal from '@/components/employee-beta/CertificationsModal.vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['model']);
const isAdmin = inject('isAdmin');
const isUser = inject('isUser');
const toggleModal = ref(false);

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const filteredList = computed(() => {
  const startIndex = 0; //each page contains 5 certification entries
  const endIndex = startIndex + 5;
  if (!isEmpty(props.model.certifications)) {
    return props.model.certifications.slice(startIndex, endIndex);
  }
  return [];
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function toggleCertificationsModal() {
  toggleModal.value = !toggleModal.value;
}
</script>

<style scoped>
p {
  margin-bottom: 12px;
}
</style>
