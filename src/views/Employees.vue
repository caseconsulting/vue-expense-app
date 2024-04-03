<!-- eslint-disable vue/no-v-model-argument -->
<template>
  <div :class="powerEdit ? 'power-edit-mode' : ''">
    <!-- Status Alert -->
    <v-snackbar
      v-model="status.show"
      :color="status.color"
      :multi-line="true"
      location="top end"
      :timeout="5000"
      :vertical="true"
    >
      <v-card-text color="white">
        <span class="text-h6 font-weight-medium">{{ status.statusMessage }}</span>
      </v-card-text>
      <v-btn color="white" variant="text" @click="clearStatus"> Close </v-btn>
    </v-snackbar>
    <v-card>
      <v-container fluid class="px-0 px-md-4">
        <!-- Title -->
        <v-card-title class="">
          <v-row class="d-flex align-center">
            <v-col cols="12" md="4">
              <h2 class="my-2">
                Employees
                <span v-if="powerEdit" class="ml-3 power-edit-text">Power Edit Mode</span>
              </h2>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="12" md="4">
              <v-text-field
                id="employeesSearch"
                v-model.trim="search"
                append-inner-icon="mdi-magnify"
                label="Search (comma separate terms)"
                variant="underlined"
                single-line
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-title>

        <power-edit-container v-if="powerEdit" :search="search"></power-edit-container>
        <div v-else>
          <!-- Filters -->
          <v-card v-if="userRoleIsAdmin() || userRoleIsManager()" class="pa-0 pa-md-4" variant="outlined">
            <v-row color="black" class="mx-1 mx-md-5 my-1">
              <!-- Active Filter -->
              <v-col :align="isMobile() ? 'center' : ''" cols="7" md="4" sm="6">
                <h4 class="d-block mx-auto">Employee Status:</h4>
                <v-btn-toggle color="primary" class="filter_color mx-auto" v-model="filter.active" text multiple>
                  <!-- Full Time -->
                  <v-tooltip location="top" text="Full Time">
                    <template v-slot:activator="{ props }">
                      <v-btn value="full" id="full" v-bind="props" variant="text">
                        <v-icon class="mr-1"> mdi-clock{{ filter.active.includes('full') ? '' : '-outline' }} </v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>

                  <!-- Part Time -->
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn value="part" id="part" v-bind="props" variant="text">
                        <v-icon>
                          {{ filter.active.includes('part') ? 'mdi-clock-time-four' : 'mdi-progress-clock' }}
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>Part Time</span>
                  </v-tooltip>

                  <!-- Inactive -->
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn value="inactive" id="inactive" v-bind="props" variant="text">
                        <v-icon> mdi-stop-circle{{ filter.active.includes('inactive') ? '' : '-outline' }} </v-icon>
                      </v-btn>
                    </template>
                    <span>Inactive</span>
                  </v-tooltip>
                </v-btn-toggle>
              </v-col>
              <!-- Tags filter -->
              <v-col :align="isMobile() ? 'center' : ''" cols="5" md="5" sm="6">
                <v-autocomplete
                  v-if="userRoleIsAdmin() || userRoleIsManager()"
                  class="mt-2 mt-md-4 ml-1 ml-md-4"
                  variant="underlined"
                  clearable
                  label="Filter by Tag (click to flip)"
                  v-model="selectedTags"
                  :items="tags"
                  multiple
                  color="gray"
                  item-title="tagName"
                  item-value="id"
                  hide-details
                  return-object
                >
                  <template v-slot:chip="{ props, item }">
                    <v-chip
                      size="small"
                      closable
                      v-bind="props"
                      @click.stop
                      @click="negateTag(item.raw)"
                      @click:close="removeTag(item.raw)"
                      :color="chipColor(item.raw.id)"
                    >
                      {{ tagFlip.includes(item.raw.id) ? 'NOT ' : '' }}
                      {{ item.raw.tagName }}
                    </v-chip>
                  </template>
                </v-autocomplete>
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
            :disabled="loading"
            :size="isMobile() ? 'x-small' : 'default'"
            @click="renderCreateEmployee()"
            elevation="2"
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
            :size="isMobile() ? 'x-small' : 'default'"
            @click="renderManageTags()"
            elevation="2"
          >
            Manage Tags
            <v-icon class="pl-2">mdi-tag-multiple</v-icon>
          </v-btn>

          <!-- Sync Applications -->
          <v-btn
            v-if="hasAdminPermissions()"
            id="syncApplicationsBtn"
            class="mb-5 ml-2 ml-md-4"
            :disabled="loading || syncing"
            @click="syncApplications()"
            elevation="2"
            :size="isMobile() ? 'x-small' : 'default'"
          >
            {{ isMobile() ? 'Sync Apps' : 'Sync Applications' }}

            <v-progress-circular
              v-if="syncing"
              class="ml-2"
              :size="25"
              indeterminate
              color="grey"
            ></v-progress-circular>
            <v-icon v-else class="pl-2">mdi-web-sync</v-icon>
          </v-btn>

          <!-- CSV Downloads modal -->
          <v-btn
            v-if="hasAdminPermissions()"
            :midAction="midAction"
            :disabled="loading || syncing"
            elevation="2"
            class="mb-5 ml-2 ml-md-4"
            @click.stop="showExportDataModal = !showExportDataModal"
          >
            Export Data <v-icon class="pl-2">mdi-table-arrow-down</v-icon>
          </v-btn>

          <v-btn @click="powerEdit = true" class="mb-5 ml-2 ml-md-4 float-right" variant="flat">
            <v-icon size="x-large">mdi-pencil</v-icon>
          </v-btn>

          <!-- NEW DATA TABLE -->
          <v-data-table
            :headers="headers"
            :items="filteredEmployees"
            :sort-by.sync="sortBy"
            :loading="loading"
            :items-per-page.sync="itemsPerPage"
            :search="search"
            :custom-filter="customFilter"
            mobile-breakpoint="800"
            item-key="employeeNumber"
            class="elevation-1 employees-table text-body-2"
            @click:row="handleClick"
          >
            <!-- Delete Action Item Slot -->
            <template v-slot:[`item.actions`]="{ item }">
              <div class="datatable_btn layout">
                <convert-employee-to-csv
                  v-if="userRoleIsAdmin()"
                  :midAction="midAction"
                  :employee="item"
                  :contracts="contracts"
                  :tags="tags"
                  :filename="`${item.nickname || item.firstName} ${item.lastName}`"
                ></convert-employee-to-csv>
                <span>
                  <v-tooltip activator="parent" location="top" text="Delete" />
                  <v-btn
                    v-if="hasAdminPermissions()"
                    id="employeesDeleteBtn"
                    :disabled="midAction"
                    @click.stop="validateDelete(item)"
                    variant="text"
                    icon="mdi-delete"
                  >
                  </v-btn>
                </span>
              </div>
            </template>

            <!-- Avatar Item Slot -->
            <template v-slot:[`item.avatars`]="{ item }">
              <user-avatar :employee="item" :image="item.avatar" :size="35" class="text-body-1" />
            </template>

            <!-- First Name Item Slot -->
            <template v-slot:[`item.firstName`]="{ item }">
              <p :class="{ inactiveStyle: isInactive(item) }" class="mb-0">
                {{ item.firstName }}
              </p>
            </template>

            <!-- Middle Name Item Slot -->
            <template v-slot:[`item.middleName`]="{ item }">
              <p :class="{ inactiveStyle: isInactive(item) }" class="mb-0">
                {{ item.middleName }}
              </p>
            </template>

            <!-- Last Name Item Slot -->
            <template v-slot:[`item.lastName`]="{ item }">
              <p :class="{ inactiveStyle: isInactive(item) }" class="mb-0">
                {{ item.lastName }}
              </p>
            </template>

            <!-- Nickname Item Slot -->
            <template v-slot:[`item.nickname`]="{ item }">
              <p :class="{ inactiveStyle: isInactive(item) }" class="mb-0">
                {{ item.nickname }}
              </p>
            </template>

            <!-- Last Login Item Slot -->
            <template v-slot:[`item.lastLoginSeconds`]="{ item }">
              <p v-if="userRoleIsAdmin()" :class="{ inactiveStyle: isInactive(item) }" class="mb-0">
                {{ getLoginDate(item) }}
              </p>
            </template>

            <!-- Date Item Slot -->
            <template v-slot:[`item.hireDate`]="{ item }">
              <p :class="{ inactiveStyle: isInactive(item) }" class="mb-0">
                {{ monthDayYearFormat(item.hireDate) }}
              </p>
            </template>

            <!-- Email Item Slot -->
            <template v-slot:[`item.email`]="{ item }">
              <p :class="{ inactiveStyle: isInactive(item) }" class="mb-0">
                {{ item.email }}
              </p>
            </template>
          </v-data-table>
          <!-- END NEW DATA TABLE -->

          <!-- Confirmation Modals -->
          <delete-modal :toggleDeleteModal="deleting" :type="'employee'"></delete-modal>
          <delete-error-modal :toggleDeleteErrorModal="invalidDelete" type="employee"></delete-error-modal>
        </div>
      </v-container>
    </v-card>
    <v-dialog @click:outside="clearCreateEmployee" v-model="createEmployee" :width="isMobile() ? '100%' : '80%'">
      <employee-form :contracts="contracts" :key="childKey" :model="this.model" />
    </v-dialog>
    <v-dialog v-model="manageTags" scrollable :width="isMobile() ? '100%' : '70%'" persistent>
      <tag-manager :key="childKey" />
    </v-dialog>
    <v-dialog v-model="toggleEmployeesSyncModal" :width="isMobile() ? '100%' : '70%'" persistent>
      <employees-sync-modal :syncData="applicationSyncData" :key="childKey" />
    </v-dialog>
    <v-dialog v-model="showExportDataModal" :width="isMobile() ? '100%' : '50%'" persistent>
      <export-employee-data :employees="employees" :contracts="contracts" :tags="tags" :key="childKey" />
    </v-dialog>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import { updateStoreEmployees, updateStoreAvatars, updateStoreContracts, updateStoreTags } from '@/utils/storeUtils';
