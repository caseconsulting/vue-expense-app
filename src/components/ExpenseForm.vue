<template>
  <v-card class="mt-3" hover>
    <v-card-title class="header_style">
      <!-- Editing an Expense -->
      <h3 v-if="expense.id && (isAdmin || !isReimbursed)">Edit Expense</h3>
      <!-- Creating an Expense -->
      <h3 v-else-if="!isInactive">Create New Expense</h3>
      <!-- Inactive Employee -->
      <h3 v-else>Inactive Employee</h3>
    </v-card-title>
    <v-container fluid>
      <v-form ref="form" v-model="valid" lazy-validation>
        <!-- Employee picker if admin -->
        <v-autocomplete
          v-if="!asUser"
          :items="activeEmployees"
          :rules="requiredRules"
          :filter="customFilter"
          :disabled="isReimbursed || isEdit || isInactive"
          v-model="editedExpense.employeeId"
          item-text="text"
          label="Employee"
          id="employeeName"
          class="form_padding"
        ></v-autocomplete>

        <!-- Expense Type Picker if Admin -->
        <v-autocomplete
          v-if="!asUser"
          :items="filteredExpenseTypes()"
          :rules="requiredRules"
          :disabled="isInactive"
          v-model="editedExpense.expenseTypeId"
          label="Expense Type"
          id="expenseType"
          :hint="hint"
          persistent-hint
          @input="getExpenseTypeSelected"
        ></v-autocomplete>

        <!-- Expense Type Picker if User -->
        <v-autocomplete
          v-else
          :items="filteredExpenseTypes()"
          :disabled="isInactive"
          :rules="requiredRules"
          v-model="editedExpense.expenseTypeId"
          label="Expense Type"
          :hint="hint"
          persistent-hint
          @input="getExpenseTypeSelected"
          class="form_padding"
        ></v-autocomplete>

        <!-- Category -->
        <v-select
          v-if="getCategories() != null && getCategories().length >= 1"
          :rules="requiredRules"
          :disabled="isInactive"
          v-model="editedExpense.category"
          :items="getCategories()"
          label="Select Category"
          clearable
          chips
        ></v-select>

        <!-- Remaining budget total -->
        <v-card class="mt-2">
          <v-card-text class="py-1 text-subtitle-1 grey-lighten-2--text">
            <span v-if="!editedExpense.employeeId">Please choose an employee to see remaining balance.</span>
            <span v-else-if="!editedExpense.expenseTypeId">
              Please choose an expense type to see remaining balance.
            </span>
            <span v-else-if="remainingBudget === ''">Remaining budget for current expense type is not available.</span>
            <span v-else-if="expenseTypeName">
              Remaining budget for {{ expenseTypeName }}:
              <span :class="{ negativeBudget: remainingBudget <= 0 }">{{ remainingBudget.toFixed(2) }}</span>
            </span>
          </v-card-text>
        </v-card>

        <!-- Cost -->
        <v-text-field
          prefix="$"
          v-model="editedExpense.cost"
          :rules="costRules"
          :disabled="isReimbursed || isInactive || isHighFive"
          label="Cost"
          id="cost"
          data-vv-name="Cost"
        ></v-text-field>

        <!-- Employee Selection List -->
        <v-autocomplete
          v-if="this.reqRecipient"
          :items="this.recipientOptions"
          :rules="requiredRules"
          :disabled="isReimbursed"
          v-model="editedExpense.recipient"
          label="Recipient"
          id="recipient"
          class="form_padding"
          :placeholder="recipientPlaceholder"
        ></v-autocomplete>

        <!-- Description -->
        <v-text-field
          v-if="!this.reqRecipient"
          v-model="editedExpense.description"
          :rules="descriptionRules"
          :disabled="isInactive"
          id="description"
          label="Description"
          data-vv-name="Description"
        ></v-text-field>

        <!-- Purchase Date -->
        <v-menu
          v-if="isUser || isAdmin || isIntern"
          ref="purchaseMenu"
          :close-on-content-click="true"
          v-model="purchaseMenu"
          :nudge-right="40"
          :disabled="isReimbursed && !isDifferentExpenseType"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="purchaseDateFormatted"
              id="purchaseDate"
              :rules="dateRules"
              :disabled="(isReimbursed && !isDifferentExpenseType) || isInactive"
              v-mask="'##/##/####'"
              label="Purchase Date"
              hint="MM/DD/YYYY format"
              persistent-hint
              prepend-icon="event"
              @blur="editedExpense.purchaseDate = parseDate(purchaseDateFormatted)"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="editedExpense.purchaseDate" no-title @input="purchaseMenu = false"></v-date-picker>
        </v-menu>

        <!-- Reimbursed Date -->
        <v-menu
          v-if="isAdmin"
          ref="reimburseMenu"
          :close-on-content-click="false"
          v-model="reimburseMenu"
          :nudge-right="40"
          :disabled="isReimbursed && !isDifferentExpenseType"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="reimbursedDateFormatted"
              id="reimburseDate"
              :rules="optionalDateRules"
              :disabled="(isReimbursed && !isDifferentExpenseType) || isInactive"
              v-mask="'##/##/####'"
              label="Reimburse Date (optional)"
              hint="MM/DD/YYYY format "
              persistent-hint
              prepend-icon="event"
              @blur="editedExpense.reimbursedDate = parseDate(reimbursedDateFormatted)"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="editedExpense.reimbursedDate" no-title @input="reimburseMenu = false"></v-date-picker>
        </v-menu>

        <!-- Receipt Uploading -->
        <v-checkbox
          v-if="receiptRequired && isEdit && !isEmpty(expense.receipt)"
          style="padding-top: 20px; padding-bottom: 0px"
          v-model="allowReceipt"
          label="Update the Receipt?"
          :disabled="isInactive"
        ></v-checkbox>
        <file-upload
          v-if="receiptRequired && ((allowReceipt && isEdit) || !isEdit || isEmpty(expense.receipt))"
          style="padding-top: 0px; padding-bottom: 0px"
          @fileSelected="setFile"
          :passedRules="receiptRules"
          :receipt="expense.receipt"
        ></file-upload>

        <!-- Receipt Name -->
        <v-card-text
          style="padding: 0px 0px 3px 0px; font: inherit; font-size: 16px; color: #0000008a"
          v-if="!isEmpty(expense.receipt) && isEdit"
          >Current Receipt: {{ this.editedExpense.receipt }}</v-card-text
        >

        <!-- Scan Receipt Button -->
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <span v-on="on">
              <v-btn
                v-if="receiptRequired && ((allowReceipt && isEdit) || !isEdit || isEmpty(expense.receipt))"
                color="white"
                @click="scanFile"
                class="ma-2"
                :disabled="isInactive || disableScan"
                v-bind="attrs"
              >
                Scan Receipt
              </v-btn>
            </span>
          </template>
          <span>Scanning only works for pngs and jpegs.</span>
        </v-tooltip>

        <!-- Notes -->
        <v-textarea
          v-model="editedExpense.note"
          :rules="notesRules"
          :label="notesLabel"
          id="notes"
          data-vv-name="Description"
          :disabled="isInactive"
        ></v-textarea>

        <!-- URL -->
        <v-text-field
          v-model="editedExpense.url"
          :rules="urlRules"
          :label="urlLabel"
          :disabled="isInactive"
        ></v-text-field>

        <!-- Show On Feed -->
        <v-switch
          v-if="isAdmin"
          :disabled="isInactive"
          v-model="editedExpense.showOnFeed"
          label="Have expense show on company feed?"
        ></v-switch>

        <!-- Buttons -->
        <!-- Cancel Button -->
        <v-btn color="white" elevation="2" @click="clearForm" class="ma-2" :disabled="isInactive">
          <icon class="mr-1" name="ban"></icon>Cancel
        </v-btn>

        <!-- Submit Button -->
        <v-btn
          outlined
          color="success"
          @click="checkCoverage"
          :disabled="!valid || (!isAdmin && isReimbursed) || isInactive"
          id="submitButton"
          :loading="loading"
          class="ma-2"
        >
          <icon class="mr-1" name="save"></icon>Submit
        </v-btn>
        <!-- End Buttons -->
      </v-form>
      <confirmation-box
        :isCovered="isCovered"
        :isOverCovered="isOverCovered"
        :toggleConfirmationBox="confirming"
        :expense="editedExpense"
      ></confirmation-box>
    </v-container>
  </v-card>
