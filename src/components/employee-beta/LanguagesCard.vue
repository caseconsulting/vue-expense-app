<template>
  <div class="infoTab">
    <base-card title="Foreign Languages">
      <v-card-text class="px-7 pt-5 pb-1 text-black">
        <!-- Employee has entered languages-->
        <div v-if="!isEmpty(languages)">
          <!-- Loop Languages -->
          <div v-for="(language, index) in filteredList" :key="language.name + index">
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
        <div v-if="!isEmpty(languages) && Math.ceil(languages.length / 5) != 1" class="text-center">
          <v-card-actions class="d-flex justify-center">
            <v-btn @click="activateModal()">Click To See More</v-btn>
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
import LanguagesModal from './modals/LanguagesModal.vue';
import BaseCard from '@/components/employee-beta/BaseCard.vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['model']);
const languages = ref(props.model.languages ? props.model.languages : []);
console.log(languages.value);
const toggleModal = ref(false);

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const filteredList = computed(() => {
  const startIndex = 0; //each page contains 5 certification entries
  const endIndex = 5;
  if (!isEmpty(languages.value)) {
    return sortLanguagesByProficiency(languages.value).slice(startIndex, endIndex);
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
