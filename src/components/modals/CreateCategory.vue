<template>
  <v-dialog v-model="show">
    <template #activator="{ props }">
      <add-primary title="Category" v-bind="props"></add-primary>
    </template>
    <category-form :model="{}"></category-form>
  </v-dialog>
</template>
<script setup>
import AddPrimary from '@/components/shared/buttons/AddPrimary.vue';
import CategoryForm from '@/components/expense-types/CategoryForm.vue';
import { ref } from 'vue';

const show = ref(false);
</script>