import ExportEmployeeData from '@/components/employees/csv/ExportEmployeeData.vue';
import DeleteErrorModal from '@/components/modals/DeleteErrorModal.vue';
import DeleteModal from '@/components/modals/DeleteModal.vue';
import EmployeeForm from '@/components/employees/EmployeeForm.vue';
import _ from 'lodash';
import ConvertEmployeeToCsv from '@/components/employees/csv/ConvertEmployeeToCsv.vue';
import PowerEditContainer from '@/components/employees/power-edit/PowerEditContainer.vue';
import TagManager from '@/components/employees/tags/TagManager.vue';
import EmployeesSyncModal from '@/components/modals/EmployeesSyncModal.vue';
import {
  isEmpty,
  isFullTime,
  isInactive,
  isPartTime,
  isMobile,
  monthDayYearFormat,
  storeIsPopulated,
  userRoleIsAdmin,
  userRoleIsManager
} from '@/utils/utils';
import { format } from '../shared/dateUtils';

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Key for data table, also has implications for custom search
 * of data table
 */
function dataTableKey() {
  return { a: this.filter, b: this.selectedTags };
} // dataTableKey

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Changes the employee avatar to default if it fails to display original.
 *
 * @param item - employee to check
 */
function changeAvatar(item) {
  let index = _.findIndex(this.employees, (employee) => {
    return employee.id === item.id;
  });

  let newItem = this.employees[index];

  newItem.avatar = null;

  this.employees.splice(index, 1, newItem);
} // changeAvatar

