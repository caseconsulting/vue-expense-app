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
      <v-btn color="white" text @click="clearStatus">
        Close
      </v-btn>
    </v-snackbar>
    <v-card>
      <v-container fluid>
        <!-- Title -->
        <v-card-title>
          <h2>Employees</h2>
          <v-spacer></v-spacer>
          <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
        </v-card-title>

        <!-- Filters -->
        <fieldset v-if="userIsAdmin()" class="filter_border">
          <legend class="legend_style">Filters</legend>

          <!-- Active Filter -->
          <div class="flagFilter">
            <h4>Employee Status:</h4>
            <v-btn-toggle class="filter_color" v-model="filter.active" text multiple>
              <!-- Full Time -->
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn value="full" v-on="on" text>
                    <icon class="mr-1" name="clock" color="black"></icon>
                  </v-btn>
                </template>
                <span>Full Time</span>
              </v-tooltip>

              <!-- Part Time -->
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn value="part" v-on="on" text>
                    <icon name="regular/clock" color="black"></icon>
                  </v-btn>
                </template>
                <span>Part Time</span>
              </v-tooltip>

              <!-- Inactive -->
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn value="inactive" v-on="on" text>
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
        <v-btn class="mb-5" @click="createEmployee = true">
          Create an Employee<v-icon class="pl-2">person_add</v-icon>
        </v-btn>

        <!-- Employee Datatable-->
        <v-data-table
          :headers="headers"
          :items="filteredEmployees"
          :sort-by.sync="sortBy"
          :sort-desc.sync="sortDesc"
          :expanded.sync="expanded"
          :loading="loading"
          :items-per-page.sync="itemsPerPage"
          :search="search"
          item-key="employeeNumber"
          class="elevation-1"
        >
          <!-- Rows in datatable -->
          <template v-slot:item="{ item }">
            <router-link
              :to="employeePath(item)"
              tag="tr"
              :class="{ inactiveStyle: isInactive(item), selectFocus: isFocus(item) }"
            >
              <!-- Employee Information -->
              <td>{{ item.employeeNumber }}</td>
              <td>{{ item.firstName }}</td>
              <td>{{ item.lastName }}</td>
              <td>{{ item.hireDate | dateFormat }}</td>
              <td>{{ item.email }}</td>
              <!-- Action Icons -->
              <td class="datatable_btn layout" v-if="userIsAdmin()" @click="clickedRow(item)">
                <!-- Delete Button -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn :disabled="midAction" text icon @click.stop="validateDelete(item)" v-on="on">
                      <v-icon style="color: #606060;">
                        delete
                      </v-icon>
                    </v-btn>
                  </template>
                  <span>Delete</span>
                </v-tooltip>
              </td>
              <!-- End Action Icons -->
            </router-link>
          </template>
          <!-- End rows in datatable -->

          <!-- Alert for no search results -->
          <v-alert slot="no-results" :value="true" color="error" icon="warning">
            Your search for "{{ search }}" found no results.
          </v-alert>
          <!-- End alert for no search results -->
        </v-data-table>
        <!-- End employee datatable -->
        <br />

        <!-- Download employee csv button -->
        <v-card-actions>
          <convert-employees-to-csv
            v-if="userIsAdmin()"
            :midAction="midAction"
            :employees="filteredEmployees"
          ></convert-employees-to-csv>
        </v-card-actions>

        <!-- Confirmation Modals -->
        <delete-modal :activate="deleting" :type="'employee'"></delete-modal>
        <delete-error-modal :activate="invalidDelete" type="employee"></delete-error-modal>
        <!-- End Confirmation Modals -->
      </v-container>
    </v-card>
    <v-dialog v-model="createEmployee"><employee-form :model="this.model"></employee-form></v-dialog>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import ConvertEmployeesToCsv from '../components/ConvertEmployeesToCsv.vue';
import DeleteErrorModal from '../components/DeleteErrorModal.vue';
import DeleteModal from '../components/DeleteModal.vue';
import EmployeeForm from '../components/EmployeeForm.vue';
import { getRole } from '@/utils/auth';
import moment from 'moment';
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Refresh and updates employee list and displays a successful create status in the snackbar.
 */
function addModelToTable() {
  this.refreshEmployees();

  this.$set(this.status, 'statusType', 'SUCCESS');
  this.$set(this.status, 'statusMessage', 'Employee was successfully created!');
  this.$set(this.status, 'color', 'green');
} // addModelToTable

/**
 * NOTE: Unused?
 *
 * Clear the selected employee.
 */
