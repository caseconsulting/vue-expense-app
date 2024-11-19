<template>
  <v-card>
    <v-card-title class="d-flex align-center header_style">
      <!-- Editing an Expense -->
      <h3 v-if="expense.id && (userRoleIsAdmin() || userRoleIsManager() || !isReimbursed)">Edit Expense</h3>
      <!-- Creating an Expense -->
      <h3 v-else>Create New Expense</h3>
      <!-- Inactive Employee -->
    </v-card-title>
    <v-container fluid>
      <v-form ref="form" v-model="valid" @submit.prevent="valid ? (confirmingValid = true) : _">
        <!-- Employee picker if admin -->
        <v-autocomplete
          v-if="!asUser"
          variant="underlined"
          :items="activeEmployees"
          :rules="getRequiredRules()"
          :custom-filter="employeeFilter"
          :disabled="isReimbursed || isEdit || isInactive"
          v-model="editedExpense.employeeId"
          item-title="text"
          label="Employee"
          id="employeeName"
          class="form_padding"
        ></v-autocomplete>

        <!-- Expense Type Picker if Admin -->
        <v-autocomplete
          v-if="!asUser"
          variant="underlined"
          :items="filteredExpenseTypes()"
          :rules="getRequiredRules()"
          :disabled="isInactive"
          v-model="editedExpense.expenseTypeId"
          item-title="text"
          item-value="id"
          label="Expense Type"
          id="expenseType"
          :hint="hint"
          persistent-hint
          @update:model-value="getExpenseTypeSelected"
        ></v-autocomplete>

        <!-- Expense Type Picker if User -->
        <v-autocomplete
          v-else
          variant="underlined"
          :items="filteredExpenseTypes()"
          :disabled="isInactive"
          :rules="getRequiredRules()"
          v-model="editedExpense.expenseTypeId"
          item-title="text"
          item-value="id"
          label="Expense Type"
          :hint="hint"
          persistent-hint
          @update:modelValue="getExpenseTypeSelected()"
          class="form_padding"
        ></v-autocomplete>

        <!-- Expense Type Description -->
        <div
          v-if="selectedExpenseType"
          class="d-flex align-center pa-1 mt-1 text-caption text-grey-darken-2 bg-blue-lighten-5 border-dashed border-thin rounded-sm"
        >
          <v-icon class="mr-1">mdi-information-slab-box-outline</v-icon>
          {{ selectedExpenseType.description }}
        </div>

        <!-- Category -->
        <v-select
          variant="underlined"
          v-if="getCategories() != null && getCategories().length >= 1"
          :rules="getRequiredRules()"
          :disabled="isInactive"
          v-model="editedExpense.category"
          :items="getCategories()"
          label="Select Category"
          clearable
          chips
        ></v-select>

        <!-- Update Receipt Checkbox -->
        <v-checkbox
          v-if="receiptRequired && isEdit && !isEmpty(expense.receipt)"
          class="py-0"
          v-model="allowReceipt"
          label="Update the Receipt?"
          :disabled="isInactive"
        ></v-checkbox>

        <!-- Old Receipt Name -->
        <v-card-text class="pa-0 font-16 form-text" v-if="!isEmpty(expense.receipt) && isEdit"
          >Current Receipt: {{ submittedReceipt }}</v-card-text
        >

        <!-- Upload Receipt -->
        <v-row class="mt-2 justify-space-between">
          <file-upload
            v-if="receiptRequired && ((allowReceipt && isEdit) || !isEdit || isEmpty(expense.receipt))"
            class="ml-1 mb-2 py-0 w-70"
            :passedRules="receiptRules"
            :receipt="expense.receipt"
            :disabled="isInactive"
          ></file-upload>
          <!-- Scan Receipt Button -->
          <v-tooltip location="bottom">
            <template v-slot:activator="{ props }">
              <span v-bind="props" class="d-flex align-center">
                <v-btn
                  v-if="receiptRequired && ((allowReceipt && isEdit) || !isEdit || isEmpty(expense.receipt))"
                  color="black"
                  @click="scanFile"
                  class="mx-3 mb-5"
                  variant="outlined"
                  elevation="1"
                  :disabled="isInactive || disableScan"
                  :loading="scanLoading"
                >
                  <v-icon>mdi-barcode-scan</v-icon>
                </v-btn>
              </span>
            </template>
            <span v-if="!scanLoading">
              Scans the receipt and autofills fields. Scanning only works for pdfs, pngs, and jpegs.
            </span>
            <span v-else>Scanning your receipt, this may take up to 15 seconds</span>
          </v-tooltip>
        </v-row>

        <!-- Cost -->
        <v-row class="mx-1">
          <v-text-field
            variant="underlined"
            prefix="$"
            :rules="costRules"
            :disabled="isReimbursed || isInactive || isHighFive"
            label="Cost"
            id="cost"
            class="py-0"
            maxlength="12"
            data-vv-name="Cost"
            persistent-hint
            :hint="costHint()"
            v-model="costFormatted"
            @keyup="formatCost"
          >
            <template v-slot:message="{ message }">
              <span v-html="message"></span>
            </template>
          </v-text-field>
          <!-- Exchange Hours Calculator -->
          <v-tooltip location="bottom">
            <template v-slot:activator="{ props }">
              <span v-bind="props">
                <v-btn
                  v-if="editedExpense.category && editedExpense.category === 'Exchange for training hours'"
                  class="ml-3"
                  :disabled="isInactive"
                  @click="showExchangeCalculator = true"
                >
                  <v-icon>mdi-calculator</v-icon>
                </v-btn>
              </span>
            </template>
            <span>Show Exchange Calculator</span>
          </v-tooltip>
        </v-row>

        <!-- Recipient Employee Selection List -->
        <v-autocomplete
          v-if="reqRecipient"
          :items="recipientOptions"
          variant="underlined"
          :rules="getRequiredRules()"
          :disabled="isInactive || isReimbursed"
          v-model="editedExpense.recipient"
          label="Recipient"
          id="recipient"
          class="form_padding"
          :placeholder="recipientPlaceholder"
          item-title="text"
          item-value="id"
        ></v-autocomplete>

        <!-- Description -->
        <v-text-field
          variant="underlined"
          v-if="!reqRecipient"
          v-model="editedExpense.description"
          :rules="descriptionRules"
          :disabled="isInactive"
          id="description"
          class="mt-4"
          label="Description"
          data-vv-name="Description"
          @update:focused="descRedirect()"
          :hint="editedExpense.category === 'Exchange for training hours' ? 'Will open in a modal' : ''"
          persistent-hint
          :key="editedExpense.category"
        >
          <template v-if="editedExpense.category === 'Exchange for training hours'" v-slot:prepend>
            <div @click="descRedirect()" class="pointer">
              <v-icon :color="caseGray">mdi-open-in-new</v-icon>
            </div>
          </template>
        </v-text-field>

        <!-- Purchase Date -->
        <v-menu
          ref="purchaseMenu"
          :close-on-content-click="false"
          v-model="purchaseMenu"
          :disabled="isReimbursed && !isDifferentExpenseType"
          location="start center"
        >
          <template v-slot:activator="{ props }">
            <v-text-field
              variant="underlined"
              v-model="purchaseDateFormatted"
              id="purchaseDate"
              :rules="[...getDateRules(), ...getNonFutureDateRules()]"
              :disabled="(isReimbursed && !isDifferentExpenseType) || isInactive"
              v-mask="'##/##/####'"
              label="Purchase Date"
              hint="MM/DD/YYYY format"
              persistent-hint
              v-bind="props"
              @click:prepend="purchaseMenu = true"
              @keypress="purchaseMenu = false"
              @update:focused="editedExpense.purchaseDate = format(purchaseDateFormatted, 'MM/DD/YYYY', 'YYYY-MM-DD')"
              autocomplete="off"
            >
              <template v-slot:prepend>
                <div v-bind="props" class="pointer">
                  <v-icon :color="caseGray">mdi-calendar</v-icon>
                </div>
              </template>
            </v-text-field>
          </template>
          <v-date-picker
            keyboard-icon=""
            hide-actions
            v-model="editedExpense.purchaseDate"
            show-adjacent-months
            no-title
            color="#bc3825"
            @update:model-value="purchaseMenu = false"
          ></v-date-picker>
        </v-menu>

        <!-- Reimbursed Date -->
        <v-menu
          v-if="userRoleIsAdmin() || userRoleIsManager()"
          ref="reimburseMenu"
          :close-on-content-click="false"
          v-model="reimburseMenu"
          :offset="40"
          :disabled="isReimbursed && !isDifferentExpenseType"
          transition="scale-transition"
          max-width="290px"
          min-width="290px"
          location="start center"
        >
          <template v-slot:activator="{ props }">
            <v-text-field
              variant="underlined"
              v-model="reimbursedDateFormatted"
              id="reimburseDate"
              :rules="getDateOptionalRules()"
              :disabled="(isReimbursed && !isDifferentExpenseType) || isInactive"
              v-mask="'##/##/####'"
              label="Reimburse Date (optional)"
              hint="MM/DD/YYYY format "
              persistent-hint
              @click="reimburseMenu = false"
              @update:focused="
                editedExpense.reimbursedDate = format(reimbursedDateFormatted, 'MM/DD/YYYY', 'YYYY-MM-DD')
              "
              @update:model-value="reimburseMenu = false"
              v-bind="props"
              autocomplete="off"
            >
              <template v-slot:prepend>
                <div v-bind="props" class="pointer">
                  <v-icon :color="caseGray">mdi-calendar</v-icon>
                </div>
              </template>
            </v-text-field>
          </template>
          <v-date-picker
            keyboard-icon=""
            hide-actions
            v-model="editedExpense.reimbursedDate"
            show-adjacent-months
            no-title
            color="#bc3825"
            @update:model-value="reimburseMenu = false"
          ></v-date-picker>
        </v-menu>

        <!-- Notes -->
        <v-textarea
          v-if="reqRecipient"
          variant="underlined"
          v-model="editedExpense.note"
          :rules="notesRules()"
          :label="notesLabel"
          id="notes"
          data-vv-name="Description"
          :disabled="isInactive"
        ></v-textarea>
        <!-- Separating optional and required notes field logic since
        the rules cause issues with validation -->
        <v-textarea
          v-else
          variant="underlined"
          v-model="editedExpense.note"
          :label="notesLabel"
          id="notes"
          data-vv-name="Description"
          :disabled="isInactive"
        ></v-textarea>

        <!-- URL -->
        <v-text-field
          variant="underlined"
          v-model="editedExpense.url"
          :rules="[...getURLRules(), getRequireURL()]"
          :label="urlLabel"
          :disabled="isInactive"
        ></v-text-field>

        <!-- Show On Feed -->
        <v-switch
          v-if="userRoleIsAdmin() || userRoleIsManager()"
          :disabled="isInactive"
          v-model="editedExpense.showOnFeed"
          label="Have expense show on company feed?"
          :color="caseRed"
        ></v-switch>

        <!-- Buttons -->
        <!-- Cancel Button -->
        <v-btn
          color="white"
          elevation="2"
          @click="confirmBackingOut = true"
          class="ma-2"
          :disabled="isInactive"
          id="cancelButton"
        >
          <v-icon class="mr-1" icon="mdi-close-circle" size="large" />Cancel
        </v-btn>

        <!-- Submit Button -->
        <v-btn
          variant="outlined"
          color="success"
          type="submit"
          :disabled="(!(userRoleIsAdmin() || userRoleIsManager()) && isReimbursed) || isInactive"
          id="submitButton"
          :loading="loading"
          class="ma-2"
        >
          <v-icon class="mr-1" icon="mdi-content-save" size="large" />Submit
        </v-btn>
        <!-- End Buttons -->
      </v-form>
      <!-- Confirmation if the expense exceeds the available budget remaining -->
      <confirmation-box
        :isCovered="isCovered"
        :isOverCovered="isOverCovered"
        :toggleConfirmationBox="confirming"
        :expense="editedExpense"
      ></confirmation-box>
      <!-- Confirmation Modal -->
      <general-confirmation-modal
        title="Are you sure you want to submit?"
        :toggleModal="confirmingValid"
        type="expense"
      ></general-confirmation-modal>
      <!-- Cancel Confirmation Modal -->
      <cancel-confirmation :toggleSubmissionConfirmation="confirmBackingOut" type="expense"> </cancel-confirmation>
      <v-dialog v-model="showExchangeCalculator" :width="isMobile ? '100%' : '50%'" persistent>
        <ExchangeTrainingHoursCalculator />
      </v-dialog>
      <v-dialog v-model="showExchangeTrainingDesc" :width="isMobile ? '100%' : '50%'" persistent>
        <ExchangeTrainingDescription :previousDesc="editedExpense.description" />
      </v-dialog>
    </v-container>
  </v-card>