/**
 * Clear the action status that is displayed in the snackbar.
 */
function clearStatus() {
  this.status['show'] = false;
  this.status['statusType'] = undefined;
  this.status['statusMessage'] = null;
  this.status['color'] = null;
} // clearStatus

/**
 * Returns the color that at tag filter chip should be
 *
 * @param id ID of the tag item
 *
 */
function chipColor(id) {
  return this.tagFlip.includes(id) ? 'red' : 'gray';
} // chipColor

/**
 * Custom filter for employee table searching
 *
 * @param _ - unused value (in theory the current item of employee to search)
 * @param search - The search value in the search bar
 * @param item - The item in the table
 * @returns Boolean - True if the item matches the search criteria
 */
function customFilter(_, search, item) {
  item = item.raw;

  // reset index if search is different than before
  if (this.searchCache.search != search || this.searchCache.tableKey != this.dataTableKey) {
    this.searchIndex = new Set();
    this.searchCache.search = search;
    this.searchCache.tableKey = this.dataTableKey;
  }

  /**
   * Bounce conditions:
   *  - nothing is being searched
   *  - the search is only one character and one term
   *  - searching something that's not the employee object
   *  - the employee has been searched before
   */
  let terms = search.split(','); // used for searching later, search is split by comma
  if (search == null || (terms.length == 1 && terms[0].length < 2)) return true;
  if (this.searchIndex.has(item.email)) return false;

  // mark employee as searched
  this.searchIndex.add(item.email);

  // different items from the employee to look through
  let [frst, midl, last, nick, F, M, N, L] = [
    item.firstName?.trim(),
    item.middleName?.trim(),
    item.lastName?.trim(),
    item.nickname?.trim(),
    item.firstName ? item.firstName.trim()[0] : '',
    item.middleName ? item.middleName.trim()[0] : '',
    item.nickname ? item.nickname.trim()[0] : '',
    item.lastName ? item.lastName.trim()[0] : ''
  ];
  let searchableTerms = [
    `${item.employeeNumber}`,
    `${frst} ${last}`,
    `${last} ${frst}`,
    `${frst} ${midl} ${last}`,
    `${frst} ${nick} ${last}`,
    `${frst} ${nick} ${midl} ${last}`,
    `${frst} ${midl} ${nick} ${last}`,
    `${F}${M}${L}`,
    `${F}${N}${L}`,
    `${F}${M}${N}${L}`,
    `${F}${N}${M}${L}`,
    `${F} ${L}`,
    `${L} ${F}`,
    `${F} ${N} ${last}`,
    `${F} ${M} ${last}`,
    `${F} ${N} ${M} ${last}`,
    `${F} ${M} ${N} ${last}`,
    `${frst} ${M} ${last}`,
    `${frst} ${N} ${last}`,
    `${frst} ${N} ${M} ${last}`,
    `${frst} ${M} ${N} ${last}`
  ];

  // search through all searchable terms with all search terms
  for (let t of terms) {
    t = t.trim();
    if (t.length < 2) continue;
    for (let s of searchableTerms) {
      if (s && s.toLowerCase().includes(t.toLowerCase())) {
        return true;
      }
    }
  }

  return false;
} // customFilter

