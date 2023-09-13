<template>
  <div>
    <!-- Status Alert -->
    <v-snackbar
      v-model="status.statusType"
      :color="status.color"
      :multi-line="true"
      :right="true"
      :timeout="5000"
      :top="true"
      :vertical="true"
    >
      <v-card-title headline color="white">
        <span class="headline">{{ status.statusMessage }}</span>
      </v-card-title>
      <v-btn color="white" text @click="clearStatus"> Close </v-btn>
    </v-snackbar>
    <v-card>
      <v-container fluid>
        <!-- Title -->
        <v-card-title>
          <h2>Employees</h2>
          <v-spacer></v-spacer>
          <v-text-field
            id="employeesSearch"
            v-model="search"
            append-icon="search"
            label="Search (comma separate terms)"
            single-line
            hide-details
          ></v-text-field>
        </v-card-title>

        <!-- Filters -->
        <v-card v-if="userRoleIsAdmin() || userRoleIsManager()" class="pa-4" outlined>
          <v-row>
            <!-- Active Filter -->
            <v-col cols="12" md="12">
              <h4>Employee Status:</h4>
              <v-btn-toggle class="filter_color d-inline-block mr-6" v-model="filter.active" text multiple>
                <!-- Full Time -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="full" id="full" v-on="on" text>
                      <v-icon class="mr-1" color="black">mdi-clock-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>Full Time</span>
                </v-tooltip>

                <!-- Part Time -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="part" id="part" v-on="on" text>
                      <v-icon color="black">mdi-progress-clock</v-icon>
                    </v-btn>
                  </template>
                  <span>Part Time</span>
                </v-tooltip>

                <!-- Inactive -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="inactive" id="inactive" v-on="on" text>
                      <v-icon color="black">mdi-stop-circle-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>Inactive</span>
                </v-tooltip>
              </v-btn-toggle>
              <!-- End Active Filter -->
              <!-- Tags filter -->
              <v-autocomplete
                v-if="userRoleIsAdmin() || userRoleIsManager()"
                class="d-inline-block"
                clearable
                label="Filter by Tag (click to flip)"
                v-model="selectedTags"
                :items="tags"
                multiple
                variant="solo-filled"
                item-color="gray"
                item-text="tagName"
                item-value="id"
                return-object
              >
                <template v-slot:selection="data">
                  <v-chip
                    small
                    close
                    @click.stop
                    @click="negateTag(data.item)"
                    @click:close="removeTag(data.item)"
                    :color="chipColor(data.item.id)"
                  >
                    {{ tagFlip.includes(data.item.id) ? 'NOT ' : '' }}
                    {{ data.item.tagName }}
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
          id="createEmployeeBtn"
          class="mb-5"
          :disabled="loading"
          @click="renderCreateEmployee()"
          elevation="2"
          v-if="hasAdminPermissions()"
        >
          Create an Employee<v-icon class="pl-2">person_add</v-icon>
        </v-btn>

        <!-- Tag Manager -->
        <v-btn
          id="manageTagsBtn"
          class="mb-5 ml-4"
          :disabled="loading"
          @click="renderManageTags()"
          elevation="2"
          v-if="hasAdminPermissions()"
        >
          Manage Tags<v-icon class="pl-2">mdi-tag-multiple</v-icon>
        </v-btn>

        <!-- Sync Applications -->
        <v-btn
          id="syncApplicationsBtn"
          class="mb-5 ml-4"
          :disabled="loading || syncing"
          @click="syncApplications()"
          elevation="2"
          v-if="hasAdminPermissions()"
          >Sync Applications
          <v-progress-circular v-if="syncing" class="ml-2" :size="25" indeterminate color="grey"></v-progress-circular>
          <v-icon v-else class="pl-2">mdi-web-sync</v-icon>
        </v-btn>

        <!-- NEW DATA TABLE -->
        <v-data-table
          :headers="headers"
          :items="filteredEmployees"
          :sort-by.sync="sortBy"
          :sort-desc.sync="sortDesc"
          :expanded.sync="expanded"
          :loading="loading"
          :items-per-page.sync="itemsPerPage"
          :search="search"
          :custom-filter="customFilter"
          mobile-breakpoint="800"
          item-key="employeeNumber"
          class="elevation-1 employees-table"
          @click:row="handleClick"
        >
          <!-- Delete Action Item Slot -->
          <template v-slot:[`item.actions`]="{ item }">
            <div class="datatable_btn layout">
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <convert-employee-to-csv
                    v-if="userRoleIsAdmin()"
                    :midAction="midAction"
                    :employee="item"
                    :contracts="contracts"
                    :tags="tags"
                    v-on="on"
                  ></convert-employee-to-csv>
                  <v-btn
                    v-if="hasAdminPermissions()"
                    id="employeesDeleteBtn"
                    :disabled="midAction"
                    text
                    icon
                    @click.stop="validateDelete(item)"
                    v-on="on"
                  >
                    <v-icon class="case-gray"> delete </v-icon>
                  </v-btn>
                </template>
                <span>Delete</span>
              </v-tooltip>
            </div>
          </template>

          <!-- Avatar Item Slot -->
          <template v-slot:[`item.avatars`]="{ item }">
            <!-- Valid Avatar -->
            <v-avatar v-if="item.avatar" size="35">
              <img :src="item.avatar" @error="changeAvatar(employee)" />
            </v-avatar>
            <!-- Invalid Avatar -->
            <v-avatar v-else size="35" color="grey darken-2">
              <div class="white--text">
                <b>{{ item.firstName.substring(0, 1) }}{{ item.lastName.substring(0, 1) }}</b>
              </div>
            </v-avatar>
          </template>

          <!-- First Name Item Slot -->
          <template v-slot:[`item.firstName`]="{ item }">
            <p :class="{ inactiveStyle: isInactive(item), selectFocus: isFocus(item) }" class="mb-0">
              {{ item.firstName }}
            </p>
          </template>

          <!-- Middle Name Item Slot -->
          <template v-slot:[`item.middleName`]="{ item }">
            <p :class="{ inactiveStyle: isInactive(item), selectFocus: isFocus(item) }" class="mb-0">
              {{ item.middleName }}
            </p>
          </template>

          <!-- Last Name Item Slot -->
          <template v-slot:[`item.lastName`]="{ item }">
            <p :class="{ inactiveStyle: isInactive(item), selectFocus: isFocus(item) }" class="mb-0">
              {{ item.lastName }}
            </p>
          </template>

          <!-- Nickname Item Slot -->
          <template v-slot:[`item.nickname`]="{ item }">
            <p :class="{ inactiveStyle: isInactive(item), selectFocus: isFocus(item) }" class="mb-0">
              {{ item.nickname }}
            </p>
          </template>

          <!-- Last Login Item Slot -->
          <template v-slot:[`item.lastLoginSeconds`]="{ item }">
            <p
              v-if="userRoleIsAdmin()"
              :class="{ inactiveStyle: isInactive(item), selectFocus: isFocus(item) }"
              class="mb-0"
            >
              {{ getLoginDate(item) }}
            </p>
          </template>

          <!-- Date Item Slot -->
          <template v-slot:[`item.hireDate`]="{ item }">
            <p :class="{ inactiveStyle: isInactive(item), selectFocus: isFocus(item) }" class="mb-0">
              {{ monthDayYearFormat(item.hireDate) }}
            </p>
          </template>

          <!-- Email Item Slot -->
          <template v-slot:[`item.email`]="{ item }">
            <p :class="{ inactiveStyle: isInactive(item), selectFocus: isFocus(item) }" class="mb-0">
              {{ item.email }}
            </p>
          </template>

          <!-- Alert for no search results -->
          <v-alert slot="no-results" :value="true" color="error" icon="warning">
            Your search for "{{ search }}" found no results.
          </v-alert>
        </v-data-table>
        <!-- NEW DATA TABLE -->

        <br />

        <!-- Download employee csv button -->
        <v-card-actions class="justify-end">
          <convert-employees-to-csv
            v-if="userRoleIsAdmin()"
            :midAction="midAction"
            :contracts="contracts"
            :employees="filteredEmployees"
            :tags="tags"
          ></convert-employees-to-csv>
          <generate-csv-eeo-report
            v-if="userRoleIsAdmin()"
            :midAction="midAction"
            :employees="filteredEmployees"
          ></generate-csv-eeo-report>
        </v-card-actions>

        <!-- Confirmation Modals -->
        <delete-modal :toggleDeleteModal="deleting" :type="'employee'"></delete-modal>
        <delete-error-modal :toggleDeleteErrorModal="invalidDelete" type="employee"></delete-error-modal>
        <!-- End Confirmation Modals -->
      </v-container>
    </v-card>
    <v-dialog @click:outside="clearCreateEmployee" v-model="createEmployee"
      ><employee-form :contracts="contracts" :key="childKey" :model="this.model"></employee-form
    ></v-dialog>
    <v-dialog v-model="manageTags" width="70%" persistent>
      <tag-manager :key="childKey"></tag-manager>
    </v-dialog>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import { updateStoreEmployees, updateStoreAvatars, updateStoreContracts, updateStoreTags } from '@/utils/storeUtils';
