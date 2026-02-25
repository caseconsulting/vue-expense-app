<template>
  <div>
    <v-row>
      <h4>Unanet</h4>
      <div>
        <v-autocomplete
          v-model="editedEmployee.integrationData.unanet.projectOrgCode"
        />
      </div>
    </v-row>
  </div>
</template>

<script setup>
import _isEmpty from 'lodash/isEmpty';
import { ref, onBeforeMount } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

// passes in all slot props as a single object
const { slotProps } = defineProps(['slotProps']);
const editedEmployee = ref(slotProps.editedEmployee);

onBeforeMount(() => {
  const requiredFields = {
    // dot-noted-object: default-value
    'editedEmployee.integrationData.unanet.projectOrgCode': null
  };
  for (let [field, dflt] of Object.entries(requiredFields)) {
    let curr;
    for (let sub of field.split('.')) {
      if (!curr) {
        curr = field[sub];
      } else {
        curr[sub] ??= {};
        curr = curr[sub];
      }
    }
    curr = dflt;
  }
})

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets validation rules for languages: no duplicate languages and no english
 */
function getLanguageRules() {
  return [
    // no duplicate languages
    (v) => {
      let count = 0;
      for (let i = 0; i < editedEmployee.value.languages.length && count <= 2; i++) {
        if (editedEmployee.value.languages[i].name === v) count++;
      }
      return count <= 1 || 'Duplicate language found, please remove duplicate entries';
    },
    // no english
    (v) => {
      return (!_isEmpty(v) && v.toLowerCase() !== 'english') || 'English is not a foreign language';
    }
  ];
}

/**
 * Adds a new language to the list
 *
 * @param {boolean} addToTop Whether to add to the top or bottom of the list
 */
function addLanguage(addToTop = true) {
  const newLanguage = {
    name: '',
    proficiency: ''
  };

  if (addToTop) editedEmployee.value.languages.unshift(newLanguage);
  else editedEmployee.value.languages.push(newLanguage);
}

function deleteLanguage(index) {
  editedEmployee.value.languages.splice(index, 1);
}
</script>
