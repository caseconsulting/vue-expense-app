<!-- eslint-disable vue/no-v-model-argument -->
<template>
  <div>
    <v-card>
      <v-container fluid class="px-0 px-md-4">
        <!-- Title -->
        <v-card-title class="">
          <v-row class="d-flex align-center">
            <v-col cols="12" md="4">
              <h2 class="my-2">
                Employees
                <span v-if="powerEdit && hasAdminPermissions()" class="ml-3 power-edit-text">Power Edit Mode</span>
              </h2>
            </v-col>
            <v-spacer />
            <v-col cols="12" md="4">
              <v-text-field
                id="employeesSearch"
                v-model.trim="search"
                append-inner-icon="mdi-magnify"
                label="Search (comma separate terms)"
                variant="underlined"
                single-line
              />
            </v-col>
          </v-row>
        </v-card-title>

        <power-edit-container v-if="powerEdit && hasAdminPermissions()" :search="search" />
        <div v-else>
          <!-- Filters -->
          <v-card v-if="hasAdminPermissions()" class="pa-0 pa-md-4" variant="outlined">
            <v-row color="black" class="mx-1 mx-md-5 my-1">
              <!-- Active Filter -->
              <v-col :align="isMobile() ? 'center' : ''" cols="8" md="4" sm="6">
                <h4 class="d-block mx-auto">Employee Status:</h4>
                <v-btn-toggle
                  color="primary"
                  class="filter_color mx-auto"
                  v-model="filter.active"
                  text
                  multiple
                  @update:modelValue="filterEmployees()"
                >
                  <!-- Full Time -->
                  <v-tooltip location="top" text="Full Time">
                    <template #activator="{ props }">
                      <v-btn id="full" value="full" v-bind="props" variant="text">
                        <v-icon class="mr-1"> mdi-clock{{ filter.active.includes('full') ? '' : '-outline' }} </v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>

                  <!-- Part Time -->
                  <v-tooltip location="top">
                    <template #activator="{ props }">
                      <v-btn id="part" value="part" v-bind="props" variant="text">
                        <v-icon>
                          {{ filter.active.includes('part') ? 'mdi-clock-time-four' : 'mdi-progress-clock' }}
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>Part Time</span>
                  </v-tooltip>

                  <!-- Inactive -->
                  <v-tooltip location="top">
                    <template #activator="{ props }">
                      <v-btn id="inactive" value="inactive" v-bind="props" variant="text">
                        <v-icon> mdi-stop-circle{{ filter.active.includes('inactive') ? '' : '-outline' }} </v-icon>
                      </v-btn>
                    </template>
                    <span>Inactive</span>
                  </v-tooltip>
                </v-btn-toggle>
              </v-col>
              <!-- Tags filter -->
              <v-col
                v-if="userRoleIsAdmin() || userRoleIsManager()"
                :align="isMobile() ? 'center' : ''"
                cols="9"
                md="5"
                sm="6"
              >
                <tags-filter
                  v-model="tagsInfo"
                  @update:modelValue="filterEmployees()"
                  classProps="mt-2 mt-md-4 ml-1 ml-md-4"
                ></tags-filter>
              </v-col>
              <!-- End Tags Filter -->
            </v-row>
          </v-card>
          <br />
          <!-- End Filters -->
          <!-- Create an Employee -->
          <v-btn
            v-if="hasAdminPermissions()"
            id="createEmployeeBtn"
            class="mb-5"
            :class="isMobile() ? 'ml-2' : ''"
            :disabled="loading"
            :size="isMobile() ? 'small' : 'default'"
            elevation="2"
            @click="renderCreateEmployee()"
          >
            {{ isMobile() ? 'Create Employee' : 'Create an Employee' }}
            <v-icon class="pl-2" icon="mdi-account-plus" />
          </v-btn>

          <!-- Tag Manager -->
          <v-btn
            v-if="hasAdminPermissions()"
            id="manageTagsBtn"
            class="mb-5 ml-2 ml-md-4"
            :disabled="loading"
            :size="isMobile() ? 'small' : 'default'"
            elevation="2"
            @click="renderManageTags()"
          >
            Manage Tags
            <v-icon class="pl-2"> mdi-tag-multiple </v-icon>
          </v-btn>

          <!-- Sync Applications -->
          <v-btn
            v-if="hasAdminPermissions()"
            id="syncApplicationsBtn"
            class="mb-5 ml-2 ml-md-4"
            :disabled="loading || syncing"
            elevation="2"
            :size="isMobile() ? 'small' : 'default'"
            @click="syncApplications()"
          >
            {{ isMobile() ? 'Sync Apps' : 'Sync Applications' }}

            <v-progress-circular v-if="syncing" class="ml-2" :size="25" indeterminate color="grey" />
            <v-icon v-else class="pl-2"> mdi-web-sync </v-icon>
          </v-btn>

          <!-- CSV Downloads modal -->
          <v-btn
            v-if="hasAdminPermissions()"
            :mid-action="midAction"
            :disabled="loading || syncing"
            elevation="2"
            :size="isMobile() ? 'small' : 'default'"
            class="mb-5 ml-2 ml-md-4"
            @click.stop="showExportDataModal = !showExportDataModal"
          >
            Export Data <v-icon class="pl-2"> mdi-table-arrow-down </v-icon>
          </v-btn>

          <v-btn
            v-if="hasAdminPermissions()"
            class="mb-5 ml-2 ml-md-4 float-right"
            @click="powerEdit = true"
            variant="flat"
          >
            <v-tooltip activator="parent">Enter power edit mode</v-tooltip>
            <v-icon size="x-large"> mdi-pencil </v-icon>
          </v-btn>

          <!-- NEW DATA TABLE -->
          <v-data-table
            :sort-by="sortBy"
            :items-per-page="itemsPerPage"
            :headers="headers"
            :items="filteredEmployees"
            :loading="loading"
            :search="search"
            :custom-filter="employeeFilter"
            mobile-breakpoint="800"
            item-key="employeeNumber"
            class="elevation-1 employees-table text-body-2"
            @click:row="handleClick"
          >
            <!-- Delete Action Item Slot -->
            <template #[`item.actions`]="{ item }">
              <div class="datatable_btn layout">
                <convert-employee-to-csv
                  v-if="userRoleIsAdmin()"
                  :mid-action="midAction"
                  :employee="item"
                  :contracts="contracts"
                  :tags="tags"
                  :filename="`${item.nickname || item.firstName} ${item.lastName}`"
                />
                <span>
                  <v-tooltip activator="parent" location="top" text="Delete" />
                  <v-btn
                    v-if="hasAdminPermissions()"
                    id="employeesDeleteBtn"
                    :disabled="midAction"
                    variant="text"
                    icon="mdi-delete"
                    @click.stop="validateDelete(item)"
                  />
                </span>
              </div>
            </template>

            <!-- Avatar Item Slot -->
            <template #[`item.avatars`]="{ item }">
              <user-avatar :employee="item" :image="item.avatar" :size="35" class="text-body-1" />
            </template>

            <!-- First Name Item Slot -->
            <template #[`item.firstName`]="{ item }">
              <p :class="{ inactiveStyle: isInactive(item) }" class="mb-0">
                {{ item.firstName }}
              </p>
            </template>

            <!-- Middle Name Item Slot -->
            <template #[`item.middleName`]="{ item }">
              <p :class="{ inactiveStyle: isInactive(item) }" class="mb-0">
                {{ item.middleName }}
              </p>
            </template>

            <!-- Last Name Item Slot -->
            <template #[`item.lastName`]="{ item }">
              <p :class="{ inactiveStyle: isInactive(item) }" class="mb-0">
                {{ item.lastName }}
              </p>
            </template>

            <!-- Nickname Item Slot -->
            <template #[`item.nickname`]="{ item }">
              <p :class="{ inactiveStyle: isInactive(item) }" class="mb-0">
                {{ item.nickname }}
              </p>
            </template>

            <!-- Last Login Item Slot -->
            <template #[`item.lastLoginSeconds`]="{ item }">
              <p v-if="userRoleIsAdmin()" :class="{ inactiveStyle: isInactive(item) }" class="mb-0">
                {{ getLoginDate(item) }}
              </p>
            </template>

            <!-- Date Item Slot -->
            <template #[`item.hireDate`]="{ item }">
              <p :class="{ inactiveStyle: isInactive(item) }" class="mb-0">
                {{ monthDayYearFormat(item.hireDate) }}
              </p>
            </template>

            <!-- Email Item Slot -->
            <template #[`item.email`]="{ item }">
              <p :class="{ inactiveStyle: isInactive(item) }" class="mb-0">
                {{ item.email }}
              </p>
            </template>
          </v-data-table>
          <!-- END NEW DATA TABLE -->

          <!-- Confirmation Modals -->
          <delete-modal :toggle-delete-modal="deleting" :type="'employee'" />
          <delete-error-modal v-model="invalidDelete" type="employee" />
        </div>
      </v-container>
    </v-card>
    <employee-form v-model="createEmployee" :contracts="contracts" :employee="model" />
    <v-dialog v-model="manageTags" scrollable :width="isMobile() ? '100%' : '70%'" persistent>
      <tag-manager :key="childKey" />
    </v-dialog>
    <v-dialog v-model="toggleEmployeesSyncModal" :width="isMobile() ? '100%' : '70%'" persistent>
      <employees-sync-modal :key="childKey" :sync-data="applicationSyncData" />
    </v-dialog>
    <v-dialog v-model="showExportDataModal" :width="isMobile() ? '100%' : '50%'" persistent>
      <export-employee-data :employees="employees" :contracts="contracts" :key="childKey" :tags="tags" />
    </v-dialog>
  </div>
