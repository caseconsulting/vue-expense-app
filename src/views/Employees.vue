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
            label="Search"
            single-line
            hide-details
          ></v-text-field>
        </v-card-title>

        <!-- Filters -->
        <fieldset v-if="hasAdminPermissions()" class="filter_border">
          <legend class="legend_style">Filters</legend>

          <!-- Active Filter -->
          <div class="flagFilter">
            <h4>Employee Status:</h4>
            <v-btn-toggle class="filter_color" v-model="filter.active" text multiple>
              <!-- Full Time -->
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn value="full" id="full" v-on="on" text>
                    <icon class="mr-1" name="clock" color="black"></icon>
                  </v-btn>
                </template>
                <span>Full Time</span>
              </v-tooltip>

              <!-- Part Time -->
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn value="part" id="part" v-on="on" text>
                    <icon name="regular/clock" color="black"></icon>
                  </v-btn>
                </template>
                <span>Part Time</span>
              </v-tooltip>

              <!-- Inactive -->
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn value="inactive" id="inactive" v-on="on" text>
                    <icon name="regular/stop-circle" color="black"></icon>
                  </v-btn>
                </template>
                <span>Inactive</span>
              </v-tooltip>
            </v-btn-toggle>
          </div>
          <!-- End Active Filter -->
        </fieldset>
        <br />
        <!-- End Filters -->
        <!-- Create an Employee -->
        <v-btn
          id="createEmployeeBtn"
          class="mb-5"
          @click="renderCreateEmployee()"
          elevation="2"
          v-if="hasAdminPermissions()"
        >
          Create an Employee<v-icon class="pl-2">person_add</v-icon>
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
          mobile-breakpoint="800"
          item-key="employeeNumber"
          class="elevation-1"
          @click:row="handleClick"
        >
          <!-- Delete Action Item Slot -->
          <template v-slot:[`item.actions`]="{ item }">
            <div class="datatable_btn layout">
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <convert-employee-to-csv
                    v-if="userIsAdmin()"
                    :midAction="midAction"
                    :employee="item"
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

          <!-- Employee Number Item Slot -->
          <template v-slot:[`item.employeeNumber`]="{ item }">
            <p :class="{ inactiveStyle: isInactive(item), selectFocus: isFocus(item) }" class="mb-0">
              {{ item.employeeNumber }}
            </p>
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
          <template v-slot:[`item.lastLogin`]="{ item }">
            <v-hover v-slot="{ hover }">
              <p
                v-if="userIsAdmin() && hover && item.lastLogin !== undefined"
                :class="{ inactiveStyle: isInactive(item), selectFocus: isFocus(item) }"
                class="mb-0"
              >
                {{ moment(item.lastLogin).format('MMM Do, YYYY HH:mm:ss') }}
              </p>
              <p
                v-else-if="userIsAdmin() && item.lastLogin !== undefined"
                :class="{ inactiveStyle: isInactive(item), selectFocus: isFocus(item) }"
                class="mb-0"
              >
                {{ moment(item.lastLogin).format('MMM Do, YYYY') }}
              </p>
              <p
                v-else-if="userIsAdmin()"
                :class="{ inactiveStyle: isInactive(item), selectFocus: isFocus(item) }"
                class="mb-0"
              >
                {{ item.lastLogin }}
              </p>
            </v-hover>
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
            v-if="userIsAdmin()"
            :midAction="midAction"
            :employees="filteredEmployees"
          ></convert-employees-to-csv>
          <generate-csv-eeo-report
            v-if="userIsAdmin()"
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
      ><employee-form :key="childKey" :model="this.model"></employee-form
    ></v-dialog>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import { updateStoreEmployees } from '@/utils/storeUtils';
import ConvertEmployeesToCsv from '@/components/ConvertEmployeesToCsv.vue';
import DeleteErrorModal from '@/components/modals/DeleteErrorModal.vue';
import DeleteModal from '@/components/modals/DeleteModal.vue';
import EmployeeForm from '@/components/employees/EmployeeForm.vue';
import moment from 'moment-timezone';
import _ from 'lodash';
import { getRole } from '@/utils/auth';
import { isEmpty, isFullTime, isInactive, isPartTime, monthDayYearFormat, storeIsPopulated } from '@/utils/utils';
import ConvertEmployeeToCsv from '../components/ConvertEmployeeToCsv.vue';
import GenerateCsvEeoReport from '@/components/GenerateCsvEeoReport.vue';

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
  //filter for Active Expense Types (available to admin only)
  this.filteredEmployees = _.filter(this.employees, (employee) => {
    let fullCheck = this.filter.active.includes('full') && this.isFullTime(employee);
    let partCheck = this.filter.active.includes('part') && this.isPartTime(employee);
    let inactiveCheck = this.filter.active.includes('inactive') && this.isInactive(employee);
    return fullCheck || partCheck || inactiveCheck;
  });
} // filterEmployees

