<template>
  <v-card class="pt-3">
    <v-container fluid>
      <!-- Title -->
      <v-card-title v-if="!isMobile()" class="pb-8">
        <div
          v-if="(userRoleIsAdmin() || userRoleIsManager()) && unapprovedOnly && !loading"
          class="d-flex justify-space-between"
        >
          <h3 class="d-inline-block pa-1">Unapproved PTO Cash Outs</h3>
          <v-btn
            @click="toggleApproveModal = true"
            id="custom-button-color"
            :loading="isApproving"
            :disabled="!showApproveButton"
            class="reimburse_button px-4"
          >
            <template v-slot:prepend>
              <v-icon>mdi-currency-usd</v-icon>
            </template>
            Approve
          </v-btn>
        </div>
        <h3 v-else-if="(userRoleIsAdmin() || userRoleIsManager()) && !loading">All PTO Cash Outs</h3>
        <h3 v-else-if="!loading">My PTO Cash Outs</h3>
        <h3 v-else>Loading...</h3>
      </v-card-title>
      <div v-else>
        <v-card-title class="px-0">
          <div v-if="(userRoleIsAdmin() || userRoleIsManager()) && unapprovedOnly && !loading">
            <h3>Unapproved PTO Cash Outs</h3>
            <v-btn
              @click="toggleApproveModal = true"
              id="custom-button-color"
              :loading="isApproving"
              v-show="showApproveButton"
              size="large"
              fixed
              class="reimburse_button"
            >
              <v-icon>mdi-currency-usd</v-icon>
            </v-btn>
          </div>
          <h3 v-else-if="(userRoleIsAdmin() || userRoleIsManager()) && !loading">All PTO Cash Outs</h3>
          <h3 v-else-if="!loading">My PTO Cash Outs</h3>
          <h3 v-else>Loading...</h3>
        </v-card-title>
      </div>

      <!-- Filters -->
      <fieldset v-if="!unapprovedOnly" class="filter_border">
        <legend class="legend_style">Filters</legend>
        <v-row class="d-flex align-end">
          <v-col cols="12" sm="12" md="4" lg="4" xl="4">
            <!-- Approved Filter -->
            <div class="px-4 pt-4 pb-md-4 pb-lg-4 pb-xl-4 pb-xxl-4">
              <h4>Status:</h4>
              <v-btn-toggle color="primary" class="filter_color" v-model="filter.approved" text mandatory>
                <!-- Show Approved -->
                <v-btn value="approved" variant="text">
                  <v-tooltip activator="parent" location="top">Show Approved</v-tooltip>
                  <v-icon size="x-large" id="showApproved" class="mr-1">
                    mdi-check-circle{{ filter.approved.includes('approved') ? '' : '-outline' }}
                  </v-icon>
                </v-btn>

                <!-- Show Pending -->
                <v-btn value="notApproved" variant="text">
                  <v-tooltip activator="parent" location="top">Show Pending</v-tooltip>
                  <v-icon size="x-large" id="showPending">
                    mdi-close-circle{{ filter.approved.includes('notApproved') ? '' : '-outline' }}
                  </v-icon>
                </v-btn>

                <!-- Show Reimbursed and Pending -->
                <v-btn id="bothApproved" value="both" variant="text">
                  <v-tooltip activator="parent" location="top">Show All</v-tooltip>
                  <p class="ma-0" :class="filter.approved.includes('both') ? 'font-weight-black' : ''">BOTH</p>
                </v-btn>
              </v-btn-toggle>
            </div>
          </v-col>
          <v-col cols="12" sm="12" md="4" lg="4" xl="4">
            <!-- Employee Filter -->
            <v-autocomplete
              v-if="userRoleIsAdmin() || userRoleIsManager()"
              hide-details
              :items="employees"
              :customFilter="customFilter"
              v-model="filteredEmployee"
              item-title="text"
              id="employeeIdFilter"
              variant="underlined"
              class="ml-5 ml-md-0 ml-lg-0 ml-xl-0 ml-xxl-0 mr-5 py-0 pb-md-4 pb-lg-4 pb-xl-4 pb-xxl-4"
              label="Filter by Employee"
              clearable
            ></v-autocomplete>
          </v-col>
          <v-col cols="12" sm="12" md="4" lg="4" xl="4" xxl="4">
            <!-- Tag Filter -->
            <v-autocomplete
              v-if="userRoleIsAdmin() || userRoleIsManager()"
              clearable
              hide-details
              label="Filter by Tag (click to flip)"
              v-model="selectedTags"
              :items="tags"
              multiple
              class="ml-5 ml-md-0 ml-lg-0 ml-xl-0 ml-xxl-0 mr-5 pt-0 pb-4"
              variant="underlined"
              item-title="tagName"
              item-value="id"
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
        </v-row>
      </fieldset>
      <br />
      <!-- End Filters -->
      <!-- PTO Cash Outs Data Table -->
      <v-data-table
        v-model="selected"
        :headers="roleHeaders"
        :sort-by="sortBy"
        :items="filteredPtoCashOuts"
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
          <td v-if="userRoleIsAdmin() || userRoleIsManager()">
            {{ item.employeeName }}
          </td>
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
          <td v-if="!unapprovedOnly" class="layout mr-0">
            <!-- Edit Button -->
            <v-btn
              :disabled="isUnapproving || isDeleting || !!item.approvedDate"
              variant="text"
              icon=""
              id="edit"
              @click.stop
              @click="clickedEdit(item)"
            >
              <v-tooltip activator="parent" location="top">Edit</v-tooltip>
              <v-icon class="case-gray">mdi-pencil</v-icon>
            </v-btn>

            <!-- Delete Button -->
            <v-btn
              :disabled="isUnapproving || isDeleting || !!item.approvedDate"
              @click="clickedDelete(item)"
              variant="text"
              icon
              id="delete"
            >
              <v-tooltip activator="parent" location="top">Delete</v-tooltip>
              <v-icon class="case-gray"> mdi-delete </v-icon>
            </v-btn>
          </td>
        </template>
      </v-data-table>
    </v-container>
    <general-confirmation-modal
      title="Are you sure you want to approve selected PTO cash outs?"
      type="pto-cash-outs"
      :toggleModal="toggleApproveModal"
    />
    <delete-modal :toggleDeleteModal="toggleDeleteModal" type="PTO cash out" />
    <v-dialog v-model="toggleEditModal" persistent max-width="500">
      <p-t-o-cash-out-form
        :employeeId="clickedEditItem?.employeeId"
        :item="clickedEditItem"
        :pto="userPto"
        :editing="true"
      />
    </v-dialog>
  </v-card>