/**
 * Delete an employee and display status.
 */
async function deleteEmployee() {
  let e = await api.deleteItem(api.EMPLOYEES, this.deleteModel.id); // delete employee from api
  if (e.id) {
    // update data if successfully deletes employee
    await this.deleteModelFromTable();
  } else {
    // display error if failed to deleted employee
    this.displayError(e.response.data.message);
  }
  this.midAction = false;
} // deleteEmployee

/**
 * Refresh and updates employee list and displays a successful delete status in the snackbar.
 */
async function deleteModelFromTable() {
  await this.refreshEmployees();

  this.status['show'] = true;
  this.status['statusType'] = 'SUCCESS';
  this.status['statusMessage'] = 'Employee was successfully deleted!';
  this.status['color'] = 'green';
} // deleteModelFromTable

/**
 * Set and display an error action status in the snackbar.
 *
 * @param err - String error message
 */
function displayError(err) {
  this.status['show'] = true;
  this.status['statusType'] = 'ERROR';
  this.status['statusMessage'] = err;
  this.status['color'] = 'red';
} // displayError

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
  this.filteredEmployees = _.filter(this.employees, (employee) => {
    let fullCheck = this.filter.active.includes('full') && this.isFullTime(employee);
    let partCheck = this.filter.active.includes('part') && this.isPartTime(employee);
    let inactiveCheck = this.filter.active.includes('inactive') && this.isInactive(employee);
    let tagCheck = this.selectedTagsHasEmployee(employee);
    return (fullCheck || partCheck || inactiveCheck) && (this.selectedTags.length <= 0 || tagCheck);
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
  this.$router.push(employeePath(tableItem.item));
} //handleClick

/**
 * checks to see if the user has admin permissions
 *
 * @return boolean - whether the user is an admin or manager
 */
function hasAdminPermissions() {
  return this.userRoleIsAdmin() || this.userRoleIsManager();
} // hasAdminPermissions

/**
 * Loads in basecamp avatars, setting them when finished
 */
async function loadBasecampAvatars() {
  await this.updateStoreAvatars();
  let avatars = this.$store.getters.basecampAvatars;
  _.map(this.employees, (employee) => {
    let avatar = _.find(avatars, ['email_address', employee.email]);
    let avatarUrl = avatar ? avatar.avatar_url : null;
    employee.avatar = avatarUrl;
    return employee;
  });
}

/**
 * negates a tag
 */
function negateTag(item) {
  // try to find the id in the tagFlip array, if it is there then remove it else add it
  const index = this.tagFlip.indexOf(item.id);
  if (index >= 0) {
    this.tagFlip.splice(index, 1);
  } else {
    this.tagFlip.push(item.id);
  }
  this.refreshEmployees();
} // negateTag

/**
 * Refresh employee data and filters employees.
 */
async function refreshEmployees() {
  this.loading = true; // set loading status to true

  // assets to wait for load
  await Promise.all([
    !this.$store.getters.employees ? this.updateStoreEmployees() : '',
    !this.$store.getters.contracts && (userRoleIsAdmin() || userRoleIsManager()) ? this.updateStoreContracts() : '',
    !this.$store.getters.tags && (userRoleIsAdmin() || userRoleIsManager()) ? this.updateStoreTags() : ''
  ]);

  // assets that don't need to be awaited on, but need data that is awaited on
  Promise.all([!this.$store.getters.basecampAvatars ? this.loadBasecampAvatars() : '']);

  this.employees = this.$store.getters.employees; // get all employees
  this.filterEmployees(); // filter employees
  this.contracts = this.$store.getters.contracts;
  this.tags = this.$store.getters.tags;
  this.loading = false; // set loading status to false
} // refreshEmployees

/**
 * Removes an item from the tag filters's active filters
 *
 * @param item - The filter to remove
 */
function removeTag(item) {
  const selIndex = this.selectedTags.findIndex((t) => t.id === item.id);
  if (selIndex >= 0) {
    this.selectedTags.splice(selIndex, 1);
  }
} // removeTag

/**
 * open the create employee form
 */
function renderCreateEmployee() {
  this.createEmployee = true;
  this.childKey++;
} // renderCreateEmployee

/**
 * open the tags management modal
 */
function renderManageTags() {
  this.manageTags = true;
  this.childKey++;
} // renderManageTags

/**
 * helper function: return true if any selected tag has employee listed under it.
 *
 * @param e - the employee
 * @return true if the employee has a tag selected in filters
 */
function selectedTagsHasEmployee(e) {
  let inTag, tagFlipped;
  for (let i = 0; i < this.selectedTags.length; i++) {
    inTag = this.selectedTags[i].employees.includes(e.id);
    tagFlipped = this.tagFlip.includes(this.selectedTags[i].id);
    if (inTag != tagFlipped) {
      return true;
    }
  }
  return false;
} // selectedTagsHasEmployee

/**
 * helper function: return true if given employee is on a tag
 *
 * @param e - the employee or employee id
 * @return true if the employee has a tag selected in filters
 */
function employeeIsOnTag(e) {
  if (e.id) e = e.id; // just use the id
  for (let t of this.tags) {
    if (t.employees.includes(e)) return true;
  }
  return false;
} // employeeIsOnTag

/**
 * Syncs data between different applications (Portal, BambooHR, ADP, ...).
 */
function syncApplications() {
  this.syncing = true;
  api
    .syncApplications()
    .then(async (res) => {
      await this.updateStoreEmployees();
      await this.refreshEmployees();
      this.applicationSyncData = res.body;
    })
    .catch((err) => {
      this.applicationSyncData = err;
    })
    .finally(() => {
      this.toggleEmployeesSyncModal = true;
      this.syncing = false;
    });
} // syncApplications

/**
 * Validates if an employee can be deleted. Returns true if the employee has no expenses, otherwise returns false.
 *
 * @param item - employee to validate
 */
async function validateDelete(item) {
  // remove employee from tag object first
  if (this.employeeIsOnTag(item.id)) {
    // remove them from the tag
    let tagPromises = [];
    for (let t of this.tags) {
      if (t.employees.includes(item.id)) {
        let index = t.employees.indexOf(item.id);
        t.employees.splice(index, 1);
      }
      tagPromises.push(api.updateItem(api.TAGS, t));
    }
    await Promise.all(tagPromises);
  }

  this.midAction = true;
  try {
    let expenses = await api.getAllEmployeeExpenses(item.id); // get employee expenses
    let valid = expenses.length <= 0; // valid if no expenses

    if (valid) {
      // employee can be deleted
      this.deleteModel['id'] = item.id;
      this.deleting = true; // activate model to confirm delete
    } else {
      // employee cannot be deleted
      this.invalidDelete = !this.invalidDelete;
    }
  } catch (err) {
    this.displayError(err);
  }
} // validateDelete

/**
 * Called to reset the data on the employee form if exited w/out submitting
 */
async function clearCreateEmployee() {
  this.createEmployee = false;
  // if (this.employeeNumber) {
  //   await api.deleteResume(this.model.id);
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
async function created() {
  this.emitter.on('cancel-form', async () => {
    //used to reset the employee form modal
    await this.clearCreateEmployee();
  });
  this.emitter.on('canceled-delete-employee', () => {
    this.deleting = false;
    this.midAction = false;
  });
  this.emitter.on('confirm-delete-employee', async () => {
    this.deleting = false;
    await this.deleteEmployee();
    await this.updateStoreEmployees();
    await this.refreshEmployees();
  });
  this.emitter.on('invalid-employee-delete', () => {
    this.midAction = false;
  });
  this.emitter.on('empNum', (empNum) => {
    this.employeeNumber = empNum;
  });
  this.emitter.on('close-tag-manager', () => {
    this.manageTags = false;
  });
  this.emitter.on('close-data-sync-results-modal', () => {
    this.toggleEmployeesSyncModal = false;
    this.applicationSyncData = null;
    this.childKey++;
  });
  this.emitter.on('close-employee-export', () => {
    this.showExportDataModal = false;
  });

  // fill in search box if routed from another page
  if (localStorage.getItem('requestedFilter')) {
    this.search = localStorage.getItem('requestedFilter');
    localStorage.removeItem('requestedFilter');
  }

  // only refresh employees if data is in store. Otherwise, set loading and wait in watcher
  this.storeIsPopulated ? await this.refreshEmployees() : (this.loading = true);

  // remove admin-only actions if user is not admin (by default everything is included)
  const adminSpecific = ['lastLoginSeconds']; // requires admin role, NOT manager
  const adminPermissions = ['actions']; // requires admin level, including manager
  if (!this.hasAdminPermissions()) {
    this.headers = _.filter(this.headers, (header) => {
      return !adminPermissions.includes(header.value);
    });
  }
  if (!this.userRoleIsAdmin()) {
    this.headers = _.filter(this.headers, (header) => {
      return !adminSpecific.includes(header.value);
    });
  }
  this.search = this.search ? this.search + ' ' : ''; // solution for redirecting from stats dashboard with a filter
} // created

/**
 * destroy listeners
 */
function beforeUnmount() {
  this.emitter.off('cancel-form');
  this.emitter.off('canceled-delete-employee');
  this.emitter.off('confirm-delete-employee');
  this.emitter.off('invalid-employee-delete');
  this.emitter.off('empNum');
  this.emitter.off('close-tag-manager');
  this.emitter.off('close-data-sync-results-modal');
  this.emitter.off('close-employee-export');
} // beforeUnmount

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
  this.filterEmployees();
} // watchFilterActive

/**
 * In the case that the page has been force reloaded (and the store cleared)
 * this watcher will be activated when the store is populated again.
 */
async function watchStoreIsPopulated() {
  if (this.storeIsPopulated) await this.refreshEmployees();
} // watchStoreIsPopulated

/**
 * In the case that the page has been force reloaded (and the store cleared)
 * this watcher will be activated when the store is populated again.
 */
function watchTagFlip() {
  this.filterEmployees();
} // watchTagFlip

/**
 * Remove items from tagFlip array when they are removed from the selected
 * tags
 */
function watchSelectedTags() {
  let negatedTagRemoved = true;
  // use normal for loop to have the index
  for (let i = 0; i < this.tagFlip.length; i++) {
    // try to find the current tag in the selectedTags
    _.forEach(this.selectedTags, (t) => {
      if (t.id === this.tagFlip[i]) negatedTagRemoved = false;
    });
    // if it isn't there, remove it from tagFlip too
    if (negatedTagRemoved) {
      this.tagFlip.splice(i, 1);
    }
  }
  this.filterEmployees();
}

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  beforeUnmount,
  components: {
    DeleteErrorModal,
    DeleteModal,
    EmployeeForm,
    EmployeesSyncModal,
    ExportEmployeeData,
    ConvertEmployeeToCsv,
    PowerEditContainer,
    TagManager
  },
  computed: {
    dataTableKey,
    storeIsPopulated
  },
  created,
  data() {
    return {
      applicationSyncData: null,
      childKey: 0,
      contracts: [],
      createEmployee: false,
      deleteModel: {
        id: null
      }, // employee to delete
      deleting: false, // activate delete confirmation model
      employees: [], // employees
      employeeNumber: null,
      filter: {
        active: ['full', 'part'] // default only shows full and part time employees
      }, // datatable filter
      filteredEmployees: [], // filtered employees,
      headers: [
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
      ], // datatable headers
      midAction: false,
      powerEdit: false,
      invalidDelete: false, // invalid delete status
      itemsPerPage: -1, // items per datatable page
      loading: false, // loading status
      manageTags: false, // modal for tag management
      model: {
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
      }, // selected employee
      search: null, // query text for datatable search field
      searchIndex: new Set(),
      searchCache: {
        search: null,
        tableKey: null
      },
      selectedTags: [], // tags to include or exclude in filter
      sortBy: [{ key: 'hireDate', order: 'asc' }], // sort datatable items
      status: {
        statusType: undefined,
        statusMessage: null,
        color: null
      }, // snackbar action status
      showExportDataModal: false,
      syncing: false,
      tags: [],
      tagFlip: [],
      tagSearchString: '',
      toggleEmployeesSyncModal: false
    };
  },
  methods: {
    changeAvatar,
    clearCreateEmployee,
    clearStatus,
    chipColor,
    customFilter,
    deleteEmployee,
    deleteModelFromTable,
    displayError,
    employeePath,
    filterEmployees,
    getLoginDate,
    handleClick,
    hasAdminPermissions,
    isEmpty,
    isFullTime,
    isInactive,
    isPartTime,
    isMobile,
    loadBasecampAvatars,
    monthDayYearFormat,
    negateTag,
    refreshEmployees,
    renderCreateEmployee,
    renderManageTags,
    removeTag,
    selectedTagsHasEmployee,
    employeeIsOnTag,
    syncApplications,
    userRoleIsAdmin,
    userRoleIsManager,
    validateDelete,
    updateStoreAvatars,
    updateStoreContracts,
    updateStoreEmployees,
    updateStoreTags
  },
  watch: {
    'filter.active': watchFilterActive,
    storeIsPopulated: watchStoreIsPopulated,
    tagFlip: watchTagFlip,
    selectedTags: watchSelectedTags
  }
};
</script>

<style>
.employees-table > div > table > tbody {
  cursor: pointer;
}
.power-edit-mode {
  position: relative;
  background: linear-gradient(to right, purple, red);
  padding: 3px;
}
.power-edit-text {
  font-size: 26px;
  background: -webkit-linear-gradient(45deg, purple, red);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