/**
 * handles click event of the employee table entry
 *
 * @param item - the employee
 */
function handleClick(item) {
  this.$router.push(employeePath(item));
} //handleClick

/**
 * Checks to see if the user has admin permissions. Returns true if the user's role is an admin or manager, otherwise returns false.
 *
 * @return boolean - true if user's employeeRole is either a admin or a manager
 */
function hasAdminPermissions() {
  return this.getRole() === 'admin' || this.getRole() === 'manager';
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
 * Refresh employee data and filters employees.
 */
async function refreshEmployees() {
  this.loading = true; // set loading status to true
  this.employees = this.$store.getters.employees; // get all employees
  this.employees.forEach((currentEmp) => {
    if (currentEmp.lastLogin) {
      currentEmp.lastLogin = moment(currentEmp.lastLogin, ['MMM Do, YYYY HH:mm:ss', 'YYYY-MM-DD HH:mm:ss']);
    }
  });
  this.filterEmployees(); // filter employees
  this.expanded = []; // collapse any expanded rows in the database

  // set employee avatar
  let avatars = this.$store.getters.basecampAvatars;
  _.map(this.employees, (employee) => {
    let avatar = _.find(avatars, ['email_address', employee.email]);
    let avatarUrl = avatar ? avatar.avatar_url : null;
    employee.avatar = avatarUrl;
    return employee;
  });
  this.loading = false; // set loading status to false
} // refreshEmployees

/**
 * open the create employee form
 */
function renderCreateEmployee() {
  this.createEmployee = true;
  this.childKey++;
} // renderCreateEmployee

/**
 * Checks to see if the user is an admin. Returns true if the user's role is an admin, otherwise returns false.
 *
 * @return - whether of not the user is an admin
 */
function userIsAdmin() {
  return this.getRole() === 'admin';
} // userIsAdmin

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

  // only refresh employees if data is in store. Otherwise, set loading and wait in watcher
  this.storeIsPopulated ? await this.refreshEmployees() : (this.loading = true);

  // remove admin-only actions if user is not admin (by default everything is included)
  const adminSpecific = ['lastLogin']; // requires admin role, NOT manager
  const adminPermissions = ['actions']; // requires admin level, including manager
  if (!this.hasAdminPermissions()) {
    this.headers = _.filter(this.headers, (header) => {
      return !adminPermissions.includes(header.value);
    });
  }
  if (!this.userIsAdmin()) {
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
    GenerateCsvEeoReport
  },
  computed: {
    storeIsPopulated
  },
  created,
  data() {
    return {
      childKey: 0,
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
          text: 'Employee #',
          value: 'employeeNumber'
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
        {
          text: 'Last Login',
          value: 'lastLogin'
        },
        {
          value: 'actions',
          sortable: false
        }
      ], // datatable headers
      midAction: false,
      invalidDelete: false, // invalid delete status
      itemsPerPage: -1, // items per datatable page
      loading: false, // loading status
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
      sortBy: 'employeeNumber', // sort datatable items
      sortDesc: false, // sort datatable items
      status: {
        statusType: undefined,
        statusMessage: null,
        color: null
      } // snackbar action status
    };
  },
  methods: {
    changeAvatar,
    clearCreateEmployee,
    clearStatus,
    deleteEmployee,
    deleteModelFromTable,
    displayError,
    employeePath,
    filterEmployees,
    getRole,
    handleClick,
    hasAdminPermissions,
    isEmpty,
    isFocus,
    isFullTime,
    isInactive,
    isPartTime,
    monthDayYearFormat,
    refreshEmployees,
    renderCreateEmployee,
    userIsAdmin,
    validateDelete,
    updateStoreEmployees
  },
  watch: {
    'filter.active': watchFilterActive,
    storeIsPopulated: async function () {
      // in the case that the page has been force reloaded (and the store cleared)
      // this watcher will be activated when the store is populated again.
      if (this.storeIsPopulated) await this.refreshEmployees();
    }
  }
};
</script>
