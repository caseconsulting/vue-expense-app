<template>
  <v-data-table
    :items="employees"
    :headers="fields"
    :search="search"
    fixed-header
    fixed-footer
    height="80vh"
    width="100%"
    items-per-page="-1"
    class="sticky-columns mt-1"
  >
    <template v-for="field in fields" v-slot:[`item.${field.key}`]="{ item }">
      <power-edit-table-item
        :key="field"
        @click="field.editType ? (editItem = { item, field }) : ''"
        :class="saveColor(item, field)"
        class="d-flex align-center w-100 h-100 pointer"
        :editing="editItem?.item.id === item.id && editItem?.field.key === field.key"
        :field="field"
        :item="item"
      ></power-edit-table-item>
    </template>
  </v-data-table>
</template>

<script>
import PowerEditTableItem from '@/components/employees/power-edit/PowerEditTableItem.vue';
import api from '@/shared/api.js';
const _ = require('lodash');

async function created() {
  this.emitter.on('save-item', async ({ item, field, value }) => {
    this.editItem = null;
    let employee = _.find(this.$store.getters.employees, (e) => e.id === item.id);
    let originalEmployee = _.cloneDeep(employee);
    let tmpField = field.key + 'tmp';
    employee[tmpField] = { field, saving: true };
    employee[field.key] = value;
    let resp = await api.updateAttribute(api.EMPLOYEES, { ...originalEmployee, [`${field.key}`]: value }, field.key);
    if (resp.name !== 'AxiosError') {
      employee[tmpField] = { ...employee[tmpField], success: true, saving: false };
    } else {
      employee[field.key] = originalEmployee[field.key];
      employee[tmpField] = { ...employee[tmpField], fail: true, saving: false };
    }

    window.setTimeout(() => {
      delete employee[tmpField];
    }, 2000);
  });

  this.emitter.on('cancel-item', () => {
    this.editItem = null;
  });
}

function employees() {
  return _.map(this.$store.getters.employees, (e) => {
    return { ...e, name: `${e.nickname || e.firstName} ${e.lastName}` };
  });
}

function saveColor(item, field) {
  let itemClass = '';
  let itemSaving = item[field.key + 'tmp'];
  if (itemSaving?.saving && field.key === itemSaving?.field?.key) itemClass = 'item-saving';
  else if (itemSaving?.success && field.key === itemSaving?.field?.key) itemClass = 'item-success';
  else if (itemSaving?.fail && field.key === itemSaving?.field?.key) itemClass = 'item-fail';
  return itemClass;
}

export default {
  components: { PowerEditTableItem },
  computed: {
    employees
  },
  created,
  data() {
    return {
      editItem: null,
      itemsSaving: []
    };
  },
  methods: {
    saveColor
  },
  props: ['fields', 'search']
};
</script>

<style>
.item-saving {
  font-weight: bold;
  color: darkgray;
}
.item-success {
  font-weight: bold;
  color: green !important;
  transition: color 2s ease-out !important;
  -webkit-transition: color 2s ease-out !important;
}
.item-fail {
  font-weight: bold;
  color: red !important;
  transition: color 2s ease-out !important;
  -webkit-transition: color 2s ease-out !important;
}
.sticky-columns tbody > tr > td:nth-child(1),
.sticky-columns thead > tr > th:nth-child(1) {
  position: sticky !important;
  position: -webkit-sticky !important;
  left: 0;
  top: 0;
  z-index: 9998;
  background-color: white;
}
.sticky-columns thead > tr > th:nth-child(1) {
  z-index: 9999;
}
</style>
