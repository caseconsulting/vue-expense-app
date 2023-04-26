<template>
  <div>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-card>
        <v-card-title class="header_style"><h3>Cash Out PTO</h3> </v-card-title>
        <div v-if="!isSubmitting">
          <v-card-text>
            <div v-if="ptoData.ptoBalance">PTO: {{ ptoData.ptoBalance }}h</div>
            <div v-if="ptoData.pendingPtoCashOutAmount > 0">
              Pending PTO Cash Out: {{ ptoData.pendingPtoCashOutAmount }}h
            </div>
            <v-row v-if="userRoleIsAdmin()">
              <v-col col="12">
                <!-- Employee picker if admin -->
                <v-autocomplete
                  v-if="userRoleIsAdmin()"
                  :items="activeEmployees"
                  :rules="getRequiredRules()"
                  :filter="customFilter"
                  v-model="ptoCashOutObj.employeeId"
                  item-text="text"
                  label="Employee"
                  id="employeeName"
                  class="form_padding"
                ></v-autocomplete>
              </v-col>
            </v-row>
            <v-row>
              <v-col col="12">
                <!-- PTO Cash Out Amount -->
                <v-text-field
                  prepend-icon="mdi-clock-outline"
                  class="pt-5"
                  :rules="[
                    (v) => !!v || 'Field is required',
                    ...getNumberRules(),
                    ...getPTOCashOutRules(userAvailablePTO, this.$store.getters.user.id)
                  ]"
                  :hint="cashOutHint()"
                  v-model="ptoCashOutObj.amount"
                  label="Number of Hours Requested to be Paid Out"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row v-if="userRoleIsAdmin()">
              <v-col col="12">
                <!-- Approved Date for PTO Cash Out (Optional) -->
                <v-menu
                  v-if="userRoleIsAdmin()"
                  ref="approvedDateMenu"
                  :close-on-content-click="false"
                  v-model="approvedDateMenu"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      v-model="approvedDateFormatted"
                      id="approvedDate"
                      :rules="getDateOptionalRules()"
                      v-mask="'##/##/####'"
                      label="Approved Date (optional)"
                      hint="MM/DD/YYYY format "
                      persistent-hint
                      prepend-icon="event"
                      @blur="ptoCashOutObj.approvedDate = format(approvedDateFormatted, 'MM/DD/YYYY', 'YYYY-MM-DD')"
                      @input="approvedDateMenu = false"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="ptoCashOutObj.approvedDate"
                    no-title
                    @input="approvedDateMenu = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <!-- Cancel Button -->
            <v-btn color="white " @click="cancel()" class="ma-2" elevation="2">
              <v-icon class="mr-1">cancel</v-icon>Cancel
            </v-btn>
            <!-- Submit Button -->
            <v-btn outlined class="ma-2" color="success" :disabled="!valid" @click="submit()">
              <v-icon class="mr-1">save</v-icon>Submit
            </v-btn>
          </v-card-actions>
        </div>
        <div v-else class="py-10 px-6">
          <v-progress-linear :indeterminate="true"></v-progress-linear>
        </div>
      </v-card>
    </v-form>
  </div>
</template>
<script>
import {
  getNumberRules,
  getRequiredRules,
  getPTOCashOutRules,
  getDateOptionalRules
} from '@/shared/validationUtils.js';
import api from '@/shared/api.js';
import dateUtils from '@/shared/dateUtils.js';
import { v4 as uuid } from 'uuid';
import { userRoleIsAdmin } from '../../utils/utils';
import { updateStoreEmployees } from '../../utils/storeUtils';
import employeeUtils from '../../shared/employeeUtils';
import { format } from '../../shared/dateUtils';
import { mask } from 'vue-the-mask';
import { getEmployeeByID } from '../../shared/employeeUtils';

import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Created lifecycle hook
 */
