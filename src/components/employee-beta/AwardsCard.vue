<template>
  <div class="infoTab">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between header_style">
        <h3 class="text-white px-2">Awards</h3>
        <v-btn v-if="isAdmin || isUser" density="comfortable" variant="text">
          <v-tooltip activator="parent" location="top"> Edit Profile </v-tooltip>
          <v-icon id="edit" color="white"> mdi-pencil </v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <!-- Employee has Awards -->
        <div v-if="!isEmpty(filteredList)">
          <!-- Loop Awards -->
          <v-list>
            <v-list-item v-for="(awards, index) in filteredList" :key="awards.name + index">
              <v-list-item-title class="d-flex align-center">
                <v-icon class="mx-3">mdi-trophy-award</v-icon>
                <p class="ma-3">
                  <b>{{ awards.name }}</b>
                </p>
              </v-list-item-title>
              <div class="pl-10">
                <p><b>Date Received: </b>{{ monthYearFormat(awards.dateReceived) }}</p>
                <v-divider v-if="index < filteredList.length - 1" class="mb-3"></v-divider>
              </div>
            </v-list-item>
          </v-list>
          <!-- End Loop Awards -->
        </div>
        <!-- Employee does not have Awards -->
        <p v-else class="pt-6 pl-6">No Award Information</p>
        <!-- Pagination -->
        <div v-if="!isEmpty(model.awards) && Math.ceil(model.awards.length / 5) != 1" class="text-center">
          <!-- <v-pagination v-model="page" :length="Math.ceil(model.awards.length / 5)" :total-visible="8"></v-pagination> TODO: Remove Pagination -->
          <v-card-actions class="d-flex justify-center">
            <v-btn>Click To See More</v-btn>
          </v-card-actions>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { isEmpty, monthYearFormat } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['model', 'isAdmin', 'isUser']);
const page = ref(1);

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const filteredList = computed(() => {
  const startIndex = 5 * (page.value - 1);
  const endIndex = startIndex + 5;
  if (!isEmpty(props.model.awards)) {
    return props.model.awards.slice(startIndex, endIndex);
  }
  return [];
});
</script>

<style scoped>
p {
  margin-bottom: 12px;
}
</style>
