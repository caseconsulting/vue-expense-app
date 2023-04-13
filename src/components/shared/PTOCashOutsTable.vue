<template>
  <v-card class="mt-3">
    <v-container fluid>
      <!-- Title -->
      <v-card-title v-if="!isMobile()">
        <h3 v-if="userRoleIsAdmin() && unapprovedOnly && !loading">Unapproved PTO Cash Outs</h3>
        <h3 v-else-if="userRoleIsAdmin() && !loading">All PTO Cash Outs</h3>
        <h3 v-else-if="!loading">My PTO Cash Outs</h3>
        <h3 v-else>Loading...</h3>
        <v-spacer></v-spacer>
        <!-- Filter -->
        <v-autocomplete
          v-if="userRoleIsAdmin()"
          hide-details
          :items="employees"
          v-model="filteredEmployee"
          item-text="text"
          id="employeeIdFilter"
          class="mr-3"
          label="Filter by Employee"
          clearable
        ></v-autocomplete>
      </v-card-title>
      <div v-else>
        <v-card-title class="px-0">
          <h3 v-if="userRoleIsAdmin() && unapprovedOnly && !loading">Unapproved PTO Cash Outs</h3>
          <h3 v-else-if="userRoleIsAdmin() && !loading">All PTO Cash Outs</h3>
          <h3 v-else-if="!loading">My PTO Cash Outs</h3>
          <h3 v-else>Loading...</h3>
        </v-card-title>
        <v-row class="mb-5">
          <v-col v-if="userRoleIsAdmin()">
            <!-- Employee Filter -->
            <v-autocomplete
              hide-details
              :items="employees"
              :filter="customFilter"
              v-model="employee"
              item-text="text"
              id="employeeIdFilter"
              label="Filter by Employee"
              clearable
            ></v-autocomplete>
          </v-col>
        </v-row>
      </div>

      <!-- Filters -->
      <fieldset v-if="!unapprovedOnly" class="filter_border">
        <legend class="legend_style">Filters</legend>

        <!-- Approved Filter -->
        <div class="flagFilter">
          <h4>Approved:</h4>
          <v-btn-toggle class="filter_color" v-model="filter.approved" text mandatory>
            <!-- Show Approved -->
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn value="approved" v-on="on" text>
                  <v-icon id="showApproved" class="mr-1">mdi-check-circle-outline</v-icon>
                </v-btn>
              </template>
              <span>Show Approved</span>
            </v-tooltip>

            <!-- Show Pending -->
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn value="notApproved" v-on="on" text>
                  <v-icon id="showPending">mdi-close-circle-outline</v-icon>
                </v-btn>
              </template>
              <span>Show Pending</span>
            </v-tooltip>

            <!-- Show Reimbursed and Pending -->
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn id="bothApproved" value="both" v-on="on" text> BOTH </v-btn>
              </template>
              <span>Show All</span>
            </v-tooltip>
          </v-btn-toggle>
        </div>
        <!-- End Reimbursed Filter -->
        <div class="flagFilter"></div>
      </fieldset>
      <br />
      <!-- End Filters -->
      <!-- PTO Cash Outs Data Table -->
      <v-data-table
        v-model="selected"
        :headers="roleHeaders"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
        :items="filteredPtoCashOuts"
        class="elevation-4"
        :loading="loading"
        :show-select="unapprovedOnly"
      >
        <!-- Creation Date slot -->
        <template v-slot:[`item.creationDate`]="{ item }">
          <td>{{ monthDayYearFormat(item.creationDate) }}</td>
        </template>

        <!-- Employee slot -->
        <template v-slot:[`item.employeeId`]="{ item }">
          <td v-if="userRoleIsAdmin()">{{ firstAndLastName(getEmployeeByID(item.employeeId)) }}</td>
        </template>

        <!-- Amount slot-->
        <template v-slot:[`item.amount`]="{ item }">
          <td>{{ item.amount + (item.amount > 1 ? ' hrs' : 'hr') }}</td>
        </template>

        <!-- Approved Date slot -->
        <template v-slot:[`item.approvedDate`]="{ item }">
          <td>{{ monthDayYearFormat(item.approvedDate) }}</td>
        </template>
      </v-data-table>
    </v-container>
    <v-fab-transition class="reimburse_button">
      <v-btn
        @click="toggleApproveModal = true"
        id="custom-button-color"
        :loading="isApproving"
        v-show="showApproveButton"
        fab
        dark
        large
        bottom
        left
        fixed
        class="reimburse_button"
      >
        <v-icon>mdi-currency-usd</v-icon>
      </v-btn>
    </v-fab-transition>
    <general-confirmation-modal
      title="Are you sure you want to approve selected PTO cash outs?"
      type="pto-cash-outs"
      :toggleModal="toggleApproveModal"
    />
  </v-card>
</template>
<script>
import { isMobile, userRoleIsAdmin, monthDayYearFormat, isEmpty } from '@/utils/utils';
import { getEmployeeByID, firstAndLastName } from '@/shared/employeeUtils';
import api from '@/shared/api.js';
import { updateStoreUser, updateStoreEmployees } from '@/utils/storeUtils';
import _ from 'lodash';
import GeneralConfirmationModal from '../modals/GeneralConfirmationModal.vue';
import dateUtils from '@/shared/dateUtils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Created lifecycle hook
 */