</template>

<script>
import api from '@/shared/api.js';
import ConfirmationBox from '@/components/modals/ConfirmationBox.vue';
import dateUtils from '@/shared/dateUtils';
import employeeUtils from '@/shared/employeeUtils';
import FileUpload from '@/components/FileUpload.vue';
import { getRole } from '@/utils/auth';
import { v4 as uuid } from 'uuid';
import { isEmpty, isFullTime } from '@/utils/utils';
import { mask } from 'vue-the-mask';
import _ from 'lodash';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');

const IsoFormat = 'YYYY-MM-DD';

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Get the category options for the selected expense type. Returns a sorted list of categories for the expense type.
 *
 * @return
 */
function getCategories() {
  this.selectedExpenseType = _.find(this.expenseTypes, (expenseType) => {
    if (expenseType.value === this.editedExpense.expenseTypeId) {
      return expenseType;
    }
  });
  if (this.selectedExpenseType) {
    return _.map(this.selectedExpenseType.categories, (category) => {
      return category.name;
    });
  }
  return [];
} // getCategories

/**
 * Checks if the employee is an admin. Returns true if the employee is an admin, otherwise returns false.
 *
 * @return boolean - employee is an admin
 */
function isAdmin() {
  return this.employeeRole === 'admin';
} // isAdmin

/**
 * Checks if the employee is an intern. Returns true if the employee is an intern, otherwise returns false.
 *
 * @return boolean - employee is an intern
 */
function isIntern() {
  return this.employeeRole === 'intern';
} // isAdmin

/**
 * Checks if a receipt is required. Returns true if the receipt is required, otherwise returns false.
 *
 * @return boolean - receipt is required
 */
function receiptRequired() {
  this.selectedExpenseType = _.find(this.expenseTypes, (expenseType) => {
    if (expenseType.value === this.editedExpense.expenseTypeId) {
      return expenseType;
    }
  });
  if (this.selectedExpenseType) {
    return this.selectedExpenseType.requiredFlag;
  }
  return true;
} // receiptRequired

/**
 * Checks if the expense is reimbursed. Returns true if the expense is reimbursed, otherwise returns false.
 *
 * @return boolean - expense is reimbursed
 */
function isReimbursed() {
  return this.isEdit && this.originalExpense && !isEmpty(this.originalExpense.reimbursedDate);
} // isReimbursed

/**
 * Checks if the employee is a user. Returns true if the employee is a user, otherwise returns false.
 *
 * @return boolean - employee is a user
 */
function isUser() {
  return this.employeeRole === 'user';
} // isUser

/**
 * Creates the rules for the notes section based on whether or not
 *  the current expense type requires a recipient
 *
 *  @return rule
 */
function notesRules() {
  const notesRules = [];

  if (this.reqRecipient) {
    const notesRule = (v) => !isEmpty(v) || 'Notes is a required field';
    notesRules.push(notesRule);
  }

  return notesRules;
}
/**
 * Creates the label for the notes section base on if it is optional
 *
 * @return string - label
 */
function notesLabel() {
  if (this.reqRecipient) {
    return 'Notes';
  } else {
    return 'Notes (optional)';
  }
}
/**
 * Creates the label for the url section base on if it is optional
 *
 * @return string - label
 */
function urlLabel() {
  return this.editedExpense.requireURL ? 'URL' : 'URL (optional)';
}

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets the remaining budget for the current expense type
 */
