<template>
  <div class="infoTab">
    <base-card title="Awards">
      <v-card-text>
        <!-- Employee has Awards -->
        <div v-if="!isEmpty(filteredList)">
          <!-- Loop Awards -->
          <v-list>
            <v-list-item v-for="(awards, index) in filteredList" :key="awards.name + index">
              <v-list-item-title class="d-flex align-center pb-4">
                <v-icon class="mx-3">mdi-trophy-award</v-icon>
                <p class="ma-3">
                  <b>{{ awards.name }}</b>
                </p>
              </v-list-item-title>
              <v-row class="pl-10">
                <p><b>Date Received: </b>{{ monthYearFormat(awards.dateReceived) }}</p>
                <v-divider v-if="index < filteredList.length - 1" class="mb-3"></v-divider>
              </v-row>
            </v-list-item>
          </v-list>
          <!-- End Loop Awards -->
        </div>
        <!-- Employee does not have Awards -->
        <p v-else class="pt-6 pl-6">No Award Information</p>
        <!-- Pagination -->
        <div v-if="!isEmpty(model.awards) && Math.ceil(model.awards.length / 5) != 1" class="text-center">
          <v-card-actions class="d-flex justify-center">
            <v-btn @click="toggleAwardsModal()">Click To See More</v-btn>
          </v-card-actions>
        </div>
      </v-card-text>
      <awards-modal v-model="toggleModal" :model="model"></awards-modal>
    </base-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { isEmpty, monthYearFormat } from '@/utils/utils';
import AwardsModal from '@/components/employee-beta/modals/AwardsModal.vue';
import BaseCard from '@/components/employee-beta/BaseCard.vue';

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
    return props.model.awards.slice(startIndex, endIndex);
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