</template>

<script>
import CancelConfirmation from '@/components/modals/CancelConfirmation.vue';
import ConfirmationBox from '@/components/modals/ConfirmationBox.vue';
import FileUpload from '@/components/utils/FileUpload.vue';
import GeneralConfirmationModal from '@/components/modals/GeneralConfirmationModal.vue';
import ExchangeTrainingHoursCalculator from '@/components/expenses/ExchangeTrainingHoursCalculator.vue';
import ExchangeTrainingDescription from '@/components/expenses/ExchangeTrainingDescription.vue';

import api from '@/shared/api.js';
import employeeUtils from '@/shared/employeeUtils';
import {
  getDateRules,
  getDateOptionalRules,
  getNonFutureDateRules,
  getRequiredRules,
  getURLRules
} from '@/shared/validationUtils.js';
import {
  isEmpty,
  isFullTime,
  isMobile,
  convertToMoneyString,
  generateUUID,
  userRoleIsAdmin,
  userRoleIsManager
} from '@/utils/utils';
import { updateStoreBudgets } from '@/utils/storeUtils';
import { getRole } from '@/utils/auth';
import { isBetween, getTodaysDate, format } from '../../shared/dateUtils';
import { employeeFilter } from '@/shared/filterUtils';
import { mask } from 'vue-the-mask';

import _find from 'lodash/find';
import _cloneDeep from 'lodash/cloneDeep';
import _forEach from 'lodash/forEach';
import _map from 'lodash/map';
import _filter from 'lodash/filter';
import _isEmpty from 'lodash/isEmpty';
import _includes from 'lodash/includes';
import _compact from 'lodash/compact';
import _isEqual from 'lodash/isEqual';
import _isNil from 'lodash/isNil';

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Get rules for the description field. Adds some rules based on conditions.
 *
 * @return array - the rules to use for the description field
 */
function descriptionRules() {
  // set base rules
  let rules = [(v) => !this.isEmpty(v) || 'Description is a required field'];

  // add rules based on form condition (eg expense type)
  if (this.editedExpense.category == 'Exchange for training hours') {
    rules.push(
      (v) =>
        (!this.isEmpty(v) && v.replaceAll(/\s/g, '').length >= 150) || 'Description must be at least 150 characters'
    );
  }

  return rules;
} // isDifferentExpenseType

/**
 * Check if expense type is changed. Returns true if the expense type is different, otherwise returns false.
 *
 * @return boolean - expense type is changed
 */
function isDifferentExpenseType() {
  if (this.editedExpense && this.originalExpense) {
    return this.editedExpense.expenseTypeId != this.originalExpense.expenseTypeId;
  }
  return false;
} // isDifferentExpenseType

/**
 * Checks if the expense is reimbursed. Returns true if the expense is reimbursed, otherwise returns false.
 *
 * @return boolean - expense is reimbursed
 */
function isReimbursed() {
  return this.isEdit && this.originalExpense && !this.isEmpty(this.originalExpense.reimbursedDate);
} // isReimbursed

/**
 * Checks if a receipt is required. Returns true if the receipt is required, otherwise returns false.
 *
 * @return boolean - receipt is required
 */
function receiptRequired() {
  this.selectedExpenseType = _find(this.expenseTypes, (expenseType) => {
    if (expenseType.value === this.editedExpense.expenseTypeId) {
      return expenseType;
    }
  });

  // if the whole expense requires receipt
  if (this.selectedExpenseType && this.selectedExpenseType.requiredFlag) {
    // return true unless expense is training and the category is exchange
    return !(
      this.selectedExpenseType.budgetName === 'Training' &&
      this.editedExpense.category === 'Exchange for training hours'
    );
  }
  // otherwise, does one of it's categories require a receipt
  if (this.editedExpense.category) {
    let category = _find(this.selectedExpenseType.categories, (cat) => {
      return cat.name === this.editedExpense.category;
    });
    return category.requireReceipt;
  }

  return false;
} // receiptRequired

/**
 * Creates the label for the notes section based on if it is optional.
 *
 * @return string - label
 */
function notesLabel() {
  return this.reqRecipient ? 'Notes' : 'Notes (optional)';
} // notesLabel

/**
 * Creates the label for the url section based on if it is optional.
 *
 * @return string - label
 */
function urlLabel() {
  return this.editedExpense.requireURL ? 'URL' : 'URL (optional)';
} // urlLabel

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Adds an expenses url and category to the training urls page.
 *
 * @param newExpense - new expense with url and category
 */