function clearModel() {
  this.$set(this.model, 'id', null);
  this.$set(this.model, 'firstName', null);
  this.$set(this.model, 'middleName', null);
  this.$set(this.model, 'lastName', null);
  this.$set(this.model, 'email', '@consultwithcase.com');
  this.$set(this.model, 'employeeRole', null);
  this.$set(this.model, 'employeeNumber', null);
  this.$set(this.model, 'hireDate', null);
  this.$set(this.model, 'workStatus', 100);

  //New Fields
  this.$set(this.model, 'birthday', null);
  this.$set(this.model, 'birthdayFeed', false);
  this.$set(this.model, 'jobRole', null);
  this.$set(this.model, 'prime', null);
  this.$set(this.model, 'contract', null);
  this.$set(this.model, 'github', null);
  this.$set(this.model, 'twitter', null);
  this.$set(this.model, 'city', null);
  this.$set(this.model, 'st', null);
  this.$set(this.model, 'country', null);
  this.$set(this.model, 'deptDate', null);
} // clearModel

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
  this.deleting = false; // deactive modal to confirm delete
  let e = await api.deleteItem(api.EMPLOYEES, this.deleteModel.id); // delete employee from api
  if (e.id) {
    // update data if successfully deletes employee
    this.deleteModelFromTable();
  } else {
    // display error if failed to deleted employee
    this.displayError(e.response.data.message);
  }
  this.midAction = false;
} // deleteEmployee

/**
 * Refresh and updates employee list and displays a successful delete status in the snackbar.
 */
function deleteModelFromTable() {
  this.refreshEmployees();

  this.$set(this.status, 'statusType', 'SUCCESS');
  this.$set(this.status, 'statusMessage', 'Employee was successfully deleted!');
  this.$set(this.status, 'color', 'green');
} // deleteModelFromTable

/**
 * Set and display an error action status in the snackbar.
 *
 * @param err - String error message
 */
async function displayError(err) {
  this.$set(this.status, 'statusType', 'ERROR');
  this.$set(this.status, 'statusMessage', err);
  this.$set(this.status, 'color', 'red');
} // displayError

/**
 * sets midAction boolean to false
 */
function employeePath(item) {
  return `/employee/${item.employeeNumber}`;
} // employeePath

/**
 * sets midAction boolean to false
 */
function endAction() {
  this.midAction = false;
}

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
 * Returns Full Time, Part Time, or Inactive based on the work status
 */
function getWorkStatus(workStatus) {
  if (workStatus == 100) {
    return 'Full Time';
  } else if (workStatus == 0) {
    return 'Inactive';
  } else if (workStatus > 0 && workStatus < 100) {
    return `Part Time (${workStatus}%)`;
  } else {
    return 'Invalid Status';
  }
} // getWorkStatus

/**
 * Checks if there is data about an employee to display. Returns true if the user is an admin or if the there is data
 * on the employee's prime, contract, job role, github, or twitter, otherwise returns false.
 *
 * @item item - employee to check
 * @return boolean - employee has data to display
 */
function isDisplayData(item) {
  let valid =
    !this.userIsAdmin() &&
    this.isEmpty(item.prime) &&
    this.isEmpty(item.contract) &&
    this.isEmpty(item.jobRole) &&
    this.isEmpty(item.github) &&
    this.isEmpty(item.twitter);
  return valid;
} // isDisplayData

/**
 * Checks if a value is empty. Returns true if the value is null or an empty/blank string.
 *
 * @param value - value to check
 * @return boolean - value is empty
 */
function isEmpty(value) {
  return _.isNil(value) || (_.isString(value) && value.trim().length === 0);
} // isEmpty

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
 * Checks if an employee is full time. Returns true if the employee is full time with a work status of 100, otherwise
 * returns false.
 *
 * @param employee - employee to check
 * @return boolean - employee is full time
 */
function isFullTime(employee) {
  return employee.workStatus == 100;
} // isFullTime

/**
 * Checks if an employee is inactive. Returns true if the employee is inactive with a work status of 0, otherwise
 * returns false.
 *
 * @param employee - employee to check
 * @return boolean - employee is inactive
 */
function isInactive(employee) {
  return employee.workStatus == 0;
} // isInactive

/**
 * Checks if an employee is part time. Returns true if the employee is part time with a work status between 0 and 100,
 * otherwise returns false.
 *
 * @param employee - employee to check
 * @return boolean - employee is part time
 */
function isPartTime(employee) {
  return employee.workStatus > 0 && employee.workStatus < 100;
} // isPartTime

/**
 * Store the attributes of a selected employee.
 *
 * @param item - employee selected
 */
function onSelect(item) {
  this.$set(this.model, 'id', item.id);
  this.$set(this.model, 'firstName', item.firstName);
  this.$set(this.model, 'lastName', item.lastName);
  this.$set(this.model, 'email', item.email);
  this.$set(this.model, 'employeeRole', item.employeeRole);
  this.$set(this.model, 'employeeNumber', item.employeeNumber);
  this.$set(this.model, 'hireDate', item.hireDate);
  this.$set(this.model, 'workStatus', item.workStatus);

  // Additional Fields
  this.$set(this.model, 'middleName', item.middleName);
  this.$set(this.model, 'birthday', item.birthday);
  this.$set(this.model, 'birthdayFeed', item.birthdayFeed);
  this.$set(this.model, 'jobRole', item.jobRole);
  this.$set(this.model, 'prime', item.prime);
  this.$set(this.model, 'contract', item.contract);
  this.$set(this.model, 'github', item.github);
  this.$set(this.model, 'twitter', item.twitter);
  this.$set(this.model, 'city', item.city);
  this.$set(this.model, 'st', item.st);
  this.$set(this.model, 'country', item.country);
  this.$set(this.model, 'deptDate', item.deptDate);
} // onSelect

