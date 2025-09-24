<template>
  <v-dialog v-model="show">
    <template #activator="{ props }">
      <add-primary title="Category" v-bind="props"></add-primary>
    </template>
    <category-form :model="model" :expenseType="expenseType"></category-form>
  </v-dialog>
</template>
<script setup>
import AddPrimary from '@/components/shared/buttons/AddPrimary.vue';
import CategoryForm from '@/components/expense-types/CategoryForm.vue';
import { ref } from 'vue';
import { Category } from '@/models/category';

const props = defineProps({
  expenseType: Object
});

const show = ref(false);
const model = ref(new Category(props.expenseType, true));
</script>
