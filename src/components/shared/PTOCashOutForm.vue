<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-card>
      <v-card-title class="d-flex align-center header_style text-h6">
        <h6 class="subtitle" v-if="employee && (userRoleIsAdmin() || userRoleIsManager())">
          Employee: {{ nicknameAndLastName(employee) }}
        </h6>
        <h3>Cash Out PTO</h3>
      </v-card-title>
      <div v-if="!isSubmitting && $store.getters.ptoCashOuts && pto">
        <v-card-text v-if="employee">
          <p>
            <span v-if="pto">
              <b>PTO:</b> {{ pto }}h
              <br />
            </span>
            <span v-else>PTO: Loading... <br /></span>
            <span v-if="Number(getPendingPtoCashoutAmount(employee.id)) > 0">
              <b>Pending PTO Cash Out:</b> {{ Number(getPendingPtoCashoutAmount(employee.id)) }}h
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
                ...getPTOCashOutRules(ptoData.ptoBalance, employee.id, item ? Number(item.amount) : null)
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
              location="start center"
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
                  @keypress="approvedDateMenu = false"
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
              @click="openLink('https://3.basecamp.com/3097063/buckets/179119/messages/6950289713')"
              class="mb-3"
              size="small"
            >
              <v-tooltip activator="parent" location="top">Click for more information</v-tooltip>
              <v-icon color="#3f51b5">mdi-information</v-icon>
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
import { generateUUID, openLink, userRoleIsAdmin, userRoleIsManager } from '../../utils/utils';
import { updateStoreEmployees, updateStorePtoCashOuts } from '../../utils/storeUtils';
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
  await Promise.all([
    !this.$store.getters.employees ? this.updateStoreEmployees() : '',
    !this.$store.getters.ptoCashOuts ? this.updateStorePtoCashOuts() : ''
  ]);
  this.employee = _.find(this.$store.getters.employees, (e) => e.id === this.employeeId);
  if (this.item) {
    let editingItem = _.cloneDeep(this.item);
    this.ptoCashOutObj['id'] = editingItem.id;
    this.ptoCashOutObj['employeeId'] = editingItem.employeeId;
    this.ptoCashOutObj['amount'] = Number(editingItem.amount);
    this.ptoCashOutObj['creationDate'] = editingItem.creationDate;
    this.ptoCashOutObj['approvedDate'] = editingItem.approvedDate;
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
  if (this.ptoCashOutObj.amount) {
    let amount = this.editing ? this.ptoCashOutObj.amount - this.item.amount : Number(this.ptoCashOutObj.amount);
    return `Balance after cash out: ${(this.pto - this.getPendingPtoCashoutAmount(this.employee.id) - amount).toFixed(2)}h`;
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
    employeeId: this.employee.id,
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
    this.ptoCashOutObj['id'] = editingItem.id;
    this.ptoCashOutObj['employeeId'] = editingItem.employeeId;
    this.ptoCashOutObj['amount'] = Number(editingItem.amount);
    this.ptoCashOutObj['creationDate'] = editingItem.creationDate;
    this.ptoCashOutObj['approvedDate'] = editingItem.approvedDate;
  }
} // watchEditPTOCashOutItem

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

function ptoData() {
  return {
    pendingPtoCashOutAmount: this.getPendingPtoCashoutAmount(this.employee.id),
    ptoBalance: this.pto
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
      employee: null,
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
    displaySuccess,
    displayError,
    getPendingPtoCashoutAmount,
    nicknameAndLastName,
    createPTOCashOutRequest,
    openLink,
    userRoleIsAdmin,
    userRoleIsManager,
    updateStoreEmployees,
    updateStorePtoCashOuts,
    updatePTOCashOutRequest,
    getEmployeeByID,
    format
  },
  watch: {
    'ptoCashOutObj.approvedDate': watchApprovedDate,
    item: watchEditPTOCashOutItem
  },
  computed: { ptoData },
  props: ['item', 'employeeId', 'pto', 'editing']
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
