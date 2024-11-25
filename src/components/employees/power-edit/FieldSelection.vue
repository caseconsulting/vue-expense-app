<template>
  <v-row>
    <v-col cols="4">
      <fieldset class="pa-1">
        <legend class="pa-0">Selected</legend>
        <v-chip
          v-for="field of localSelectedFields"
          :key="field.key"
          class="ml-1 mb-1 font-weight-bold pointer"
          color="blue"
          prepend-icon="mdi-check"
          size="small"
          variant="elevated"
          @click="removeField(field)"
        >
          {{ field.title }}
        </v-chip>
      </fieldset>
    </v-col>
    <v-col cols="8">
      <fieldset class="pa-1">
        <legend class="pa-0">Unselected</legend>
        <v-chip
          v-for="field of unSelectedFields"
          :key="field.key"
          class="ml-1 mb-1 pointer"
          color="black"
          size="small"
          variant="outlined"
          @click="addField(field)"
        >
          {{ field.title }}
        </v-chip>
      </fieldset>
    </v-col>
  </v-row>
</template>

<script setup>
import _xorBy from 'lodash/xorBy';
import _filter from 'lodash/filter';
import _sortBy from 'lodash/sortBy';
import _findIndex from 'lodash/findIndex';

import { computed, ref } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['fields', 'selectedFields']);
const localSelectedFields = ref(props.selectedFields);

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const unSelectedFields = computed(() => {
  let unselectedFields = _xorBy(props.fields, localSelectedFields.value, 'title');
  let editableUnselectedFields = _filter(unselectedFields, (f) => f.editType);
  editableUnselectedFields = _sortBy(editableUnselectedFields, (f) => f.title);
  return editableUnselectedFields;
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function addField(field) {
  localSelectedFields.value.splice(localSelectedFields.value.length, 0, field);
}

function removeField(field) {
  let i = _findIndex(localSelectedFields.value, (f) => f.title === field.title);
  localSelectedFields.value.splice(i, 1);
}
</script>

<style scoped>
fieldset {
  border: 1px solid rgb(223, 222, 222);
}
</style>
