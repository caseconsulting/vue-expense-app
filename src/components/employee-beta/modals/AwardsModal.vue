<template>
  <base-info-modal title="Awards">
    <v-card-text>
      <!-- Employee has Awards -->
      <div v-if="!isEmpty(filteredList)">
        <!-- Loop Awards -->
        <awards-list :list="filteredList"></awards-list>
        <!-- End Loop Awards -->
      </div>
      <!-- Employee does not have Awards -->
      <p v-else class="pt-6 pl-6">No Award Information</p>
      <!-- Pagination -->
      <div v-if="!isEmpty(model.awards) && Math.ceil(model.awards.length / 5) != 1" class="text-center">
        <v-pagination v-model="page" :length="Math.ceil(model.awards.length / 5)" :total-visible="8"></v-pagination>
      </div>
    </v-card-text>
  </base-info-modal>
</template>

<script setup>
import { ref, computed } from 'vue';
import { isEmpty, sortByDateReceived } from '@/utils/utils';
import BaseInfoModal from '@/components/employee-beta/modals/BaseInfoModal.vue';
import AwardsList from '@/components/employee-beta/lists/AwardsList.vue';

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
  const startIndex = 5 * (page.value - 1); //each page contains 5 award entries
  const endIndex = startIndex + 5;
  if (!isEmpty(props.model.awards)) {
    return sortByDateReceived(props.model.awards).slice(startIndex, endIndex);
  }
  return [];
});
</script>