async function addURLInfo(newExpense) {
  // remove trailing slash from url and convert all letter to lowercase
  newExpense.url = newExpense.url.replace(/\/$/, '').toLowerCase();
  if (
    newExpense.url.length >= 12 &&
    (newExpense.url.substring(0, 12) === 'https://www.' || newExpense.url.substring(0, 11) === 'http://www.')
  ) {
    // remove www from url if it exists
    newExpense.url = newExpense.url.replace(/www\./, '');
  }

  let encodedURL = this.encodeUrl(newExpense.url); // encode url

  // get url info
  let item = await api.getURLInfo(encodedURL, newExpense.category);
  if (item.id) {
    // increment hits if the url already exists
    this.urlInfo = item;
    await this.incrementURLHits();
  } else {
    // create a new url and category if it does not already exist
    this.urlInfo['id'] = newExpense.url;

    //adds categories to the list if applicable
    if (newExpense.category) {
      this.urlInfo['category'] = newExpense.category;
    } else {
      this.urlInfo['category'] = null;
    }
    this.urlInfo['hits'] = 1;
    await api.createItem(api.TRAINING_URLS, this.urlInfo);
  }
} // addURLInfo

/**
 * Calculates the adjusted budget amount for an expense type based on an employee's work status. Returns the adjust
 * amount.
 *
 * @param employee - Employee to adjust amount for
 * @param expenseType - ExpenseType budget to be adjusted
 * @return Number - adjusted budget amount
 */
function calcAdjustedBudget(employee, expenseType) {
  let result = 0;
  if (this.hasAccess(employee, expenseType)) {
    if (!expenseType.proRated) {
      result = expenseType.budget;
    } else {
      result = Number((expenseType.budget * (employee.workStatus / 100.0)).toFixed(2));
    }
  }

  return result;
} // calcAdjustedBudget

/**
 * Checks how much of the expense is covered and submits the expense.
 */
async function checkCoverage() {
  this.isInactive = true;
  if (this.$refs.form) {
    await this.$refs.form.validate();
    if (!this.valid) return;
    this.emitter.emit('startAction');
    // form is validated
    this.loading = true; // set loading status to true
    if (this.editedExpense) {
      // expense exists
      // get expense type
      let expenseType = _find(this.expenseTypes, (type) => this.editedExpense.expenseTypeId === type.value);

      // get employee
      if (this.asUser) {
        // creating or updating an expense as a user
        this.employee = this.$store.getters.user;
      } else {
        // creating or updating an expense as an admin
        this.employee = _find(this.$store.getters.employees, (e) => e.id === this.editedExpense.employeeId);
      }

      // get budget
      let employeeBudgets = await api.getEmployeeBudgets(this.employee.id);
      let budget = employeeBudgets.find((b) => {
        // make sure if the budget is recurring to get the budget for this year
        let isActiveBudget = isBetween(getTodaysDate(), b.fiscalStartDate, b.fiscalEndDate, 'day', '[]');
        return b.expenseTypeId == expenseType.value && isActiveBudget;
      });
      let budgetExists = budget ? true : false;

      // get the budget amount, including legacyCarryover
      let budgetObject = _find(this.employeeBudgets, (b) => b.expenseTypeId === expenseType.id).budgetObject;
      let budgetAmount = parseInt(budgetObject.amount);
      let legacyCarryover = parseInt(budgetObject.legacyCarryover ?? 0);

      if (this.employee.workStatus == 0) {
        // emit error if user is inactive
        this.emitter.emit('error', 'Current user is inactive');
        this.emitter.emit('endAction');
        this.loading = false; // set loading status to false
      } else {
        // user is active

        // keep the cost data as a string. This allows us to keep it formatted as ##.##
        // -- if you parse the Expense object's cost field itself into a float, it drops the second
        //    decimal place, then fails validation
        // -- remove commas from the input
        let cost = parseFloat(this.editedExpense.cost);

        //I used this comment to help me understand this function and the chnages I needed to make. I'm leaving it for posterity

        /**
         * Threshold 1 initial buget e.g. Training 3600
         * Threshold 2 Overdraft budget e.g. Training 7200
         *
         * Branch 1:
         *  1.1: User has previous expenses for this budget
         *    Branch 2:
         *      2.1: User is Full time and budget has overdraft
         *        Branch 3:
         *          3.1: User begins under initial budget
         *            Branch 4:
         *              4.1: user stays under initial budget after applying new expense
         *              4.2: user passes into overdraft budget after applying new expense -- SHOW confirmationBox
         *              4.3: user passes over initial and overdraft budget -- SHOW confirmationBox
         *          3.2: User begins over initial budget and is in overdraft budget
         *            Branch 5:
         *              5.1: user stays under overdraft budget --- SHOW confirmationBox
         *              5.2: user goes over overdraft budget -- SHOW confirmationBox
         *          3.3: This budget is already maxed out
         *      2.2: User in not full time or budget does not have overdraft
         *        Branch 6:
         *          6.1: user starts under initial budget
         *            Branch 7:
         *              7.1: User stays within budget once new expense is added
         *              7.2: User goes overbudget -- SHOW confirmationBox
         *          6.2: budget is maxed out
         *  1.2: User does not have previous expenses
         *    BRANCH 8:
         *      8.1: User is Full time and budget has overdraft
         *        See Branch 3.1
         *      8.2: User in not full time or budget does not have overdraft
         *        See Branch 6.1
         */
        if (budgetExists) {
          // BRANCH 1.1 if the matching budget exists
          let committedAmount = budget.pendingAmount + budget.reimbursedAmount;
          let allExpenses = await api.getAllAggregateExpenses();
          let match = _find(allExpenses, (entry) => {
            return entry.id === this.editedExpense.id;
          });
          // for subsequent calculations, remove matched entry cost from committed amount
          let newCommittedAmount;
          newCommittedAmount = match ? committedAmount - match.cost : committedAmount;
          if (this.originalExpense && this.originalExpense.expenseTypeId != this.editedExpense.expenseTypeId) {
            newCommittedAmount = committedAmount;
          }
          if (expenseType.odFlag && this.isFullTime(this.employee)) {
            // BRANCH 2.1 selected expense type allows overdraft and employee is full time
            if (budgetAmount + legacyCarryover > newCommittedAmount) {
              // BRANCH 3.1 under initial budget (not including overdraft)
              if (newCommittedAmount + cost <= budgetAmount + legacyCarryover) {
                // BRANCH 4.1 under initial budget and not going into overdraft after applying expense
                await this.submit();
              } else if (newCommittedAmount + cost <= 2 * budgetAmount + legacyCarryover) {
                // BRANCH 4.2 goes over initial budget with new expense but stays below overdraft budget
                this.editedExpense['budget'] = budgetAmount;
                this.editedExpense['remaining'] = budgetAmount + legacyCarryover - newCommittedAmount;
                this.editedExpense['od'] = true;
                this.isCovered = true;
                this.isOverCovered = false;
                this.confirming = !this.confirming;
              } else {
                // BRANCH 4.3 goes over overdraft budget completely
                this.editedExpense['budget'] = budgetAmount;
                this.editedExpense['remaining'] = 2 * budgetAmount + legacyCarryover - newCommittedAmount;
                this.editedExpense['od'] = true;
                this.isCovered = false;
                this.isOverCovered = false;
                this.confirming = !this.confirming;
              }
            } else if (2 * budgetAmount + legacyCarryover > newCommittedAmount) {
              // BRANCH 3.2 under overdraft budget -- expense is able to be made
              if (newCommittedAmount + cost <= 2 * budgetAmount + legacyCarryover) {
                // BRANCH 5.1 above initial budget but below overdraft budget TODO: add condirmation box handling? new flag?
                this.editedExpense['budget'] = budgetAmount;
                this.editedExpense['remaining'] = 2 * budgetAmount + legacyCarryover - newCommittedAmount;
                this.editedExpense['od'] = true;
                this.isCovered = true;
                this.isOverCovered = true;
                this.confirming = !this.confirming;
              } else {
                // BRANCH 5.2 budget not maxed out before this expense (going over overdraft) but expense not fully covered. Show adusted confirmation dialog
                this.editedExpense['budget'] = budgetAmount;
                this.editedExpense['remaining'] = 2 * budgetAmount + legacyCarryover - newCommittedAmount;
                this.editedExpense['od'] = true;
                this.isCovered = false;
                this.isOverCovered = false;
                this.confirming = !this.confirming;
              }
            } else {
              // BRANCH 3.3 budget is already maxed out for overdraft expense can't be made
              this.emitter.emit('error', 'Budget is maxed out');
              this.loading = false; // set loading status to false
              this.emitter.emit('endAction');
            }
          } else {
            // BRANCH 2.2 selected expense type does not allow overdraft or employee is not full time
            this.editedExpense['od'] = false;
            if (newCommittedAmount < budgetAmount + legacyCarryover) {
              // BRANCH 6.1 starts under initial budget
              if (newCommittedAmount + cost <= budgetAmount + legacyCarryover) {
                // BRANCH 7.1 doesnt go over budget
                // reimburse the full expense
                await this.submit();
              } else {
                // BRANCH 7.2 goes over budget
                this.editedExpense['budget'] = budgetAmount;
                this.editedExpense['remaining'] = budgetAmount + legacyCarryover - newCommittedAmount;
                this.isCovered = false;
                this.isOverCovered = false;
                this.confirming = !this.confirming;
              }
            } else {
              // BRANCH 6.2 budget is maxed out
              this.emitter.emit('error', `${expenseType.budgetName} budget is maxed out`);
              this.loading = false; // set loading status to false
              this.emitter.emit('endAction');
            }
          }
        } else {
          // BRANCH 1.2 budget for this expense does not exist
          if (expenseType.odFlag && this.isFullTime(this.employee)) {
            // Branch 8.1 selected expense type allows overdraft and employee is full time
            if (cost <= budgetAmount + legacyCarryover) {
              // full amount reimbursed
              await this.submit();
            } else if (cost <= 2 * budgetAmount + legacyCarryover) {
              // the expense goes into overdraft but fully covered
              this.editedExpense['budget'] = budgetAmount;
              this.editedExpense['remaining'] = budgetAmount + legacyCarryover;
              this.editedExpense['od'] = true;
              this.isCovered = true;
              this.isOverCovered = false;
              this.confirming = !this.confirming;
            } else {
              // expense goes past overdraft budget completely and is partially covered
              this.editedExpense['budget'] = budgetAmount;
              this.editedExpense['remaining'] = 2 * budgetAmount + legacyCarryover;
              this.editedExpense['od'] = true;
              this.isCovered = false;
              this.isOverCovered = false;
              this.confirming = !this.confirming;
            }
          } else {
            // BRANCH 8.2 selected expense type does not allow overdraft or employee is not full time
            this.editedExpense['od'] = false;
            if (cost <= budgetAmount + legacyCarryover) {
              // reimburse the full expense
              await this.submit();
            } else {
              // expense exceeds the budget but the expense not fully covered
              this.editedExpense['budget'] = budgetAmount;
              this.editedExpense['remaining'] = budgetAmount + legacyCarryover;
              this.isCovered = false;
              this.isOverCovered = false;
              this.confirming = !this.confirming;
            }
          }
        }
      }
    }
  }
  this.isInactive = false;
} // checkCoverage

