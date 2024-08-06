<template>
  <div class="infoCard">
    <base-card title="Awards">
      <div class="text-black">
        <!-- Employee has Awards -->
        <div v-if="!isEmpty(filteredList)">
          <!-- Loop Awards -->
          <awards-list :list="filteredList"></awards-list>
          <!-- End Loop Awards -->
        </div>
        <!-- Employee does not have Awards -->
        <p v-else class="mt-2 text-align: center">No Award Information</p>
        <!-- Pagination -->
        <div v-if="!isEmpty(model.awards)" class="text-center">
          <v-card-actions class="d-flex justify-center">
            <v-btn variant="flat" color="#F3F3F3" @click="toggleAwardsModal()"
              >View all {{ model.awards.length }} awards
            </v-btn>
          </v-card-actions>
        </div>
      </div>
      <awards-modal v-model="toggleModal" :model="model"></awards-modal>
    </base-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { isEmpty, sortByDateReceived } from '@/utils/utils';
import AwardsList from '@/components/employee-beta/lists/AwardsList.vue';
import AwardsModal from '@/components/employee-beta/modals/AwardsModal.vue';
import BaseCard from '@/components/employee-beta/cards/BaseCard.vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['model']);
const toggleModal = ref(false);

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const filteredList = computed(() => {
  const startIndex = 0;
  const endIndex = 5;
  if (!isEmpty(props.model.awards)) {
    return sortByDateReceived(props.model.awards).slice(startIndex, endIndex);
  }
  return [];
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function toggleAwardsModal() {
  toggleModal.value = !toggleModal.value;
}
</script>

<style scoped>
p {
  margin-bottom: 12px;
}
</style>
