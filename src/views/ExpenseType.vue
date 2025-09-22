<template>
  <div>
    <div v-if="model == null && loading">
      <p>Loading...</p>
    </div>
    <div v-else>
      <h1>{{ model.name }}</h1>
      <p>{{ model.description }}</p>
      <v-row>
        <v-col cols="6">
          <v-card>
            <v-card-title class="header-slim">Expense Type</v-card-title>
            <v-card-text class="mt-2">
              <h2>Budget Amount</h2>
              <div class="ml-4">
                <p><b>Budget:</b> {{ model.budget }}</p>
                <p>TODO: tags</p>
                <p><b>Monthly Limit:</b>
                  <span v-if="model.monthlyLimit">{{ model.monthlyLimit }}</span>
                  <span v-else>None</span>
                </p>
              </div>
              <h2>Employee Access</h2>
              <div class="ml-4">
                TODO
              </div>
              <h2>Duration</h2>
              <div class="ml-4">
                <boolean displayText="Recurring" :field="model.recurringFlag"></boolean>
                <div v-if="model.recurringFlag">
                  <boolean displayText="Inactive" :field="model.isInactive"></boolean>
                </div>
                <div v-else>
                  <p><b>Start Date:</b> {{ model.startDate }}</p>
                  <p><b>End Date:</b> {{ model.endDate }}</p>
                </div>
              </div>
              <h2>Integrations</h2>
              <div class="ml-4">
                <p v-if="model.campfire"><b>Basecamp Campfire:</b>{{ model.campfire }}</p>
                <p v-else> None</p>
              </div>
              <h2>Flags</h2>
              <div class="ml-4">
                <p><b>Show On Feed:</b> {{ model.showOnFeedText }}</p>
                <p><b>Require URL:</b> {{ model.requireURLText }}</p>
                <p><b>Require Receipt:</b> {{ model.requireReceiptText }}</p>
                <boolean displayText="Requires Recipient" :field="model.hasRecipient"></boolean>
                <boolean displayText="Pro-rated" :field="model.proRated"></boolean>
                <boolean displayText="Overdraft Allowed" :field="model.odFlag"></boolean>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6">
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