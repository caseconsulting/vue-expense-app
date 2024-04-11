<template>
  <v-row class="pa-4">
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
          v-for="field of nonSelectedFields"
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

<script>
const _ = require('lodash');

function addField(field) {
  this.localSelectedFields.splice(this.localSelectedFields.length, 0, field);
}

function removeField(field) {
  let i = _.findIndex(this.localSelectedFields, (f) => f.title === field.title);
  this.localSelectedFields.splice(i, 1);
}

function nonSelectedFields() {
  let unselectedFields = _.xorBy(this.fields, this.localSelectedFields, 'title');
  let editableUnselectedFields = _.filter(unselectedFields, (f) => f.editType);
  return editableUnselectedFields;
}

export default {
  computed: {
    nonSelectedFields
  },
  data() {
    return {
      localSelectedFields: this.selectedFields
    };
  },
  methods: { addField, removeField },
  props: ['fields', 'selectedFields']
};
</script>

<style scoped>
fieldset {
  border: 1px solid rgb(223, 222, 222);
}
</style>