/**
 * Clears the form and sets all fields to a default state.
 */
function clearForm() {
  // don't clear form if there was an error in submitting
  if (this.errorSubmitting) {
    this.errorSubmitting = false; // reset var
    this.isInactive = false; // enable form
    return;
  }

  this.allowReceipt = false;
  if (this.$refs.form) {
    this.$refs.form.reset();
  }
  this.emitter.emit('finished-editing-expense'); //notify parent no longer editing an expense

  this.reqRecipient = false;
  this.recipientPlaceholder = null;
  this.editedExpense = _cloneDeep(this.expense);
  this.originalExpense = this.editedExpense;
  this.purchaseDateFormatted = null;
  this.files = [];

  this.urlInfo['url'] = '';
  this.urlInfo['category'] = '';
  this.urlInfo['hits'] = 0;

  if (this.asUser) {
    // creating or updating an expense as a user
    this.editedExpense['employeeName'] = `${this.userInfo.firstName} ${this.userInfo.lastName}`;
    this.editedExpense['employeeId'] = this.userInfo.id;
  }
} // clearForm

/**
 * Determines which hint to display for the cost field.
 *
 * @return String - The hint to display
 */
function costHint() {
  if (!this.editedExpense.employeeId) {
    return 'Please choose an employee to see remaining balance.';
  } else if (!this.editedExpense.expenseTypeId) {
    return 'Please choose an expense type to see remaining balance.';
  } else if (this.remainingBudget === '') {
    return 'Remaining budget for current expense type is not available.';
  } else if (this.expenseTypeName) {
    let str = `Remaining budget for ${this.expenseTypeName}: `;
    if (this.remainingBudget <= 0) {
      str += `<span class="text-red">${this.convertToMoneyString(this.remainingBudget)}`;
    } else {
      str += this.convertToMoneyString(this.remainingBudget);
      return str;
    }
    let employee = _find(this.$store.getters.employees, (e) => e.id === this.editedExpense.employeeId);
    let isOverdraftable =
      (this.selectedExpenseType.proRated && this.isFullTime(employee) && this.selectedExpenseType.odFlag) ||
      (!this.selectedExpenseType.proRated && this.selectedExpenseType.odFlag);
    if (
      this.remainingBudget < 0 &&
      this.remainingBudget >= -this.overdraftBudget &&
      this.selectedExpenseType.odFlag &&
      isOverdraftable
    ) {
      str += ` (Overdraftable and within ${this.convertToMoneyString(this.overdraftBudget)} limit)`;
    } else if (this.remainingBudget < -this.overdraftBudget && this.selectedExpenseType.odFlag && isOverdraftable) {
      str += ` (Exceeds overdraftable amount of ${this.convertToMoneyString(this.overdraftBudget)})`;
    } else if (this.remainingBudget < 0 && !this.selectedExpenseType.odFlag) {
      str += ' (Not Overdraftable)';
    }
    str += '</span>';
    return str;
  }
} // costHint

/**
 * Creates a new expense.
 */
async function createNewEntry() {
  let updatedAttachment;
  let updatedExpense;

  let newUUID = generateUUID();
  this.editedExpense['id'] = newUUID;
  this.editedExpense['createdAt'] = getTodaysDate();
  if (this.isReceiptRequired() && this.files?.length > 0) {
    // if receipt required and updating receipt
    // stores files name for lookup later
    let fileNames = [];
    for (let i = 0; i < this.files.length; i++) {
      fileNames[i] = this.files[i].name;
    }
    this.editedExpense['receipt'] = fileNames;
    // upload attachment to S3
    updatedAttachment = await api.createAttachment(this.editedExpense, this.files);
    if (updatedAttachment[0].key) {
      // successfully uploads file
      updatedExpense = await api.createItem(api.EXPENSES, this.editedExpense);

      if (updatedExpense.id) {
        // successfully updates expense
        // TODO: Only add if training expense type.
        if (!this.isEmpty(updatedExpense.url) && !this.isEmpty(updatedExpense.category)) {
          await this.addURLInfo(updatedExpense);
        }

        this.editedExpense['id'] = updatedExpense.id;
        this.emitter.emit('add', updatedExpense);
        this.clearForm();
      } else {
        // emit error if fails to update expense
        this.emitter.emit('error', updatedExpense.response.data.message);
        this.editedExpense['id'] = '';
      }
    } else {
      // emit error if fails to upload file
      this.emitter.emit('error', updatedAttachment.response.data.message);
      this.editedExpense['id'] = '';
    }
  } else {
    // if receipt not required or not updating receipt
    if (!this.isReceiptRequired()) {
      this.files = [];
      this.editedExpense['receipt'] = null;
    }
    updatedExpense = await api.createItem(api.EXPENSES, this.editedExpense);

    if (updatedExpense.id) {
      // successfully updates expense
      // TODO: Only add if training expense type. Allow empty category
      if (!this.isEmpty(updatedExpense.url) && !this.isEmpty(updatedExpense.category)) {
        // add training url if url and category exist
        await this.addURLInfo(updatedExpense);
      }

      this.editedExpense['id'] = updatedExpense.id;
      this.emitter.emit('add', updatedExpense);
      this.clearForm();
    } else {
      // emit error if fails to update expense
      this.emitter.emit('error', updatedExpense.response.data.message);
      this.editedExpense['id'] = '';
    }
  }
} // createNewEntry

/**
 * Redirects description field to modal if needed (only for exchange for training hours)
 */
function descRedirect() {
  if (this.editedExpense.category == 'Exchange for training hours') this.showExchangeTrainingDesc = true;
}

/**
 * Encodes a url from binary to ascii. Returns the encoded url.
 *
 * @param url - url to encode
 * @return String - encoded url
 */
function encodeUrl(url) {
  return btoa(url);
} // encodeUrl

/**
 * Filters expense type. Returns the expense types that the employee has access to and the budget amount.
 *
 * @return - filtered expense types
 */
function filteredExpenseTypes() {
  let filteredExpType = [];
  let selectedEmployee = _find(this.employees, ['value', this.editedExpense.employeeId]);
  if (!this.asUser) {
    // creating or updating an expense as an admin
    _forEach(this.expenseTypes, (expenseType) => {
      if (!expenseType.isInactive) {
        // expense type is active
        if (!selectedEmployee) {
          // add expense type if no employees are selected
          expenseType.text = `${expenseType.budgetName} - $${Number(expenseType.budget).toLocaleString().toString()}`;
          filteredExpType.push(expenseType);
        } else if (this.hasAccess(selectedEmployee, expenseType)) {
          // add expense type if the employee is selected and has access
          let budget = _find(this.employeeBudgets, (b) => b.expenseTypeId === expenseType.id);
          let amount = budget ? budget.budgetObject.amount : this.calcAdjustedBudget(selectedEmployee, expenseType); // calculate budget
          expenseType.text = `${expenseType.budgetName} - $${Number(amount).toLocaleString().toString()}`;
          filteredExpType.push(expenseType);
        }
      }
    });
  } else {
    // creating or updating an expense as a user
    let employee = this.userInfo;
    _forEach(this.expenseTypes, (expenseType) => {
      if (!expenseType.isInactive) {
        // expense type is active
        if (this.hasAccess(employee, expenseType)) {
          // user has access to the expense type
          if (
            expenseType.recurringFlag ||
            isBetween(getTodaysDate(), expenseType.startDate, expenseType.endDate, 'day', '[]')
          ) {
            // expense type is active
            let budget = _find(this.employeeBudgets, (b) => b.expenseTypeId === expenseType.id);
            let amount = budget ? budget.budgetObject.amount : expenseType.budgetAmount;
            expenseType.text = `${expenseType.budgetName} - $${Number(amount).toLocaleString().toString()}`;
            filteredExpType.push(expenseType);
          }
        }
      }
    });
  }

  return filteredExpType;
} // filteredExpenseTypes

