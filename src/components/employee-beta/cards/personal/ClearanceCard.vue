<template>
  <div>
    <base-card title="Clearance">
      <template #title>
        <div class="d-flex align-center">
          <v-icon v-if="!isEmpty(clearances)" style="margin-right: 10px" size="small" id="personal" color="white">
            mdi-shield-account
          </v-icon>
          <h3 class="text-white">Clearance</h3>
        </div>
      </template>
      <clearance-list v-if="!isEmpty(clearances)" :list="[displayedClearance]" :toggleModal="false"></clearance-list>
      <p v-if="isEmpty(clearances)" class="text-center mt-6 mx-2">No Clearance Information</p>
      <div v-if="!isEmpty(clearances)" class="text-center">
        <v-card-actions class="d-flex justify-center">
          <v-btn variant="flat" color="#F3F3F3" @click="toggleClearanceModal()"
            >View All {{ clearances.length }} Clearances</v-btn
          >
        </v-card-actions>
      </div>
      <clearance-modal v-model="toggleModal" :model="model"></clearance-modal>
    </base-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { isEmpty } from '@/utils/utils';
import BaseCard from '../BaseCard.vue';
import { orderBy } from 'lodash';
import ClearanceList from '@/components/employee-beta/lists/ClearanceList.vue';
import ClearanceModal from '@/components/employee-beta/modals/ClearanceModal.vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['model']);
const toggleModal = ref(false);

// Gets the employee's clearances - prioritizes granted over awaited clearances
const clearances = computed(() => {
  if (!isEmpty(props.model.clearances)) {
    return orderBy(props.model.clearances, ['badgeExpirationDate'], ['asc']);
  }
  return [];
});

const displayedClearance = computed(() => {
  if (!isEmpty(clearances.value)) {
    return orderBy(clearances.value, ['awaitingClearance', 'badgeExpirationDate'], ['asc', 'desc'])[0]; //displays clearance with the latest expiration date
  }
  return [];
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function toggleClearanceModal() {
  toggleModal.value = !toggleModal.value;
}
</script>
