<template>
  <base-info-modal title="Foreign Languages">
    <v-card-text>
      <div v-if="!isEmpty(filteredList)">
        <!-- Loop Languages -->
        <div v-for="(language, index) in visibleItems" :key="language.name + index">
          <v-row>
            <v-col>
              <p><b>Language: </b>{{ language.name }}</p>
            </v-col>
          </v-row>
          <p class="pl-10"><b>Level of Fluency: </b>{{ language.proficiency }}</p>
          <hr v-if="index < filteredList.length - 1" class="mb-3" />
        </div>
        <!-- End Loop Languages -->
      </div>
      <!-- Employee does not have Language Experience -->
      <p v-else>No Foreign Language Information</p>
      <!-- Pagination -->
      <div v-if="pages != 1" class="text-center">
        <v-pagination v-model="currentPage" :length="pages" total-visible="8"></v-pagination>
      </div>
    </v-card-text>
  </base-info-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { isEmpty, sortLanguagesByProficiency } from '@/utils/utils';
import BaseInfoModal from './BaseInfoModal.vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const ITEMS_PER_PAGE = 8;

const props = defineProps(['model']);
const currentPage = ref(1);
const filteredList = ref(sortLanguagesByProficiency(props.model.languages ? props.model.languages : []));

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

// updates the filtered list only when languages change
watch(
  () => props.model.languages,
  () => {
    filteredList.value = sortLanguagesByProficiency(props.model.languages);
  },
  { deep: true }
);
</script>
