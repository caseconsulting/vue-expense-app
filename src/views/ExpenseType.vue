<template>
  <div>
    <div v-if="model == null && loading">
      <p>Loading...</p>
    </div>
    <div v-else>
      <h1>{{ model.budgetName }}</h1>
      <p>{{ model.description }}</p>
      <v-row>
        <v-col cols="9">
          <v-card>
            <v-card-title class="header-slim">Categories</v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item
                  v-for="(category, index) in model.categories"
                  :key="index"
                >
                  <v-list-item-content>
                    <v-list-item-title>{{ category.name }}</v-list-item-title>
                    <v-list-item-subtitle class="d-block">
                      <boolean displayText="Show On Feed" :field="category.showOnFeed"></boolean>
                      <boolean displayText="Require URL" :field="category.requireURL"></boolean>
                      <boolean displayText="Require Receipt" :field="category.requireReceipt"></boolean>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="3">
          <span>
            <p v-if="model.alwaysOnFeed"><b>Show On Feed:</b> All Expenses</p>
            <p v-else><b>Show On Feed:</b> {{ model.categoriesOnFeed }}</p>
            <p v-if="model.requireURL"><b>Require URL:</b> All Expenses</p>
            <p v-else><b>Require URL:</b> {{ model.categoriesRequireURL }}</p>
            <p v-if="model.requiredFlag"><b>Require Receipt:</b> All Expenses</p>
            <p v-else><b>Require Receipt:</b> {{ model.categoriesRequireReceipt }}</p>
          </span>
          <boolean displayText="Requires Recipient" :field="model.hasRecipient"></boolean>
          <br />
          <boolean displayText="Pro-rated" :field="model.proRated"></boolean>
          <br />
          <boolean displayText="Overdraft Allowed" :field="model.odFlag"></boolean>
          <br />
          <boolean displayText="Recurring" :field="model.recurringFlag"></boolean>
          <br />
          <boolean displayText="Inactive" :field="model.isInactive"></boolean>
        </v-col>
      </v-row>
    </div>
  </div>
</template>
<script setup>
import Boolean from '@/components/shared/Boolean.vue';
import { onBeforeMount, ref } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { updateStoreUser, updateStoreExpenseTypes } from '@/utils/storeUtils.js';
import { ExpenseType } from '@/models/ExpenseType.js';

const route = useRoute();
const store = useStore();

const loading = ref(true);
const model = ref(null); // selected expense type

onBeforeMount(async () => {
  await updateStoreUser();
  await updateStoreExpenseTypes();
  loadExpenseType();
});

function loadExpenseType() {
  model.value = new ExpenseType(store.getters.expenseTypes.find(et => et.id === route.params.id));
  loading.value = false;
}


</script>