<template>
  <v-form v-model="valid">
    <v-data-table
      :expanded="expanded"
      :items="employees"
      :headers="fields"
      :search="search"
      density="comfortable"
      fixed-header
      fixed-footer
      items-per-page="-1"
      @click:row="handleRowClick"
      class="power-edit-table mt-1"
    >
      <template v-for="field in fields" v-slot:[`item.${field.key}`]="{ item }">
        <power-edit-table-edit-item
          v-if="editItem?.item.id === item.id && editItem?.field.key === field.key"
          :key="field"
          :field="field"
          :item="item"
          :valid="valid"
        ></power-edit-table-edit-item>
        <power-edit-table-info-item
          v-else-if="field.infoType"
          :key="field + 1"
          @click="handleItemClick(item, field)"
          :class="saveColor(item, field)"
          :field="field"
          :item="item"
        ></power-edit-table-info-item>
      </template>
      <template v-slot:expanded-row>
        <tr>
          <power-edit-table-edit-item
            :expanded="true"
            :field="editItem.field"
            :item="editItem.item"
            :valid="valid"
          ></power-edit-table-edit-item>
        </tr>
      </template>
    </v-data-table>
  </v-form>
</template>

<script>
import PowerEditTableInfoItem from '@/components/employees/power-edit/PowerEditTableInfoItem.vue';
import PowerEditTableEditItem from '@/components/employees/power-edit/PowerEditTableEditItem.vue';
import api from '@/shared/api.js';
const _ = require('lodash');

async function created() {
  this.emitter.on('save-item', async ({ item, field, value }) => {
    await this.saveItem(item, field, value);
  });
}

function handleItemClick(item, field) {
  if (field.editType) this.editItem = { item, field };
  else if (field.fixed) this.$router.push(`employee/${item.employeeNumber}`);
}

function handleRowClick() {
  if (this.editItem?.field?.group) {
    if (!this.expanded.includes(this.editItem?.item?.id)) this.expanded.push(this.editItem?.item?.id);
    console.log(this.expanded);
  }
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

async function saveItem(item, field, value) {
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

  setTimeout(() => {
    delete employee[tmpField];
  }, 2000);
}

export default {
  components: { PowerEditTableInfoItem, PowerEditTableEditItem },
  computed: {
    employees
  },
  created,
  data() {
    return {
      editItem: null,
      expanded: [],
      itemsSaving: [],
      valid: true
    };
  },
  methods: {
    handleItemClick,
    handleRowClick,
    saveColor,
    saveItem
  },
  props: ['fields', 'search']
};
</script>

<style scoped>
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
.power-edit-table {
  max-height: 80vh;
}
</style>
