<template>
  <v-card hover>
    <v-card-title class="header_style">
      <h3 v-if="expense.id && (isAdmin || !isReimbursed)">Edit Expense</h3>
      <h3 v-else-if="expense.id && !isAdmin && isReimbursed">View Expense</h3>
      <h3 v-else-if="!isInactive">Create New Expense</h3>
      <h3 v-else>Inactive Employee</h3>
    </v-card-title>
    <v-container fluid>
      <v-form ref="form" v-model="valid" lazy-validation>
        <!--Employee picker if admin level -->
        <v-autocomplete
          v-if="!asUser"
          :items="employees"
          :rules="componentRules"
          :filter="customFilter"
          :disabled="isReimbursed || isEdit"
          v-model="expense.employeeId"
          item-text="text"
          label="Employee"
          class="form_padding"
        ></v-autocomplete>

        <!--Expense type picker if admin -->
        <v-autocomplete
          v-if="!asUser"
          :items="filteredExpenseTypes()"
          :rules="componentRules"
          :disabled="isInactive"
          v-model="expense.expenseTypeId"
          label="Expense Type"
          :hint="hint"
          persistent-hint
          @input="expenseTypeSelected"
        ></v-autocomplete>

        <!--Expense type picker if user -->
        <v-autocomplete
          v-else
          :items="filteredExpenseTypes()"
          :disabled="isInactive"
          :rules="componentRules"
          v-model="expense.expenseTypeId"
          label="Expense Type"
          :hint="hint"
          persistent-hint
          @input="expenseTypeSelected"
          class="form_padding"
        ></v-autocomplete>

        <!-- category selector -->
        <v-select
          v-if="getCategories() != null && getCategories().length >= 1"
          :rules="componentRules"
          :disabled="isInactive"
          v-model="expense.category"
          :items="getCategories()"
          label="Select Category"
          clearable
          chips
        ></v-select>

        <!--Cost input field -->
        <v-text-field
          prefix="$"
          v-model="expense.cost"
          :rules="costRules"
          :disabled="isReimbursed || isInactive"
          label="Cost"
          data-vv-name="Cost"
        ></v-text-field>

        <!--Description input field -->
        <v-text-field
          v-model="expense.description"
          :rules="descriptionRules"
          :disabled="isInactive"
          label="Description"
          data-vv-name="Description"
        ></v-text-field>

        <!-- Date Picker 1-->
        <v-menu
          v-if="isUser || isAdmin"
          ref="menu1"
          :close-on-content-click="true"
          v-model="menu1"
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
          <v-date-picker v-model="expense.purchaseDate" no-title @input="menu1 = false"></v-date-picker>
        </v-menu>

        <!-- Date Picker 2-->
        <v-menu
          v-if="isAdmin"
          ref="menu2"
          :close-on-content-click="false"
          v-model="menu2"
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
          <v-date-picker v-model="expense.reimbursedDate" no-title @input="menu2 = false"></v-date-picker>
        </v-menu>

        <!-- Receipt uploading -->
        <v-checkbox
          v-if="updateIsRequired && isEdit && !isEmpty(expense.receipt)"
          style="padding-top: 20px; padding-bottom: 0px;"
          v-model="allowReceipt"
          label="Update the Receipt?"
          :disabled="isInactive"
        ></v-checkbox>
        <file-upload
          v-if="!isInactive && updateIsRequired && ((allowReceipt && isEdit) || !isEdit || isEmpty(expense.receipt))"
          style="padding-top: 0px; padding-bottom: 0px;"
          @fileSelected="setFile"
          :passedRules="receiptRules"
        ></file-upload>

        <!-- Receipt name -->
        <v-card-text
          style="padding: 0px 0px 3px 0px; font: inherit; font-size: 16px; color: #0000008a"
          v-if="!isEmpty(expense.receipt) && isEdit"
          >Current Receipt: {{ this.expense.receipt }}</v-card-text
        >

        <!-- Notes section -->
        <v-textarea
          v-model="expense.note"
          label="Notes (optional)"
          data-vv-name="Description"
          :disabled="isInactive"
        ></v-textarea>

        <!-- Reference URL -->
        <v-text-field
          v-model="expense.url"
          :rules="urlRules"
          label="URL (Optional)"
          :disabled="isInactive"
        ></v-text-field>

        <!-- Buttons -->

        <!-- cancel button -->
        <v-btn color="white" @click="clearForm" class="ma-2" :disabled="isInactive">
          <icon class="mr-1" name="ban"></icon>Cancel
        </v-btn>

        <!-- submit button -->
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
import { getRole } from '@/utils/auth';
import moment from 'moment';
import uuid from 'uuid/v4';

