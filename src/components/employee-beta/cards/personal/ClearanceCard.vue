<template>
  <div>
    <base-card title="Clearance">
      <template v-if="!isEmpty(clearances)" #prependIcon>
        <v-icon size="small" id="personal" color="white"> mdi-shield-account </v-icon>
      </template>
      <clearance-list v-if="!isEmpty(clearances)" :list="[displayedClearance]"></clearance-list>
      <p v-if="isEmpty(clearances)" class="text-center mt-6 mx-2">No Clearance Information</p>
      <div v-if="!isEmpty(clearances) && clearances.length != 1" class="text-center">
        <v-card-actions class="d-flex justify-center">
          <v-btn @click="toggleClearanceModal()">Click To See More</v-btn>
        </v-card-actions>
      </div>
      <clearance-modal v-model="toggleModal" :model="model"></clearance-modal>
    </base-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { isEmpty } from '@/utils/utils';
import BaseCard from '../BaseCard.vue';
import ClearanceList from '@/components/employee-beta/lists/ClearanceList.vue';
import ClearanceModal from '@/components/employee-beta/modals/ClearanceModal.vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['model']);
const toggleModal = ref(false);
const clearances = ref([]);
const displayedClearance = ref([]);

// Gets the employee's clearances - prioritizes granted over awaited clearances
clearances.value = props.model.clearances;
if (!isEmpty(clearances.value)) {
  clearances.value.forEach((clearance) => {
    if (!clearance.awaitingClearance) {
      displayedClearance.value = clearance;
      return;
    }
  });
  if (isEmpty(displayedClearance.value)) {
    displayedClearance.value = clearances.value[0];
  }
}

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function toggleClearanceModal() {
  toggleModal.value = !toggleModal.value;
}
</script>