async function getRemainingBudget() {
  if (this.editedExpense.expenseTypeId && this.editedExpense.employeeId) {
    let budgets = await api.getAllActiveEmployeeBudgets(this.editedExpense.employeeId);
    if (budgets) {
      let budget = budgets.find((currBudget) => currBudget.expenseTypeId === this.editedExpense.expenseTypeId);

      if (budget) {
        this.remainingBudget =
          budget.budgetObject.amount -
          budget.budgetObject.pendingAmount -
          budget.budgetObject.reimbursedAmount -
          this.editedExpense.cost;
        this.expenseTypeName = budget.expenseTypeName;
      } else {
        this.remainingBudget = '';
      }
    }
  }
}

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

  let encodedURL = await this.encodeUrl(newExpense.url); // encode url

  // get url info
  let item = await api.getURLInfo(encodedURL, newExpense.category);
  if (item.id) {
    // increment hits if the url already exists
    this.urlInfo = item;
    await this.incrementURLHits();
  } else {
    // create a new url and category if it does not already exist
    this.$set(this.urlInfo, 'id', newExpense.url);

    //adds categories to the list if applicable
    if (newExpense.category) {
      this.$set(this.urlInfo, 'category', newExpense.category);
    } else {
      this.$set(this.urlInfo, 'category', null);
    }
    this.$set(this.urlInfo, 'hits', 1);
    await api.createItem(api.URLS, this.urlInfo);
  }
} // addURLInfo

/**
 * Check if today is between a set of given dates in isoformat. Returns true if today is between the two dates,
 * otherwise returns false.
 *
 * @param start - start date
 * @param end - end date
 * @return boolean - today is in set of dates
 */
function betweenDates(start, end) {
  let startDate = moment(start, IsoFormat);
  let endDate = moment(end, IsoFormat);
  return moment().isBetween(startDate, endDate, 'day', '[]');
} // betweenDates

/**
 * Calculates the adjusted budget amount for an expense type based on an employee's work status. Returns the adjust
 * amount.
 *
 * @param employee - Employee to adjust amount for
 * @param expenseType - ExpenseType budget to be adjusted
 * @return Number - adjusted budget amount
 */
function calcAdjustedBudget(employee, expenseType) {
  if (hasAccess(employee, expenseType)) {
    if (expenseType.accessibleBy == 'FULL' || expenseType.accessibleBy == 'FULL TIME') {
      return expenseType.budget;
    } else {
      return Number((expenseType.budget * (employee.workStatus / 100.0)).toFixed(2));
    }
  } else {
    return 0;
  }
} // calcAdjustedBudget

/**
 * Checks how much of the expense is covered and submits the expense.
 */