async function created() {
  if (!this.$store.getters.employees) {
    await this.updateStoreEmployees();
  }
  if (this.item) {
    let editingItem = _.cloneDeep(this.item);
    this.$set(this.ptoCashOutObj, 'id', editingItem.id);
    this.$set(this.ptoCashOutObj, 'employeeId', editingItem.employeeId);
    this.$set(this.ptoCashOutObj, 'amount', editingItem.amount);
    this.$set(this.ptoCashOutObj, 'creationDate', editingItem.creationDate);
    this.$set(this.ptoCashOutObj, 'approvedDate', editingItem.approvedDate);
  }
  this.setActiveEmployeesDropdown();
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits a message and data if it exists.
 *
 * @param msg - Message to emit
 */
function emit(msg) {
  window.EventBus.$emit(msg);
} // emit

/**
 * Submit event handler. Validates form and creates a PTO Cash Out record
 * in the database.
 */
async function submit() {
  try {
    this.valid = this.$refs.form.validate();
    if (this.valid) {
      this.isSubmitting = true;
      if (this.item) {
        await this.updatePTOCashOutRequest();
      } else {
        await this.createPTOCashOutRequest();
      }
      emit('close-pto-cash-out-form');
      this.clearForm();
      this.isSubmitting = false;
      if (this.item) {
        this.displaySuccess('Successfully edited PTO Cash Out request!');
      } else {
        this.displaySuccess('Successfully created PTO Cash Out request!');
      }
    }
  } catch (err) {
    emit('close-pto-cash-out-form');
    this.clearForm();
    this.isSubmitting = false;
    this.displayError(err);
  }
} // submit

/**
 * Cancel event handler
 */
function cancel() {
  emit('close-pto-cash-out-form');
  this.clearForm();
} // cancel

/**
 * Clears form and resets validation.
 */
function clearForm() {
  this.$set(this.ptoCashOutObj, 'id', null);
  this.$set(this.ptoCashOutObj, 'employeeId', null);
  this.$set(this.ptoCashOutObj, 'amount', null);
  this.$set(this.ptoCashOutObj, 'creationDate', null);
  this.$set(this.ptoCashOutObj, 'approvedDate', null);

  this.approvedDateFormatted = null;
  this.$refs.form.reset();
  this.$refs.form.resetValidation();
} // clearForm

/**
 * Custom filter for employee autocomplete options.
 *
 * @param item - employee
 * @param queryText - text used for filtering
 * @return string - filtered employee name
 */
function customFilter(item, queryText) {
  const query = queryText ? queryText : '';
  const nickNameFullName = item.nickname ? `${item.nickname} ${item.lastName}` : '';
  const firstNameFullName = `${item.firstName} ${item.lastName}`;

  const queryContainsNickName = nickNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase()) >= 0;
  const queryContainsFirstName =
    firstNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase()) >= 0;

  return queryContainsNickName || queryContainsFirstName;
} // customFilter

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
/**
 * Gets the user's available PTO balance.
 * 
 * @param employeeNumber employee's employee number to get PTO balance for
 * @returns Number - The available PTO balance
 */
function getPtoBalance(employeeNumber) {
  return this.$store.getters.quickbooksPTO.results.users[employeeNumber]
    ? this.$store.getters.quickbooksPTO.results.users[employeeNumber].pto_balances.PTO
    : null;
} // getPtoBalance

/**
 * Gets the user's pending PTO cash out amount
 *
 * @param employeeId employee's employee ID to get PTO balances for
 * @returns Number - The pending cash out amount
 */
function getPendingPtoCashoutAmount(employeeId) {
  let pendingPtoCashOuts = this.$store.getters.ptoCashOuts.filter(
    (p) => !p.approvedDate && employeeId === p.employeeId
  );
  return pendingPtoCashOuts.reduce((n, { amount }) => n + amount, 0);
} // getPendingPtoCashoutAmount

/**
 * Shows the PTO available after the requested cash out amount.
 *
 * @returns String - The hint text
 */
function cashOutHint() {
  if (this.ptoCashOutObj.amount) {
    return `Balance after cash out: ${
      this.getPtoBalance() - this.getPendingPtoCashoutAmount() - this.ptoCashOutObj.amount
    }h`;
  }
} // cashOutHint

/**
 * Creates a PTO Cash Out record in the database.
 */
async function createPTOCashOutRequest() {
  let newItem = _.cloneDeep(this.ptoCashOutObj);
  let ptoCashOut = await api.createItem(api.PTO_CASH_OUTS, {
    id: uuid(),
    amount: newItem.amount,
    employeeId: newItem.employeeId ? newItem.employeeId : this.$store.getters.user.id,
    creationDate: dateUtils.getTodaysDate(),
    approvedDate: newItem.approvedDate ? newItem.approvedDate : null
  });
  this.$store.dispatch('setPtoCashOuts', { ptoCashOuts: [...this.$store.getters.ptoCashOuts, ptoCashOut] });
} // createPTOCashOutRequest