import ConvertEmployeesToCsv from '@/components/employees/csv/ConvertEmployeesToCsv.vue';
import DeleteErrorModal from '@/components/modals/DeleteErrorModal.vue';
import DeleteModal from '@/components/modals/DeleteModal.vue';
import EmployeeForm from '@/components/employees/EmployeeForm.vue';
import _ from 'lodash';
import ConvertEmployeeToCsv from '@/components/employees/csv/ConvertEmployeeToCsv.vue';
import GenerateCsvEeoReport from '@/components/employees/csv/GenerateCsvEeoReport.vue';
import TagManager from '@/components/employees/tags/TagManager.vue';
import {
  isEmpty,
  isFullTime,
  isInactive,
  isPartTime,
  monthDayYearFormat,
  storeIsPopulated,
  userRoleIsAdmin,
  userRoleIsManager
} from '@/utils/utils';
import { format } from '../shared/dateUtils';

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
  this.$set(this.status, 'statusType', undefined);
  this.$set(this.status, 'statusMessage', null);
  this.$set(this.status, 'color', null);
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
 * @param _ - unused value
 * @param search - The search value in the search bar
 * @param item - The item in the table
 * @returns Boolean - True if the item matches the search criteria
 */
function customFilter(_, search, item) {
  // short circuit to return everyone if there is no search term yet
  if (search == null) return true;

  // split the search to allow for multiple search terms
  let terms = search.split(',');
  if (terms.length == 1 && terms[0].length < 2) return true;

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

  this.$set(this.status, 'statusType', 'SUCCESS');
  this.$set(this.status, 'statusMessage', 'Employee was successfully deleted!');
  this.$set(this.status, 'color', 'green');
} // deleteModelFromTable

