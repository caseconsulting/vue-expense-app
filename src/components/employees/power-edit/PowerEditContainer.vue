<template>
  <div>
    <field-selection :fields="orderedFields"></field-selection>
    <power-edit-table :fields="selectedFields" :search="search"></power-edit-table>
  </div>
</template>

<script>
import FieldSelection from '@/components/employees/power-edit/FieldSelection.vue';
import PowerEditTable from '@/components/employees/power-edit/PowerEditTable.vue';
import { fields } from '@/components/employees/power-edit/fields.js';
const _ = require('lodash');

function selectedFields() {
  return _.filter(this.fields, (f) => f.selected);
}

function orderedFields() {
  // always have name as first field, then selected alphabetized, then unselected alphabetized
  return [
    this.fields[0],
    ..._.filter(this.fields, (f) => f.title !== 'Name' && f.selected).sort((a, b) =>
      a.title > b.title ? 1 : b.title > a.title ? -1 : 0
    ),
    ..._.filter(this.fields, (f) => f.title !== 'Name' && !f.selected).sort((a, b) =>
      a.title > b.title ? 1 : b.title > a.title ? -1 : 0
    )
  ];
}

export default {
  components: {
    FieldSelection,
    PowerEditTable
  },
  computed: {
    selectedFields,
    orderedFields
  },
  data() {
    return {
      fields: fields
    };
  },
  props: ['search']
};
</script>