import ConfirmationBox from './ConfirmationBox.vue';
import _ from 'lodash';
import dateUtils from '@/shared/dateUtils';
import employeeUtils from '@/shared/employeeUtils';
import FileUpload from './FileUpload.vue';

const IsoFormat = 'YYYY-MM-DD';

// METHODS
function adjustedBudget(expenseType, employee) {
  return (expenseType.budget * (employee.workStatus / 100.0)).toFixed(2);
}

function isFullTime(employee) {
  return employee.workStatus == 100;
}

function setFile(file) {
  if (file) {
    this.file = file;
  } else {
    this.file = undefined;
  }
}

async function checkCoverage() {
  if (this.$refs.form.validate()) {
    this.loading = true;
    if (this.expense) {
      let expenseType = _.find(this.expenseTypes, type => this.expense.expenseTypeId === type.value);
      //let budgets = [];

      // get employee information
      if (this.asUser) {
        this.employee = await api.getUser();
        //budgets = await api.getItems(api.BUDGETS);
      } else {
        this.employee = await api.getItem(api.EMPLOYEES, this.expense.employeeId); // is this used?
        //budgets = await api.getBudgetItem(this.expense.employeeId);
      }

      let budget = await api.getBudgetsByDateAndType(this.employee.id, this.expense.purchaseDate, expenseType.value);

      if (this.employee.workStatus == 0) {
        // if user is inactive
        this.$emit('error', 'Current user is inactive');
        this.loading = false;
      } else {
        // Keep the cost data as a string. This allows us to keep it formatted as ##.##
        // -- If you parse the Expense object's cost field itself into a float, it drops the second
        //    decimal place, then fails validation
        // -- Remove commas from the input
        let cost = parseFloat(this.expense.cost);
        this.$set(this.expense, 'cost', this.expense.cost);
        if (budget) {
          // if the matching budget exists
          let committedAmount = budget.pendingAmount + budget.reimbursedAmount;
          let allExpenses = await api.getAggregate();
          let match = _.find(allExpenses, entry => {
            return entry.id === this.expense.id;
          });
          // For subsequent calculations, remove matched entry cost from committed amount
          let newCommittedAmount;
          newCommittedAmount = match ? committedAmount - match.cost : committedAmount;
          if (this.originalExpense && this.originalExpense.expenseTypeId != this.expense.expenseTypeId) {
            newCommittedAmount = committedAmount;
          }
          if (expenseType.odFlag && this.isFullTime(this.employee)) {
            // Selected Expense Type allows overdraft and employee is full time
            if (2 * expenseType.budget > newCommittedAmount) {
              //under budget
              if (newCommittedAmount + cost <= 2 * expenseType.budget) {
                //full amount reimbursed
                this.submit();
              } else {
                // budget not maxed out but expense not fully covered show adusted confirmation dialog
                this.$set(this.expense, 'budget', expenseType.budget);
                this.$set(this.expense, 'remaining', 2 * expenseType.budget - newCommittedAmount);
                this.$set(this.expense, 'od', true);
                this.confirming = true;
              }
            } else {
              // budget is already maxed out for overdraft
              this.$emit('error', 'Budget is maxed out');
              this.loading = false;
            }
          } else {
            // Selected Expense Type does not allow overdraft or employee is not full time
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
              this.loading = false;
            }
          }
        } else {
          // Budget for this expense does not exist
          if (expenseType.odFlag && this.isFullTime(this.employee)) {
            // Selected Expense Type allows overdraft and employee is full time
            if (cost <= 2 * expenseType.budget) {
              //full amount reimbursed
              this.submit();
            } else {
              // budget not maxed out but the expense not fully covered
              this.$set(this.expense, 'budget', expenseType.budget);
              this.$set(this.expense, 'remaining', 2 * expenseType.budget);
              this.$set(this.expense, 'od', true);
              this.confirming = true;
            }
          } else {
            // Selected Expense Type does not allow overdraft or employee is not full time
            this.$set(this.expense, 'od', false);
            // calculate adjustedBudget based on employee's current work status
            let adjustedBudget = this.adjustedBudget(expenseType, this.employee);
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
}

function clearForm() {
  this.allowReceipt = false;
  this.$refs.form.reset();

  this.$set(this.expense, 'budgetName', '');
  this.$set(this.expense, 'id', '');
  this.$set(this.expense, 'purchaseDate', null);
  this.$set(this.expense, 'reimbursedDate', null);
  this.$set(this.expense, 'createdAt', null);
  this.$set(this.expense, 'url', null);
  this.$set(this.expense, 'receipt', undefined);
  this.$set(this.expense, 'category', '');
  this.$set(this.expense, 'expenseTypeId', '');
  this.originalExpense = null;

  this.$set(this.urlInfo, 'url', '');
  this.$set(this.urlInfo, 'category', '');
  this.$set(this.urlInfo, 'hits', 0);

  if (this.isUser) {
    this.$set(this.expense, 'employeeName', this.userInfo.id);
  } else {
    this.$set(this.expense, 'employeeName', '');
  }
}

function customFilter(item, queryText) {
  const hasValue = val => (val != null ? val : '');
  const text = hasValue(item.text);
  const query = hasValue(queryText);
  return (
    text
      .toString()
      .toLowerCase()
      .indexOf(query.toString().toLowerCase()) > -1
  );
}

// returns true if today is between a start and end date
function betweenDates(start, end) {
  let startDate = moment(start, IsoFormat);
  let endDate = moment(end, IsoFormat);
  return moment().isBetween(startDate, endDate, 'day', '[]');
}

// filter for expenses recurring or containing todays date
function filteredExpenseTypes() {
  let filteredExpType = [];
  let selectedEmployee = _.find(this.employees, ['value', this.expense.employeeId]);
  if (!this.asUser) {
    _.forEach(this.expenseTypes, expenseType => {
      if (!expenseType.isInactive) {
        if (!selectedEmployee) {
          filteredExpType.push(expenseType);
        } else if (hasAccess({ id: selectedEmployee.value, workStatus: selectedEmployee.workStatus }, expenseType)) {
          let amount = adjustedBudget(expenseType, selectedEmployee);
          expenseType.text = `${expenseType.budgetName} - $${amount}`;
          filteredExpType.push(expenseType);
        }
      }
    });
  } else {
    let employee = this.userInfo;
    _.forEach(this.expenseTypes, expenseType => {
      if (!expenseType.isInactive) {
        if (hasAccess(employee, expenseType)) {
          if (expenseType.recurringFlag || betweenDates(expenseType.startDate, expenseType.endDate)) {
            let amount = adjustedBudget(expenseType, employee);
            expenseType.text = `${expenseType.budgetName} - $${amount}`;
            filteredExpType.push(expenseType);
          }
        }
      }
    });
  }

  return filteredExpType;
}

function formatDate(date) {
  return dateUtils.formatDate(date);
}

function hasAccess(employee, expenseType) {
  if (employee.workStatus == 0) {
    return false;
  } else if (expenseType.accessibleBy == 'ALL') {
    return true;
  } else if (expenseType.accessibleBy == 'FULL TIME') {
    return employee.workStatus == 100;
  } else if (expenseType.accessibleBy == 'PART TIME') {
    return employee.workStatus > 0 && employee.workStatus < 100;
  } else {
    return expenseType.accessibleBy.includes(employee.id);
  }
}

function parseDate(date) {
  return dateUtils.parseDate(date);
}

async function createNewEntry(newUUID) {
  let updatedAttachment;
  let updatedExpense;

  this.$set(this.expense, 'id', newUUID);
  this.$set(this.expense, 'createdAt', moment().format('YYYY-MM-DD'));
  if (this.isReceiptRequired() && this.file) {
    // if receipt required and updating receipt
    //stores file name for lookup later
    this.$set(this.expense, 'receipt', this.file.name);
    // upload attachment to S3
    updatedAttachment = await api.createAttachment(this.expense, this.file);
    if (updatedAttachment.code) {
      // error uploading file
      this.$emit('error', updatedAttachment.message);
      this.expense.id = null;
    } else {
      // success uploading file
      updatedExpense = await api.createItem(api.EXPENSES, this.expense);

      if (updatedExpense.id) {
        //add url to training-urls table (uncommenting will add URL info to training-urls table when URL is present)
        if (!isEmpty(updatedExpense.url) && !isEmpty(updatedExpense.category)) {
          await this.addURLInfo(updatedExpense);
        }

        this.$set(this.expense, 'id', updatedExpense.id);
        this.$emit('add', updatedExpense);
        window.EventBus.$emit('showSnackbar', updatedExpense);
        window.EventBus.$emit('refreshChart', updatedExpense);
        this.clearForm();
      } else {
        this.$emit('error', updatedExpense.response.data.message);
        this.expense.id = null;
      }
    }
  } else {
    // success uploading file
    updatedExpense = await api.createItem(api.EXPENSES, this.expense);

    if (updatedExpense.id) {
      //add url to training-urls table (uncommenting will add URL info to training-urls table when URL is present)
      if (!isEmpty(updatedExpense.url) && !isEmpty(updatedExpense.category)) {
        await this.addURLInfo(updatedExpense);
      }

      this.$set(this.expense, 'id', updatedExpense.id);
      this.$emit('add', updatedExpense);
      window.EventBus.$emit('showSnackbar', updatedExpense);
      window.EventBus.$emit('refreshChart', updatedExpense);
      this.clearForm();
    } else {
      this.$emit('error', updatedExpense.response.data.message);
    }
  }
}

async function updateExistingEntry() {
  let updatedAttachment;
  let updatedExpense;

  // if updating an expense
  if (this.isReceiptRequired() && this.file) {
    // if receipt required and updating receipt
    //stores file name for lookup later
    this.$set(this.expense, 'receipt', this.file.name);
    // upload attachment to S3
    updatedAttachment = await api.createAttachment(this.expense, this.file);
    if (updatedAttachment.code) {
      // error uploading file
      this.$emit('error', updatedAttachment.message);
    } else {
      // success uploading file
      // update item in database
      updatedExpense = await api.updateItem(api.EXPENSES, this.expense.id, this.expense);
      if (updatedExpense.id) {
        // success uploading form
        if (this.expense.expenseTypeId == this.originalExpense.expenseTypeId) {
          this.$emit('update', updatedExpense);
        } else {
          this.$emit('delete', this.originalExpense);
          this.$emit('add', updatedExpense);
        }
        this.clearForm();
      } else {
        // error uploading form
        this.$emit('error', updatedExpense.response.data.message);
      }
    }
  } else {
    // if not updating receipt
    // update item in database
    updatedExpense = await api.updateItem(api.EXPENSES, this.expense.id, this.expense);
    if (updatedExpense.id) {
      // success uploading form
      if (this.expense.expenseTypeId == this.originalExpense.expenseTypeId) {
        this.$emit('update', updatedExpense);
      } else {
        this.$emit('delete', this.originalExpense);
        this.$emit('add', updatedExpense);
      }
      this.clearForm();
    } else {
      // error uploading form
      this.$emit('error', updatedExpense.response.data.message);
    }
  }
}

/*
 * Submit sometimes called multiple times. Normally occurs when submitting an expense after changing code.
 */
async function submit() {
  let newUUID = uuid();
  if (this.$refs.form != undefined || this.$refs.form != null) {
    if (this.$refs.form.validate()) {
      // second validate may be unnecessary. included in checkCoverage()

      if (!this.expense.note) {
        this.expense.note = null;
      }

      if (!this.expense.id || this.expense.id == newUUID) {
        // creating a new expense
        this.createNewEntry(newUUID);
      } else {
        // editing a current expense
        this.updateExistingEntry();
      }
    }
    this.loading = false;
  }
}

async function addURLInfo(newExpense) {
  //removes trailing slash from url and converts all letter to lowercase before adding to dynamo
  newExpense.url = newExpense.url.replace(/\/$/, '').toLowerCase();
  if (
    newExpense.url.length >= 12 &&
    (newExpense.url.substring(0, 12) === 'https://www.' || newExpense.url.substring(0, 11) === 'http://www.')
  ) {
    newExpense.url = newExpense.url.replace(/www\./, ''); //removes www from url before adding to dynamo
  }

  let encodedURL = btoa(newExpense.url);
  encodedURL = encodedURL.replace(/\//g, '%2F');
  let item = await api.getURLInfo(encodedURL, newExpense.category);
  if (item) {
    await this.incrementURLHits(item);
  } else {
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
}

function isDifferentExpenseType() {
  if (this.expense && this.originalExpense) {
    return this.expense.expenseTypeId != this.originalExpense.expenseTypeId;
  }
  return false;
}

async function incrementURLHits(urlInfo) {
  let encodedURL = btoa(urlInfo[0].id);
  let hits = urlInfo[0].hits + 1;
  this.urlInfo = urlInfo[0];
  this.urlInfo.hits = hits;

  return await api.updateURL(api.URLS, encodedURL, this.urlInfo.category, this.urlInfo);
}

function expenseTypeSelected(value) {
  this.expense.category = '';
  return (this.selectedExpenseType = _.find(this.expenseTypes, expenseType => {
    if (expenseType.value === value) {
      return expenseType;
    }
  }));
}

/**
 * Check if purchase date is within the fiscal range of the budget
 */
function checkExpenseDate(purchaseDate, budget) {
  let startDate, endDate, date;
  startDate = moment(budget.fiscalStartDate, IsoFormat);
  endDate = moment(budget.fiscalEndDate, IsoFormat);
  date = moment(purchaseDate);
  return date.isBetween(startDate, endDate, 'day', '[]');
}

function isReceiptRequired() {
  this.selectedExpenseType = _.find(this.expenseTypes, expenseType => {
    if (expenseType.value === this.expense.expenseTypeId) {
      return expenseType;
    }
  });
  if (this.selectedExpenseType) {
    return this.selectedExpenseType.requiredFlag;
  }
  return true;
}

// COMPUTED
function updateIsRequired() {
  this.selectedExpenseType = _.find(this.expenseTypes, expenseType => {
    if (expenseType.value === this.expense.expenseTypeId) {
      return expenseType;
    }
  });
  if (this.selectedExpenseType) {
    return this.selectedExpenseType.requiredFlag;
  }
  return true;
}

function getCategories() {
  this.selectedExpenseType = _.find(this.expenseTypes, expenseType => {
    if (expenseType.value === this.expense.expenseTypeId) {
      return expenseType;
    }
  });
  if (this.selectedExpenseType) {
    return _.sortBy(this.selectedExpenseType.categories, category => {
      return category;
    });
  }
  return false;
}

function isAdmin() {
  return this.employeeRole === 'admin';
}

function isReimbursed() {
  return this.isEdit && this.originalExpense && !isEmpty(this.originalExpense.reimbursedDate);
}

function isUser() {
  return this.employeeRole === 'user';
}

//  extend the Number object
Number.prototype.pad = function(size) {
  var s = String(this);
  while (s.length < (size || 2)) {
    s = '0' + s;
  }
  return s;
};

function isRequired() {
  if (this.selectedExpenseType) {
    return this.selectedExpenseType.requiredFlag;
  }
  return true;
}

// LIFECYCLE HOOKS
async function created() {
  this.employeeRole = getRole();
  this.userInfo = await api.getUser();

  window.EventBus.$on('canceledSubmit', () => {
    this.confirming = false;
    this.loading = false;
  });
  window.EventBus.$on('confirmSubmit', () => {
    this.confirming = false;
    this.submit();
  });

  this.homeView = this.$route.path === '/home';
  this.isInactive = this.homeView && this.userInfo.workStatus == 0;
  this.asUser = this.homeView || this.employeeRole == 'user';

  if (this.asUser) {
    this.$set(this.expense, 'employeeName', this.userInfo.id);
    this.$set(this.expense, 'employeeId', this.userInfo.id);
  } else {
    let employees = await api.getItems(api.EMPLOYEES);
    this.employees = employees.map(employee => {
      return {
        text: employeeUtils.fullName(employee),
        value: employee.id,
        workStatus: employee.workStatus
      };
    });
  }

  let expenseTypes = await api.getItems(api.EXPENSE_TYPES);
  this.expenseTypes = _.map(expenseTypes, expenseType => {
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
      accessibleBy: expenseType.accessibleBy
    };
  });
}

function isEmpty(item) {
  return !item || item.trim().length <= 0;
}

export default {
  data() {
    return {
      allowReceipt: false,
      asUser: true,
      componentRules: [v => !!v || 'Required field'],
      costRules: [
        v => !!v || 'Cost is a required field',
        v => v > 0 || 'Cost must be a positive number',
        v =>
          /^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?$/.test(v) ||
          'Expense amount must be a number with two decimal digits',
        v => v < 1000000000 || 'Nice try' //when a user tries to fill out expense that is over a million
      ],
      date: null,
      dateRules: [
        v => !!v || 'Date must be valid. Format: MM/DD/YYYY',
        v => (!!v && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/DD/YYYY'
      ],
      descriptionRules: [
        v => !!v || 'Description is a required field',
        v => (v && v.replace(/\s/g, '').length > 0) || 'Description is a required field'
      ],
      employeeRole: '',
      employee: null,
      employees: [],
      expenseTypes: [],
      file: undefined,
      homeView: false,
      hint: '',
      isInactive: false,
      loading: false,
      menu1: false,
      menu2: false,
      optionalDateRules: [v => !v || /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) || 'Date must be valid. Format: MM/DD/YYYY'],
      originalExpense: null,
      purchaseDateFormatted: null,
      receiptRules: [v => !!v || 'Receipts are required'],
      reimbursedDateFormatted: null,
      selectedEmployee: {},
      selectedExpenseType: {},
      confirming: false,
      urlInfo: {
        id: ' ',
        category: '',
        hits: 0
      },
      urlRules: [
        v =>
          !v ||
          v == ' ' ||
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(
            v
          ) ||
          'URL must be valid. Only http(s) are accepted.'
      ],
      userInfo: {},
      valid: false
    };
  },
  components: {
    ConfirmationBox,
    FileUpload
  },
  watch: {
    'expense.id': function() {
      this.originalExpense = _.cloneDeep(this.expense);
    },
    'expense.purchaseDate': function() {
      this.purchaseDateFormatted = this.formatDate(this.expense.purchaseDate) || this.purchaseDateFormatted;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.expense.purchaseDate !== null && !this.formatDate(this.expense.purchaseDate)) {
        this.expense.purchaseDate = null;
      }
    },
    'expense.reimbursedDate': function() {
      this.reimbursedDateFormatted = this.formatDate(this.expense.reimbursedDate) || this.reimbursedDateFormatted;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.expense.reimbursedDate !== null && !this.formatDate(this.expense.reimbursedDate)) {
        this.expense.reimbursedDate = null;
      }
    },
    'expense.expenseTypeId': function() {
      let selected = _.find(this.expenseTypes, expenseType => {
        return expenseType.value === this.expense.expenseTypeId;
      });

      if (selected && selected.recurringFlag) {
        this.hint = 'Recurring Expense Type';
      } else if (selected) {
        this.hint = `Available from ${formatDate(selected.startDate)} - ${formatDate(selected.endDate)}`;
      } else {
        this.hint = '';
      }
    }
  },
  props: ['expense', 'isEdit'],
  computed: {
    isAdmin,
    isDifferentExpenseType,
    isReimbursed,
    isUser,
    isRequired,
    updateIsRequired
  },
  methods: {
    addURLInfo,
    adjustedBudget,
    betweenDates,
    checkCoverage,
    checkExpenseDate,
    clearForm,
    createNewEntry,
    customFilter,
    expenseTypeSelected,
    formatDate,
    filteredExpenseTypes,
    getCategories,
    hasAccess,
    incrementURLHits,
    isEmpty,
    isFullTime,
    isReceiptRequired,
    parseDate,
    submit,
    setFile,
    updateExistingEntry
  },
  created
};
</script>

<style>
.optional {
  font-size: 0.5em;
}
</style>