/**
 * Formats the cost on the form for a nicer display.
 */
function formatCost(e) {
  // log cursor position to put it back to where it was
  let cursorStart, cursorEnd, previousLength;
  if (e) {
    cursorStart = e.target.selectionStart;
    cursorEnd = e.target.selectionEnd;
    previousLength = this.costFormatted.length;
  }

  let [wholePart, fracPart] = this.parseCost(this.costFormatted).split('.');
  this.editedExpense.cost = this.parseCost(this.costFormatted);
  if (Number(this.editedExpense.cost)) {
    this.costFormatted = Number(wholePart).toLocaleString().toString();
    if (fracPart != undefined) this.costFormatted += `.${fracPart}`;
  }

  // set cursor back to where it was
  if (e) {
    // note: longer delay means bigger stutter in input (3ms is not very noticable) but also more
    // assurance that it will update *after* the cursor is shifted to the end by Vuetify.
    let delay = 3;
    setTimeout(() => {
      e.target.selectionStart = cursorStart + this.costFormatted.length - previousLength;
      e.target.selectionEnd = cursorEnd + this.costFormatted.length - previousLength;
    }, delay);
  }
} // formatCost

/**
 * Get the category options for the selected expense type. Returns a sorted list of categories for the expense type.
 *
 * @return array - categories
 */
function getCategories() {
  let categories = [];
  if (this.selectedExpenseType) {
    categories = _map(this.selectedExpenseType.categories, (category) => {
      return category.name;
    });
  }
  return categories;
} // getCategories

/**
 * Gets an expense type given an expense type id. Returns the expense type selected and clears the expense
 * category.
 *
 * @param expenseTypeId - expense type id
 * @return Object - expense type selected
 */
function getExpenseTypeSelected(expenseTypeId) {
  this.editedExpense.category = null; // clear expense category (not type) to prevent it persisting
  this.$refs.form.resetValidation(); // avoid validation errors after changing category
  return (this.selectedExpenseType = _find(this.expenseTypes, (expenseType) => {
    if (expenseType.value === expenseTypeId) {
      return expenseType;
    }
  }));
} // getExpenseTypeSelected

/**
 * Gets the remaining budget for the current expense type
 */
async function getRemainingBudget() {
  if (this.editedExpense.employeeId) {
    // get budgets for employee, use budgets store if it is for yourself.
    if (this.editedExpense.employeeId == this.$store.getters.user.id) {
      this.employeeBudgets = this.$store.getters.budgets;
    } else {
      this.employeeBudgets = await api.getAllActiveEmployeeBudgets(this.editedExpense.employeeId);
    }
    let employee = _find(this.$store.getters.employees, (e) => e.id === this.editedExpense.employeeId);
    // filter out expense types that an employee does not have a budget to
    this.expenseTypes = _filter(
      this.expenseTypes,
      (expenseType) =>
        this.hasAccess(employee, expenseType) && _find(this.employeeBudgets, (b) => b.expenseTypeId === expenseType.id)
    );
  }
  if (this.editedExpense.expenseTypeId && this.editedExpense.employeeId) {
    if (this.employeeBudgets) {
      let budget = this.employeeBudgets.find(
        (currBudget) => currBudget.expenseTypeId === this.editedExpense.expenseTypeId
      );

      let legacyCarryover = parseInt(budget.budgetObject.legacyCarryover ?? 0);

      if (budget) {
        this.remainingBudget =
          budget.budgetObject.amount +
          legacyCarryover -
          budget.budgetObject.pendingAmount -
          budget.budgetObject.reimbursedAmount -
          this.editedExpense.cost;
        this.expenseTypeName = budget.expenseTypeName;
        this.overdraftBudget = budget.budgetObject.amount;
      } else {
        this.remainingBudget = '';
      }

      // If user is editing the form, give them back the old value for accurate calculations
      // rules for the if statement are the same as the title (around line 5 at time or writing)
      if (this.expense.id && (userRoleIsAdmin() || userRoleIsManager() || !this.isReimbursed)) {
        this.remainingBudget += budget.budgetObject.pendingAmount;
      }
    }
  }
} //getRemainingBudget

/**
 * Determine if a URL is required.
 *
 * @return requiredRules if URL is required
 */
function getRequireURL() {
  if (!this.selectedExpenseType) {
    return true;
  }
  if (this.selectedExpenseType.requireURL) {
    return getRequiredRules();
  }
  if (this.selectedExpenseType.categories.length != 0 && this.editedExpense.category) {
    let selectedCategory = _find(this.selectedExpenseType.categories, (category) => {
      if (category.name === this.editedExpense.category) {
        return category;
      }
    });
    if (selectedCategory.requireURL) {
      return getRequiredRules();
    }
  }
  return true;
} // getRequireURL

/**
 * Check if an employee has access to an expense type. Returns true if employee has access, otherwise returns false.
 *
 * @param employee - Employee to access
 * @param expenseType - ExpenseType to be accessed
 * @return Boolean - employee has access to expense type
 */
function hasAccess(employee, expenseType) {
  let result = false;
  if (employee.workStatus == 0) {
    result = false;
  } else if (expenseType.accessibleBy.includes('Intern') && employee.employeeRole == 'intern') {
    result = true;
  } else if (
    expenseType.accessibleBy.includes('FullTime') &&
    employee.employeeRole != 'intern' &&
    employee.workStatus == 100
  ) {
    result = true;
  } else if (
    expenseType.accessibleBy.includes('PartTime') &&
    employee.employeeRole != 'intern' &&
    employee.workStatus < 100
  ) {
    result = true;
  } else {
    result = expenseType.accessibleBy.includes(employee.id);
  }

  return result;
} // hasAccess

/**
 * Increment training url hit count.
 */
async function incrementURLHits() {
  this.urlInfo.hits = this.urlInfo.hits + 1;

  return await api.updateItem(api.TRAINING_URLS, this.urlInfo);
} // incrementURLHits

/**
 * Checks if a receipt is required. Returns true if the receipt is required, otherwise returns false.
 *
 * @return boolean - receipt is required
 */
function isReceiptRequired() {
  this.selectedExpenseType = _find(this.expenseTypes, (expenseType) => {
    if (expenseType.value === this.editedExpense.expenseTypeId) {
      return expenseType;
    }
  });

  // if the whole expense requires receipt
  if (this.selectedExpenseType && this.selectedExpenseType.requiredFlag) {
    return this.selectedExpenseType.requiredFlag;
  }
  // otherwise, does one of it's categories require a receipt
  if (this.editedExpense.category) {
    let category = _find(this.selectedExpenseType.categories, (cat) => {
      return cat.name === this.editedExpense.category;
    });
    return category.requireReceipt;
  }

  return false;
} // receiptRequired

/**
 * Creates the rules for the notes section based on whether or not the current expense type requires a recipient.
 *
 *  @return rule
 */
function notesRules() {
  return [(v) => !this.isEmpty(v) || 'Notes is a required field'];
} // notesRules

/**
 * Parses the cost to get rid of commas.
 *
 * @param cost - preformatted cost
 * @return String - The cost without formatting
 */
function parseCost(cost) {
  if (cost && !_isEmpty(cost)) {
    return cost.replace(/[,\s]/g, '');
  } else {
    return cost || '';
  }
} // parseCost

/**
 * preformats different US/Europe money formats for parsing
 *
 * @param float - number to be formatted
 * @return string - formatted number
 */
function preformatFloat(float) {
  if (!float) {
    return '';
  }

  //Index of first comma
  const posC = float.indexOf(',');

  if (posC === -1) {
    //No commas found, treat as float
    return float;
  }

  //Index of first full stop
  const posFS = float.indexOf('.');

  if (posFS === -1) {
    //Uses commas and not full stops - swap them (e.g. 1,23 --> 1.23)
    return float.replace(/,/g, '.');
  }

  //Uses both commas and full stops - ensure correct order and remove 1000s separators
  return posC < posFS ? float.replace(/,/g, '') : float.replace(/\./g, '').replace(',', '.');
} // preformatFloat

/**
 * Sets the files.
 *
 * @param files - receipt
 */
