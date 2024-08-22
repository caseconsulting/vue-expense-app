<template>
  <div class="eduTab">
    <base-card title="Education">
      <v-card-text v-if="isEmpty(showableList)" style="text-align: center" class="pt-7">
        <p>No Education Information</p>
      </v-card-text>
      <v-card-text v-else>
        <education-list :list="showableList"></education-list>
        <div v-if="!isEmpty(showableList) && Math.ceil(totalList.length / 2) != 1" class="text-center">
          <v-card-actions class="d-flex justify-center">
            <v-btn variant="flat" color="#F3F3F3" @click="toggleModal = true"
              >View All {{ totalList.length }} Educations</v-btn
            >
          </v-card-actions>
        </div>
      </v-card-text>
      <education-modal v-model="toggleModal" :model="model"></education-modal>
    </base-card>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
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
const props = defineProps(['model']);

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const showableList = computed(() => {
  if (!isEmpty(props.model.education)) {
    return props.model.education.slice(0, 2);
  }
  return [];
});

const totalList = computed(() => {
  if (!isEmpty(props.model.education)) {
    return props.model.education;
  }
  return [];
});
</script>
