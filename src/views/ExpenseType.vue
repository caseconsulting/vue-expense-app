<template>
  <div>
    <p>{{ model?.id }}</p>
    <p>{{ model?.budgetName }}</p>
    <p>{{ model?.description }}</p>
  </div>
</template>
<script setup>
import { onBeforeMount, ref } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { updateStoreExpenseTypes } from '@/utils/storeUtils.js';

const route = useRoute();
const store = useStore();

const model = ref(null); // selected expense type

onBeforeMount(async () => {
  await Promise.all([
    !store.getters.user ? updateStoreUser() : '',
    !store.getters.expenseTypes ? updateStoreExpenseTypes() : ''
  ]);
  loadExpenseType();
});

function loadExpenseType() {
  model.value = store.getters.expenseTypes.find(et => et.id === route.params.id);
}
</script>