function setFile(files) {
  if (files) {
    this.isInactive = true;
    this.files = files;
    let fileNames = [];
    for (let i = 0; i < files.length; i++) {
      fileNames[i] = files[i].name;
    }
    this.editedExpense['receipt'] = fileNames;
    this.receipt = fileNames;
    this.isInactive = false;
  } else {
    this.files = [];
    this.editedExpense['receipt'] = null;
    this.receipt = null;
  }
} // setFile

/**
 * Scans the receipt file.
 */
async function scanFile() {
  this.scanLoading = true;
  let file = this.files;
  if (file) {
    this.isInactive = true;
    //go get text data from textract and comprehend

    this.receiptObject = await api.extractText(this.userInfo.id, file);
    if (this.receiptObject instanceof Error) {
      this.isInactive = false;
      this.receiptObject = null;
      this.scanLoading = false;
      return;
    }

    let totalPrice;
    let failed = false;

    _forEach(this.receiptObject.KeyValueSets, (relationship) => {
      //loop through keyvaluesets

      let keys = Object.values(relationship.Keys); //grab the text and confidence objects
      let keyText = '';
      _forEach(keys, (key) => {
        // loop through each one
        keyText += key.Text.toLowerCase() + ' ';
      });

      if (_includes(keyText, 'total') && !_includes(keyText, 'sub') && !_includes(keyText, 'tax')) {
        //check if there is a total in any relationship
        //if there is loop throught the values in that relationship, and build the text.

        let valText = '';
        let valConfidence = 100;
        //build value string
        _forEach(relationship.Values, (value) => {
          valText += value.Text + '';
          valConfidence = Math.min(valConfidence, value.Confidence); //key: Total: Values: USD confidence 99 141500 confidence 50
        });
        //set string to format that parsefloat will like and parse it
        valText = this.preformatFloat(valText);
        totalPrice = parseFloat(valText.replace(/[^\d.]/g, ''));

        //check to see if the confidence is above acceptable values and that the parse worked
        if (valConfidence < 90 || typeof totalPrice != 'number' || isNaN(totalPrice)) {
          failed = true;
        }
      }
    });
    let isTotal = false;
    let currentTotal = null;
    if (totalPrice == null) {
      //if there was no relationship that included total do it with words
      _forEach(this.receiptObject.Words, (word) => {
        //loop through word object
        if (isTotal) {
          //if the previous word was total
          if (word.Confidence >= 90) {
            //if the confidence is higher than 90/100 parse the word to look for a number
            let number = word.Text;
            number = this.preformatFloat(number);
            currentTotal = parseFloat(number.replace(/[^\d.]/g, ''));
            if (typeof currentTotal != 'number' || isNaN(currentTotal)) {
              //if it wasn't a number or parsefloat screwed up it failed
              currentTotal = null;
            }
            if (currentTotal != null) {
              totalPrice = currentTotal;
            }
          }
          //switch isTotal back
          isTotal = false;
        }
        let wordText = word.Text.toLowerCase();
        if (_includes(wordText, 'total') && !_includes(wordText, 'sub') && !_includes(wordText, 'tax')) {
          //if the current word is total
          isTotal = true;
        }
      });
      if (totalPrice == null || typeof totalPrice != 'number' || isNaN(totalPrice)) {
        failed = true;
      }
    }
    //if there is no relationship with the total
    //--find the word total in words and check if the next word is a number
    //--if that number has high confidence use it as the total
    //else if there is no total word at all

    //check comprehend data for date objects
    //see if what it found is able to be converted to dayjs
    //format it so it is in the correct format
    //set purchase date
    let firstDate = null;
    // COMMERCIAL_ITEM
    let commercialItem = '';
    // EVENT
    let event = '';
    // LOCATION
    let location = '';
    // ORGANIZATION
    let organization = '';
    // TITLE
    let title = '';
    _forEach(this.receiptObject.comprehend.Entities, (entity) => {
      if (entity.Type == 'DATE') {
        if (entity.Score > 0.9 && firstDate == null) {
          firstDate = entity.Text;
        }
      } else if (entity.Type == 'COMMERCIAL_ITEM') {
        if (entity.Score > 0.9) {
          commercialItem += entity.Text + ' ';
        }
      } else if (entity.Type == 'EVENT') {
        if (entity.Score > 0.9) {
          event += entity.Text + ' ';
        }
      } else if (entity.Type == 'LOCATION') {
        if (entity.Score > 0.9) {
          location += entity.Text + ' ';
        }
      } else if (entity.Type == 'ORGANIZATION') {
        if (entity.Score > 0.9) {
          organization += entity.Text + ' ';
        }
      } else if (entity.Type == 'TITLE') {
        if (entity.Score > 0.9) {
          title += entity.Text + ' ';
        }
      }
    });
    let adjustNote = '';
    if (title != '') {
      adjustNote += 'Title: ' + title + '\n';
    }
    if (organization != '') {
      adjustNote += 'Organization: ' + organization + '\n';
    }
    if (location != '') {
      adjustNote += 'Location: ' + location + '\n';
    }
    if (event != '') {
      adjustNote += 'Event: ' + event + '\n';
    }
    if (commercialItem != '') {
      adjustNote += 'Commercial Item: ' + commercialItem;
    }
    if (adjustNote != '') {
      adjustNote = '\n\nValues generated from receipt:\n' + adjustNote;
      adjustNote = adjustNote
        .split(' ')
        .filter(function (item, i, allItems) {
          return i == allItems.indexOf(item);
        })
        .join(' ');
    }
    this.isInactive = false;
    if (firstDate != null && this.editedExpense.purchaseDate == null) {
      this.editedExpense.purchaseDate = this.format(firstDate);
    }
    if (!failed && (this.editedExpense.cost == 0 || this.editedExpense.cost == null)) {
      this.editedExpense.cost = totalPrice;
      this.costFormatted = Number(this.editedExpense.cost).toLocaleString().toString();
    }
    this.editedExpense.note = adjustNote;
    // }
  }
  this.scanLoading = false;
} // scanFile

/**
 * Sets all of the expense type data to its original fields.
 */
function setDefaultExpenseTypeData() {
  let expenseTypes = this.$store.getters.expenseTypes;
  this.expenseTypes = _map(expenseTypes, (expenseType) => {
    return {
      text: `${expenseType.budgetName} - $${expenseType.budget}`,
      value: expenseType.id,
      ...expenseType
    };
  });
} // setDefaultExpenseTypeData

/**
 * Sets the recipients to choose from based on expense type.
 */
function setRecipientOptions() {
  // creating or updating an expense as an admin
  this.recipientOptions = _compact(
    this.activeEmployees.map((employee) => {
      if (
        employee.value == this.userInfo.id ||
        employee.workStatus == 0 ||
        this.editedExpense.employeeId == employee.value
      ) {
        if (this.userInfo.id != this.editedExpense.employeeId && !this.asUser) {
          return employee;
        }
        return;
      }
      return employee;
    })
  );
} // setRecipientOptions

/**
 * Submits an expense.
 */
async function submit() {
  // NOTE: Submit sometimes called multiple times. Normally occurs when submitting an expense after changing code.
  if (this.$refs.form != undefined || this.$refs.form != null) {
    if (this.$refs.form.validate()) {
      // NOTE: this second validate may be unnecessary. included in checkCoverage()
      // set the description if a recipient is required

      if (!this.reqRecipient) {
        this.editedExpense.recipient = null;
      }

      if (this.editedExpense?.rejections?.softRejections) {
        this.editedExpense.rejections.softRejections.revised = true;
      }

      if (this.isEmpty(this.editedExpense.id)) {
        // creating a new expense
        await this.createNewEntry();
      } else {
        // editing a current expense
        await this.updateExistingEntry();
      }
    }
    this.loading = false; // set loading status to false

    this.emitter.emit('endAction');
    this.isHighFive = false; // set high five back to false
    this.reqRecipient = false;
    this.clearForm();

    // update budgets in store
    await this.updateStoreBudgets();
    this.emitter.emit('updateData');
  }
} // submit

/**
 * Updates an existing expense.
 */
