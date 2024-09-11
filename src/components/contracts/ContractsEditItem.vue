<template>
  <v-form class="d-flex align-center" v-model="valid" @keyup.enter="saveItem()">
    <v-combobox
      v-if="props.header.type === 'combobox'"
      v-model="model"
      autofocus
      :rules="props.header.rules"
      :class="props.header.class"
      :items="getDropdownItems()"
      :label="props.header.title"
      variant="underlined"
    ></v-combobox>
    <v-textarea
      v-else-if="props.header.type === 'textarea'"
      v-model="model"
      auto-grow
      autofocus
      :class="props.header.class"
      :rules="props.header.rules"
      :label="props.header.title"
      variant="underlined"
    ></v-textarea>
    <v-select
      v-else-if="props.header.type === 'select'"
      v-model="model"
      autofocus
      clearable
      :items="['On-site', 'Hybrid', 'Remote']"
      :rules="props.header.rules"
      :label="props.header.title"
      variant="underlined"
    >
    </v-select>
    <v-text-field
      v-else
      v-model="model"
      autofocus
      :rules="props.header.rules"
      :label="props.header.title"
      variant="underlined"
    ></v-text-field>
    <v-btn density="comfortable" @click="saveItem()" :disabled="!valid" icon variant="text">
      <v-tooltip activator="parent">Save {{ props.header.title }}</v-tooltip>
      <v-icon>mdi-content-save</v-icon>
    </v-btn>
  </v-form>
</template>

<script setup>
import _forEach from 'lodash/forEach';
import _find from 'lodash/find';
import _findIndex from 'lodash/findIndex';
import api from '@/shared/api';
import { onBeforeUnmount, ref, inject, onBeforeMount } from 'vue';
import { getOrgList, getProjectLocations } from '@/shared/contractUtils';
import { useStore } from 'vuex';

const props = defineProps(['header', 'item', 'type']);
const emitter = inject('emitter');
const store = useStore();

const model = ref(props.item[props.header.key]);
const header = ref(props.header);
const item = ref(props.item);
const valid = ref(false);

header.value.editing = true;

onBeforeMount(() => {
  emitter.emit(`editing-${props.type}-item`);
});

onBeforeUnmount(() => {
  header.value.editing = false;
});

function getDropdownItems() {
  let items = [];
  let key = props.header.key;
  if (key === 'location') {
    items = getProjectLocations();
  } else {
    items = getOrgList(key, {
      customerOrg: key !== 'customerOrg' ? props.item.customerOrg : null,
      directorate: key !== 'directorate' ? props.item.directorate : null,
      org2: key !== 'org2' ? props.item.org2 : null,
      org3: key !== 'org3' ? props.item.org3 : null
    });
  }
  return items;
}

async function saveItem() {
  if (valid.value) {
    let key = props.header.key;
    let promise = null;
    if (item.value.contractId) {
      // update contract
      item.value[key] = model.value;
      promise = api.updateAttribute(api.CONTRACTS, { id: item.value.id, [`${key}`]: item.value[key] }, key);
    } else {
      // update projects field
      let contract = _find(store.getters.contracts, (c) => _find(c.projects, (p) => p.id === item.value.id));
      let pIndex = _findIndex(contract.projects, (p) => p.id === item.value.id);
      item.value[key] = model.value;
      contract.projects[pIndex] = item.value;
      _forEach(contract.projects, (p) => delete p.saveStatuses);
      promise = api.updateAttribute(api.CONTRACTS, { id: contract.id, projects: contract.projects }, 'projects');
    }
    emitter.emit('saved-contract-item', { key, item: item.value, promise });
  }
}
</script>