/**
 * Refresh employee data and filters employees.
 */
async function refreshEmployees() {
  this.loading = true; // set loading status to true
  this.employees = await api.getItems(api.EMPLOYEES); // get all employees
  this.filterEmployees(); // filter employees
  this.expanded = []; // collapse any expanded rows in the database
  this.loading = false; // set loading status to false
} // refreshEmployees

/**
 * Sets midAction boolean to true
 */
function startAction() {
  this.midAction = true;
}

/**
 * Refresh and updates employee list and displays a successful update status in the snackbar.
 */
function updateModelInTable() {
  this.refreshEmployees();
  this.$set(this.status, 'statusType', 'SUCCESS');
  this.$set(this.status, 'statusMessage', 'Employee was successfully updated!');
  this.$set(this.status, 'color', 'green');
} // updateModelInTable

/**
 * Checks to see if the user is an admin. Returns true if the user's role is an admin, otherwise returns false.
 */
function userIsAdmin() {
  return getRole() === 'admin';
} // userIsAdmin

/**
 * Validates if an employee can be deleted. Returns true if the employee has no expenses, otherwise returns false.
 *
 * @param item - employee to validate
 */
async function validateDelete(item) {
  this.midAction = true;
  let valid = await api
    .getAllEmployeeExpenses(item.id) // get employee expenses
    .then((result) => {
      // return if the employee has expenses
      return result.length <= 0;
    })
    .catch((err) => {
      // error getting employee expenses
      this.displayError(err);
    });

  if (valid) {
    // employee can be deleted
    this.$set(this.deleteModel, 'id', item.id);
    this.deleting = true; // activate model to confirm delete
  } else {
    // employee cannot be deleted
    this.invalidDelete = true;
  }
} // validateDelete

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Adjust datatable header for user view. Creates event listeners.
 */
async function created() {
  window.EventBus.$on('cancel-form', () => {
    this.createEmployee = false;
  });
  window.EventBus.$on('canceled-delete-employee', () => {
    this.deleting = false;
    this.midAction = false;
  });
  window.EventBus.$on('confirm-delete-employee', this.deleteEmployee);
  window.EventBus.$on('invalid-employee-delete', () => {
    this.invalidDelete = false;
    this.midAction = false;
  });

  this.refreshEmployees();

  // remove employee action button header if user view
  if (!this.userIsAdmin()) {
    this.headers.pop();
  }
} // created

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  beforeDestroy() {
    window.EventBus.$off('confirm-delete-employee');
  },
  components: {
    ConvertEmployeesToCsv,
    DeleteErrorModal,
    DeleteModal,
    EmployeeForm
  },
  created,
  data() {
    return {
      createEmployee: false,
      deleteModel: {
        id: null
      }, // employee to delete
      deleting: false, // activate delete confirmation model
      employees: [], // employees
      expanded: [], // datatable expanded
      filter: {
        active: ['full', 'part'] // default only shows full and part time employees
      }, // datatable filter
      filteredEmployees: [], // filtered employees
      headers: [
        {
          text: 'Employee #',
          value: 'employeeNumber'
        },
        {
          text: 'First Name',
          value: 'firstName'
        },
        {
          text: 'Last Name',
          value: 'lastName'
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
        city: null,
        st: null,
        country: null,
        deptDate: null
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
  filters: {
    // formats a date by month, day, year (e.g. Aug 18th, 2020)
    dateFormat: (value) => {
      if (!isEmpty(value)) {
        return moment(value).format('MMM Do, YYYY');
      } else {
        return '';
      }
    },
    birthdayFeedResponse: (value) => {
      if (value == true) {
        return 'yes';
      } else {
        return 'no';
      }
    }
  },
  methods: {
    addModelToTable,
    clearModel, // NOTE: Unused?
    clearStatus,
    deleteEmployee,
    deleteModelFromTable,
    displayError,
    employeePath,
    endAction,
    filterEmployees,
    getWorkStatus,
    isDisplayData,
    isEmpty,
    isFocus,
    isFullTime,
    isInactive,
    isPartTime,
    onSelect,
    refreshEmployees,
    startAction,
    updateModelInTable,
    userIsAdmin,
    validateDelete
  },
  watch: {
    'filter.active': function () {
      // filter employees based on datatable active filter
      this.filterEmployees();
    }
  }
};
</script>

<style>
.expandedInfo {
  border: 1px solid black;
  font-size: 14px;
  padding: 20px;
}

.expandedInfo a {
  font-size: 14px;
  color: blue;
}

.expandedInfo a:hover {
  color: #0cf;
}

.flagEmp p {
  font-weight: bold;
  width: 75px;
  display: inline-block;
}
</style>