async function updateExistingEntry() {
  let updatedAttachment;
  let updatedExpense;

  // if updating an expense
  if (this.isReceiptRequired() && this.files) {
    // if receipt required and updating receipt
    // stores file name for lookup later

    let fileNames = [];
    for (let i = 0; i < this.files.length; i++) {
      fileNames[i] = this.files[i].name;
    }
    this.editedExpense['receipt'] = fileNames;
    // upload attachment to S3
    updatedAttachment = await api.createAttachment(this.editedExpense, this.files);
    if (updatedAttachment[0].key) {
      // successfully uploaded file
      // update item in database
      updatedExpense = await api.updateItem(api.EXPENSES, this.editedExpense);
      if (updatedExpense.id) {
        // successfully updates expense
        if (this.editedExpense.expenseTypeId == this.originalExpense.expenseTypeId) {
          // same expense type
          this.emitter.emit('update', updatedExpense);
        } else {
          // changing expense type
          this.emitter.emit('delete', this.originalExpense);
          this.emitter.emit('add', updatedExpense);
        }
        this.clearForm();
      } else {
        // emit error if failed to upload expense
        this.emitter.emit('error', updatedExpense.response.data.message);
      }
    } else {
      // error uploading file
      console.log(updatedAttachment);
      this.emitter.emit('error', updatedAttachment.response.data.message);
    }
  } else {
    // if not updating receipt
    if (!this.isReceiptRequired()) {
      this.files = [];
      this.editedExpense['receipt'] = null;
    }

    // update item in database
    updatedExpense = await api.updateItem(api.EXPENSES, this.editedExpense);
    if (updatedExpense.id) {
      // successfully updates expense
      if (this.editedExpense.expenseTypeId == this.originalExpense.expenseTypeId) {
        // same expense type
        this.emitter.emit('update', updatedExpense);
      } else {
        // changing expense type
        this.emitter.emit('delete', this.originalExpense);
        this.emitter.emit('add', updatedExpense);
      }
      this.clearForm();
    } else {
      // emit error if failed to upload expense
      this.emitter.emit('error', updatedExpense.response.data.message);
    }
  }
} // updateExistingEntry

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Set employee role, user info, expense types, and current user view. Creates event listeners.
 */
function created() {
  this.employeeRole = this.getRole();
  this.userInfo = this.$store.getters.user;

  this.emitter.on('error', () => {
    this.errorSubmitting = true;
  });
  this.emitter.on('fileSelected', (file) => {
    this.setFile(file);
  });
  this.emitter.on('canceledSubmit', () => {
    this.loading = false; // set loading status to false
    this.emitter.emit('endAction');
  });
  this.emitter.on('confirmSubmit', async () => {
    await this.submit(); // submit expense
  });
  this.emitter.on('confirmed-expense', async () => {
    this.confirmingValid = false;
    await this.checkCoverage();
  });
  this.emitter.on('canceled-expense', () => {
    this.confirmingValid = false;
  });
  this.emitter.on('backout-canceled-expense', () => {
    this.confirmBackingOut = false;
  });
  this.emitter.on('backout-confirmed-expense', () => {
    this.confirmBackingOut = false;
    this.clearForm();
  });
  this.emitter.on('close-exchange-training-hours-calculator', () => {
    this.showExchangeCalculator = false;
  });
  this.emitter.on('insert-training-desc', (desc) => {
    this.showExchangeTrainingDesc = false;
    this.editedExpense.description = desc;
  });
  this.emitter.on('close-exchange-training-desc', () => {
    this.showExchangeTrainingDesc = false;
  });
  this.emitter.on('insert-training-hours', (amount) => {
    this.showExchangeCalculator = false;
    this.costFormatted = amount;
    this.formatCost();
    this.editedExpense.cost = this.parseCost(this.costFormatted);
  });

  this.myBudgetsView = this.$route.path === '/myBudgets';
  this.isInactive = this.myBudgetsView && this.userInfo.workStatus == 0;
  this.asUser = this.myBudgetsView || this.employeeRole === 'user' || this.employeeRole === 'intern';
  if (this.asUser) {
    // creating or updating an expense as a user
    this.editedExpense['employeeName'] = `${this.userInfo.firstName} ${this.userInfo.lastName}`;
    this.editedExpense['employeeId'] = this.userInfo.id;
  }
  // creating or updating an expense as an admin
  let employees = this.$store.getters.employees;
  this.employees = employees.map((employee) => {
    return {
      id: employee.id,
      text: employeeUtils.nicknameAndLastName(employee),
      value: employee.id,
      workStatus: employee.workStatus,
      firstName: employee.firstName,
      nickname: employee.nickname,
      lastName: employee.lastName,
      employeeRole: employee.employeeRole
    };
  });
  //only active employees
  this.activeEmployees = this.employees.map((employee) => {
    if (employee.workStatus == 0) {
      return;
    } else {
      return employee;
    }
  });
  this.activeEmployees = _compact(this.activeEmployees);

  this.setRecipientOptions();

  // set aggregate expense types
  this.setDefaultExpenseTypeData();

  // adjust costRules to prevent users from using negative expenses
  if (this.employeeRole && this.employeeRole == 'admin') {
    this.costRules.splice(1, 0, (v) => (!this.isEmpty(v) && v != 0) || 'Cost cannot be zero');
  } else {
    this.costRules.splice(
      1,
      0,
      (v) => (!this.isEmpty(v) && v.split(',').join('') > 0) || 'Cost must be a positive number'
    );
  }

  this.clearForm();
} // created

/**
 * destroy listeners
 */
function beforeUnmount() {
  this.emitter.off('canceledSubmit');
  this.emitter.off('confirmSubmit');
  this.emitter.off('confirmed-expense');
  this.emitter.off('canceled-expense');
  this.emitter.off('close-exchange-training-desc');
  this.emitter.off('backout-canceled-expense');
  this.emitter.off('backout-confirmed-expense');
  this.emitter.off('close-exchange-training-hours-calculator');
} // beforeUnmount

/**
 * Extends the Number object to populate a given size with zeros.
 *
 * @param size - size of number
 * @return String - number with size number of zeros
 */
Number.prototype.pad = function (size) {
  var s = String(this);
  while (s.length < (size || 2)) {
    s = '0' + s;
  }
  return s;
}; // Number.prototype.pad

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for expense.id - sets the edited expense and original expense and determines if it is being edited.
 */
function watchExpenseID() {
  this.editedExpense = _cloneDeep(this.expense);
  this.originalExpense = _cloneDeep(this.editedExpense);
  //when model id is not empty then must be editing an expense
  if (!this.isEmpty(this.expense.id)) {
    this.emitter.emit('editing-expense'); //notify parent that expense is being edited
    this.costFormatted = Number(this.editedExpense.cost).toLocaleString();
    this.submittedReceipt = this.editedExpense.receipt;
  } else {
    this.clearForm();
  }

  this.selectedExpenseType = _find(this.expenseTypes, (expenseType) => {
    if (expenseType.value === this.editedExpense.expenseTypeId) {
      return expenseType;
    }
  });

  if (this.asUser) {
    // creating or updating an expense as a user
    this.editedExpense['employeeName'] = `${this.userInfo.firstName} ${this.userInfo.lastName}`;
    this.editedExpense['employeeId'] = this.userInfo.id;
  }
} // watchExpenseID

/**
 * watcher for editedExpense.cost - updates remaining budget.
 */
async function watchEditedExpenseCost() {
  //update remaining budget
  await this.getRemainingBudget();
} // watchEditedExpenseCost

/**
 * watcher for editedExpense.expenseTypeId - set fields for the that expenseType.
 */
async function watchEditedExpenseExpenseTypeID() {
  this.selectedExpenseType = _find(this.expenseTypes, (expenseType) => {
    return expenseType.value === this.editedExpense.expenseTypeId;
  });
  this.requireURLET = this.selectedExpenseType && this.selectedExpenseType.requireURL;

  if (this.selectedExpenseType) {
    // set hint
    this.hint = this.selectedExpenseType.recurringFlag
      ? 'Recurring Expense Type'
      : `Available from ${this.format(this.selectedExpenseType.startDate, null, 'MM/DD/YYYY')} - ${this.format(
          this.selectedExpenseType.endDate,
          null,
          'MM/DD/YYYY'
        )}`;

    // set high five cost
    // HARD CODE
    if (this.selectedExpenseType.budgetName === 'High Five') {
      this.costFormatted = '50.00';
      this.editedExpense.cost = '50.00';
      this.isHighFive = true;
      // dont clear when selecting a previous expense to edit
    } else if (!this.editedExpense.edit) {
      this.costFormatted = '';
      this.editedExpense.cost = '';
      this.isHighFive = false;
    }
    this.editedExpense.edit = false;
    // set requires recipient
    this.reqRecipient = this.selectedExpenseType.hasRecipient;

    let localRecipient = _find(this.employees, (employee) => employee.value == this.editedExpense.recipient);
    this.recipientPlaceholder = localRecipient ? localRecipient.text : '';
    // set show on company feed and require url
    if (
      !_isEqual(this.originalExpense, this.editedExpense) ||
      _isNil(this.editedExpense.id) ||
      _isEmpty(this.editedExpense.id)
    ) {
      // changing the expense type
      if (!this.isEdit && this.selectedExpenseType.alwaysOnFeed) {
        // if expense type is always on feed
        this.editedExpense.showOnFeed = true;
      } else {
        // if expense type is not always on feed
        if (!_isEmpty(this.selectedExpenseType.categories)) {
          // expense type has categories
          let category = _find(this.selectedExpenseType.categories, (category) => {
            return category == this.editedExpense.category;
          });
          this.editedExpense.showOnFeed = category ? category.showOnFeed : false;
        }
      }
    }

    if (this.selectedExpenseType.requireURL) {
      // if expense type always requires url
      this.editedExpense.requireURL = true;
    } else {
      // if expense type does not always require url
      if (_isEmpty(this.selectedExpenseType.categories)) {
        // expense type does not have categories
        this.editedExpense.requireURL = false;
      } else {
        // expense type has categories
        let category = _find(this.selectedExpenseType.categories, (category) => {
          return category == this.editedExpense.category;
        });
        this.editedExpense.requireURL = category ? category.requireURL : false;
      }
    }
    this.editedExpense = _cloneDeep(this.editedExpense); //need to clone editedExpense in order to see label URL changes
  } else {
    this.hint = '';
  }

  //update remaining budget
  await this.getRemainingBudget();
} // watchEditedExpenseExpenseTypeID