/**
 * Set and display an error action status in the snackbar.
 *
 * @param err - String error message
 */
function displayError(err) {
  this.$set(this.status, 'statusType', 'ERROR');
  this.$set(this.status, 'statusMessage', err);
  this.$set(this.status, 'color', 'red');
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
function handleClick(item) {
  this.$router.push(employeePath(item));
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
 * Checks to see if an employee is expanded in the datatable.
 *
 * @param item - employee to check
 * @return boolean - the employee is expanded
 */
function isFocus(item) {
  let expanded = !_.isEmpty(this.expanded) && item.employeeNumber == this.expanded[0].employeeNumber;
  return expanded || this.model.id == item.id;
} // isFocus

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
} // negateTag

/**
 * Refresh employee data and filters employees.
 */
async function refreshEmployees() {
  this.loading = true; // set loading status to true
  await Promise.all([
    !this.$store.getters.employees ? this.updateStoreEmployees() : '',
    !this.$store.getters.basecampAvatars ? this.updateStoreAvatars() : '',
    !this.$store.getters.contracts && (userRoleIsAdmin() || userRoleIsManager()) ? this.updateStoreContracts() : '',
    !this.$store.getters.tags && (userRoleIsAdmin() || userRoleIsManager()) ? this.updateStoreTags() : ''
  ]);
  this.employees = this.$store.getters.employees; // get all employees
  this.filterEmployees(); // filter employees
  this.expanded = []; // collapse any expanded rows in the database
  let avatars = this.$store.getters.basecampAvatars;
  _.map(this.employees, (employee) => {
    let avatar = _.find(avatars, ['email_address', employee.email]);
    let avatarUrl = avatar ? avatar.avatar_url : null;
    employee.avatar = avatarUrl;
    return employee;
  });
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
 * Syncs data between different applications (Portal, BambooHR, ADP, ...).
 */
function syncApplications() {
  this.syncing = true;
  api.syncApplications().then((res) => {
    let body = res.body;
    if (body && body.failures === 0) {
      this.$set(this.status, 'statusType', 'SUCCESS');
      this.$set(
        this.status,
        'statusMessage',
        `Successfully synced applications with ${body.usersCreated} user(s) created and ${body.usersUpdated} user(s) updated.`
      );
      this.$set(this.status, 'color', 'green');
    } else {
      this.$set(this.status, 'statusType', 'ERROR');
      this.$set(
        this.status,
        'statusMessage',
        `Application sync finished with ${body.failures} failure(s), ${body.usersCreated} user(s) created and ${body.usersUpdated} user(s) updated.`
      );
      this.$set(this.status, 'color', 'red');
    }
    this.syncing = false;
  });
} // syncApplications

/**
 * Validates if an employee can be deleted. Returns true if the employee has no expenses, otherwise returns false.
 *
 * @param item - employee to validate
 */
async function validateDelete(item) {
  this.midAction = true;
  try {
    let expenses = await api.getAllEmployeeExpenses(item.id); // get employee expenses
    let valid = expenses.length <= 0; // valid if no expenses

    if (valid) {
      // employee can be deleted
      this.$set(this.deleteModel, 'id', item.id);
      this.deleting = !this.deleting; // activate model to confirm delete
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
  if (this.employeeNumber) {
    await api.deleteResume(this.employeeNumber);
  }
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
  window.EventBus.$on('cancel-form', async () => {
    //used to reset the employee form modal
    await this.clearCreateEmployee();
  });
  window.EventBus.$on('canceled-delete-employee', () => {
    this.midAction = false;
  });
  window.EventBus.$on('confirm-delete-employee', async () => {
    await this.deleteEmployee();
    await this.updateStoreEmployees();
    await this.refreshEmployees();
  });
  window.EventBus.$on('invalid-employee-delete', () => {
    this.midAction = false;
  });
  window.EventBus.$on('empNum', (empNum) => {
    this.employeeNumber = empNum;
  });
  window.EventBus.$on('close-tag-manager', () => {
    this.manageTags = false;
  });

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
} // created

/**
 * destroy listeners
 */
function beforeDestroy() {
  window.EventBus.$off('cancel-form');
  window.EventBus.$off('canceled-delete-employee');
  window.EventBus.$off('confirm-delete-employee');
  window.EventBus.$off('invalid-employee-delete');
  window.EventBus.$off('empNum');
  window.EventBus.$off('close-tag-manager');
} // beforeDestroy

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
  beforeDestroy,
  components: {
    ConvertEmployeesToCsv,
    DeleteErrorModal,
    DeleteModal,
    EmployeeForm,
    ConvertEmployeeToCsv,
    GenerateCsvEeoReport,
    TagManager
  },
  computed: {
    storeIsPopulated
  },
  created,
  data() {
    return {
      childKey: 0,
      contracts: [],
      createEmployee: false,
      deleteModel: {
        id: null
      }, // employee to delete
      deleting: false, // activate delete confirmation model
      employees: [], // employees
      employeeNumber: null,
      expanded: [], // datatable expanded
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
          text: 'First Name',
          value: 'firstName'
        },
        {
          text: 'Middle Name',
          value: 'middleName'
        },
        {
          text: 'Last Name',
          value: 'lastName'
        },
        {
          text: 'Nickname',
          value: 'nickname'
        },
        {
          text: 'Hire Date',
          value: 'hireDate'
        },
        {
          text: 'Email',
          value: 'email'
        },
        userRoleIsAdmin() || userRoleIsManager()
          ? {
              text: 'Last Login',
              value: 'lastLoginSeconds'
            }
          : _,
        {
          value: 'actions',
          sortable: false
        }
      ], // datatable headers
      midAction: false,
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
        currentZIP: null
      }, // selected employee
      search: null, // query text for datatable search field
      selectedTags: [], // tags to include or exclude in filter
      sortBy: 'hireDate', // sort datatable items
      sortDesc: false, // sort datatable items
      status: {
        statusType: undefined,
        statusMessage: null,
        color: null
      }, // snackbar action status
      syncing: false,
      tags: [],
      tagFlip: [],
      tagSearchString: ''
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
    isFocus,
    isFullTime,
    isInactive,
    isPartTime,
    monthDayYearFormat,
    negateTag,
    refreshEmployees,
    renderCreateEmployee,
    renderManageTags,
    removeTag,
    selectedTagsHasEmployee,
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
</style>
