<template>
  <div class="infoTab">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between header_style">
        <h3 class="text-white px-2">Languages</h3>
        <v-btn v-if="isAdmin || isUser" density="comfortable" variant="text" icon="">
          <v-tooltip activator="parent" location="top"> Edit Profile </v-tooltip>
          <v-icon id="edit" color="white"> mdi-pencil </v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="px-7 pt-5 pb-1 text-black">
        <!-- Employee has entered languages-->
        <div v-if="!isEmpty(model.languages)">
          <!-- Loop Languages -->
          <div v-for="(languages, index) in filteredList" :key="languages.name + index">
            <v-row>
              <v-col>
                <p><b>Language: </b>{{ languages.name }}</p>
              </v-col>
            </v-row>
            <p class="pl-10"><b>Level of Fluency: </b>{{ languages.proficiency }}</p>
            <hr v-if="index < filteredList.length - 1" class="mb-3" />
          </div>
          <!-- End Loop Languages -->
        </div>
        <!-- Employee does not have Language Experience -->
        <p v-else>No Foreign Language Information</p>
        <!-- Pagination -->
        <div v-if="!isEmpty(model.languages) && Math.ceil(model.languages.length / 5) != 1" class="text-center">
          <v-card-actions class="d-flex justify-center">
            <v-btn>Click To See More</v-btn>
          </v-card-actions>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import { isEmpty } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['model']);

const isAdmin = inject('isAdmin');
const isUser = inject('isUser');

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const filteredList = computed(() => {
  const startIndex = 0; //each page contains 5 certification entries
  const endIndex = 5;
  if (!isEmpty(props.model.languages)) {
    const list = sortByProficiency(props.model.languages).slice(startIndex, endIndex);
    console.log(list);
    return list;
  }
  return [];
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |---------------------------------------------------

/**
 * Helper function to sort languages by proficiency, highest to lowest: Literacy, Native-like, Personal, Basic
 * @param {Array} technologies - List of known languages
 * return filteredList - A list of languages sorted by proficiency
 */
function sortByProficiency(languages) {
  const levelProficiency = [
    'Literacy - fluency and broad vocabulary associated with high levels of education',
    'Native-like - ability to use the language like a native speaker',
    'Personal - words you know depending on your day-to-day activities (experiences, work, country, friends)',
    'Basic - most basic words that everyone uses'
  ];
  const compare = (languageA, languageB) => {
    return levelProficiency.indexOf(languageB.proficiency) - levelProficiency.indexOf(languageA.proficiency);
  };
  const sortedByProficiency = languages.toSorted(compare);
  return sortedByProficiency;
}
</script>

<style scoped>
p {
  margin-bottom: 12px;
}
</style>
