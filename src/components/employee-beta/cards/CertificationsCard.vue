<template>
  <div class="infoCard">
    <base-card title="Certifications">
      <div class="text-black">
        <!-- Employee has Certifications -->
        <div v-if="!isEmpty(filteredList)">
          <certifications-list :list="filteredList"></certifications-list>
        </div>
        <!-- Employee does not have Certifications -->
        <p v-else class="mt-6 ml-6">No Certification Information</p>
        <div v-if="!isEmpty(model.certifications)" class="text-center">
          <v-card-actions class="d-flex justify-center">
            <v-btn @click="toggleCertificationsModal()"
              >View All {{ model.certifications.length }} Certifications</v-btn
            >
          </v-card-actions>
        </div>
      </div>
      <certifications-modal v-model="toggleModal" :model="model"></certifications-modal>
    </base-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { isEmpty, sortByDateReceived } from '@/utils/utils';
import BaseCard from '@/components/employee-beta/cards/BaseCard.vue';
import CertificationsList from '@/components/employee-beta/lists/CertificationsList.vue';
import CertificationsModal from '@/components/employee-beta/modals/CertificationsModal.vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const ITEMS_PER_PAGE = 5; //each page contains 5 certification entries

const props = defineProps(['model']);
const toggleModal = ref(false);

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const filteredList = computed(() => {
  const startIndex = 0;
  const endIndex = ITEMS_PER_PAGE;
  if (!isEmpty(props.model.certifications)) {
    return sortByDateReceived(props.model.certifications).slice(startIndex, endIndex);
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
