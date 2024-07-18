<template>
  <div class="eduTab">
    <base-card title="Education">
      <v-card-text v-if="isEmpty(showableList)">
        <p>No Education to display</p>
      </v-card-text>
      <v-card-text v-else>
        <education-list :list="showableList"></education-list>
        <div v-if="!isEmpty(showableList) && Math.ceil(totalList.length / 2) != 1" class="text-center">
          <v-card-actions class="d-flex justify-center">
            <v-btn @click="toggleModal = true">Click to see more</v-btn>
          </v-card-actions>
        </div>
      </v-card-text>
      <education-modal v-model="toggleModal" :model="model"></education-modal>
    </base-card>
  </div>
</template>

<script setup>
import { onBeforeMount, ref } from 'vue';
import { isEmpty } from '@/utils/utils';
import BaseCard from './BaseCard.vue';
import EducationList from '../lists/EducationList.vue';
import EducationModal from '../modals/EducationModal.vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const toggleModal = ref(false);
const showableList = ref([]);
const totalList = ref([]);
const props = defineProps(['model']);

// |--------------------------------------------------|
// |                                                  |
// |                LIFESTYLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data for the list.
 */
onBeforeMount(() => {
  if (!isEmpty(props.model.education)) {
    showableList.value = props.model.education.slice(0, 2); // only shows 2 educations at a time
    totalList.value = props.model.education; // gets all education
  }
}); // created
</script>
