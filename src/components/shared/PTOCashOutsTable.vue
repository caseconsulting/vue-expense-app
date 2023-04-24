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
        @click:row="rowClicked"
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
          <td>{{ item.amount + (item.amount > 1 ? ' hrs' : ' hr') }}</td>
        </template>

        <!-- Approved Date slot -->
        <template v-slot:[`item.approvedDate`]="{ item }">
          <td>{{ monthDayYearFormat(item.approvedDate) }}</td>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <td v-if="!unapprovedOnly" class="datatable_btn layout">
            <!-- Edit Button -->
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn :disabled="isUnapproving || isDeleting" text icon id="edit" v-on="on" @click="clickedEdit(item)">
                  <v-icon class="case-gray">edit</v-icon>
                </v-btn>
              </template>
              <span>Edit</span>
            </v-tooltip>

            <!-- Delete Button -->
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn
                  :disabled="isUnapproving || isDeleting"
                  @click="clickedDelete(item)"
                  text
                  icon
                  id="delete"
                  v-on="on"
                >
                  <v-icon class="case-gray"> delete </v-icon>
                </v-btn>
              </template>
              <span>Delete</span>
            </v-tooltip>

            <!-- Unapprove Button -->
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-if="userRoleIsAdmin()"
                  :disabled="!isApproved(item) || isUnapproving || isDeleting"
                  @click="clickedUnapprove(item)"
                  text
                  icon
                  id="unapprove"
                  v-on="on"
                >
                  <v-icon class="case-gray"> money_off </v-icon>
                </v-btn>
              </template>
              <span>Unapprove</span>
            </v-tooltip>
          </td>
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
    <unapprove-p-t-o-cash-out-modal :toggleUnapproveModal="toggleUnapproveModal" />
    <delete-modal :toggleDeleteModal="toggleDeleteModal" type="PTO cash out" />
    <v-dialog v-model="toggleEditModal" persistent max-width="500">
      <p-t-o-cash-out-form :item="clickedEditItem" />
    </v-dialog>
  </v-card>
</template>
<script>
import { isMobile, userRoleIsAdmin, monthDayYearFormat, isEmpty } from '@/utils/utils';
import { getEmployeeByID, firstAndLastName } from '@/shared/employeeUtils';
import api from '@/shared/api.js';
import { updateStoreUser, updateStoreEmployees, updateStorePtoCashOuts } from '@/utils/storeUtils';
import _ from 'lodash';
import GeneralConfirmationModal from '../modals/GeneralConfirmationModal.vue';
import dateUtils from '@/shared/dateUtils';
import UnapprovePTOCashOutModal from '../modals/UnapprovePTOCashOutModal.vue';
import DeleteModal from '../modals/DeleteModal.vue';
import PTOCashOutForm from './PTOCashOutForm.vue';

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
    this.clickedConfirmApprove();
  });
  window.EventBus.$on('canceled-pto-cash-outs', () => {
    this.toggleApproveModal = false;
  });
  window.EventBus.$on('confirm-unapprove-cash-out', () => {
    this.clickedConfirmUnapprove();
  });
  window.EventBus.$on('canceled-unapprove-cash-out', () => {
    this.clickedCancelUnapprove();
  });
  window.EventBus.$on('confirm-delete-PTO cash out', () => {
    this.clickedConfirmDelete();
  });
  window.EventBus.$on('canceled-delete-PTO cash out', () => {
    this.clickedCancelDelete();
  });

  if (!this.$store.getters.storeIsPopulated) {
    await Promise.all([this.updateStoreUser(), this.updateStoreEmployees()]);
  }
  await this.updateStorePtoCashOuts();
  this.loading = false;
} // created

/**
 * beforeDestroy lifecycle hook. Destroys all event listeners.
 */
function beforeDestroy() {
  window.EventBus.$off('confirm-pto-cash-outs');
  window.EventBus.$off('canceled-pto-cash-outs');
  window.EventBus.$off('confirm-unapprove-cash-out');
  window.EventBus.$off('canceled-unapprove-cash-out');
  window.EventBus.$off('confirm-delete-pto-cash-out');
  window.EventBus.$off('canceled-delete-pto-cash-out');
  window.EventBus.$off('close-pto-cash-out-form');
} // beforeDestroy

function mounted() {
  window.EventBus.$on('close-pto-cash-out-form', () => {
    this.toggleEditModal = false;
    this.clickedEditItem = null;
  });
}

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
 * Event handler confirm clicked approve
 */
async function clickedConfirmApprove() {
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
} // clickedConfirmApprove

/**
 * Event handler for clicking the unapprove button on row item.
 *
 * @param item PTO cash out item
 */
function clickedUnapprove(item) {
  this.clickedUnapproveItem = item;
  this.isUnapproving = true;
  this.toggleUnapproveModal = !this.toggleUnapproveModal;
} // clickedUnapprove

/**
 * Event handler for clicking the delete button.
 *
 * @param item PTO cash out item to delete
 */
function clickedDelete(item) {
  this.clickedDeleteItem = item;
  this.isDeleting = true;
  this.toggleDeleteModal = !this.toggleDeleteModal;
} // clickedDelete

/**
 * Event handler for clicking confirm delete in delete modal.
 */
async function clickedConfirmDelete() {
  try {
    this.loading = true;
    await this.deletePTOCashOut(this.clickedDeleteItem);
    this.loading = false;
    this.displaySuccess('Successfully deleted PTO cash out!');
  } catch (err) {
    this.loading = false;
    this.displayError(err);
  }
  this.isDeleting = false;
  this.clickedDeleteItem = null;
} // clickedConfirmDelete

/**
 * Event handler for clicking cancel delete in delete modal.
 */