</template>

<script setup>
import api from '@/shared/api.js';
// import BaseCard from '../components/employee-beta/cards/BaseCard.vue';
import { updateStoreEmployees, updateStoreAvatars, updateStoreContracts, updateStoreTags } from '@/utils/storeUtils';
import ExportEmployeeData from '@/components/employees/csv/ExportEmployeeData.vue';
import DeleteErrorModal from '@/components/modals/DeleteErrorModal.vue';
import DeleteModal from '@/components/modals/DeleteModal.vue';
// import EmployeeForm from '../components/employees/EmployeeForm.vue'
import EmployeeForm from '../components/employee-beta/forms/EmployeeForm.vue';
import _ from 'lodash';
import ConvertEmployeeToCsv from '@/components/employees/csv/ConvertEmployeeToCsv.vue';
import PowerEditContainer from '@/components/employees/power-edit/PowerEditContainer.vue';
import TagManager from '@/components/employees/tags/TagManager.vue';
import TagsFilter from '@/components/shared/TagsFilter.vue';
import EmployeesSyncModal from '@/components/modals/EmployeesSyncModal.vue';
import { selectedTagsHasEmployee } from '@/shared/employeeUtils';
import {
  isFullTime,
  isInactive,
  isPartTime,
  isMobile,
  monthDayYearFormat,
  storeIsPopulated,
  userRoleIsAdmin,
  userRoleIsManager
} from '@/utils/utils';
import { employeeFilter } from '@/shared/filterUtils';
import { format } from '../shared/dateUtils';
import { ref, inject, onBeforeMount, onBeforeUnmount, computed, watch, provide } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useDisplaySuccess, useDisplayError } from '@/components/shared/StatusSnackbar.vue';

