<template>
  <v-form class="d-flex align-center" v-model="valid">
    <v-combobox
      v-if="props.header.type === 'combobox'"
      v-model="model"
      autofocus
      :rules="props.header.rules"
      :class="props.header.class"
      :items="getItems()"
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
    <v-btn density="comfortable" :disabled="!valid" icon variant="text">
      <v-tooltip activator="parent">Save {{ props.header.title }}</v-tooltip>
      <v-icon>mdi-content-save</v-icon>
    </v-btn>
  </v-form>
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue';
import { getOrgList, getProjectLocations } from '@/shared/contractUtils';

const props = defineProps(['header', 'item']);
const model = ref(props.item[props.header.key]);
const header = ref(props.header);
const valid = ref(false);

const originalHeaderWidth = header.value.customWidth;
header.value.customWidth = 'x-large';

onBeforeUnmount(() => {
  header.value.customWidth = originalHeaderWidth;
});

function getItems() {
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
</script>
