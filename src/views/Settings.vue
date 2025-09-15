<template>
  <div>
    <v-card>
      <v-card-title class="header-slim d-flex align-center">
        <v-icon
          icon="mdi-cog"
          size="small"
          class="mr-1 mb-1"
        />Settings

        <v-spacer />

        <v-btn
          small
          variant="text"
          @click="add = true"
          icon="mdi-plus" ></v-btn>
      </v-card-title>
      <v-card-text>
          <power-edit-table
            :items="settings"
            :fields="fields"
          ></power-edit-table>
      </v-card-text>
    </v-card>
    <settings-form v-model="add"></settings-form>
  </div>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue';
import PowerEditTable from '@/components/shared/power-edit/Table.vue';
import SettingsForm from '@/components/settings/SettingsForm.vue';
import { TYPES } from '@/components/shared/power-edit/js/fieldTypes.js';
import api from '@/shared/api.js';

const emitter = inject('emitter');
const add = ref(false);
const settings = ref([]);
const fields = [{
  title: 'Key',
  key: 'key',
  fixed: true,
  infoType: TYPES.DEFAULT
}, {
  title: 'Setting',
  key: 'setting',
  editType: TYPES.DEFAULT,
  infoType: TYPES.DEFAULT
  }];


emitter.on('save-edit-item', async ({ item, editItem, field }) => {
  await saveItem(item, editItem, field);
});

emitter.on('add-settings', async () => {
  add.value = false;
  settings.value = await api.getItems(api.SETTINGS);
});


onMounted(async () => {
  settings.value = await api.getItems(api.SETTINGS);
});


async function saveItem(item, editItem, field) {
  editItem.value = null;
  let setting = settings.value.find(s => s.id === item.id);
  if (setting) {
    setting[field.key] = item[field.key];
    resp = await api.updateAttribute(api.SETTINGS, { id: item.id, [`${field.key}`]: item[field.key] }, field.key);
  }
}
</script>