// |--------------------------------------------------|
// |                                                  |
// |                     SET UP                       |
// |                                                  |
// |--------------------------------------------------|

const store = useStore();
const emitter = inject('emitter');
const router = useRouter();

//provide roles
const isAdmin = ref(false);
provide('isAdmin', isAdmin);
const isUser = ref(false);
provide('isUser', isUser);

const applicationSyncData = ref(null);
const childKey = ref(0);
const contracts = ref([]);
const createEmployee = ref(false);
const deleteModel = ref({
  id: null
}); // employee to delete
const deleting = ref(false); // activate delete confirmation model
const employees = ref([]); // employees
const employeeNumber = ref(null);
const filter = ref({
  active: ['full', 'part'] // default only shows full and part time employees
}); // datatable filter
const filteredEmployees = ref([]); // filtered employees,
const headers = ref([
  {
    value: 'avatars',
    sortable: false
  },
  {
    title: 'First Name',
    key: 'firstName'
  },
  {
    title: 'Middle Name',
    key: 'middleName'
  },
  {
    title: 'Last Name',
    key: 'lastName'
  },
  {
    title: 'Nickname',
    key: 'nickname'
  },
  {
    title: 'Hire Date',
    key: 'hireDate'
  },
  {
    title: 'Email',
    key: 'email'
  },
  userRoleIsAdmin() || userRoleIsManager()
    ? {
        title: 'Last Login',
        key: 'lastLoginSeconds'
      }
    : _,
  userRoleIsAdmin() || userRoleIsManager()
    ? {
        title: 'Actions',
        key: 'actions',
        sortable: false
      }
    : _
]); // datatable headers
const midAction = ref(false);
const powerEdit = ref(false);
const invalidDelete = ref(false); // invalid delete status
const itemsPerPage = ref(-1); // items per datatable page
const loading = ref(false); // loading status
const manageTags = ref(false); // modal for tag management
const model = ref({
  id: null,
  firstName: null,
  middleName: null,
  lastName: null,
  nickname: null,
  email: '@consultwithcase.com',
  employeeRole: null,
  employeeNumber: null,
  hireDate: null,
  workStatus: 100,
  birthday: null,
  birthdayFeed: false,
  jobRole: null,
  prime: null,
  contract: null,
  github: null,
  twitter: null,
  phoneNumber: null,
  city: null,
  st: null,
  country: null,
  deptDate: null,
  currentCity: null,
  currentState: null,
  currentStreet: null,
  currentStreet2: null,
  currentZIP: null
}); // selected employee
const search = ref(null); // query text for datatable search field
const sortBy = ref([{ key: 'hireDate', order: 'asc' }]); // sort datatable items
const showExportDataModal = ref(false);
const syncing = ref(false);
const tags = ref([]);
const tagsInfo = ref({
  selected: [],
  flipped: []
});
const toggleEmployeesSyncModal = ref(false);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Delete an employee and display status.
 */
