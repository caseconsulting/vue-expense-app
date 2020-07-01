<template>
  <v-card hover>
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
          :disabled="isReimbursed || isEdit"
          v-model="expense.employeeId"
          item-text="text"
          label="Employee"
          class="form_padding"
        ></v-autocomplete>

        <!-- Expense Type Picker if Admin -->
        <v-autocomplete
          v-if="!asUser"
          :items="filteredExpenseTypes()"
          :rules="requiredRules"
          :disabled="isInactive"
          v-model="expense.expenseTypeId"
          label="Expense Type"
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
          v-model="expense.expenseTypeId"
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
          v-model="expense.category"
          :items="getCategories()"
          label="Select Category"
          clearable
          chips
        ></v-select>

        <!-- Cost -->
        <v-text-field
          prefix="$"
          v-model="expense.cost"
          :rules="costRules"
          :disabled="isReimbursed || isInactive || isHighFive"
          label="Cost"
          data-vv-name="Cost"
        ></v-text-field>

        <!-- Employee Selection List -->
        <v-autocomplete
          v-if="this.reqRecipient"
          :items="this.highFiveRecipients"
          :rules="requiredRules"
          :disabled="isReimbursed"
          v-model="expense.description"
          label="Recipient"
          class="form_padding"
        ></v-autocomplete>

        <!-- Description -->
        <v-text-field
          v-if="!this.reqRecipient"
          v-model="expense.description"
          :rules="descriptionRules"
          :disabled="isInactive"
          label="Description"
          data-vv-name="Description"
        ></v-text-field>

        <!-- Purchase Date -->
        <v-menu
          v-if="isUser || isAdmin"
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
              :rules="dateRules"
              :disabled="(isReimbursed && !isDifferentExpenseType) || isInactive"
              label="Purchase Date"
              hint="MM/DD/YYYY format"
              persistent-hint
              prepend-icon="event"
              @blur="expense.purchaseDate = parseDate(purchaseDateFormatted)"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="expense.purchaseDate" no-title @input="purchaseMenu = false"></v-date-picker>
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
              :rules="optionalDateRules"
              :disabled="(isReimbursed && !isDifferentExpenseType) || isInactive"
              label="Reimburse Date (optional)"
              hint="MM/DD/YYYY format "
              persistent-hint
              prepend-icon="event"
              @blur="expense.reimbursedDate = parseDate(reimbursedDateFormatted)"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="expense.reimbursedDate" no-title @input="reimburseMenu = false"></v-date-picker>
        </v-menu>

        <!-- Receipt Uploading -->
        <v-checkbox
          v-if="receiptRequired && isEdit && !isEmpty(expense.receipt)"
          style="padding-top: 20px; padding-bottom: 0px;"
          v-model="allowReceipt"
          label="Update the Receipt?"
          :disabled="isInactive"
        ></v-checkbox>
        <file-upload
          v-if="!isInactive && receiptRequired && ((allowReceipt && isEdit) || !isEdit || isEmpty(expense.receipt))"
          style="padding-top: 0px; padding-bottom: 0px;"
          @fileSelected="setFile"
          :passedRules="receiptRules"
          :receipt="expense.receipt"
        ></file-upload>

        <!-- Receipt Name -->
        <v-card-text
          style="padding: 0px 0px 3px 0px; font: inherit; font-size: 16px; color: #0000008a;"
          v-if="!isEmpty(expense.receipt) && isEdit"
          >Current Receipt: {{ this.expense.receipt }}</v-card-text
        >

        <!-- Notes -->
        <v-textarea
          v-model="expense.note"
          :rules="notesRules"
          :label="notesLabel"
          data-vv-name="Description"
          :disabled="isInactive"
        ></v-textarea>

        <!-- URL -->
        <v-text-field
          v-model="expense.url"
          :rules="urlRules"
          label="URL (Optional)"
          :disabled="isInactive"
        ></v-text-field>

        <!-- Buttons -->
        <!-- Cancel Button -->
        <v-btn color="white" @click="clearForm" class="ma-2" :disabled="isInactive">
          <icon class="mr-1" name="ban"></icon>Cancel
        </v-btn>

        <!-- Submit Button -->
        <v-btn
          outlined
          color="success"
          @click="checkCoverage"
          :disabled="!valid || (!isAdmin && isReimbursed) || isInactive"
          :loading="loading"
          class="ma-2"
        >
          <icon class="mr-1" name="save"></icon>Submit
        </v-btn>
        <!-- End Buttons -->
      </v-form>
      <confirmation-box :activate="confirming" :expense="expense"></confirmation-box>
    </v-container>
  </v-card>
