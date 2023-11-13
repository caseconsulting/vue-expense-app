<template>
  <div v-if="$store.getters.ptoCashOuts">
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-card>
        <v-card-title class="d-flex align-center header_style text-h6">
          <h6 class="subtitle" v-if="userRoleIsAdmin() || userRoleIsManager()">
            Employee: {{ nicknameAndLastName(passedEmployee) }}
          </h6>
          <h3>Cash Out PTO</h3>
        </v-card-title>
        <div v-if="!isSubmitting">
          <v-card-text v-if="passedEmployee">
            <p>
              <span v-if="pto">
                <b>PTO:</b> {{ pto }}h
                <br />
              </span>
              <span v-else>PTO: Loading... <br /></span>
              <span v-if="Number(getPendingPtoCashoutAmount(passedEmployee.id)) > 0">
                <b>Pending PTO Cash Out:</b> {{ Number(getPendingPtoCashoutAmount(passedEmployee.id)) }}h
              </span>
            </p>
            <div>
              <!-- PTO Cash Out Amount -->
              <v-text-field
                prepend-icon="mdi-clock-outline"
                variant="underlined"
                class="py-2"
                :rules="[
                  (v) => !!v || 'Field is required',
                  ...getNumberRules(),
                  ...getPTOCashOutRules(
                    ptoData.ptoBalance,
                    passedEmployee ? passedEmployee.id : this.$store.getters.user.id,
                    item ? Number(item.amount) : null
                  )
                ]"
                :hint="cashOutHint()"
                v-model.number="ptoCashOutObj.amount"
                label="Number of Hours Requested to be Paid Out"
                required
              ></v-text-field>

              <!-- Approved Date for PTO Cash Out (Optional) -->
              <v-menu
                v-if="userRoleIsAdmin() || userRoleIsManager()"
                ref="approvedDateMenu"
                :close-on-content-click="false"
                v-model="approvedDateMenu"
                location="end center"
              >
                <template v-slot:activator="{ props }">
                  <v-text-field
                    v-model="approvedDateFormatted"
                    id="approvedDate"
                    :rules="getDateOptionalRules()"
                    v-mask="'##/##/####'"
                    variant="underlined"
                    label="Approved Date (optional)"
                    hint="MM/DD/YYYY format"
                    class="mb-4"
                    persistent-hint
                    v-bind="props"
                    @update:focused="
                      ptoCashOutObj.approvedDate = format(approvedDateFormatted, 'MM/DD/YYYY', 'YYYY-MM-DD')
                    "
                    @click:prepend="approvedDateMenu = true"
                  >
                    <template v-slot:prepend>
                      <div class="pointer">
                        <v-icon color="grey-darken-1">mdi-calendar</v-icon>
                      </div>
                    </template>
                  </v-text-field>
                </template>
                <v-date-picker
                  v-model="ptoCashOutObj.approvedDate"
                  @update:model-value="approvedDateMenu = false"
                  hide-actions
                  show-adjacent-months
                  keyboard-icon=""
                  color="#bc3825"
                  title="Approved Date"
                >
                </v-date-picker>
              </v-menu>
            </div>
            <small>
              *cash outs are paid during the normal payroll period
              <v-avatar
                @click="
                  openLink(
                    isLegacyFireTeam
                      ? 'https://3.basecamp.com/3097063/buckets/179119/messages/6450437179'
                      : 'https://3.basecamp.com/3097063/buckets/179119/messages/939259168'
                  )
                "
                class="mb-3"
                size="small"
              >
                <v-tooltip activator="parent" location="top">Click for more information</v-tooltip>
                <v-icon size="small" color="#3f51b5">mdi-information</v-icon>
              </v-avatar>
            </small>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <!-- Cancel Button -->
            <v-btn color="black" @click="cancel()" variant="text" class="mx-2"> Cancel </v-btn>
            <!-- Submit Button -->
            <v-btn variant="text" class="mx-2" color="success" :disabled="!valid" @click="submit()">
              <template v-slot:prepend>
                <v-icon>mdi-content-save</v-icon>
              </template>
              Submit
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
import { generateUUID, userRoleIsAdmin, userRoleIsManager } from '../../utils/utils';
import { updateStoreEmployees } from '../../utils/storeUtils';
import { format } from '../../shared/dateUtils';
import { mask } from 'vue-the-mask';
import { getEmployeeByID, nicknameAndLastName } from '../../shared/employeeUtils';

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
    this.passedEmployee = _.find(this.$store.getters.employees, (e) => e.id === this.item.employeeId);
    this.ptoCashOutObj['id'] = editingItem.id;
    this.ptoCashOutObj['employeeId'] = editingItem.employeeId;
    this.ptoCashOutObj['amount'] = Number(editingItem.amount);
    this.ptoCashOutObj['creationDate'] = editingItem.creationDate;
    this.ptoCashOutObj['approvedDate'] = editingItem.approvedDate;
  } else {
    if (this.employee.value) {
      this.passedEmployee = _.cloneDeep(this.employee.value);
    } else {
      this.passedEmployee = _.cloneDeep(this.employee);
    }
  }
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

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
      this.emitter.emit('close-pto-cash-out-form');
      this.clearForm();
      this.isSubmitting = false;
      if (this.item) {
        this.displaySuccess('Successfully edited PTO Cash Out request!');
      } else {
        this.displaySuccess('Successfully created PTO Cash Out request!');
      }
    }
  } catch (err) {
    this.emitter.emit('close-pto-cash-out-form');
    this.clearForm();
    this.isSubmitting = false;
    this.displayError(err);
  }
} // submit