async function deleteEmployee() {
  let e = await api.deleteItem(api.EMPLOYEES, deleteModel.value.id); // delete employee from api
  if (e.id) {
    // update data if successfully deletes employee
    await deleteModelFromTable();
  } else {
    // display error if failed to deleted employee
    useDisplayError(e.response.data.message);
  }
  midAction.value = false;
} // deleteEmployee

/**
 * Refresh and updates employee list and displays a successful delete status in the snackbar.
 */
async function deleteModelFromTable() {
  await refreshEmployees();

  useDisplaySuccess('Employee was successfully deleted!', 5000, 'top right', 'green');
} // deleteModelFromTable

/**
 * sets midAction boolean to false
 *
 * @param item - the employee
 * @return the path to the employees profile
 */
function employeePath(item) {
  return `/employee/${item.employeeNumber}`;
} // employeePath

/**
 * Filters list of employees.
 */
function filterEmployees() {
  //filter for Active Expense Types
  filteredEmployees.value = _.filter(employees.value, (employee) => {
    let fullCheck = filter.value.active.includes('full') && isFullTime(employee);
    let partCheck = filter.value.active.includes('part') && isPartTime(employee);
    let inactiveCheck = filter.value.active.includes('inactive') && isInactive(employee);
    let tagCheck = selectedTagsHasEmployee(employee.id, tagsInfo.value);
    return (fullCheck || partCheck || inactiveCheck) && (tagsInfo.value.selected.length <= 0 || tagCheck);
  });
} // filterEmployees

/**
 * Returns a human readable date from item.lastLogin. Stores a sortable int as item.lastLoginSeconds for sorting purposes.
 * @param {item} item - the employee
 */
