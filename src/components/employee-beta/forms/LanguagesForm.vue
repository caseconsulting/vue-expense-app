<template>
  <div>
    <v-row class="mt-2"><h3>Foreign Languages</h3></v-row>
    <v-row>
      <v-col class="d-flex justify-center">
        <v-btn prepend-icon="mdi-plus" @click="addLanguage()">Add Language</v-btn>
      </v-col>
    </v-row>
    <v-row v-for="(language, index) in editedEmployee.languages" :key="language + index">
      <v-col>
        <v-row>
          <v-col :cols="isMobile() ? '10' : ''">
            <v-combobox
              v-model="language.name"
              label-="Language"
              :rules="[...getRequiredRules(), ...getLanguageRules()]"
              :items="LANGUAGES"
            ></v-combobox>
          </v-col>
          <!-- IN MOBILE VIEW ONLY -->
          <v-col v-if="isMobile()" cols="2">
            <v-tooltip text="Delete Language" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon="mdi-delete" variant="text" @click="deleteLanguage(index)"></v-btn>
              </template>
            </v-tooltip>
          </v-col>
          <!-- END IN MOBILE VIEW ONLY -->
          <v-col :cols="isMobile() ? '12' : ''">
            <v-autocomplete v-model="language.proficiency" label="Proficiency" :items="PROFICIENCIES"></v-autocomplete>
          </v-col>
          <v-col v-if="!isMobile()" cols="auto">
            <v-tooltip text="Delete Language" location="top">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon="mdi-delete" variant="text" @click="deleteLanguage(index)"></v-btn>
              </template>
            </v-tooltip>
          </v-col>
        </v-row>
        <v-row v-if="index < editedEmployee.languages.length - 1" class="pb-4">
          <v-divider class="border-opacity-25" thickness="3"></v-divider>
        </v-row>
      </v-col>
    </v-row>
    <v-row v-if="editedEmployee.languages && editedEmployee.languages.length != 0">
      <v-col class="d-flex justify-center">
        <v-btn prepend-icon="mdi-plus" @click="addLanguage(false)">Add Language</v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { LANGUAGES, PROFICIENCIES } from '@/shared/employeeUtils';
import { getRequiredRules } from '@/shared/validationUtils';
import { isMobile } from '@/utils/utils';
import _isEmpty from 'lodash/isEmpty';
import { ref } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

// passes in all slot props as a single object
const { slotProps } = defineProps(['slotProps']);
const editedEmployee = ref(slotProps.editedEmployee);

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