function clickedCancelDelete() {
  this.isDeleting = false;
} // clickedCancelDelete

/**
 * Deletes PTO cash out from database. Updates vuex store accordingly.
 *
 * @param item PTO cash out item to delete
 */
async function deletePTOCashOut(item) {
  let ptoCashOuts = _.cloneDeep(this.$store.getters.ptoCashOuts);
  ptoCashOuts = _.filter(ptoCashOuts, (p) => p.id != item.id);
  let deletedPTOCashOut = await api.deleteItem(api.PTO_CASH_OUTS, item.id);
  this.$store.dispatch('setPtoCashOuts', { ptoCashOuts });
  return deletedPTOCashOut;
} // deletePTOCashOut

/**
 * Event handler for clicking confirm unapprove from confirmation modal.
 */
async function clickedConfirmUnapprove() {
  try {
    // this.toggleUnapproveModal = false;
    this.loading = true;
    await this.unapprovePTOCashOut(this.clickedUnapproveItem);
    this.loading = false;
    this.displaySuccess('Successfully unapproved PTO cash out!');
  } catch (err) {
    this.loading = false;
    this.displayError(err);
  }
  this.isUnapproving = false;
  this.clickedUnapproveItem = null;
} // clickedConfirmUnapprove

/**
 * Unapproves PTO cash out item in the database. Removes approved date from
 * the object.
 *
 * @param item PTO cash out item to unapprove.
 */
async function unapprovePTOCashOut(item) {
  let ptoCashOut = _.cloneDeep(item);
  ptoCashOut.approvedDate = null;
  let ptoCashOuts = _.cloneDeep(this.$store.getters.ptoCashOuts);
  let index = ptoCashOuts.findIndex((p) => p.id == ptoCashOut.id);
  ptoCashOuts[index] = ptoCashOut;
  let updatedPTOCashOut = await api.updateItem(api.PTO_CASH_OUTS, ptoCashOut);
  this.$store.dispatch('setPtoCashOuts', { ptoCashOuts });
  return updatedPTOCashOut;
} // unapprovePTOCashOut

/**
 * Event handler for clicking cancel in the confirm unapprove modal.
 */
function clickedCancelUnapprove() {
  this.isUnapproving = false;
  // this.toggleUnapproveModal = !this.toggleUnapproveModal;
} // clickedCancelUnapprove

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

function rowClicked(item) {
  let employee = this.$store.getters.employees.find((e) => e.id === item.employeeId);
  window.EventBus.$emit('change-quickbooks-employee', employee);
}

/**
 * Unchecks all boxes in the data table
 */
function uncheckAllBoxes() {
  this.selected = [];
} // uncheckAllBoxes

/**
 * Returns if PTO cash out is approved, false otherwise
 *
 * @param ptoCashOut PTO Cash Out item from database
 * @return true if PTO Cash Out Item is approved, false otherwise
 */
function isApproved(ptoCashOut) {
  return ptoCashOut && ptoCashOut.approvedDate && !_.isEmpty(ptoCashOut.approvedDate);
} // isApproved

/**
 * Event handler for clicked edit item.
 *
 * @param item PTO Cash Out item to edit
 */
function clickedEdit(item) {
  this.clickedEditItem = item;
  this.toggleEditModal = true;
} // clickedEdit

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
  let filteredPtoCashOuts = _.cloneDeep(this.$store.getters.ptoCashOuts);

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
  let headers = _.cloneDeep(this.headers);
  if (!this.userRoleIsAdmin()) {
    headers = _.filter(headers, (h) => h.text != 'Employee');
  }

  if (this.unapprovedOnly) {
    headers = _.filter(headers, (h) => h.text != 'actions');
  }
  return headers;
} // roleHeaders

/**
 * Gets all employees with submitted PTO Cash Out Requests for autocomplete filter component.
 *
 * @return Array - filtered employees
 */
function employees() {
  let employeeIdsWithPTOCashOuts = this.$store.getters.ptoCashOuts
    ? this.$store.getters.ptoCashOuts.map((p) => p.employeeId)
    : [];
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
  beforeDestroy,
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
        { text: 'Approved Date', value: 'approvedDate' },
        { value: 'actions', sortable: false }
      ],
      sortBy: 'creationDate',
      sortDesc: true,
      selected: [],
      isApproving: false,
      isUnapproving: false,
      isDeleting: false,
      showApproveButton: false,
      toggleApproveModal: false,
      toggleUnapproveModal: false,
      toggleDeleteModal: false,
      toggleEditModal: false,
      clickedUnapproveItem: null,
      clickedEditItem: null
    };
  },
  methods: {
    approveSelectedPTOCashOuts,
    clickedConfirmApprove,
    clickedConfirmUnapprove,
    clickedCancelUnapprove,
    clickedDelete,
    clickedUnapprove,
    clickedCancelDelete,
    clickedConfirmDelete,
    clickedEdit,
    deletePTOCashOut,
    displayError,
    displaySuccess,
    isApproved,
    isMobile,
    userRoleIsAdmin,
    monthDayYearFormat,
    isEmpty,
    getEmployeeByID,
    firstAndLastName,
    rowClicked,
    updateStoreUser,
    updateStoreEmployees,
    updateStorePtoCashOuts,
    uncheckAllBoxes,
    unapprovePTOCashOut
  },
  mounted,
  computed: {
    roleHeaders,
    filteredPtoCashOuts,
    employees
  },
  props: ['unapprovedOnly'],
  watch: {
    selected: watchSelected
  },
  components: { GeneralConfirmationModal, UnapprovePTOCashOutModal, DeleteModal, PTOCashOutForm }
};
</script>
