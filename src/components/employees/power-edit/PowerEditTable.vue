<template>
  <v-form v-model="valid">
    <v-data-table
      :expanded="expanded"
      :items="employees"
      :headers="props.fields"
      :search="props.search"
      density="comfortable"
      fixed-header
      fixed-footer
      items-per-page="-1"
      @click:row="handleRowClick"
      class="power-edit-table mt-1"
    >
      <template v-for="field in props.fields" v-slot:[`item.${field.key}`]="{ item }">
        <power-edit-table-edit-item
          v-if="editItem?.item?.id === item.id && editItem?.field?.key === field.key"
          :key="field"
          :field="field"
          :item="item"
          :showInfo="field.group"
        ></power-edit-table-edit-item>
        <power-edit-table-info-item
          v-else-if="field.infoType"
          :key="field + 1"
          @click="handleItemClick(item, field)"
          :class="saveColor(item, field)"
          :field="field"
          :item="item"
          class="d-flex align-center w-100 h-100"
        ></power-edit-table-info-item>
      </template>
      <template v-slot:expanded-row>
        <tr v-if="editItem?.field && editItem?.item">
          <td colspan="12">
            <div>
              <power-edit-table-edit-item :field="editItem.field" :item="editItem.item"></power-edit-table-edit-item>
            </div>
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-form>
</template>

<script setup>
import PowerEditTableInfoItem from '@/components/employees/power-edit/PowerEditTableInfoItem.vue';
import PowerEditTableEditItem from '@/components/employees/power-edit/PowerEditTableEditItem.vue';
import _ from 'lodash';
import api from '@/shared/api.js';
import { computed, ref, inject } from 'vue';
import { useStore } from 'vuex';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['fields', 'search']);
const store = useStore();
const emitter = inject('emitter');
const editItem = ref(null);
const expanded = ref([]);
const valid = ref(true);

emitter.on('save-item', async ({ item, field }) => {
  await saveItem(item, field);
});

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const employees = computed(() => {
  return _.map(store.getters.employees, (e) => {
    return { ...e, name: `${e.nickname || e.firstName} ${e.lastName}` };
  });
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function handleItemClick(item, field) {
  if (field.editType) editItem.value = { item, field };
  else if (field.fixed) this.$router.push(`employee/${item.employeeNumber}`);
}

function handleRowClick() {
  expanded.value = [];
  if (editItem.value?.field?.group) {
    if (!expanded.value.includes(editItem.value?.item?.id)) expanded.value.push(editItem.value?.item?.id);
  }
}

function saveColor(item, field) {
  let itemClass = '';
  let itemSaving = item[field.key + 'tmp'];
  if (itemSaving?.saving && field.key === itemSaving?.field?.key) itemClass = 'item-saving';
  else if (itemSaving?.success && field.key === itemSaving?.field?.key) itemClass = 'item-success';
  else if (itemSaving?.fail && field.key === itemSaving?.field?.key) itemClass = 'item-fail';
  return itemClass;
}

async function saveItem(item, field) {
  editItem.value = null;
  let employee = _.find(store.getters.employees, (e) => e.id === item.id);
  let originalEmployee = _.cloneDeep(employee);
  let tmpField = field.key + 'tmp';
  employee[tmpField] = { field, saving: true };
  let resp;
  if (field.group && field.subkeys) {
    let promises = [];
    _.forEach(field.subkeys, (key) => {
      employee[key] = item[key];
      originalEmployee[key] = item[key];
      promises.push(api.updateAttribute(api.EMPLOYEES, { ...originalEmployee }, key));
    });
    console.log(field);
    resp = await Promise.all(promises);
    console.log(field);
  } else {
    employee[field.key] = item[field.key];
    originalEmployee[field.key] = item[field.key];
    resp = await api.updateAttribute(api.EMPLOYEES, { ...originalEmployee }, field.key);
  }
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