/**
 * Opens a link in a new tab.
 *
 * @param link String - the link to open
 */
function openLink(link) {
  window.open(link, '_blank');
} // openLink

/**
 * Cancel event handler
 */
function cancel() {
  this.emitter.emit('close-pto-cash-out-form');
  this.clearForm();
} // cancel

/**
 * Clears form and resets validation.
 */
function clearForm() {
  this.ptoCashOutObj['id'] = null;
  this.ptoCashOutObj['employeeId'] = null;
  this.ptoCashOutObj['amount'] = null;
  this.ptoCashOutObj['creationDate'] = null;
  this.ptoCashOutObj['approvedDate'] = null;

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
  let employeeId;
  if (this.passedEmployee) {
    employeeId = this.passedEmployee.id;
  } else {
    employeeId = this.$store.getters.user.id;
  }
  if (this.ptoCashOutObj.amount) {
    let amount = this.editing ? this.ptoCashOutObj.amount - this.item.amount : Number(this.ptoCashOutObj.amount);
    return `Balance after cash out: ${(this.pto - this.getPendingPtoCashoutAmount(employeeId) - amount).toFixed(2)}h`;
  }
} // cashOutHint

/**
 * Creates a PTO Cash Out record in the database.
 */
async function createPTOCashOutRequest() {
  let newItem = _.cloneDeep(this.ptoCashOutObj);
  let ptoCashOut = await api.createItem(api.PTO_CASH_OUTS, {
    id: generateUUID(),
    amount: Number(newItem.amount),
    employeeId: this.passedEmployee.id,
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
    this.passedEmployee = _.find(this.$store.getters.employees, (e) => e.id === this.item.employeeId);
    this.ptoCashOutObj['id'] = editingItem.id;
    this.ptoCashOutObj['employeeId'] = editingItem.employeeId;
    this.ptoCashOutObj['amount'] = Number(editingItem.amount);
    this.ptoCashOutObj['creationDate'] = editingItem.creationDate;
    this.ptoCashOutObj['approvedDate'] = editingItem.approvedDate;
  }
} // watchEditPTOCashOutItem

/**
 * Watcher for employee prop.
 */
function watchEmployee() {
  this.passedEmployee = _.cloneDeep(this.employee.value);
} // watchEmployee

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

function ptoData() {
  let employeeId;
  if (this.passedEmployee) {
    employeeId = this.passedEmployee.employeeId;
  } else {
    employeeId = this.$store.getters.user.id;
  }

  return {
    pendingPtoCashOutAmount: this.getPendingPtoCashoutAmount(employeeId),
    ptoBalance: this.pto
  };
}

/**
 * Determines if an employee is a legacy FireTeam employee.
 *
 * @returns Boolean - whether the employee was FireTeam or not
 */
function isLegacyFireTeam() {
  if (!this.passedEmployee) {
    return parseInt(this.employee.employeeNumber, 10) < 100;
  } else {
    return parseInt(this.passedEmployee.employeeNumber, 10) < 100;
  }
} // isLegacyFireTeam

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
      approvedDateFormatted: null
    };
  },
  directives: { mask },
  methods: {
    getDateOptionalRules,
    getNumberRules,
    getRequiredRules,
    getPTOCashOutRules,
    submit,
    cancel,
    cashOutHint,
    clearForm,
    customFilter,
    displaySuccess,
    displayError,
    getPendingPtoCashoutAmount,
    nicknameAndLastName,
    createPTOCashOutRequest,
    openLink,
    userRoleIsAdmin,
    userRoleIsManager,
    updateStoreEmployees,
    updatePTOCashOutRequest,
    getEmployeeByID,
    format
  },
  watch: {
    'ptoCashOutObj.approvedDate': watchApprovedDate,
    item: watchEditPTOCashOutItem,
    'employee.value': watchEmployee
  },
  computed: { ptoData, isLegacyFireTeam },
  props: ['item', 'employee', 'pto', 'editing']
};
</script>
<style scoped>
h3 {
  line-height: 20px;
}
h5 {
  line-height: 14px;
}
.title {
  position: relative;
}
.subtitle {
  position: absolute;
  top: 8px;
  line-height: 12px;
  font-size: 12px;
}
</style>
