<template>
  <v-container>
    <v-row><h3>Foreign Languages</h3></v-row>
    <v-row v-for="(language, index) in editedEmployee.languages" :key="language + index">
      <v-col>
        <v-row>
          <v-col>
            <v-combobox
              v-model="language.name"
              label-="Language"
              :rules="[...getRequiredRules(), ...getLanguageRules()]"
              :items="LANGUAGES"
            ></v-combobox>
          </v-col>
          <v-col>
            <v-autocomplete v-model="language.proficiency" label="Proficiency" :items="PROFICIENCIES"></v-autocomplete>
          </v-col>
          <v-col cols="auto">
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
    <v-row>
      <v-col class="d-flex justify-center">
        <v-btn prepend-icon="mdi-plus" @click="addLanguage(false)">Add Language</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { getRequiredRules } from '@/shared/validationUtils';
import { isEmpty } from 'lodash';
import { LANGUAGES, PROFICIENCIES } from '@/shared/employeeUtils';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const editedEmployee = defineModel();

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
      return (!isEmpty(v) && v.toLowerCase() !== 'english') || 'English is not a foreign language';
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