async function created() {
  window.EventBus.$on('confirmed-pto-cash-outs', () => {
    this.clickedConfirm();
  });
  window.EventBus.$on('canceled-pto-cash-outs', () => {
    this.toggleApproveModal = false;
  });
  if (!this.$store.getters.storeIsPopulated) {
    await this.updateStoreUser();
    await this.updateStoreEmployees();
  }
  if (this.userRoleIsAdmin()) {
    this.ptoCashOuts = await api.getItems(api.PTO_CASH_OUTS);
  } else {
    this.ptoCashOuts = await api.getEmployeePtoCashOuts(this.$store.getters.user.id);
  }
  this.loading = false;
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Approves selected pto cash outs
 */
async function approveSelectedPTOCashOuts() {
  let promises = [];
  this.selected.forEach((e) => {
    let item = e;
    item.approvedDate = dateUtils.getTodaysDate();
    promises.push(api.updateItem(api.PTO_CASH_OUTS, item));
  });
  return await Promise.all(promises);
} // approveSelectedPTOCashOuts

/**
 * Event handler confirm clicked
 */
async function clickedConfirm() {
  try {
    this.isApproving = true;
    await this.approveSelectedPTOCashOuts();
    this.isApproving = false;
    this.displaySuccess('Successfully approved PTO cash outs!');
    this.uncheckAllBoxes();
  } catch (err) {
    this.isApproving = false;
    this.displayError(err);
  }
  this.toggleApproveModal = false;
} // clickedConfirm

/**
 * Displays error snackbar
 *
 * @param err error message to display
 */
function displayError(err) {
  let status = {
    statusType: 'ERROR',
    statusMessage: err,
    color: 'red'
  };

  window.EventBus.$emit('status-alert', status);
} // displayError

/**
 * Displays success message
 * @param msg success message to display
 */
function displaySuccess(msg) {
  let status = {
    statusType: 'SUCCESS',
    statusMessage: msg,
    color: 'green'
  };
  window.EventBus.$emit('status-alert', status);
} // displaySuccess

/**
 * Unchecks all boxes in the data table
 */
function uncheckAllBoxes() {
  this.selected = [];
} // uncheckAllBoxes

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Filters data table based on filter settings
 *
 * @return Array - filtered PTO cash outs
 */
function filteredPtoCashOuts() {
  let filteredPtoCashOuts = _.cloneDeep(this.ptoCashOuts);

  if (this.filteredEmployee) {
    filteredPtoCashOuts = _.filter(filteredPtoCashOuts, (p) => p.employeeId == this.filteredEmployee);
  }

  if (this.filter.approved === 'notApproved' || this.unapprovedOnly) {
    filteredPtoCashOuts = _.filter(filteredPtoCashOuts, (p) => p.approvedDate == null);
  } else if (this.filter.approved === 'approved') {
    filteredPtoCashOuts = _.filter(filteredPtoCashOuts, (p) => p.approvedDate != null);
  }
  return filteredPtoCashOuts;
} // filteredPtOCashOuts

/**
 * Gets the datatable headers based on user's role. Returns all headers if user role is admin.
 * Otherwise returns all but 'Employee' header.
 *
 * @return Array - datatable headers
 */
function roleHeaders() {
  return this.userRoleIsAdmin() ? this.headers : _.filter(this.headers, (h) => h.text != 'Employee');
} // roleHeaders

/**
 * Gets all employees with submitted PTO Cash Out Requests for autocomplete filter component.
 *
 * @return Array - filtered employees
 */
function employees() {
  let employeeIdsWithPTOCashOuts = this.ptoCashOuts.map((p) => p.employeeId);
  return _.map(
    _.filter(this.$store.getters.employees, (e) => employeeIdsWithPTOCashOuts.includes(e.id)),
    (e) => ({
      text: firstAndLastName(e),
      value: e.id,
      nickname: e.nickname ? e.nickname : '',
      firstName: e.firstName,
      lastName: e.lastName
    })
  );
} // employees

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Watcher for selected items
 */
function watchSelected() {
  if (this.selected.length == 0) {
    this.showApproveButton = false;
  } else {
    this.showApproveButton = true;
  }
} // watchSelected

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  data() {
    return {
      ptoCashOuts: [],
      loading: true,
      filteredEmployee: null,
      filter: {
        // active: 'both',
        approved: 'notApproved' // default only shows cash outs that are not approved
      },
      headers: [
        { text: 'Creation Date', value: 'creationDate' },
        { text: 'Employee', value: 'employeeId' },
        { text: 'Amount', value: 'amount' },
        { text: 'Approved Date', value: 'approvedDate' }
      ],
      sortBy: 'creationDate',
      sortDesc: true,
      selected: [],
      isApproving: false,
      showApproveButton: false,
      toggleApproveModal: false
    };
  },
  methods: {
    approveSelectedPTOCashOuts,
    clickedConfirm,
    displayError,
    displaySuccess,
    isMobile,
    userRoleIsAdmin,
    monthDayYearFormat,
    isEmpty,
    getEmployeeByID,
    firstAndLastName,
    updateStoreUser,
    updateStoreEmployees,
    uncheckAllBoxes
  },
  computed: {
    roleHeaders,
    filteredPtoCashOuts,
    employees
  },
  props: ['unapprovedOnly'],
  watch: {
    selected: watchSelected
  },
  components: { GeneralConfirmationModal }
};
</script>
