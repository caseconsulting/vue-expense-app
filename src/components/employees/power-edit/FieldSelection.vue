<template>
  <div class="pa-4">
    <v-row class="ml-1">
      <v-col cols="6" md="3" lg="2" class="pa-0 mb-5">
        <v-text-field
          density="compact"
          v-model="fieldSearch"
          append-inner-icon="mdi-magnify"
          label="Search field (chip)"
          variant="underlined"
          hide-details
          single-line
          clearable
        ></v-text-field>
      </v-col>
    </v-row>
    <div class="d-inline-block">
      <v-chip
        v-for="field of localFields"
        :key="field.key"
        size="small"
        :prepend-icon="field.selected ? 'mdi-check' : ''"
        class="mr-1 pointer"
        @click="field.selected = !field.selected"
        :color="field.selected ? 'blue' : 'black'"
        :variant="field.selected ? 'elevated' : 'outlined'"
      >
        {{ field.title }}
      </v-chip>
    </div>
  </div>
</template>

<script>
const _ = require('lodash');

function localFields() {
  return _.filter(this.fields, (f) => !this.fieldSearch || f.title.includes(this.fieldSearch));
}

export default {
  computed: {
    localFields
  },
  data() {
    return {
      fieldSearch: null
    };
  },
  props: ['fields']
};
</script>
