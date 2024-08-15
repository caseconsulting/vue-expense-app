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
              :custom-filter="employeeFilter"
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
            <tags-filter
              v-if="userRoleIsAdmin() || userRoleIsManager()"
              classProps="ml-5 ml-md-0 ml-lg-0 ml-xl-0 ml-xxl-0 mr-5 pt-0 pb-4"
              v-model="tagsInfo"
            ></tags-filter>
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

<script setup>
import { formatNumber, isMobile, userRoleIsAdmin, userRoleIsManager, monthDayYearFormat } from '@/utils/utils';
import { getEmployeeByID, nicknameAndLastName } from '@/shared/employeeUtils';
import { employeeFilter } from '@/shared/filterUtils';
import api from '@/shared/api.js';
import { updateStoreUser, updateStoreEmployees, updateStorePtoCashOuts, updateStoreTags } from '@/utils/storeUtils';
import _cloneDeep from 'lodash/cloneDeep';
import _filter from 'lodash/filter';
import _map from 'lodash/map';
import _find from 'lodash/find';
import GeneralConfirmationModal from '../modals/GeneralConfirmationModal.vue';
import dateUtils from '@/shared/dateUtils';
import DeleteModal from '../modals/DeleteModal.vue';
import PTOCashOutForm from './PTOCashOutForm.vue';
import TagsFilter from '@/components/shared/TagsFilter.vue';
import { computed, inject, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useDisplayError, useDisplaySuccess } from '@/components/shared/StatusSnackbar.vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['unapprovedOnly']);
const store = useStore();
const emitter = inject('emitter');
const loading = ref(true);
const filteredEmployee = ref(null);
const filter = ref({
  approved: 'notApproved'
});
const headersList = [
  { title: 'Creation Date', key: 'creationDate' },
  { title: 'Employee', key: 'employeeId' },
  { title: 'Amount', key: 'amount' },
  { title: 'Approved Date', key: 'approvedDate' },
  { key: 'actions', sortable: false }
];
const sortBy = ref([{ key: 'creationDate', order: 'desc' }]);
const selected = ref([]);
const tagsInfo = ref({
  selected: [],
  flipped: []
});
const isApproving = ref(false);
const isUnapproving = ref(false);
const isDeleting = ref(false);
const showApproveButton = ref(false);
const toggleApproveModal = ref(false);
const toggleDeleteModal = ref(false);
const toggleEditModal = ref(false);
const clickedEditItem = ref(null);
const clickedDeleteItem = ref(null);
const userPto = ref(null);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Created lifecycle hook
 */
onBeforeMount(async () => {
  let promises = [];
  if (!store.getters.employees) {
    promises.push(updateStoreEmployees());
  }
  if (!store.getters.user) {
    promises.push(updateStoreUser());
  }
  if (!store.getters.ptoCashOuts) {
    promises.push(updateStorePtoCashOuts());
  }
  if (!store.getters.tags && (userRoleIsAdmin() || userRoleIsManager())) {
    promises.push(updateStoreTags());
  }
  if (promises.length > 0) {
    await Promise.all(promises);
  }
  loading.value = false;
}); // created¬

/**
 * beforeUnmount lifecycle hook. Destroys all event listeners.
 */
onBeforeUnmount(() => {
  emitter.off('confirmed-pto-cash-outs');
  emitter.off('confirm-delete-PTO cash out');
  emitter.off('canceled-delete-PTO cash out');
  emitter.off('close-pto-cash-out-form-table');
}); // beforeUnmount

/**
 * Mounted lifecycle hook
 */
onMounted(async () => {
  emitter.on('close-pto-cash-out-form-table', () => {
    toggleEditModal.value = false;
    clickedEditItem.value = null;
    userPto.value = null;
  });
  emitter.on('confirmed-pto-cash-outs', async () => {
    await clickedConfirmApprove();
  });
  emitter.on('confirm-delete-PTO cash out', async () => {
    await clickedConfirmDelete();
  });
  emitter.on('canceled-delete-PTO cash out', () => {
    clickedCancelDelete();
  });
}); // mounted

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
const filteredPtoCashOuts = computed(() => {
  let filteredPtoCashOuts = _cloneDeep(store.getters.ptoCashOuts);

  if (filteredEmployee.value) {
    filteredPtoCashOuts = _filter(filteredPtoCashOuts, (p) => p.employeeId == filteredEmployee.value);
  }
  // filter tags
  if (tagsInfo.value.selected.length > 0) {
    filteredPtoCashOuts = _filter(filteredPtoCashOuts, (p) => {
      let inTag, tagFlipped;
      for (let i = 0; i < tagsInfo.value.selected.length; i++) {
        inTag = tagsInfo.value.selected[i].employees.includes(p.employeeId);
        tagFlipped = tagsInfo.value.flipped.includes(tagsInfo.value.selected[i].id);
        if (inTag != tagFlipped) {
          return true;
        }
      }
      return false;
    });
  }

  if (filter.value.approved === 'notApproved' || props.unapprovedOnly) {
    filteredPtoCashOuts = _filter(filteredPtoCashOuts, (p) => p.approvedDate == null);
  } else if (filter.value.approved === 'approved') {
    filteredPtoCashOuts = _filter(filteredPtoCashOuts, (p) => p.approvedDate != null);
  }
  if (store.getters.employees) {
    filteredPtoCashOuts.forEach((p, index) => {
      filteredPtoCashOuts[index].employeeName = nicknameAndLastName(
        getEmployeeByID(p.employeeId, store.getters.employees)
      );
    });
  }
  return filteredPtoCashOuts;
}); // filteredPtoCashOuts