</template>
<script>
import { formatNumber, isMobile, userRoleIsAdmin, userRoleIsManager, monthDayYearFormat, isEmpty } from '@/utils/utils';
import { getEmployeeByID, nicknameAndLastName } from '@/shared/employeeUtils';
import api from '@/shared/api.js';
import { updateStoreUser, updateStoreEmployees, updateStorePtoCashOuts, updateStoreTags } from '@/utils/storeUtils';
import _ from 'lodash';
import GeneralConfirmationModal from '../modals/GeneralConfirmationModal.vue';
import dateUtils from '@/shared/dateUtils';
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
  let promises = [];
  if (!this.$store.getters.employees) {
    promises.push(this.updateStoreEmployees());
  }
  if (!this.$store.getters.user) {
    promises.push(this.updateStoreUser());
  }
  if (!this.$store.getters.ptoCashOuts) {
    promises.push(this.updateStorePtoCashOuts());
  }
  if (!this.$store.getters.tags && (userRoleIsAdmin() || userRoleIsManager())) {
    promises.push(this.updateStoreTags());
  }
  if (promises.length > 0) {
    await Promise.all(promises);
  }
  this.tags = this.$store.getters.tags; // get the tags
  this.loading = false;
} // created¬

/**
 * beforeUnmount lifecycle hook. Destroys all event listeners.
 */
function beforeUnmount() {
  this.emitter.off('confirm-pto-cash-outs');
  this.emitter.off('canceled-pto-cash-outs');
  this.emitter.off('confirm-delete-PTO cash out');
  this.emitter.off('canceled-delete-PTO cash out');
  this.emitter.off('close-pto-cash-out-form');
} // beforeUnmount

/**
 * Mounted lifecycle hook
 */
async function mounted() {
  this.emitter.on('close-pto-cash-out-form', () => {
    this.toggleEditModal = false;
    this.clickedEditItem = null;
    this.userPto = null;
  });
  this.emitter.on('confirmed-pto-cash-outs', async () => {
    await this.clickedConfirmApprove();
  });
  this.emitter.on('canceled-pto-cash-outs', () => {
    this.toggleApproveModal = false;
  });
  this.emitter.on('confirm-delete-PTO cash out', async () => {
    await this.clickedConfirmDelete();
  });
  this.emitter.on('canceled-delete-PTO cash out', () => {
    this.clickedCancelDelete();
  });
} // mounted

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
    let item = _.find(this.filteredPtoCashOuts, (f) => f.id === e);
    item['approvedDate'] = dateUtils.getTodaysDate();
    item['approvalWasSeen'] = false;
    promises.push(api.updateItem(api.PTO_CASH_OUTS, item));
  });
  return await Promise.all(promises);
} // approveSelectedPTOCashOuts

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
 * Event handler confirm clicked approve
 */
