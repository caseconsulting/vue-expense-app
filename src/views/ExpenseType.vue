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
            <p v-else><b>Show On Feed:</b> {{ categoriesOnFeed(model.categories) }}</p>
            <p v-if="model.requireURL"><b>Require URL:</b> All Expenses</p>
            <p v-else><b>Require URL:</b> {{ categoriesReqUrl(model.categories) }}</p>
            <p v-if="model.requiredFlag"><b>Require Receipt:</b> All Expenses</p>
            <p v-else><b>Require Receipt:</b> {{ categoriesReqReceipt(model.categories) }}</p>
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

/**
 * Returns a string of category names that are on the feed.
 *
 * @param categories - the categories to stringify
 * @return string - the string of categories on the feed
 */
function categoriesOnFeed(categories) {
  let string = '';
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].showOnFeed) {
      if (string.length > 0) {
        string += ', ';
      }
      string += categories[i].name;
    }
  }
  if (string.length == 0) {
    string = 'None';
  }
  return string;
}

/**
 * Returns a string of category names that require a receipt.
 *
 * @param categories - the categories to stringify
 * @return string - the string of categories that require a receipt
 */
function categoriesReqReceipt(categories) {
  let string = '';
  //first filter out those that have a receipt required. then map each match to just it's name (now it's a list).
  //finally join the array items with a comma.
  string = categories.filter((cat) => {
    return cat.requireReceipt;
  }).map((match) => {
    return match.name;
  }).join(', ');

  if (string.length == 0) {
    string = 'None';
  }
  return string;
}

/**
 * Returns a string of category names that require a url.
 *
 * @param categories - the categories to stringify
 * @return string - the string of categories that require a url
 */
function categoriesReqUrl(categories) {
  let string = '';
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].requireURL) {
      if (string.length > 0) {
        string += ', ';
      }
      string += categories[i].name;
    }
  }
  if (string.length == 0) {
    string = 'None';
  }
  return string;
}

function loadExpenseType() {
  model.value = new ExpenseType(store.getters.expenseTypes.find(et => et.id === route.params.id));
  loading.value = false;
}


</script>