/**
 * Gets the datatable headers based on user's role. Returns all headers if user role is admin.
 * Otherwise returns all but 'Employee' header.
 *
 * @return Array - datatable headers
 */
const roleHeaders = computed(() => {
  let headers = _cloneDeep(headersList);
  if (!(userRoleIsAdmin() || userRoleIsManager())) {
    headers = _filter(headers, (h) => h.title != 'Employee');
  }

  if (props.unapprovedOnly) {
    headers = _filter(headers, (h) => h.title != 'actions');
  }
  return headers;
}); // roleHeaders

/**
 * Gets all employees with submitted PTO Cash Out Requests for autocomplete filter component.
 *
 * @return Array - filtered employees
 */
const employees = computed(() => {
  let employeeIdsWithPTOCashOuts = store.getters.ptoCashOuts ? store.getters.ptoCashOuts.map((p) => p.employeeId) : [];
  return _map(
    _filter(store.getters.employees, (e) => employeeIdsWithPTOCashOuts.includes(e.id)),
    (e) => ({
      text: nicknameAndLastName(e),
      value: e.id,
      nickname: e.nickname ? e.nickname : '',
      firstName: e.firstName,
      lastName: e.lastName
    })
  );
}); // employees

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Watcher for selected items
 */
watch(selected, () => {
  if (selected.value.length == 0) {
    showApproveButton.value = false;
  } else {
    showApproveButton.value = true;
  }
}); // watchSelected

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
  selected.value.forEach((e) => {
    let item = _find(filteredPtoCashOuts.value, (f) => f.id === e);
    item['approvedDate'] = dateUtils.getTodaysDate();
    item['approvalWasSeen'] = false;
    promises.push(api.updateItem(api.PTO_CASH_OUTS, item));
  });
  return await Promise.all(promises);
} // approveSelectedPTOCashOuts

/**
 * Event handler confirm clicked approve
 */
async function clickedConfirmApprove() {
  try {
    isApproving.value = true;
    await approveSelectedPTOCashOuts();
    await updateStorePtoCashOuts();
    isApproving.value = false;
    useDisplaySuccess('Successfully approved PTO cash outs!');
    uncheckAllBoxes();
  } catch (err) {
    isApproving.value = false;
    useDisplayError(err);
  }
  toggleApproveModal.value = false;
} // clickedConfirmApprove

/**
 * Event handler for clicking the delete button.
 *
 * @param item PTO cash out item to delete
 */
function clickedDelete(item) {
  clickedDeleteItem.value = item;
  isDeleting.value = true;
  toggleDeleteModal.value = !toggleDeleteModal.value;
} // clickedDelete

/**
 * Event handler for clicking confirm delete in delete modal.
 */
async function clickedConfirmDelete() {
  try {
    loading.value = true;
    await deletePTOCashOut(clickedDeleteItem.value);
    loading.value = false;
    useDisplaySuccess('Successfully deleted PTO cash out!');
  } catch (err) {
    loading.value = false;
    useDisplayError(err);
  }
  isDeleting.value = false;
  clickedDeleteItem.value = null;
  toggleDeleteModal.value = false;
} // clickedConfirmDelete

/**
 * Event handler for clicking cancel delete in delete modal.
 */
function clickedCancelDelete() {
  isDeleting.value = false;
  toggleDeleteModal.value = false;
} // clickedCancelDelete

/**
 * Deletes PTO cash out from database. Updates vuex store accordingly.
 *
 * @param item PTO cash out item to delete
 */
async function deletePTOCashOut(item) {
  let ptoCashOuts = _cloneDeep(store.getters.ptoCashOuts);
  ptoCashOuts = _filter(ptoCashOuts, (p) => p.id != item.id);
  let deletedPTOCashOut = await api.deleteItem(api.PTO_CASH_OUTS, item.id);
  store.dispatch('setPtoCashOuts', { ptoCashOuts });
  return deletedPTOCashOut;
} // deletePTOCashOut

/**
 * Changes the timesheets employee when a row is clicked
 *
 * @param item Object - The item from the row clicked
 */
function rowClicked(_, { item }) {
  let employee = store.getters.employees.find((e) => e.id === item.employeeId);
  emitter.emit('change-timesheets-employee', employee);
} // rowClicked

/**
 * Unchecks all boxes in the data table
 */
function uncheckAllBoxes() {
  selected.value = [];
} // uncheckAllBoxes

/**
 * Event handler for clicked edit item.
 *
 * @param item PTO Cash Out item to edit
 */
async function clickedEdit(item) {
  clickedEditItem.value = item;
  toggleEditModal.value = true;
  let tempEmployee = _find(store.getters.employees, (e) => e.id === item.employeeId);
  let employeeBalances = await api.getTimesheetsData(tempEmployee.employeeNumber, {
    code: 1,
    employeeId: tempEmployee.id
  });
  let pto = employeeBalances?.ptoBalances?.PTO / 60 / 60 || 0;
  userPto.value = formatNumber(pto);
} // clickedEdit
</script>
