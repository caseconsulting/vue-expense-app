<template>
  <div>
    <div v-if="model == null && loading">
        <v-row>
          <v-col cols="12">
            <v-skeleton-loader type="heading"></v-skeleton-loader>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <v-skeleton-loader width="100%" type="text@12"></v-skeleton-loader>
          </v-col>
          <v-col cols="6">
            <v-skeleton-loader width="100%" type="text@12"></v-skeleton-loader>
          </v-col>
        </v-row>
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
                <!-- Tag Budgets -->
                <v-row v-if="userRoleIsAdmin() && model.tagBudgets && model.tagBudgets.length > 0" no-gutters>
                  <v-col cols="12" sm="6" md="3">
                    <div>
                      <p><b>Tag Budgets:</b></p>
                    </div>
                  </v-col>
                  <v-col class="d-flex justify-space-between flex-wrap">
                    <div v-for="(model, index) in model.tagBudgets" :key="index" class="d-flex px-2 pb-4">
                      <div class="d-flex pr-3">
                        <b>Tag(s):</b>
                        <div class="d-flex flex-column">
                          <v-chip v-for="tagID in model.tags" size="small" :key="tagID">
                            <v-icon icon="mdi-tag" start />{{ getTagByID(tagID).tagName }}
                          </v-chip>
                        </div>
                      </div>
                      <div class="d-flex flex-nowrap">
                        <span>
                          <b>Budget: </b>
                          {{ convertToMoneyString(model.budget) }}
                        </span>
                      </div>
                    </div>
                  </v-col>
                </v-row>
                <p><b>Monthly Limit: </b>
                  <span v-if="model.monthlyLimit">{{ model.monthlyLimit }}</span>
                  <span v-else>None</span>
                </p>
              </div>
              <h2>Employee Access</h2>
              <div class="ml-4">
                <p><b>Access:</b> {{ model.accessText }}</p>
                <employee-list :employees="getEmployeeAccess()" title="Accessible By"></employee-list>
                <p><b>Disabled Employees:</b> {{ model.disabledEmployeesText }}</p>
                <employee-list
                  v-if="getDisabledEmployees().length > 0"
                  :employees="getDisabledEmployees()" title="Disabled Employees">
                </employee-list>
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
              <h2>Emails</h2>
              <div class="ml-4">
                <p><b>To: </b>
                  <span v-if="model.to">{{ model.to }}</span>
                  <span v-else>None</span>
                </p>
                <p><b>CC: </b>
                  <span v-if="model.cc">{{ model.cc }}</span>
                  <span v-else>None</span>
                </p>
                <p><b>BCC: </b>
                  <span v-if="model.bcc">{{ model.bcc }}</span>
                  <span v-else>None</span>
                </p>
                <p><b>Reply-To: </b>
                  <span v-if="model.replyTo">{{ model.replyTo }}</span>
                  <span v-else>None</span>
                </p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6">
          <v-card>
            <v-card-title class="header-slim">Categories</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" class="d-flex justify-center ma-1">
                  <create-category
                    title="Add Category"
                    :click="() => {
                      addCategory = true;
                    }"
                  ></create-category>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" v-if="model.categories.length == 0">
                  <p>No categories.</p>
                </v-col>
                <v-col cols="12" v-else>
                  <v-list>
                    <v-list-item
                      v-for="(category, index) in model.categories"
                      :key="index"
                    >
                      <v-list-item-title>{{ category.name }}</v-list-item-title>
                      <v-list-item-subtitle class="d-block">
                        <boolean displayText="Show On Feed" :field="category.showOnFeed"></boolean>
                        <boolean displayText="Require URL" :field="category.requireURL"></boolean>
                        <boolean displayText="Require Receipt" :field="category.requireReceipt"></boolean>
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>
<script setup>
import Boolean from '@/components/shared/Boolean.vue';
import CreateCategory from '@/components/modals/CreateCategory.vue';
import EmployeeList from '@/components/modals/EmployeeList.vue';
import { onBeforeMount, ref } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { convertToMoneyString, userRoleIsAdmin } from '@/utils/utils';
import { updateStoreEmployees, updateStoreExpenseTypes, updateStoreTags, updateStoreUser } from '@/utils/storeUtils.js';
import { loadBasecampAvatars } from '@/utils/basecamp';
import { ExpenseType } from '@/models/ExpenseType.js';

const route = useRoute();
const store = useStore();

const addCategory = ref(false);
const loading = ref(true);
const model = ref(null); // selected expense type

onBeforeMount(async () => {
  await updateStoreEmployees();
  await loadBasecampAvatars(store, store.getters.employees);
  await updateStoreUser();
  await updateStoreExpenseTypes();
  await updateStoreTags();
  loadExpenseType();
});

function getEmployeeAccess() {
  return model.value.employeeAccess(store.getters.employees);
}

function getDisabledEmployees() {
  return model.value.disabledEmployeesList(store.getters.employees);
}

/**
 * Gets tag object given id
 * @param id id of tag to find
 */
function getTagByID(id) {
  return store.getters.tags.find((t) => t.id === id);
}


function loadExpenseType() {
  model.value = new ExpenseType(store.getters.expenseTypes.find(et => et.id === route.params.id));
  loading.value = false;
}


</script>