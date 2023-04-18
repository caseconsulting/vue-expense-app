<template>
  <div>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-card>
        <v-card-title class="header_style"><h3>Cash Out PTO</h3> </v-card-title>
        <div v-if="!isSubmitting">
          <v-card-text>
            <div>PTO available: {{ getPtoBalance() }}h</div>
            <div v-if="getPendingPtoCashoutAmount() > 0">
              Pending PTO cash outs: {{ getPendingPtoCashoutAmount() }}h
            </div>
            <v-text-field
              prepend-icon="mdi-clock-outline"
              class="pt-5"
              :rules="[
                (v) => !!v || 'Field is required',
                ...getNumberRules(),
                ...getPTOCashOutRules(userAvailablePTO, this.$store.getters.user.id)
              ]"
              :hint="cashOutHint()"
              v-model="hoursRequested"
              label="Number of Hours Requested to be Paid Out"
              required
            ></v-text-field>
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
import { getNumberRules, getRequiredRules, getPTOCashOutRules } from '@/shared/validationUtils.js';
import api from '@/shared/api.js';
import dateUtils from '@/shared/dateUtils.js';
import { v4 as uuid } from 'uuid';

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
      await this.createPTOCashOutRequest();
      emit('close-pto-cash-out-form');
      this.clearForm();
      this.isSubmitting = false;
      this.displaySuccess('Successfully created PTO Cash Out request');
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
  this.hoursRequested = null;
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
 * Gets the user's available PTO balance.
 *
 * @returns Number - The available PTO balance
 */
function getPtoBalance() {
  let user = this.$store.getters.user;
  return this.$store.getters.quickbooksPTO.results.users[user.employeeNumber].pto_balances.PTO;
} // getPtoBalance

/**
 * Gets the user's pending PTO cash out amount
 *
 * @returns Number - The pending cash out amount
 */
function getPendingPtoCashoutAmount() {
  let pendingPtoCashOuts = this.$store.getters.ptoCashOuts.filter(
    (p) => !p.approvedDate && this.$store.getters.user.id === p.employeeId
  );
  return pendingPtoCashOuts.reduce((n, { amount }) => n + amount, 0);
} // getPendingPtoCashoutAmount

/**
 * Shows the PTO available after the requested cash out amount.
 *
 * @returns String - The hint text
 */
function cashOutHint() {
  if (this.hoursRequested) {
    return `Balance after cash out: ${this.getPtoBalance() - this.getPendingPtoCashoutAmount() - this.hoursRequested}h`;
  }
} // cashOutHint

/**
 * Creates a PTO Cash Out record in the database.
 */
async function createPTOCashOutRequest() {
  let ptoCashOut = await api.createItem(api.PTO_CASH_OUTS, {
    id: uuid(),
    amount: this.hoursRequested,
    employeeId: this.$store.getters.user.id,
    creationDate: dateUtils.getTodaysDate()
  });
  this.$store.dispatch('setPtoCashOuts', { ptoCashOuts: [...this.$store.getters.ptoCashOuts, ptoCashOut] });
} // createPTOCashOutRequest

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|
export default {
  data() {
    return {
      show: false,
      hoursRequested: null,
      valid: false,
      isSubmitting: false,
      userAvailablePTO:
        this.$store.getters.quickbooksPTO.results.users[this.$store.getters.user.employeeNumber]['pto_balances'].PTO
    };
  },
  methods: {
    getNumberRules,
    getRequiredRules,
    getPTOCashOutRules,
    emit,
    submit,
    cancel,
    cashOutHint,
    clearForm,
    displaySuccess,
    displayError,
    getPendingPtoCashoutAmount,
    getPtoBalance,
    createPTOCashOutRequest
  }
};
</script>
