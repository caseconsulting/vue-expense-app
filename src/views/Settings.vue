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
          ></power-edit-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import PowerEditTable from '@/components/shared/power-edit/Table.vue';

const settings = [
  {
    key: 'test',
    value: 'info@consultwithcase.com',
  }
]
</script>