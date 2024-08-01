<template>
  <base-info-modal :title="isMobile() ? 'Job Experience' : 'Past Job Experience'">
    <div class="ml-4" v-if="!isEmpty(filteredList)">
      <job-experience-list :list="filteredList" :model="model" :onModal="onModal"></job-experience-list>
    </div>
    <div
      v-if="!isEmpty(model.companies) && Math.ceil(model.companies.length / ITEMS_PER_PAGE) != 1"
      class="text-center"
    >
      <v-pagination
        v-model="page"
        :length="Math.ceil(model.companies.length / ITEMS_PER_PAGE)"
        :total-visible="8"
      ></v-pagination>
    </div>
  </base-info-modal>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseInfoModal from './BaseInfoModal.vue';
import { isEmpty, isMobile } from '../../../utils/utils';
import JobExperienceList from '../lists/JobExperienceList.vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const ITEMS_PER_PAGE = 5;

const props = defineProps(['model', 'onModal']);
const page = ref(1);

// |--------------------------------------------------|
// |                                                  |
// |                    COMPUTED                      |
// |                                                  |
// |--------------------------------------------------|

const filteredList = computed(() => {
  const startIndex = (page.value - 1) * ITEMS_PER_PAGE; //each page contains 5 job entries
  const endIndex = startIndex + ITEMS_PER_PAGE;
  if (!isEmpty(props.model.companies)) {
    return props.model.companies.slice(startIndex, endIndex);
  }
  return [];
});
</script>