async function checkCoverage() {
  this.isInactive = true;
  if (this.$refs.form.validate()) {
    this.$emit('startAction');
    // form is validated
    this.loading = true; // set loading status to true
    if (this.editedExpense) {
      // expense exists
      // get expense type
      let expenseType = _.find(this.expenseTypes, (type) => this.editedExpense.expenseTypeId === type.value);

      // get employee
      if (this.asUser) {
        // creating or updating an expense as a user
        this.employee = await api.getUser();
      } else {
        // creating or updating an expense as an admin
        this.employee = await api.getItem(api.EMPLOYEES, this.editedExpense.employeeId);
      }

      // get budget
      let budget = await api.getEmployeeBudget(this.employee.id, expenseType.value, this.editedExpense.purchaseDate);

      if (this.employee.workStatus == 0) {
        // emit error if user is inactive
        this.$emit('error', 'Current user is inactive');
        this.$emit('endAction');
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
        if (budget) {
          // BRANCH 1.1 if the matching budget exists
          let committedAmount = budget.pendingAmount + budget.reimbursedAmount;
          let allExpenses = await api.getAllAggregateExpenses();
          let match = _.find(allExpenses, (entry) => {
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
            if (expenseType.budget > newCommittedAmount) {
              //BRANCH 3.1 under initial budget (not including overdraft)
              if (newCommittedAmount + cost <= expenseType.budget) {
                // BRANCH 4.1 under initial budget and not going into overdraft after applying expense
                this.submit();
              } else if (newCommittedAmount + cost <= 2 * expenseType.budget) {
                // BRANCH 4.2 goes over initial budget with new expense but stays below overdraft budget
                this.$set(this.editedExpense, 'budget', expenseType.budget);
                this.$set(this.editedExpense, 'remaining', expenseType.budget - newCommittedAmount);
                // this.$set(this.editedExpensee, 'od', true);
                this.isCovered = true;
                this.isOverCovered = false;
                this.confirming = !this.confirming;
              } else {
                // BRANCH 4.3 goes over overdraft budget completely
                this.$set(this.editedExpense, 'budget', expenseType.budget);
                this.$set(this.editedExpense, 'remaining', 2 * expenseType.budget - newCommittedAmount);
                this.$set(this.editedExpense, 'od', true);
                this.isCovered = false;
                this.isOverCovered = false;
                this.confirming = !this.confirming;
              }
            } else if (2 * expenseType.budget > newCommittedAmount) {
              // BRANCH 3.2 under overdraft budget -- expense is able to be made
              if (newCommittedAmount + cost <= 2 * expenseType.budget) {
                // BRANCH 5.1 above initial budget but below overdraft budget TODO: add condirmation box handling? new flag?
                this.$set(this.editedExpense, 'budget', expenseType.budget);
                this.$set(this.editedExpense, 'remaining', 2 * expenseType.budget - newCommittedAmount);
                this.$set(this.editedExpense, 'od', true);
                this.isCovered = true;
                this.isOverCovered = true;
                this.confirming = !this.confirming;
              } else {
                // BRANCH 5.2 budget not maxed out before this expense (going over overdraft) but expense not fully covered. Show adusted confirmation dialog
                this.$set(this.editedExpense, 'budget', expenseType.budget);
                this.$set(this.editedExpense, 'remaining', 2 * expenseType.budget - newCommittedAmount);
                this.$set(this.editedExpense, 'od', true);
                this.isCovered = false;
                this.isOverCovered = false;
                this.confirming = !this.confirming;
              }
            } else {
              // BRANCH 3.3 budget is already maxed out for overdraft expense can't be made
              this.$emit('error', 'Budget is maxed out');
              this.loading = false; // set loading status to false
              this.$emit('endAction');
            }
          } else {
            // BRANCH 2.2 selected expense type does not allow overdraft or employee is not full time
            this.$set(this.editedExpense, 'od', false);
            if (newCommittedAmount <= budget.amount) {
              // BRANCH 6.1 starts under initial budget
              if (newCommittedAmount + cost <= budget.amount) {
                // BRANCH 7.1 doesnt go over budget
                // reimburse the full expense
                this.submit();
              } else {
                // BRANCH 7.2 goes over budget
                this.$set(this.editedExpense, 'budget', budget.amount);
                this.$set(this.editedExpense, 'remaining', budget.amount - newCommittedAmount);
                this.isCovered = false;
                this.isOverCovered = false;
                this.confirming = !this.confirming;
              }
            } else {
              // BRANCH 6.2 budget is maxed out
              this.$emit('error', `${expenseType.budgetName} budget is maxed out`);
              this.loading = false; // set loading status to false
              this.$emit('endAction');
            }
          }
        } else {
          // BRANCH 1.2 budget for this expense does not exist
          if (expenseType.odFlag && this.isFullTime(this.employee)) {
            // Branch 8.1 selected expense type allows overdraft and employee is full time
            if (cost <= expenseType.budget) {
              // full amount reimbursed
              this.submit();
            } else if (cost <= 2 * expenseType.budget) {
              // the expense goes into overdraft but fully covered
              this.$set(this.editedExpense, 'budget', expenseType.budget);
              this.$set(this.editedExpense, 'remaining', expenseType.budget);
              this.$set(this.editedExpense, 'od', true);
              this.isCovered = true;
              this.isOverCovered = false;
              this.confirming = !this.confirming;
            } else {
              // expense goes past overdraft budget completely and is partially covered
              this.$set(this.editedExpense, 'budget', expenseType.budget);
              this.$set(this.editedExpense, 'remaining', 2 * expenseType.budget);
              this.$set(this.editedExpense, 'od', true);
              this.isCovered = false;
              this.isOverCovered = false;
              this.confirming = !this.confirming;
            }
          } else {
            // BRANCH 8.2 selected expense type does not allow overdraft or employee is not full time
            this.$set(this.editedExpense, 'od', false);
            // calculate adjusted budget amount based on employee's current work status
            let adjustedBudget = this.calcAdjustedBudget(this.employee, expenseType);
            if (cost <= adjustedBudget) {
              // reimburse the full expense
              this.submit();
            } else {
              // expense exceeds the budget but the expense not fully covered
              this.$set(this.editedExpense, 'budget', adjustedBudget);
              this.$set(this.editedExpense, 'remaining', adjustedBudget);
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
 * Check if purchase date is within the budget fiscal date range. Returns true if the purchase date is in the budget
 * date range, otherwise returns false.
 *
 * @param purchaseDate - expense purchase date
 * @param budget - budget for expense
 * @return boolean - expense purchase date is in budget dsate range.
 */
function checkExpenseDate(purchaseDate, budget) {
  let startDate, endDate, date;
  startDate = moment(budget.fiscalStartDate, IsoFormat);
  endDate = moment(budget.fiscalEndDate, IsoFormat);
  date = moment(purchaseDate);
  return date.isBetween(startDate, endDate, 'day', '[]');
} // checkExpenseDate

/**
 * Clears the form and sets all fields to a default state.
 */
function clearForm() {
  this.allowReceipt = false;
  this.$refs.form.reset();

  this.emit('finished-editing-expense'); //notify parent no longer editing an expense

  this.reqRecipient = false;
  this.recipientPlaceholder = null;
  this.editedExpense = _.cloneDeep(this.expense);
  this.originalExpense = this.editedExpense;
  this.purchaseDateFormatted = null;
  this.file = null;

  this.$set(this.urlInfo, 'url', '');
  this.$set(this.urlInfo, 'category', '');
  this.$set(this.urlInfo, 'hits', 0);

  if (this.asUser) {
    // creating or updating an expense as a user
    this.$set(this.editedExpense, 'employeeName', this.userInfo.id);
    this.$set(this.editedExpense, 'employeeId', this.userInfo.id);
  }
} // clearForm

/**
 * Creates a new expense.
 */
async function createNewEntry() {
  let updatedAttachment;
  let updatedExpense;

  let newUUID = uuid();
  this.$set(this.editedExpense, 'id', newUUID);
  this.$set(this.editedExpense, 'createdAt', moment().format('YYYY-MM-DD'));
  if (this.isReceiptRequired() && this.file) {
    // if receipt required and updating receipt
    // stores file name for lookup later
    this.$set(this.editedExpense, 'receipt', this.file.name);
    // upload attachment to S3
    updatedAttachment = await api.createAttachment(this.editedExpense, this.file);
    if (updatedAttachment.key) {
      // successfully uploads file
      updatedExpense = await api.createItem(api.EXPENSES, this.editedExpense);

      if (updatedExpense.id) {
        // successfully updates expense
        // TODO: Only add if training expense type.
        if (!isEmpty(updatedExpense.url) && !isEmpty(updatedExpense.category)) {
          await this.addURLInfo(updatedExpense);
        }

        this.$set(this.editedExpense, 'id', updatedExpense.id);
        this.$emit('add', updatedExpense);
        window.EventBus.$emit('showSnackbar', updatedExpense);
        window.EventBus.$emit('refreshChart', updatedExpense);
        this.clearForm();
      } else {
        // emit error if fails to update expense
        this.$emit('error', updatedExpense.response.data.message);
        this.$set(this.editedExpense, 'id', '');
      }
    } else {
      // emit error if fails to upload file
      this.$emit('error', updatedAttachment.response.data.message);
      this.$set(this.editedExpense, 'id', '');
    }
  } else {
    // if receipt not required or not updating receipt
    if (!this.isReceiptRequired()) {
      this.file = null;
      this.$set(this.editedExpense, 'receipt', null);
    }
    updatedExpense = await api.createItem(api.EXPENSES, this.editedExpense);

    if (updatedExpense.id) {
      // successfully updates expense
      // TODO: Only add if training expense type. Allow empty category
      if (!isEmpty(updatedExpense.url) && !isEmpty(updatedExpense.category)) {
        // add training url if url and category exist
        await this.addURLInfo(updatedExpense);
      }

      this.$set(this.editedExpense, 'id', updatedExpense.id);
      this.$emit('add', updatedExpense);
      window.EventBus.$emit('showSnackbar', updatedExpense);
      window.EventBus.$emit('refreshChart', updatedExpense);
      this.clearForm();
    } else {
      // emit error if fails to update expense
      this.$emit('error', updatedExpense.response.data.message);
      this.$set(this.editedExpense, 'id', '');
    }
  }
} // createNewEntry

/**
 * Custom filter for employee autocomplete options.
 *
 * @param item -
 * @param queryText -
 * @return
 */
function customFilter(item, queryText) {
  const hasValue = (val) => (val != null ? val : '');
  const text = hasValue(item.text);
  const query = hasValue(queryText);
  return text.toString().toLowerCase().indexOf(query.toString().toLowerCase()) > -1;
} // customFilter

/**
 * Encodes a url from binary to ascii. Returns the encoded url.
 *
 * @param url - url to encode
 * @return String - encoded url
 */
async function encodeUrl(url) {
  // return btoa(url).replace(/\//g, '%2F');
  return btoa(url);
} // encodeUrl

/**
 * Emits a message and data if it exists.
 *
 * @param msg - Message to emit
 */
function emit(msg) {
  window.EventBus.$emit(msg);
} // emit

/**
 * Filters expense type. Returns the expense types that the employee has access to and the budget amount.
 */
function filteredExpenseTypes() {
  let filteredExpType = [];
  let selectedEmployee = _.find(this.employees, ['value', this.editedExpense.employeeId]);
  if (!this.asUser) {
    // creating or updating an expense as a user
    _.forEach(this.expenseTypes, (expenseType) => {
      if (!expenseType.isInactive) {
        // expense type is active
        if (!selectedEmployee) {
          // add expense type if no employees are selected
          filteredExpType.push(expenseType);
        } else if (hasAccess({ id: selectedEmployee.value, workStatus: selectedEmployee.workStatus }, expenseType)) {
          // add expense type if the employee is selected and has access
          let amount = calcAdjustedBudget(selectedEmployee, expenseType); // calculate budget
          expenseType.text = `${expenseType.budgetName} - $${amount}`;
          filteredExpType.push(expenseType);
        }
      }
    });
  } else {
    // creating or updating an expense as an admin
    let employee = this.userInfo;
    _.forEach(this.expenseTypes, (expenseType) => {
      if (!expenseType.isInactive) {
        // expense type is active
        if (hasAccess(employee, expenseType)) {
          // user has access to the expense type
          if (expenseType.recurringFlag || betweenDates(expenseType.startDate, expenseType.endDate)) {
            // expense type is active
            let amount = calcAdjustedBudget(employee, expenseType);
            expenseType.text = `${expenseType.budgetName} - $${amount}`;
            filteredExpType.push(expenseType);
          }
        }
      }
    });
  }

  return filteredExpType;
} // filteredExpenseTypes

/**
 * Formats a date.
 *
 * @param date - date to format
 * @return Date - formatted date
 */
function formatDate(date) {
  return dateUtils.formatDate(date);
} // formatDate

/**
 * Gets an expense type given an expense type id. Returns the expense type selected and clears the expense
 * category.
 *
 * @param expenseTypeId - expense type id
 * @return Object - expense type selected
 */
function getExpenseTypeSelected(expenseTypeId) {
  if (this.editedExpense.expenseTypeId != expenseTypeId) {
    this.editedExpense.category = '';
  }
  return (this.selectedExpenseType = _.find(this.expenseTypes, (expenseType) => {
    if (expenseType.value === expenseTypeId) {
      return expenseType;
    }
  }));
} // getExpenseTypeSelected

/**
 * Check if an employee has access to an expense type. Returns true if employee has access, otherwise returns false.
 *
 * @param employee - Employee to access
 * @param expenseType - ExpenseType to be accessed
 * @return Boolean - employee has access to expense type
 */
function hasAccess(employee, expenseType) {
  if (expenseType.accessibleBy == 'ALL' || expenseType.accessibleBy == 'FULL') {
    return true;
  } else if (expenseType.accessibleBy == 'FULL TIME') {
    return employee.workStatus == 100;
  } else {
    return expenseType.accessibleBy.includes(employee.id);
  }
} // hasAccess

/**
 * Increment training url hit count.
 */
async function incrementURLHits() {
  this.urlInfo.hits = this.urlInfo.hits + 1;

  return await api.updateItem(api.URLS, this.urlInfo);
} // incrementURLHits

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
 * Checks if the selected expense type requires a receipt. Returns true if a receipt is required, otherwise returns false.
 *
 * @return boolean - receipt is required for expense type.
 */
function isReceiptRequired() {
  this.selectedExpenseType = _.find(this.expenseTypes, (expenseType) => {
    if (expenseType.value === this.editedExpense.expenseTypeId) {
      return expenseType;
    }
  });
  if (this.selectedExpenseType) {
    return this.selectedExpenseType.requiredFlag;
  }
  return true;
} // isReceiptRequired

//Returns a number with two decimal point precision as a string.
function moneyFilter(value) {
  return `${new Intl.NumberFormat('en-US', {
    style: 'decimal',
    useGrouping: false,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)}`;
} // moneyFilter

/**
 * Parse a date to isoformat (YYYY-MM-DD).
 *
 * @param Date = date to parse
 * @return Date - date in isoformat
 */
function parseDate(date) {
  return dateUtils.parseDate(date);
} // parseDate

/**
 * preformats different US/Europe money formats for parsing
 *
 * @param float - number to be formatted
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
 * Sets the file.
 *
 * @param file - receipt
 */
async function setFile(file) {
  if (file) {
    this.isInactive = true;
    this.file = file;
    this.$set(this.editedExpense, 'receipt', file.name);
    this.isInactive = false;
  } else {
    this.file = null;
    this.$set(this.editedExpense, 'receipt', null);
    this.receipt = null;
  }
} // setFile

/**
 * Scans the receipt file.
 */
async function scanFile() {
  let file = this.file;
  if (file) {
    this.isInactive = true;
    //go get text data from textract and comprehend

    this.receiptObject = await api.extractText(file);
    if (this.receiptObject instanceof Error) {
      this.isInactive = false;
      this.receiptObject = null;
      return;
    }

    let totalPrice;
    let failed = false;

    _.forEach(this.receiptObject.KeyValueSets, (relationship) => {
      //loop through keyvaluesets

      let keys = Object.values(relationship.Keys); //grab the text and confidence objects
      let keyText = '';
      _.forEach(keys, (key) => {
        // loop through each one
        keyText += key.Text.toLowerCase() + ' ';
      });

      if (_.includes(keyText, 'total') && !_.includes(keyText, 'sub') && !_.includes(keyText, 'tax')) {
        //check if there is a total in any relationship
        //if there is loop throught the values in that relationship, and build the text.

        let valText = '';
        let valConfidence = 100;
        //build value string
        _.forEach(relationship.Values, (value) => {
          valText += value.Text + '';
          valConfidence = Math.min(valConfidence, value.Confidence); //key: Total: Values: USD confidence 99 141500 confidence 50
        });
        //set string to format that parsefloat will like and parse it
        valText = preformatFloat(valText);
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
      _.forEach(this.receiptObject.Words, (word) => {
        //loop through word object
        if (isTotal) {
          //if the previous word was total
          if (word.Confidence >= 90) {
            //if the confidence is higher than 90/100 parse the word to look for a number
            let number = word.Text;
            number = preformatFloat(number);
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
        if (_.includes(wordText, 'total') && !_.includes(wordText, 'sub') && !_.includes(wordText, 'tax')) {
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
    //see if what it found is able to be converted to moment
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
    _.forEach(this.receiptObject.comprehend.Entities, (entity) => {
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
      let date = moment(firstDate);
      date = parseDate(date.format('YYYY-MM-DD'));
      this.editedExpense.purchaseDate = date;
    }
    if (!failed && (this.editedExpense.cost == 0 || this.editedExpense.cost == null)) {
      this.editedExpense.cost = totalPrice;
    }
    if (!isEmpty(this.editedExpense.note)) {
      // expense has a note
      this.editedExpense.note += `\n\n${adjustNote}`;
    } else {
      // expense does not have a note
      this.editedExpense.note = adjustNote;
    }
  }
} // scanFile

/**
 * Sets the recipients to choose from based on expense type.
 */
function setRecipientOptions() {
  // creating or updating an expense as an admin
  this.recipientOptions = _.compact(
    this.activeEmployees.map((employee) => {
      if (
        employee.value == this.userInfo.id ||
        employee.workStatus == 0 ||
        this.editedExpense.employeeId == employee.value
      ) {
        if (this.userInfo.id != this.editedExpense.employeeId && !this.asUser) {
          // return employeeUtils.fullName(employee);
          return employee;
        }
        return;
      }
      // return employeeUtils.fullName(employee);
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

      if (this.reqRecipient) {
        let giver = _.find(this.employees, (employee) => employee.value == this.editedExpense.employeeId);
        let receiver = _.find(this.employees, (employee) => employee.value == this.editedExpense.recipient);
        let expenseType = _.find(this.expenseTypes, (type) => this.editedExpense.expenseTypeId === type.value);

        if (giver && receiver && expenseType) {
          this.editedExpense.description = `${giver.text} gave ${receiver.text} a ${expenseType.budgetName}`;
        }
      } else {
        this.editedExpense.recipient = null;
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
    this.$emit('endAction');
    this.isHighFive = false; // set high five back to false
    this.reqRecipient = false;
  }
} // submit

/**
 * Updates an existing expense.
 */
async function updateExistingEntry() {
  let updatedAttachment;
  let updatedExpense;

  // if updating an expense
  if (this.isReceiptRequired() && this.file) {
    // if receipt required and updating receipt
    // stores file name for lookup later
    this.$set(this.editedExpense, 'receipt', this.file.name);
    // upload attachment to S3
    updatedAttachment = await api.createAttachment(this.editedExpense, this.file);
    if (updatedAttachment.key) {
      // successfully uploaded file
      // update item in database
      updatedExpense = await api.updateItem(api.EXPENSES, this.editedExpense);
      if (updatedExpense.id) {
        // successfully updates expense
        if (this.editedExpense.expenseTypeId == this.originalExpense.expenseTypeId) {
          // same expense type
          this.$emit('update', updatedExpense);
        } else {
          // changing expense type
          this.$emit('delete', this.originalExpense);
          this.$emit('add', updatedExpense);
        }
        this.clearForm();
      } else {
        // emit error if failed to upload expense
        this.$emit('error', updatedExpense.response.data.message);
      }
    } else {
      // error uploading file
      this.$emit('error', updatedAttachment.response.data.message);
    }
  } else {
    // if not updating receipt
    if (!this.isReceiptRequired()) {
      this.file = null;
      this.$set(this.editedExpense, 'receipt', null);
    }

    // update item in database
    updatedExpense = await api.updateItem(api.EXPENSES, this.editedExpense);
    if (updatedExpense.id) {
      // successfully updates expense
      if (this.editedExpense.expenseTypeId == this.originalExpense.expenseTypeId) {
        // same expense type
        this.$emit('update', updatedExpense);
      } else {
        // changing expense type
        this.$emit('delete', this.originalExpense);
        this.$emit('add', updatedExpense);
      }
      this.clearForm();
    } else {
      // emit error if failed to upload expense
      this.$emit('error', updatedExpense.response.data.message);
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
async function created() {
  this.employeeRole = getRole();
  this.userInfo = await api.getUser();
  this.editedExpense = _.cloneDeep(this.expense);

  window.EventBus.$on('canceledSubmit', () => {
    this.loading = false; // set loading status to false
    this.$emit('endAction');
  });
  window.EventBus.$on('confirmSubmit', () => {
    this.submit(); // submit expense
  });

  this.myBudgetsView = this.$route.path === '/myBudgets';
  this.isInactive = this.myBudgetsView && this.userInfo.workStatus == 0;
  this.asUser = this.myBudgetsView || this.employeeRole == 'user' || this.employeeRole == 'intern';

  if (this.asUser) {
    // creating or updating an expense as a user
    this.$set(this.editedExpense, 'employeeName', this.userInfo.id);
    this.$set(this.editedExpense, 'employeeId', this.userInfo.id);
  }
  // creating or updating an expense as an admin
  let employees = await api.getItems(api.EMPLOYEES);
  this.employees = employees.map((employee) => {
    return {
      //text: employeeUtils.fullName(employee),
      text: employeeUtils.nicknameAndLastName(employee),
      value: employee.id,
      workStatus: employee.workStatus
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
  this.activeEmployees = _.compact(this.activeEmployees);

  this.setRecipientOptions();

  // set aggregate expense types
  let expenseTypes = await api.getItems(api.EXPENSE_TYPES);
  this.expenseTypes = _.map(expenseTypes, (expenseType) => {
    return {
      /* beautify preserve:start */
      text: `${expenseType.budgetName} - $${expenseType.budget}`,
      startDate: expenseType.startDate,
      endDate: expenseType.endDate,
      /* beautify preserve:end */
      budgetName: expenseType.budgetName,
      value: expenseType.id,
      budget: expenseType.budget,
      odFlag: expenseType.odFlag,
      requiredFlag: expenseType.requiredFlag,
      recurringFlag: expenseType.recurringFlag,
      isInactive: expenseType.isInactive,
      categories: expenseType.categories,
      accessibleBy: expenseType.accessibleBy,
      hasRecipient: expenseType.hasRecipient,
      alwaysOnFeed: expenseType.alwaysOnFeed,
      requireURL: expenseType.requireURL
    };
  });
  this.clearForm();
} // created

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
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  beforeDestroy() {
    window.EventBus.$off('canceledSubmit');
    window.EventBus.$off('confirmSubmit');
  },
  components: {
    ConfirmationBox,
    FileUpload
  },
  computed: {
    isAdmin,
    isDifferentExpenseType,
    isIntern,
    isReimbursed,
    isUser,
    receiptRequired,
    notesRules,
    notesLabel,
    urlLabel
  },
  created,
  data() {
    return {
      activeEmployees: [], // active employees
      allowReceipt: false, // allow receipt to be uploaded
      asUser: true, // user view
      confirming: false, // budget overage confirmation box activator
      costRules: [
        (v) => !isEmpty(v) || 'Cost is a required field',
        (v) => !isEmpty(v) > 0 || 'Cost must be a positive number',
        (v) =>
          /^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?$/.test(v) ||
          'Expense amount must be a number with two decimal digits',
        (v) => v < 1000000000 || 'Nice try' //when a user tries to fill out expense that is over a million
      ], // rules for cost
      date: null, // NOTE: Unused?
      dateRules: [
        (v) => !isEmpty(v) || 'Date must be valid. Format: MM/DD/YYYY',
        (v) => (!isEmpty(v) && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/DD/YYYY',
        (v) => moment(v, 'MM/DD/YYYY').isValid() || 'Date must be valid'
      ], // rules for dates
      descriptionRules: [
        (v) => !isEmpty(v) || 'Description is a required field',
        (v) => (!isEmpty(v) && v.replace(/\s/g, '').length > 0) || 'Description is a required field'
      ], // rules for description
      disableScan: true, // receipt scanned disabled
      //editedExpense: {}, // data being edited --
      editedExpense: _.cloneDeep(this.expense),
      employee: null, // employee selected
      employeeRole: '', // employee role
      employees: [], // employees
      expenseTypes: [], // expense types
      expenseTypeName: null, //expense type name for budget
      file: undefined, // receipt
      hint: '', // form hints
      isCovered: false, // expense is fully covered
      isHighFive: false, // expense is a high five
      isInactive: false, // employee is inactive -- also used for uploading reciepts dont delete
      isOverCovered: false, // expense is only partially covered
      loading: false, // loading
      myBudgetsView: false, // if on myBudgetsView page
      optionalDateRules: [
        (v) => isEmpty(v) || /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) || 'Date must be valid. Format: MM/DD/YYYY',
        (v) => (!isEmpty(v) ? moment(v, 'MM/DD/YYYY').isValid() || 'Date must be valid' : true)
      ], // option date rules
      originalExpense: null, // expense before changes
      purchaseDateFormatted: null, // formatted purchase date
      purchaseMenu: false, // display purchase menu
      receiptRules: [(v) => !isEmpty(v) || 'Receipts are required'], // rules for receipt
      recipientOptions: [], // list of active employees to choose for high five
      recipientPlaceholder: '',
      reimbursedDateFormatted: null, // formatted reimburse date
      reimburseMenu: false, // display reimburse menu
      remainingBudget: 0,
      reqRecipient: false, // expense requires recipient
      requiredRules: [(v) => !isEmpty(v) || 'Required field'], // rules for required fields
      selectedEmployee: {}, // selected employees
      selectedExpenseType: {}, // selected expense types
      selectedRecipient: {}, // the recipient selected for a high five
      urlInfo: {
        id: null,
        category: null,
        hits: 0
      }, // training url info
      urlRules: [
        (v) => !this.editedExpense.requireURL || !isEmpty(v) || 'URL is required. Only http(s) are accepted.',
        (v) =>
          isEmpty(v) ||
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(
            v
          ) ||
          'URL must be valid. Only http(s) are accepted.'
      ], // rules for training url
      userInfo: {}, // user info
      valid: false // form validity
    };
  },
  directives: { mask },
  methods: {
    addURLInfo,
    betweenDates,
    calcAdjustedBudget,
    checkCoverage,
    checkExpenseDate,
    clearForm,
    createNewEntry,
    customFilter,
    encodeUrl,
    emit,
    filteredExpenseTypes,
    formatDate,
    getCategories,
    getExpenseTypeSelected,
    getRemainingBudget,
    hasAccess,
    incrementURLHits,
    isEmpty,
    isFullTime,
    isReceiptRequired,
    moneyFilter,
    parseDate,
    scanFile,
    setFile,
    setRecipientOptions,
    submit,
    updateExistingEntry
  },
  props: [
    'expense', // expense to be created/updated
    'isEdit' // if updating an expense
  ],
  watch: {
    'expense.id': function () {
      this.editedExpense = _.cloneDeep(this.expense);
      this.originalExpense = _.cloneDeep(this.editedExpense);

      //when model id is not empty then must be editing an expense
      if (!this.isEmpty(this.expense.id)) {
        this.emit('editing-expense'); //notify parent that expense is being edited
      }

      this.selectedExpenseType = _.find(this.expenseTypes, (expenseType) => {
        if (expenseType.value === this.editedExpense.expenseTypeId) {
          return expenseType;
        }
      });
    },
    'editedExpense.cost': function () {
      //update remaining budget
      this.getRemainingBudget();
    },
    'editedExpense.expenseTypeId': function () {
      this.selectedExpenseType = _.find(this.expenseTypes, (expenseType) => {
        return expenseType.value === this.editedExpense.expenseTypeId;
      });
      this.requireURLET = this.selectedExpenseType && this.selectedExpenseType.requireURL;

      if (this.selectedExpenseType) {
        // set hint
        this.hint = this.selectedExpenseType.recurringFlag
          ? 'Recurring Expense Type'
          : `Available from ${formatDate(this.selectedExpenseType.startDate)} - ${formatDate(
              this.selectedExpenseType.endDate
            )}`;

        // set high five cost
        // HARD CODE
        if (this.selectedExpenseType.budgetName === 'High Five') {
          this.$set(this.editedExpense, 'cost', moneyFilter(50));
          this.isHighFive = true;
        } else {
          this.isHighFive = false;
        }

        // set requires recipient
        this.reqRecipient = this.selectedExpenseType.hasRecipient;

        let localRecipient = _.find(this.employees, (employee) => employee.value == this.editedExpense.recipient);
        this.recipientPlaceholder = localRecipient ? localRecipient.text : '';

        // set show on company feed and require url
        if (!_.isEqual(this.originalExpense, this.editedExpense) || _.isNil(this.editedExpense.id)) {
          // changing the expense type
          if (this.selectedExpenseType.alwaysOnFeed) {
            // if expense type is always on feed
            this.editedExpense.showOnFeed = true;
          } else {
            // if expense type is not always on feed
            if (_.isEmpty(this.selectedExpenseType.categories)) {
              // expense type does not have categories
              this.editedExpense.showOnFeed = false;
            } else {
              // expense type has categories
              let category = _.find(this.selectedExpenseType.categories, (category) => {
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
          if (_.isEmpty(this.selectedExpenseType.categories)) {
            // expense type does not have categories
            this.editedExpense.requireURL = false;
          } else {
            // expense type has categories
            let category = _.find(this.selectedExpenseType.categories, (category) => {
              return category == this.editedExpense.category;
            });
            this.editedExpense.requireURL = category ? category.requireURL : false;
          }
        }
        this.editedExpense = _.cloneDeep(this.editedExpense); //need to clone editedExpense in order to see label URL changes
      } else {
        this.hint = '';
      }

      //update remaining budget
      this.getRemainingBudget();
    },
    'editedExpense.category': function () {
      if (
        !_.isNil(this.selectedExpenseType) &&
        (!_.isEqual(this.originalExpense.category, this.editedExpense.category) ||
          !_.isEqual(this.originalExpense.expenseTypeId, this.editedExpense.expenseTypeId) ||
          _.isNil(this.editedExpense.id))
      ) {
        // category or expense type is changed
        if (this.selectedExpenseType.alwaysOnFeed) {
          // if expense type is always on feed
          this.editedExpense.showOnFeed = true;
        } else {
          // if expense type is not always on feed
          if (_.isEmpty(this.selectedExpenseType.categories)) {
            // expense type does not have categories
            this.editedExpense.showOnFeed = false;
          } else {
            // expense type has categories
            let category = _.find(this.selectedExpenseType.categories, (category) => {
              return category.name == this.editedExpense.category;
            });
            this.editedExpense.showOnFeed = category ? category.showOnFeed : false;
          }
        }
      } else {
        // category and expense type are not changed
        this.editedExpense.showOnFeed = this.originalExpense.showOnFeed;
      }

      if (!_.isNil(this.selectedExpenseType)) {
        if (this.selectedExpenseType.requireURL) {
          // if expense type requires url
          this.editedExpense.requireURL = true;
        } else {
          // if expense type does not always require url
          if (_.isEmpty(this.selectedExpenseType.categories)) {
            // expense type does not have categories
            this.editedExpense.requireURL = false;
          } else {
            // expense type has categories
            let category = _.find(this.selectedExpenseType.categories, (category) => {
              return category.name == this.editedExpense.category;
            });
            this.editedExpense.requireURL = category ? category.requireURL : false;
          }
        }
        this.editedExpense = _.cloneDeep(this.editedExpense); //need to clone editedExpense in order to see label URL changes
      }
    },
    'editedExpense.employeeId': function () {
      this.setRecipientOptions();
      this.getRemainingBudget();
    },
    'editedExpense.purchaseDate': function () {
      this.purchaseDateFormatted = this.formatDate(this.editedExpense.purchaseDate) || this.purchaseDateFormatted;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.editedExpense.purchaseDate !== null && !this.formatDate(this.editedExpense.purchaseDate)) {
        this.editedExpense.purchaseDate = null;
      }
    },
    'editedExpense.reimbursedDate': function () {
      this.reimbursedDateFormatted = this.formatDate(this.editedExpense.reimbursedDate) || this.reimbursedDateFormatted;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.editedExpense.reimbursedDate !== null && !this.formatDate(this.editedExpense.reimbursedDate)) {
        this.editedExpense.reimbursedDate = null;
      }
    },
    file: function () {
      //for disabling the scan button
      if (this.file == null) {
        //if no file
        this.disableScan = true;
      } else if (this.file.type != 'image/jpeg' && this.file.type != 'image/png') {
        //if file isn't jpg or png
        this.disableScan = true;
      } else {
        this.disableScan = false;
      }
    }
  }
};
</script>

<style scoped>
.optional {
  font-size: 0.5em;
}

.negativeBudget {
  color: red;
}
</style>