function getLoginDate(item) {
  let date = item.lastLogin;

  if (date) {
    item.lastLoginSeconds = parseInt(format(date, 'MMM Do, YYYY HH:mm:ss', 'X')); //seconds
    date = format(date, 'MMM Do, YYYY HH:mm:ss', 'MMM Do, YYYY HH:mm'); //what's displayed
  }

  return date;
} // getLoginDate

/**
 * handles click event of the employee table entry
 *
 * @param item - the employee
 */
function handleClick(_, tableItem) {
  router.push(employeePath(tableItem.item));
} //handleClick

/**
 * checks to see if the user has admin permissions
 *
 * @return boolean - whether the user is an admin or manager
 */
function hasAdminPermissions() {
  return userRoleIsAdmin() || userRoleIsManager();
} // hasAdminPermissions

/**
 * Loads in basecamp avatars, setting them when finished
 */
async function loadBasecampAvatars() {
  if (!store.getters.basecampAvatars) await updateStoreAvatars();
  let avatars = store.getters.basecampAvatars;
  _.map(employees.value, (employee) => {
    let avatar = _.find(avatars, ['email_address', employee.email]);
    let avatarUrl = avatar ? avatar.avatar_url : null;
    employee.avatar = avatarUrl;
    return employee;
  });
}

/**
 * Refresh employee data and filters employees.
 */
async function refreshEmployees() {
  loading.value = true; // set loading status to true

  // assets to wait for load
  await Promise.all([
    !store.getters.employees ? updateStoreEmployees() : '',
    !store.getters.contracts && (userRoleIsAdmin() || userRoleIsManager()) ? updateStoreContracts() : '',
    !store.getters.tags && (userRoleIsAdmin() || userRoleIsManager()) ? updateStoreTags() : ''
  ]);
  employees.value = store.getters.employees; // get all employees
  contracts.value = store.getters.contracts;
  tags.value = store.getters.tags;
  // assets that don't need to be awaited on, but need data that is awaited on
  Promise.all([loadBasecampAvatars()]);
  filterEmployees(); // filter employees
  loading.value = false; // set loading status to false
} // refreshEmployees

/**
 * open the create employee form
 */
function renderCreateEmployee() {
  createEmployee.value = true;
  childKey.value++;
  emitter.emit('create-new-employee');
} // renderCreateEmployee

/**
 * open the tags management modal
 */
function renderManageTags() {
  manageTags.value = true;
  childKey.value++;
} // renderManageTags

/**
 * helper function: return true if given employee is on a tag
 *
 * @param e - the employee or employee id
 * @return true if the employee has a tag selected in filters
 */
function employeeIsOnTag(e) {
  if (e.id) e = e.id; // just use the id
  for (let t of tags.value) {
    if (t.employees.includes(e)) return true;
  }
  return false;
} // employeeIsOnTag

/**
 * Syncs data between different applications (Portal, BambooHR, ADP, ...).
 */
function syncApplications() {
  syncing.value = true;
  api
    .syncApplications()
    .then(async (res) => {
      await updateStoreEmployees();
      await refreshEmployees();
      applicationSyncData.value = res.body;
    })
    .catch((err) => {
      applicationSyncData.value = err;
    })
    .finally(() => {
      toggleEmployeesSyncModal.value = true;
      syncing.value = false;
    });
} // syncApplications

/**
 * Validates if an employee can be deleted. Returns true if the employee has no expenses, otherwise returns false.
 *
 * @param item - employee to validate
 */
async function validateDelete(item) {
  // remove employee from tag object first
  if (employeeIsOnTag(item.id)) {
    // remove them from the tag
    let tagPromises = [];
    for (let t of tags.value) {
      if (t.employees.includes(item.id)) {
        let index = t.employees.indexOf(item.id);
        t.employees.splice(index, 1);
      }
      tagPromises.push(api.updateItem(api.TAGS, t));
    }
    await Promise.all(tagPromises);
  }

  midAction.value = true;
  try {
    let expenses = await api.getAllEmployeeExpenses(item.id); // get employee expenses
    let valid = expenses.length <= 0; // valid if no expenses

    if (valid) {
      // employee can be deleted
      deleteModel.value['id'] = item.id;
      deleting.value = true; // activate model to confirm delete
    } else {
      // employee cannot be deleted
      invalidDelete.value = !invalidDelete.value;
    }
  } catch (err) {
    useDisplayError(err);
  }
} // validateDelete

