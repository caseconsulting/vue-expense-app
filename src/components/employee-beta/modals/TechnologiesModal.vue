<template>
  <base-info-modal title="Technologies and Skills">
    <v-card-text>
      <div v-if="!isEmpty(model.technologies)">
        <v-list>
          <!-- Loop Technologies -->
          <v-list-item v-for="(technology, index) in visibleItems" :key="technology.name + index">
            <v-list-item-title class="d-flex align-center pb-4">
              <div class="mx-3">
                <span v-if="technology.current">
                  <v-icon>mdi-check</v-icon>
                  <v-tooltip activator="parent" location="left">Current Skill</v-tooltip>
                </span>
              </div>
              <p class="ma-3">
                <b>{{ technology.name }}</b>
              </p>
            </v-list-item-title>
            <v-row class="pl-10">
              <p><b>Experience: </b>{{ Number(technology.years).toFixed(1) }} years</p>
            </v-row>
            <hr v-if="index < filteredList.length - 1" class="my-3" />
          </v-list-item>
          <!-- End Loop Technologies -->
        </v-list>
        <!-- Pagination -->
        <div v-if="pages != 1" class="text-center">
          <v-pagination v-model="currentPage" :length="pages" total-visible="8"></v-pagination>
        </div>
      </div>
      <!-- Employee does not have Technology Experience -->
      <p v-else>No Technologies or Skills Information</p>
    </v-card-text>
  </base-info-modal>
</template>

<script setup>
import { computed, watch } from 'vue';
import BaseInfoModal from './BaseInfoModal.vue';
import { isEmpty, sortUserTechnologies } from '@/utils/utils';
import { ref } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const ITEMS_PER_PAGE = 8;

const props = defineProps(['model']);

const currentPage = ref(1);
const filteredList = ref(sortUserTechnologies(props.model.technologies));

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Items visible on the current page
 */
const visibleItems = computed(() => {
  const startIndex = (currentPage.value - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  return filteredList.value.slice(startIndex, endIndex);
});

/**
 * The number of pages
 */
const pages = computed(() => Math.ceil(filteredList.value.length / ITEMS_PER_PAGE));

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

// updates the filtered list only when technologies change
watch(
  () => props.model.technologies,
  () => {
    filteredList.value = sortUserTechnologies(props.model.technologies);
  },
  { deep: true }
);
</script>
