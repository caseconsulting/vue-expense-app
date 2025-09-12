<template>
  <div>
    <v-card>
      <v-card-title class="header-slim">
        <v-icon
          icon="mdi-cog"
          size="small"
          class="mr-1 mb-1"
        />
        Settings
      </v-card-title>
      <v-card-text>
          <power-edit-table
            :items="settings"
            :fields="fields"
          ></power-edit-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import PowerEditTable from '@/components/shared/power-edit/Table.vue';
import { TYPES } from '@/components/shared/power-edit/js/fieldTypes.js';

const settings = [
  {
    id: 1,
    key: 'test',
    value: 'info@consultwithcase.com',
  },
  {
    id: 2,
    key: 'another',
    value: 'another value',
  }
];

const fields = [{
  title: 'Test',
  key: 'key',
  fixed: true,
  infoType: TYPES.DEFAULT
}, {
  title: 'Value',
  key: 'value',
  editType: TYPES.DEFAULT,
  infoType: TYPES.DEFAULT
}];
</script>