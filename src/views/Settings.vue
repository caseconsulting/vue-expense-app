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
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import PowerEditTable from '@/components/employees/power-edit/PowerEditTable.vue';

const settings = [
  {
    key: 'test',
    value: 'info@consultwithcase.com',
  }
]
</script>