<template>
  <base-card title="Past Experience">
    <v-card-text v-if="isEmpty(pageList)" class="mt-6" style="font-size: 18px">
      <p>No past job experience to display</p>
    </v-card-text>
    <v-card-text v-else>
      <past-experience-list :list="pageList"></past-experience-list>
      <div v-if="!isEmpty(model.companies) && Math.ceil(model.companies.length / 5) != 1" class="text-center">
        <v-card-actions class="d-flex justify-center">
          <v-btn @click="toggleJobExpModal()">Click To See More</v-btn>
        </v-card-actions>
      </div>
      <past-job-experience-modal v-model="toggleModal" :model="model"></past-job-experience-modal>
    </v-card-text>
  </base-card>
</template>

<script setup>
import { _ } from 'lodash';
import { isEmpty } from '@/utils/utils';
import { onBeforeMount, ref } from 'vue';
import BaseCard from './BaseCard.vue';
import PastExperienceList from '../lists/PastExperienceList.vue';
import PastJobExperienceModal from '../modals/PastJobExperienceModal.vue';

const props = defineProps(['model']);

const filterCompanies = ref(_.cloneDeep(props.model.companies));
const pageList = ref([]);
const toggleModal = ref(false);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFESTYLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data for the list.
 */
onBeforeMount(() => {
  if (!isEmpty(props.model.companies)) {
    pageList.value = filterCompanies.value.slice(0, 4);
  }
}); // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function toggleJobExpModal() {
  toggleModal.value = !toggleModal.value;
}
</script>