/**
 * Update PTO Cash Out record in the database.
 */
async function updatePTOCashOutRequest() {
  let ptoCashOuts = _.cloneDeep(this.$store.getters.ptoCashOuts);
  let editedItem = _.cloneDeep(this.ptoCashOutObj);
  let index = ptoCashOuts.findIndex((p) => p.id == editedItem.id);
  ptoCashOuts[index] = editedItem;
  await api.updateItem(api.PTO_CASH_OUTS, {
    ...editedItem
  });
  this.$store.dispatch('setPtoCashOuts', { ptoCashOuts: ptoCashOuts });
} // updatePTOCashOutRequest

/**
 * Populates the active employee dropdown
 */
function setActiveEmployeesDropdown() {
  let employees = this.$store.getters.employees;
  employees = employees.map((employee) => {
    return {
      text: employeeUtils.nicknameAndLastName(employee),
      value: employee.id,
      workStatus: employee.workStatus,
      firstName: employee.firstName,
      nickname: employee.nickname,
      lastName: employee.lastName,
      employeeRole: employee.employeeRole
    };
  });
  this.activeEmployees = employees.map((employee) => {
    if (employee.workStatus == 0) {
      return;
    } else {
      return employee;
    }
  });
  this.activeEmployees = _.compact(this.activeEmployees);
} // setActiveEmployeesDropdown

/**
 * Watcher for ptoCashOutObj.approvedDate - format date.
 */
function watchApprovedDate() {
  this.approvedDateFormatted =
    this.format(this.ptoCashOutObj.approvedDate, null, 'MM/DD/YYYY') || this.approvedDateFormatted;
  if (this.ptoCashOutObj.approvedDate !== null && !this.format(this.ptoCashOutObj.approvedDate, null, 'MM/DD/YYYY')) {
    this.ptoCashOutObj.approvedDate = null;
  }
} // watchApprovedDate

/**
 * Watcher for item prop.
 */
function watchEditPTOCashOutItem() {
  if (this.item) {
    let editingItem = _.cloneDeep(this.item);
    this.$set(this.ptoCashOutObj, 'id', editingItem.id);
    this.$set(this.ptoCashOutObj, 'employeeId', editingItem.employeeId);
    this.$set(this.ptoCashOutObj, 'amount', editingItem.amount);
    this.$set(this.ptoCashOutObj, 'creationDate', editingItem.creationDate);
    this.$set(this.ptoCashOutObj, 'approvedDate', editingItem.approvedDate);
  }
} // watchEditPTOCashOutItem

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

function ptoData() {
  let employeeNumber;
  let employeeId;
  if (this.ptoCashOutObj.employeeId) {
    employeeNumber = this.getEmployeeByID(this.ptoCashOutObj.employeeId, this.$store.getters.employees).employeeNumber;
    employeeId = this.ptoCashOutObj.employeeId;
  } else {
    employeeNumber = this.$store.getters.user.employeeNumber;
    employeeId = this.$store.getters.user.id;
  }

  return {
    pendingPtoCashOutAmount: this.getPendingPtoCashoutAmount(employeeId),
    ptoBalance: this.getPtoBalance(employeeNumber)
  };
}

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|
export default {
  created,
  data() {
    return {
      show: false,
      ptoCashOutObj: { approvedDate: null },
      valid: false,
      isSubmitting: false,
      approvedDateMenu: false,
      approvedDateFormatted: null,
      activeEmployees: [],
      userAvailablePTO:
        this.$store.getters.quickbooksPTO.results.users[this.$store.getters.user.employeeNumber]['pto_balances'].PTO
    };
  },
  directives: { mask },
  methods: {
    getDateOptionalRules,
    getNumberRules,
    getRequiredRules,
    getPTOCashOutRules,
    emit,
    submit,
    cancel,
    cashOutHint,
    clearForm,
    customFilter,
    displaySuccess,
    displayError,
    getPendingPtoCashoutAmount,
    getPtoBalance,
    createPTOCashOutRequest,
    userRoleIsAdmin,
    setActiveEmployeesDropdown,
    updateStoreEmployees,
    updatePTOCashOutRequest,
    getEmployeeByID,
    format
  },
  watch: {
    'ptoCashOutObj.approvedDate': watchApprovedDate,
    item: watchEditPTOCashOutItem
  },
  computed: { ptoData },
  props: ['item']
};
</script>
