<template>
  <base-info-modal title="Certifications">
    <v-card-text class="px-7 pt-5 pb-1 text-black">
      <!-- Employee has Certifications -->
      <div v-if="!isEmpty(filteredList)">
        <!-- Loop Certifications -->
        <certifications-list :list="filteredList"></certifications-list>
        <!-- End Loop Certifications -->
      </div>
      <!-- Employee does not have Certifications -->
      <p v-else class="pt-6 pl-6">No Certification Information</p>
      <div v-if="!isEmpty(model.certifications) && Math.ceil(model.certifications.length / 5) != 1" class="text-center">
        <v-pagination
          v-model="page"
          :length="Math.ceil(model.certifications.length / 5)"
          :total-visible="8"
        ></v-pagination>
      </div>
    </v-card-text>
  </base-info-modal>
</template>

<script setup>
import { ref, computed } from 'vue';
import { isEmpty, sortByDateReceived } from '@/utils/utils';
import BaseInfoModal from '@/components/employee-beta/modals/BaseInfoModal.vue';
import CertificationsList from '@/components/employee-beta//lists/CertificationsList.vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['model']);
const page = ref(1);

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const filteredList = computed(() => {
  const startIndex = 5 * (page.value - 1); //each page contains 5 certification entries
  const endIndex = startIndex + 5;
  if (!isEmpty(props.model.certifications)) {
    return sortByDateReceived(props.model.certifications).slice(startIndex, endIndex);
  }
  return [];
});
</script>