/**
 * Called to reset the data on the employee form if exited w/out submitting
 */
async function clearCreateEmployee() {
  createEmployee.value = false;
  // if (employeeNumber.value) {
  //   await api.deleteResume(model.value.id);
  // }
} // clearCreateEmployee

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Adjust datatable header for user view. Creates event listeners.
 */
onBeforeMount(async () => {
  emitter.on('cancel-form', async () => {
    //used to reset the employee form modal
    await clearCreateEmployee();
  });
  emitter.on('canceled-delete-employee', () => {
    deleting.value = false;
    midAction.value = false;
  });
  emitter.on('confirm-delete-employee', async () => {
    deleting.value = false;
    await deleteEmployee();
    await updateStoreEmployees();
    await refreshEmployees();
  });
  emitter.on('invalid-employee-delete', () => {
    midAction.value = false;
  });
  emitter.on('empNum', (empNum) => {
    employeeNumber.value = empNum;
  });
  emitter.on('close-tag-manager', () => {
    manageTags.value = false;
  });
  emitter.on('close-data-sync-results-modal', () => {
    toggleEmployeesSyncModal.value = false;
    applicationSyncData.value = null;
    childKey.value++;
  });
  emitter.on('close-employee-export', () => {
    showExportDataModal.value = false;
  });
  emitter.on('cancel-power-edit', () => {
    powerEdit.value = false;
  });

  // fill in search box if routed from another page
  if (localStorage.getItem('requestedFilter')) {
    search.value = localStorage.getItem('requestedFilter');
    localStorage.removeItem('requestedFilter');
  }

  // only refresh employees if data is in store. Otherwise, set loading and wait in watcher
  storeIsPopulated ? await refreshEmployees() : (loading.value = true);

  // remove admin-only actions if user is not admin (by default everything is included)
  const adminSpecific = ['lastLoginSeconds']; // requires admin role, NOT manager
  const adminPermissions = ['actions']; // requires admin level, including manager
  if (!hasAdminPermissions()) {
    headers.value = _.filter(headers.value, (header) => {
      return !adminPermissions.includes(header.value);
    });
  }
  if (!userRoleIsAdmin()) {
    headers.value = _.filter(headers.value, (header) => {
      return !adminSpecific.includes(header.value);
    });
  }
  search.value = search.value ? search.value + ' ' : ''; // solution for redirecting from stats dashboard with a filter
}); // created

/**
 * destroy listeners
 */
onBeforeUnmount(() => {
  emitter.off('cancel-form');
  emitter.off('canceled-delete-employee');
  emitter.off('confirm-delete-employee');
  emitter.off('invalid-employee-delete');
  emitter.off('empNum');
  emitter.off('close-tag-manager');
  emitter.off('close-data-sync-results-modal');
  emitter.off('close-employee-export');
  emitter.off('cancel-power-edit');
}); // beforeUnmount

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for filterActive - filter employees again
 */
function watchFilterActive() {
  // filter employees based on datatable active filter
  filterEmployees();
} // watchFilterActive

/**
 * In the case that the page has been force reloaded (and the store cleared)
 * this watcher will be activated when the store is populated again.
 */
async function watchStoreIsPopulated() {
  if (storeIsPopulated) await refreshEmployees();
} // watchStoreIsPopulated

watch(filter.value.active, () => watchFilterActive());
watch(storeIsPopulated, () => watchStoreIsPopulated());

// |--------------------------------------------------|
// |                                                  |
// |                    COMPUTED                      |
// |                                                  |
// |--------------------------------------------------|

computed(storeIsPopulated);
</script>

<style>
.employees-table > div > table > tbody {
  cursor: pointer;
}
.power-edit-text {
  font-size: 26px;
  background: -webkit-linear-gradient(45deg, purple, red);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