</template>

<script>
import api from '@/shared/api.js';
import ConfirmationBox from './ConfirmationBox.vue';
import dateUtils from '@/shared/dateUtils';
import employeeUtils from '@/shared/employeeUtils';
import FileUpload from './FileUpload.vue';
import { getRole } from '@/utils/auth';
import moment from 'moment';
import { v4 as uuid } from 'uuid';
import _ from 'lodash';

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
    if (expenseType.value === this.expense.expenseTypeId) {
      return expenseType;
    }
  });
  if (this.selectedExpenseType) {
    return _.sortBy(this.selectedExpenseType.categories, (category) => {
      return category;
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
 * Checks if a receipt is required. Returns true if the receipt is required, otherwise returns false.
 *
 * @return boolean - receipt is required
 */
function receiptRequired() {
  this.selectedExpenseType = _.find(this.expenseTypes, (expenseType) => {
    if (expenseType.value === this.expense.expenseTypeId) {
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
    const notesRule = (v) => !!v || 'Notes is a required field';
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

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

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
      this.$set(this.urlInfo, 'category', ' ');
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
  if (this.$refs.form.validate()) {
    this.$emit('startAction');
    // form is validated
    this.loading = true; // set loading status to true
    if (this.expense) {
      // expense exists
      // get expense type
      let expenseType = _.find(this.expenseTypes, (type) => this.expense.expenseTypeId === type.value);

      // get employee
      if (this.asUser) {
        // creating or updating an expense as a user
        this.employee = await api.getUser();
      } else {
        // creating or updating an expense as an admin
        this.employee = await api.getItem(api.EMPLOYEES, this.expense.employeeId);
      }

      // get budget
      let budget = await api.getEmployeeBudget(this.employee.id, expenseType.value, this.expense.purchaseDate);

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
        let cost = parseFloat(this.expense.cost);
        this.$set(this.expense, 'cost', this.expense.cost);
        if (budget) {
          // if the matching budget exists
          let committedAmount = budget.pendingAmount + budget.reimbursedAmount;
          let allExpenses = await api.getAllAggregateExpenses();
          let match = _.find(allExpenses, (entry) => {
            return entry.id === this.expense.id;
          });
          // for subsequent calculations, remove matched entry cost from committed amount
          let newCommittedAmount;
          newCommittedAmount = match ? committedAmount - match.cost : committedAmount;
          if (this.originalExpense && this.originalExpense.expenseTypeId != this.expense.expenseTypeId) {
            newCommittedAmount = committedAmount;
          }
          if (expenseType.odFlag && this.isFullTime(this.employee)) {
            // selected expense type allows overdraft and employee is full time
            if (2 * expenseType.budget > newCommittedAmount) {
              // under budget
              if (newCommittedAmount + cost <= 2 * expenseType.budget) {
                // full amount reimbursed
                this.submit();
              } else {
                // budget not maxed out but expense not fully covered. Show adusted confirmation dialog
                this.$set(this.expense, 'budget', expenseType.budget);
                this.$set(this.expense, 'remaining', 2 * expenseType.budget - newCommittedAmount);
                this.$set(this.expense, 'od', true);
                this.confirming = true;
              }
            } else {
              // budget is already maxed out for overdraft
              this.$emit('error', 'Budget is maxed out');
              this.loading = false; // set loading status to false
              this.$emit('endAction');
            }
          } else {
            // selected expense type does not allow overdraft or employee is not full time
            this.$set(this.expense, 'od', false);
            if (newCommittedAmount < budget.amount) {
              // currently under budget
              if (newCommittedAmount + cost < budget.amount) {
                // reimburse the full expense
                this.submit();
              } else {
                // budget not maxed out but the expense not fully covered
                this.$set(this.expense, 'budget', budget.amount);
                this.$set(this.expense, 'remaining', budget.amount - newCommittedAmount);
                this.confirming = true;
              }
            } else {
              // budget is maxed out
              this.$emit('error', `${expenseType.budgetName} budget is maxed out`);
              this.loading = false; // set loading status to false
              this.$emit('endAction');
            }
          }
        } else {
          // budget for this expense does not exist
          if (expenseType.odFlag && this.isFullTime(this.employee)) {
            // selected expense type allows overdraft and employee is full time
            if (cost <= 2 * expenseType.budget) {
              // full amount reimbursed
              this.submit();
            } else {
              // budget not maxed out but the expense not fully covered
              this.$set(this.expense, 'budget', expenseType.budget);
              this.$set(this.expense, 'remaining', 2 * expenseType.budget);
              this.$set(this.expense, 'od', true);
              this.confirming = true;
            }
          } else {
            // selected expense type does not allow overdraft or employee is not full time
            this.$set(this.expense, 'od', false);
            // calculate adjusted budget amount based on employee's current work status
            let adjustedBudget = this.calcAdjustedBudget(this.employee, expenseType);
            if (cost <= adjustedBudget) {
              // reimburse the full expense
              this.submit();
            } else {
              // expense exceeds the budget but the expense not fully covered
              this.$set(this.expense, 'budget', adjustedBudget);
              this.$set(this.expense, 'remaining', adjustedBudget);
              this.confirming = true;
            }
          }
        }
      }
    }
  }
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

  this.$set(this.expense, 'id', null);
  this.$set(this.expense, 'createdAt', null);
  if (this.asUser) {
    // creating or updating an expense as a user
    this.$set(this.expense, 'employeeId', this.userInfo.id);
    this.$set(this.expense, 'employeeName', this.userInfo.id);
  } else {
    this.$set(this.expense, 'employeeId', null);
    this.$set(this.expense, 'employeeName', null);
  }
  this.$set(this.expense, 'expenseTypeId', null);
  this.$set(this.expense, 'budgetName', null);
  this.$set(this.expense, 'category', null);
  this.$set(this.expense, 'cost', null);
  this.$set(this.expense, 'description', null);
  this.$set(this.expense, 'purchaseDate', null);
  this.$set(this.expense, 'reimbursedDate', null);
  this.$set(this.expense, 'note', null);
  this.$set(this.expense, 'receipt', null);
  this.$set(this.expense, 'url', null);

  this.originalExpense = null;
  this.purchaseDateFormatted = null;
  this.file = null;

  this.$set(this.urlInfo, 'url', '');
  this.$set(this.urlInfo, 'category', '');
  this.$set(this.urlInfo, 'hits', 0);
} // clearForm

/**
 * Creates a new expense.
 */
async function createNewEntry() {
  let updatedAttachment;
  let updatedExpense;

  let newUUID = uuid();
  this.$set(this.expense, 'id', newUUID);
  this.$set(this.expense, 'createdAt', moment().format('YYYY-MM-DD'));
  if (this.isReceiptRequired() && this.file) {
    // if receipt required and updating receipt
    // stores file name for lookup later
    this.$set(this.expense, 'receipt', this.file.name);
    // upload attachment to S3
    updatedAttachment = await api.createAttachment(this.expense, this.file);
    if (updatedAttachment.key) {
      // successfully uploads file
      updatedExpense = await api.createItem(api.EXPENSES, this.expense);

      if (updatedExpense.id) {
        // successfully updates expense
        // TODO: Only add if training expense type. Allow empty category
        if (!isEmpty(updatedExpense.url) && !isEmpty(updatedExpense.category)) {
          await this.addURLInfo(updatedExpense);
        }

        this.$set(this.expense, 'id', updatedExpense.id);
        this.$emit('add', updatedExpense);
        window.EventBus.$emit('showSnackbar', updatedExpense);
        window.EventBus.$emit('refreshChart', updatedExpense);
        this.clearForm();
      } else {
        // emit error if fails to update expense
        this.$emit('error', updatedExpense.response.data.message);
        this.$set(this.expense, 'id', '');
      }
    } else {
      // emit error if fails to upload file
      this.$emit('error', updatedAttachment.message);
      this.$set(this.expense, 'id', '');
    }
  } else {
    // if receipt not required or not updating receipt
    if (!this.isReceiptRequired()) {
      this.file = null;
      this.$set(this.expense, 'receipt', null);
    }
    updatedExpense = await api.createItem(api.EXPENSES, this.expense);

    if (updatedExpense.id) {
      // successfully updates expense
      // TODO: Only add if training expense type. Allow empty category
      if (!isEmpty(updatedExpense.url) && !isEmpty(updatedExpense.category)) {
        // add training url if url and category exist
        await this.addURLInfo(updatedExpense);
      }

      this.$set(this.expense, 'id', updatedExpense.id);
      this.$emit('add', updatedExpense);
      window.EventBus.$emit('showSnackbar', updatedExpense);
      window.EventBus.$emit('refreshChart', updatedExpense);
      this.clearForm();
    } else {
      // emit error if fails to update expense
      this.$emit('error', updatedExpense.response.data.message);
      this.$set(this.expense, 'id', '');
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
 * Filters expense type. Returns the expense types that the employee has access to and the budget amount.
 */
function filteredExpenseTypes() {
  let filteredExpType = [];
  let selectedEmployee = _.find(this.employees, ['value', this.expense.employeeId]);
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
  this.expense.category = '';
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
  if (this.expense && this.originalExpense) {
    return this.expense.expenseTypeId != this.originalExpense.expenseTypeId;
  }
  return false;
} // isDifferentExpenseType

/**
 * Checks if a value is empty. Returns true if the value is null or a single character space String.
 *
 * @param value - value to check
 * @return boolean - value is empty
 */
function isEmpty(value) {
  return value == null || value === ' ' || value === '';
} // isEmpty

/**
 * Checks if an employee is full time. Returns true if the employee is full time, otherwise returns false.
 *
 * @param employee - employee to check
 * @return boolean - employee is full time
 */
function isFullTime(employee) {
  return employee.workStatus == 100;
} // isFullTime

/**
 * Checks if the selected expense type requires a receipt. Returns true if a receipt is required, otherwise returns false.
 *
 * @return boolean - receipt is required for expense type.
 */
function isReceiptRequired() {
  this.selectedExpenseType = _.find(this.expenseTypes, (expenseType) => {
    if (expenseType.value === this.expense.expenseTypeId) {
      return expenseType;
    }
  });
  if (this.selectedExpenseType) {
    return this.selectedExpenseType.requiredFlag;
  }
  return true;
} // isReceiptRequired

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
 * Sets the file.
 *
 * @param file - receipt
 */
async function setFile(file) {
  if (file) {
    this.file = file;
    this.$set(this.expense, 'receipt', file.name);
    this.receiptText = await api.extractText(file);
    console.log(this.receiptText);
  } else {
    this.file = null;
    this.receipt = null;
  }
} // setFile

/**
 * Submits an expense.
 */
async function submit() {
  // NOTE: Submit sometimes called multiple times. Normally occurs when submitting an expense after changing code.
  if (this.$refs.form != undefined || this.$refs.form != null) {
    if (this.$refs.form.validate()) {
      // NOTE: this second validate may be unnecessary. included in checkCoverage()
      if (this.isEmpty(this.expense.id)) {
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
    this.$set(this.expense, 'receipt', this.file.name);
    // upload attachment to S3
    updatedAttachment = await api.createAttachment(this.expense, this.file);
    if (updatedAttachment.key) {
      // successfully uploaded file
      // update item in database
      updatedExpense = await api.updateItem(api.EXPENSES, this.expense);
      if (updatedExpense.id) {
        // successfully updates expense
        if (this.expense.expenseTypeId == this.originalExpense.expenseTypeId) {
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
      this.$set(this.expense, 'receipt', null);
    }

    // update item in database
    updatedExpense = await api.updateItem(api.EXPENSES, this.expense);
    if (updatedExpense.id) {
      // successfully updates expense
      if (this.expense.expenseTypeId == this.originalExpense.expenseTypeId) {
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

  window.EventBus.$on('canceledSubmit', () => {
    this.confirming = false;
    this.loading = false; // set loading status to false
    this.$emit('endAction');
  });
  window.EventBus.$on('confirmSubmit', () => {
    this.confirming = false;
    this.submit(); // submit expense
  });

  this.myBudgetsView = this.$route.path === '/myBudgets';
  this.isInactive = this.myBudgetsView && this.userInfo.workStatus == 0;
  this.asUser = this.myBudgetsView || this.employeeRole == 'user';

  if (this.asUser) {
    // creating or updating an expense as a user
    this.$set(this.expense, 'employeeName', this.userInfo.id);
    this.$set(this.expense, 'employeeId', this.userInfo.id);
  }
  // creating or updating an expense as an admin
  let employees = await api.getItems(api.EMPLOYEES);
  this.employees = employees.map((employee) => {
    return {
      text: employeeUtils.fullName(employee),
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

  // creating or updating an expense as an admin
  this.highFiveRecipients = _.compact(
    this.activeEmployees.map((employee) => {
      if (employee.id == this.userInfo.id || employee.workStatus == 0 || this.expense.employeeId == employee.id) {
        if (this.userInfo.id != this.expense.employeeId && !this.asUser) {
          return employeeUtils.fullName(employee);
        }

        return;
      }
      return employeeUtils.fullName(employee);
    })
  );
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
      hasRecipient: expenseType.hasRecipient
    };
  });
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
  components: {
    ConfirmationBox,
    FileUpload
  },
  computed: {
    isAdmin,
    isDifferentExpenseType,
    isReimbursed,
    isUser,
    receiptRequired,
    notesRules,
    notesLabel
  },
  created,
  data() {
    return {
      activeEmployees: [],
      reqRecipient: false,
      isHighFive: false,
      allowReceipt: false, // allow receipt to be uploaded
      asUser: true, // user view
      requiredRules: [(v) => !!v || 'Required field'], // rules for required fields
      costRules: [
        (v) => !!v || 'Cost is a required field',
        (v) => v > 0 || 'Cost must be a positive number',
        (v) =>
          /^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?$/.test(v) ||
          'Expense amount must be a number with two decimal digits',
        (v) => v < 1000000000 || 'Nice try' //when a user tries to fill out expense that is over a million
      ], // rules for cost
      date: null, // NOTE: Unused?
      dateRules: [
        (v) => !!v || 'Date must be valid. Format: MM/DD/YYYY',
        (v) => (!!v && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/DD/YYYY'
      ], // rules for dates
      descriptionRules: [
        (v) => !!v || 'Description is a required field',
        (v) => (v && v.replace(/\s/g, '').length > 0) || 'Description is a required field'
      ], // rules for description
      employeeRole: '', // employee role
      employee: null, // employee selected
      employees: [], // employees
      expenseTypes: [], // expense types
      file: undefined, // receipt
      myBudgetsView: false, // if on myBudgetsView page
      hint: '', // form hints
      highFiveRecipients: [], // list of active employees to choose for high five
      isInactive: false, // employee is inactive
      loading: false, // loading
      purchaseMenu: false, // display purchase menu
      reimburseMenu: false, // display reimburse menu
      optionalDateRules: [(v) => !v || /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) || 'Date must be valid. Format: MM/DD/YYYY'], // option date rules
      originalExpense: null, // expense before changes
      purchaseDateFormatted: null, // formatted purchase date
      receiptRules: [(v) => !!v || 'Receipts are required'], // rules for receipt
      receiptText: null,
      reimbursedDateFormatted: null, // formatted reimburse date
      selectedEmployee: {}, // selected employees
      selectedExpenseType: {}, // selected expense types
      selectedRecipient: {}, // the recipent selected for a high five
      confirming: false, // budget overage confirmation box activator
      urlInfo: {
        id: ' ',
        category: '',
        hits: 0
      }, // training url info
      urlRules: [
        (v) =>
          !v ||
          v == ' ' ||
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(
            v
          ) ||
          'URL must be valid. Only http(s) are accepted.'
      ], // rules for training url
      userInfo: {}, // user info
      valid: false // form validity
    };
  },
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
    getExpenseTypeSelected,
    formatDate,
    filteredExpenseTypes,
    getCategories,
    hasAccess,
    incrementURLHits,
    isEmpty,
    isFullTime,
    isReceiptRequired,
    moneyFilter,
    parseDate,
    submit,
    setFile,
    updateExistingEntry
  },
  props: [
    'expense', // expense to be created/updated
    'isEdit' // if updating an expense
  ],
  watch: {
    'expense.employeeId': function () {
      //watches admin accessible employee field to know who can be a recipient
      this.highFiveRecipients = _.compact(
        this.activeEmployees.map((employee) => {
          console.log(this.expense.employeeId);
          console.log(employee.value);
          if (
            employee.value == this.userInfo.id || //current value is the user
            employee.workStatus == 0 || //value isn't an invalid employee
            this.expense.employeeId == employee.value //selected employee
          ) {
            //this is a bit of a mess but it makes sure admins can select themselves as recipients
            if (
              this.userInfo.id != this.expense.employeeId &&
              !this.asUser &&
              employee.value != this.expense.employeeId
            ) {
              return employee.text;
            }
            return;
          }
          return employee.text;
        })
      );
    },
    'expense.expenseTypeId': function () {
      let selected = _.find(this.expenseTypes, (expenseType) => {
        return expenseType.value === this.expense.expenseTypeId;
      });

      if (selected) {
        // set hint
        this.hint = selected.recurringFlag
          ? 'Recurring Expense Type'
          : `Available from ${formatDate(selected.startDate)} - ${formatDate(selected.endDate)}`;

        // set high five cost
        if (selected.budgetName === 'High Five') {
          this.$set(this.expense, 'cost', moneyFilter(50));
          this.isHighFive = true;
        } else {
          this.isHighFive = false;
        }

        // set requires recipient
        if (selected.hasRecipient == true) {
          this.reqRecipient = true;
        } else {
          this.reqRecipient = false;
        }
      } else {
        this.hint = '';
      }
    },
    'expense.id': function () {
      this.originalExpense = _.cloneDeep(this.expense);
    },
    'expense.purchaseDate': function () {
      this.purchaseDateFormatted = this.formatDate(this.expense.purchaseDate) || this.purchaseDateFormatted;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.expense.purchaseDate !== null && !this.formatDate(this.expense.purchaseDate)) {
        this.expense.purchaseDate = null;
      }
    },
    'expense.reimbursedDate': function () {
      this.reimbursedDateFormatted = this.formatDate(this.expense.reimbursedDate) || this.reimbursedDateFormatted;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.expense.reimbursedDate !== null && !this.formatDate(this.expense.reimbursedDate)) {
        this.expense.reimbursedDate = null;
      }
    }
  }
};
</script>

<style>
.optional {
  font-size: 0.5em;
}
</style>