async function clickedConfirmApprove() {
  try {
    this.isApproving = true;
    await this.approveSelectedPTOCashOuts();
    await this.updateStorePtoCashOuts();
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
  this.toggleDeleteModal = false;
} // clickedConfirmDelete

/**
 * Event handler for clicking cancel delete in delete modal.
 */
function clickedCancelDelete() {
  this.isDeleting = false;
  this.toggleDeleteModal = false;
} // clickedCancelDelete

/**
 * Custom filter for employee autocomplete options.
 *
 * @param item - employee
 * @param queryText - text used for filtering
 * @return string - filtered employee name
 */
function customFilter(itemValue, queryText, itemObject) {
  const item = itemObject.raw;
  const query = queryText ? queryText : '';
  const nickNameFullName = item.nickname ? `${item.nickname} ${item.lastName}` : '';
  const firstNameFullName = `${item.firstName} ${item.lastName}`;

  const queryContainsNickName = nickNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase()) >= 0;
  const queryContainsFirstName =
    firstNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase()) >= 0;

  return queryContainsNickName || queryContainsFirstName;
} // customFilter

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

  this.emitter.emit('status-alert', status);
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
  this.emitter.emit('status-alert', status);
} // displaySuccess

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
 * Changes the timesheets employee when a row is clicked
 *
 * @param item Object - The item from the row clicked
 */
function rowClicked(_, { item }) {
  let employee = this.$store.getters.employees.find((e) => e.id === item.employeeId);
  this.emitter.emit('change-timesheets-employee', employee);
} // rowClicked

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
async function clickedEdit(item) {
  this.clickedEditItem = item;
  this.toggleEditModal = true;
  let employee = _.find(this.$store.getters.employees, (e) => e.id === item.employeeId);
  let employeeBalances = await api.getTimesheetsData(employee.employeeNumber, { code: 1 });
  let pto = employeeBalances?.ptoBalances?.PTO / 60 / 60 || 0;
  this.userPto = this.formatNumber(pto);
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
  // filter tags
  if (this.selectedTags.length > 0) {
    filteredPtoCashOuts = _.filter(filteredPtoCashOuts, (p) => {
      let inTag, tagFlipped;
      for (let i = 0; i < this.selectedTags.length; i++) {
        inTag = this.selectedTags[i].employees.includes(p.employeeId);
        tagFlipped = this.tagFlip.includes(this.selectedTags[i].id);
        if (inTag != tagFlipped) {
          return true;
        }
      }
      return false;
    });
  }

  if (this.filter.approved === 'notApproved' || this.unapprovedOnly) {
    filteredPtoCashOuts = _.filter(filteredPtoCashOuts, (p) => p.approvedDate == null);
  } else if (this.filter.approved === 'approved') {
    filteredPtoCashOuts = _.filter(filteredPtoCashOuts, (p) => p.approvedDate != null);
  }
  if (this.$store.getters.employees) {
    filteredPtoCashOuts.forEach((p, index) => {
      filteredPtoCashOuts[index].employeeName = this.nicknameAndLastName(
        this.getEmployeeByID(p.employeeId, this.$store.getters.employees)
      );
    });
  }
  return filteredPtoCashOuts;
} // filteredPtoCashOuts

/**
 * Gets the datatable headers based on user's role. Returns all headers if user role is admin.
 * Otherwise returns all but 'Employee' header.
 *
 * @return Array - datatable headers
 */
function roleHeaders() {
  let headers = _.cloneDeep(this.headers);
  if (!(userRoleIsAdmin() || userRoleIsManager())) {
    headers = _.filter(headers, (h) => h.title != 'Employee');
  }

  if (this.unapprovedOnly) {
    headers = _.filter(headers, (h) => h.title != 'actions');
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
      text: nicknameAndLastName(e),
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
} // watchSelectedTags

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  beforeUnmount,
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
        { title: 'Creation Date', key: 'creationDate' },
        { title: 'Employee', key: 'employeeId' },
        { title: 'Amount', key: 'amount' },
        { title: 'Approved Date', key: 'approvedDate' },
        { key: 'actions', sortable: false }
      ],
      sortBy: [{ key: 'creationDate', order: 'desc' }],
      sortDesc: true,
      selected: [],
      selectedTags: [],
      tagFlip: [],
      tags: [],
      isApproving: false,
      isUnapproving: false,
      isDeleting: false,
      showApproveButton: false,
      toggleApproveModal: false,
      toggleDeleteModal: false,
      toggleEditModal: false,
      clickedEditItem: null,
      userPto: null
    };
  },
  methods: {
    approveSelectedPTOCashOuts,
    chipColor,
    clickedConfirmApprove,
    clickedDelete,
    clickedCancelDelete,
    clickedConfirmDelete,
    clickedEdit,
    customFilter,
    deletePTOCashOut,
    displayError,
    displaySuccess,
    formatNumber,
    isApproved,
    isMobile,
    isEmpty,
    getEmployeeByID,
    monthDayYearFormat,
    nicknameAndLastName,
    negateTag,
    removeTag,
    rowClicked,
    updateStoreUser,
    updateStoreEmployees,
    updateStorePtoCashOuts,
    updateStoreTags,
    uncheckAllBoxes,
    userRoleIsAdmin,
    userRoleIsManager
  },
  mounted,
  computed: {
    roleHeaders,
    filteredPtoCashOuts,
    employees
  },
  props: ['unapprovedOnly'],
  watch: {
    selected: watchSelected,
    selectedTags: watchSelectedTags
  },
  components: { GeneralConfirmationModal, DeleteModal, PTOCashOutForm }
};
</script>