/**
 * watcher for editedExpense.category - set fields based on category.
 */
function watchEditedExpenseCategory() {
  if (
    !_isNil(this.selectedExpenseType) &&
    (!_isEqual(this.originalExpense.category, this.editedExpense.category) ||
      !_isEqual(this.originalExpense.expenseTypeId, this.editedExpense.expenseTypeId) ||
      _isNil(this.editedExpense.id))
  ) {
    // category or expense type is changed
    if (this.selectedExpenseType.alwaysOnFeed) {
      // if expense type is always on feed
      this.editedExpense.showOnFeed = true;
    } else {
      // if expense type is not always on feed
      if (_isEmpty(this.selectedExpenseType.categories)) {
        // expense type does not have categories
        this.editedExpense.showOnFeed = false;
      } else {
        // expense type has categories
        let category = _find(this.selectedExpenseType.categories, (category) => {
          return category.name == this.editedExpense.category;
        });
        this.editedExpense.showOnFeed = category ? category.showOnFeed : false;
      }
    }
  } else {
    // category and expense type are not changed
    this.editedExpense.showOnFeed = this.originalExpense.showOnFeed;
  }

  if (!_isNil(this.selectedExpenseType)) {
    if (this.selectedExpenseType.requireURL) {
      // if expense type requires url
      this.editedExpense.requireURL = true;
    } else {
      // if expense type does not always require url
      if (_isEmpty(this.selectedExpenseType.categories)) {
        // expense type does not have categories
        this.editedExpense.requireURL = false;
      } else {
        // expense type has categories
        let category = _find(this.selectedExpenseType.categories, (category) => {
          return category.name == this.editedExpense.category;
        });
        this.editedExpense.requireURL = category ? category.requireURL : false;
      }
    }
    this.editedExpense = _cloneDeep(this.editedExpense); //need to clone editedExpense in order to see label URL changes
  }
} // watchEditedExpenseCategory

/**
 * watcher for editedExpense.employeeId - set options and get budgets.
 */
async function watchEditedExpenseEmployeeID() {
  this.setDefaultExpenseTypeData();
  this.setRecipientOptions();
  await this.getRemainingBudget();
} // watchEditedExpenseEmployeeID

/**
 * watcher for editedExpense.purchaseDate - format date.
 */
function watchEditedExpensePurchaseDate() {
  this.purchaseDateFormatted =
    this.format(this.editedExpense.purchaseDate, null, 'MM/DD/YYYY') || this.purchaseDateFormatted;
  //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
  if (this.editedExpense.purchaseDate !== null && !this.format(this.editedExpense.purchaseDate, null, 'MM/DD/YYYY')) {
    this.editedExpense.purchaseDate = null;
  }
} // watchEditedExpensePurchaseDate

/**
 * watcher for editedExpense.reimbursedDate - format date.
 */
function watchEditedExpenseReimbursedDate() {
  this.reimbursedDateFormatted =
    this.format(this.editedExpense.reimbursedDate, null, 'MM/DD/YYYY') || this.reimbursedDateFormatted;
  //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
  if (
    this.editedExpense.reimbursedDate !== null &&
    !this.format(this.editedExpense.reimbursedDate, null, 'MM/DD/YYYY')
  ) {
    this.editedExpense.reimbursedDate = null;
  }
} // watchEditedExpenseReimbursedDate

/**
 * watcher for file -  decides whether to disable scan button.
 */
function watchFiles() {
  //for disabling the scan button
  if (this.files == [] || this.files == null) {
    //if no file
    this.disableScan = true;
  } else {
    this.disableScan = false;
  }
  for (let i = 0; i < this.files.length; i++) {
    if (
      this.files[i].type != 'image/jpeg' &&
      this.files[i].type != 'image/png' &&
      this.files[i].type != 'application/pdf'
    ) {
      //if file isn't jpg or png
      this.disableScan = true;
    }
  }
} // watchFile

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  beforeUnmount,
  components: {
    CancelConfirmation,
    ConfirmationBox,
    FileUpload,
    GeneralConfirmationModal,
    ExchangeTrainingHoursCalculator,
    ExchangeTrainingDescription
  },
  computed: {
    descriptionRules,
    isDifferentExpenseType,
    isReimbursed,
    isMobile,
    receiptRequired,
    notesLabel,
    urlLabel
  },
  data() {
    return {
      activeEmployees: [], // active employees
      allowReceipt: false, // allow receipt to be uploaded
      asUser: true, // user view
      confirming: false, // budget overage confirmation box activator
      confirmingValid: false,
      confirmBackingOut: false,
      costFormatted: '',
      costRules: [
        (v) => !this.isEmpty(v) || 'Cost is a required field',
        (v) =>
          /^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?$/.test(v) ||
          'Expense amount must be a number with two decimal digits',
        (v) => this.parseCost(v) < 1000000000 || 'Nice try' //when a user tries to fill out expense that is over a million
      ], // rules for cost
      disableScan: true, // receipt scanned disabled
      //editedExpense: {}, // data being edited --
      editedExpense: _cloneDeep(this.expense),
      employee: null, // employee selected
      employeeBudgets: null, // selected employee's budgets
      employeeRole: '', // employee role
      employees: [], // employees
      errorSubmitting: false, // avoid clearing fields if error exists
      expenseTypes: [], // expense types
      expenseTypeName: null, //expense type name for budget
      files: [], // receipts
      hint: '', // form hints
      isCovered: false, // expense is fully covered
      isHighFive: false, // expense is a high five
      isInactive: false, // employee is inactive -- also used for uploading reciepts dont delete
      isOverCovered: false, // expense is only partially covered
      loading: false, // loading
      myBudgetsView: false, // if on myBudgetsView page
      originalExpense: null, // expense before changes
      overdraftBudget: 0,
      purchaseDateFormatted: null, // formatted purchase date
      purchaseMenu: false, // display purchase menu
      receiptRules: [(v) => !this.isEmpty(v) || 'Receipts are required'], // rules for receipt
      recipientOptions: [], // list of active employees to choose for high five
      recipientPlaceholder: '',
      reimbursedDateFormatted: null, // formatted reimburse date
      reimburseMenu: false, // display reimburse menu
      remainingBudget: 0,
      reqRecipient: false, // expense requires recipient
      scanLoading: false, // determines if the scanning functionality is loading
      selectedEmployee: {}, // selected employees
      selectedExpenseType: {}, // selected expense types
      showExchangeCalculator: false,
      showExchangeTrainingDesc: false,
      submittedReceipt: null, // the receipt to show when editing an expense
      urlInfo: {
        id: null,
        category: null,
        hits: 0
      }, // training url info
      userInfo: {}, // user info
      valid: false // form validity
    };
  },
  directives: { mask },
  methods: {
    addURLInfo,
    calcAdjustedBudget,
    checkCoverage,
    clearForm,
    createNewEntry,
    convertToMoneyString,
    costHint,
    descRedirect,
    employeeFilter,
    encodeUrl,
    filteredExpenseTypes,
    formatCost,
    format,
    getCategories,
    getDateRules,
    getDateOptionalRules,
    getNonFutureDateRules,
    getExpenseTypeSelected,
    getRole,
    getRemainingBudget,
    getRequiredRules,
    getRequireURL,
    getURLRules,
    hasAccess,
    incrementURLHits,
    isEmpty,
    isFullTime,
    isReceiptRequired,
    parseCost,
    preformatFloat,
    notesRules,
    scanFile,
    setFile,
    setDefaultExpenseTypeData,
    setRecipientOptions,
    submit,
    updateExistingEntry,
    userRoleIsAdmin,
    userRoleIsManager,
    updateStoreBudgets
  },
  props: [
    'expense', // expense to be created/updated
    'isEdit' // if updating an expense
  ],
  watch: {
    'expense.id': watchExpenseID,
    'editedExpense.cost': watchEditedExpenseCost,
    'editedExpense.expenseTypeId': watchEditedExpenseExpenseTypeID,
    'editedExpense.category': watchEditedExpenseCategory,
    'editedExpense.employeeId': watchEditedExpenseEmployeeID,
    'editedExpense.purchaseDate': watchEditedExpensePurchaseDate,
    'editedExpense.reimbursedDate': watchEditedExpenseReimbursedDate,
    files: watchFiles
  }
};
</script>
