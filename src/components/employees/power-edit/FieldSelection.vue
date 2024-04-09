<template>
  <v-row class="pa-4">
    <v-col cols="4">
      <fieldset class="pr-1">
        <legend class="pa-0">Selected</legend>
        <v-chip
          v-for="field of selectedFields"
          :key="field.key"
          class="ml-1 mb-1 pointer"
          color="blue"
          prepend-icon="mdi-check"
          size="x-small"
          variant="elevated"
          @click="field.selected = !field.selected"
        >
          {{ field.title }}
        </v-chip>
      </fieldset>
    </v-col>
    <v-col cols="8">
      <fieldset class="pr-1">
        <legend class="pa-0">Unselected</legend>
        <v-chip
          v-for="field of nonSelectedFields"
          :key="field.key"
          class="ml-1 mb-1 pointer"
          color="black"
          size="x-small"
          variant="outlined"
          @click="field.selected = !field.selected"
        >
          {{ field.title }}
        </v-chip>
      </fieldset>
    </v-col>
  </v-row>
</template>

<script>
const _ = require('lodash');

function nonSelectedFields() {
  return _.filter(this.localFields, (f) => !f.selected);
}

function selectedFields() {
  return _.filter(this.localFields, (f) => f.selected);
}

// function orderedFields() {
//   // always have name as first field, then selected alphabetized, then unselected alphabetized
//   return [
//     this.fields[0],
//     ..._.filter(this.fields, (f) => f.title !== 'Name' && f.selected).sort((a, b) =>
//       a.title > b.title ? 1 : b.title > a.title ? -1 : 0
//     ),
//     ..._.filter(this.fields, (f) => f.title !== 'Name' && !f.selected).sort((a, b) =>
//       a.title > b.title ? 1 : b.title > a.title ? -1 : 0
//     )
//   ];
// }

function localFields() {
  return _.filter(
    this.fields,
    (f) => (!this.fieldSearch || f.title.includes(this.fieldSearch)) && (f.editType || f.group)
  );
}

export default {
  computed: {
    localFields,
    nonSelectedFields,
    selectedFields
  },
  data() {
    return {
      fieldSearch: null
    };
  },
  props: ['fields']
};
</script>

<style scoped>
fieldset {
  border: 1px solid rgb(223, 222, 222);
}
</style>
