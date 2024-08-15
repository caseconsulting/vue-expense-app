<template>
  <div class="infoCard">
    <base-card title="Foreign Languages">
      <v-card-text class="px-2 pt-0 pb-0 text-black">
        <!-- Employee has entered languages-->
        <languages-list v-if="!isEmpty(model.languages)" :list="filteredList"></languages-list>
        <!-- Employee does not have Language Experience -->
        <p v-else class="mt-6 ml-6">No Foreign Language Information</p>
        <div v-if="!isEmpty(model.languages)" class="text-center">
          <v-card-actions class="d-flex justify-center">
            <v-btn variant="flat" color="#F3F3F3" @click="activateModal()"
              >View All {{ model.languages.length }} Languages</v-btn
            >
          </v-card-actions>
        </div>
      </v-card-text>
      <languages-modal v-model="toggleModal" :model="model"></languages-modal>
    </base-card>
  </div>
</template>

<script setup>
import { isEmpty, sortLanguagesByProficiency } from '@/utils/utils';
import { computed, ref } from 'vue';
import BaseCard from './BaseCard.vue';
import LanguagesList from '../lists/LanguagesList.vue';
import LanguagesModal from '../modals/LanguagesModal.vue';

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
  const startIndex = 0; //each page contains 5 certification entries
  const endIndex = 5;
  if (!isEmpty(props.model.languages)) {
    return sortLanguagesByProficiency(props.model.languages).slice(startIndex, endIndex);
  }
  return [];
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function activateModal() {
  toggleModal.value = !toggleModal.value;
}
</script>

<style scoped>
p {
  margin-bottom: 12px;
}
</style>
