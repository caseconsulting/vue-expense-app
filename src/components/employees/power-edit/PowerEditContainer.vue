<template>
  <div>
    <v-btn @click="emitter.emit('cancel-power-edit')" variant="text" class="float-right">
      <v-tooltip activator="parent">Exit power edit mode</v-tooltip>
      <v-icon size="x-large">mdi-pencil-off</v-icon>
    </v-btn>
    <field-selection :fields="fields" :selectedFields="selectedFields" class="pb-4 w-100"></field-selection>
    <power-edit-table
      :items="employees"
      :fields="[FIELDS.NAME, ...selectedFields, FIELDS.BLANK]"
      :search="props.search"
      :CustomEditItem="CustomEditItem"
      :CustomInfoItem="CustomInfoItem"
    ></power-edit-table>
  </div>
</template>

<script setup>
import FieldSelection from '@/components/employees/power-edit/FieldSelection.vue';
import PowerEditTable from '@/components/shared/power-edit/Table.vue';
import CustomEditItem from '@/components/employees/power-edit/edit-items/CustomItem.vue';
import CustomInfoItem from '@/components/employees/power-edit/info-items/CustomItem.vue';
import { useDisplayCustom } from '@/components/shared/StatusSnackbar.vue';
import { computed, inject, ref } from 'vue';
import FIELDS from '@/components/employees/power-edit/js/fields.js';
import api from '@/shared/api.js';
import { openLink } from '@/utils/utils.js';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['search']);
const store = useStore();
const emitter = inject('emitter');
const router = useRouter();
const fields = ref(Object.values(FIELDS));
const selectedFields = ref([FIELDS.EMPLOYEE_NUMBER, FIELDS.JOB_ROLE]);

emitter.on('click-item', ({ item, editItem, field }) => {
  handleItemClick(item, editItem, field);
});

emitter.on('save-edit-item', async ({ item, editItem, field }) => {
  await saveItem(item, editItem, field);
});

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const employees = computed(() => {
  let employees = store.getters.employees.filter((e) => e.workStatus > 0 && e.workStatus <= 100);
  return employees.map((e) => {
    return { ...e, name: `${e.nickname || e.firstName} ${e.lastName}` };
  });
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function handleItemClick(item, editItem, field) {
  if (field.editType) editItem.value = { item, field };
  else if (field.fixed) openLink(router.resolve({ path: `employee/${item.employeeNumber}` })?.href);
}

async function saveItem(item, editItem, field) {
  editItem.value = null;
  let employee = store.getters.employees.find((e) => e.id === item.id);
  let tmpField = field.key + 'tmp';
  employee[tmpField] = { field, saving: true };
  let resp;
  if (field.group && field.subkeys) {
    let promises = [];
    field.subkeys.forEach((key) => {
      employee[key] = item[key];
      promises.push(api.updateAttribute(api.EMPLOYEES, { id: item.id, [`${key}`]: item[key] }, key));
    });
    resp = await Promise.all(promises);
  } else {
    employee[field.key] = item[field.key];
    resp = await api.updateAttribute(api.EMPLOYEES, { id: item.id, [`${field.key}`]: item[field.key] }, field.key);
  }
  if (resp.name !== 'AxiosError') {
    employee[tmpField] = { ...employee[tmpField], success: true, saving: false };
  } else {
    useDisplayCustom(
      resp?.response?.data?.message || 'An unknown error has occurred',
      'CUSTOM',
      8000,
      'red',
      '',
      'top'
    );
    employee[tmpField] = { ...employee[tmpField], fail: true, saving: false };
  }

  setTimeout(() => {
    delete employee[tmpField];
  }, 2000);
}
</script>
