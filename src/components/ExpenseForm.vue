<template>
  <v-card hover>
    <v-container fluid>
      <v-card-title>
        <h3 v-if="expense.id && (isSuperAdmin || !isReimbursed)">Edit Expense</h3>
        <h3 v-else-if="expense.id && !isSuperAdmin && isReimbursed">View Expense</h3>
        <h3 v-else>Create New Expense</h3>
      </v-card-title>
      <v-form ref="form" v-model="valid" lazy-validation>
        <!--Employee picker if admin level -->
        <v-autocomplete
          v-if="employeeRole === 'super-admin' && this.$route.path !== '/home'"
          :items="employees"
          :rules="componentRules"
          :filter="customFilter"
          v-model="expense.userId"
          item-text="text"
          label="Employee"
        ></v-autocomplete>
        <!--Expense type picker if super-admin -->
        <v-autocomplete
          v-if="employeeRole === 'super-admin' && this.$route.path !== '/home'"
          :items="filteredExpenseTypes()"
          :rules="componentRules"
          :filter="customFilter"
          v-model="expense.expenseTypeId"
          label="Expense Type"
          :disabled="!!expense.id"
          @input="expenseTypeSelected"
        ></v-autocomplete>
        <!--Expense type picker if user -->
        <!-- :filter="customFilter" -->
        <v-autocomplete
          v-else
          :items="filteredExpenseTypes()"
          :rules="componentRules"
          v-model="expense.expenseTypeId"
          label="Expense Type"
          :disabled="!!expense.id"
          @input="expenseTypeSelected"
        ></v-autocomplete>
        <!--Cost input field -->
        <v-text-field
          prefix="$"
          v-model="expense.cost"
          :rules="costRules"
          label="Cost"
          data-vv-name="Cost"
        ></v-text-field>
        <!--Description input field -->
        <v-text-field
          v-model="expense.description"
          :rules="descriptionRules"
          label="Description"
          data-vv-name="Description"
        ></v-text-field>

        <!-- Date Picker 1-->
        <v-menu
          ref="menu1"
          :close-on-content-click="true"
          v-model="menu1"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          max-width="290px"
          min-width="290px"
        >
          <v-text-field
            slot="activator"
            v-model="purchaseDateFormatted"
            :rules="dateRules"
            label="Purchase Date"
            hint="MM/DD/YYYY format"
            persistent-hint
            prepend-icon="event"
            @blur="expense.purchaseDate = parseDate(purchaseDateFormatted)"
          ></v-text-field>
          <v-date-picker v-model="expense.purchaseDate" no-title @input="menu1 = false"></v-date-picker>
        </v-menu>

        <!-- Date Picker 2-->
        <v-menu
          v-if="isSuperAdmin"
          ref="menu2"
          :close-on-content-click="false"
          v-model="menu2"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          max-width="290px"
          min-width="290px"
        >
          <v-text-field
            slot="activator"
            v-model="reimbursedDateFormatted"
            :rules="optionalDateRules"
            label="Reimburse Date (optional)"
            hint="MM/DD/YYYY format "
            persistent-hint
            prepend-icon="event"
            @blur="expense.reimbursedDate = parseDate(reimbursedDateFormatted)"
          ></v-text-field>
          <v-date-picker v-model="expense.reimbursedDate" no-title @input="menu2 = false"></v-date-picker>
        </v-menu>

        <!-- Receipt uploading -->
        <v-checkbox
          style="padding-top: 20px; padding-bottom: 0px;"
          v-model="allowReceipt"
          label="Update the Receipt?"
          v-if="updateIsRequired && isEdit"
        ></v-checkbox>
        <file-upload
          v-if="updateIsRequired && ((allowReceipt && isEdit) || !isEdit)"
          style="padding-top: 0px; padding-bottom: 0px;"
          @fileSelected="setFile"
          :passedRules="receiptRules"
        ></file-upload>

        <!-- Receipt name -->
        <v-card-text
          style="padding: 0px 0px 3px 0px; font: inherit; font-size: 16px; color: #0000008a"
          v-if="this.expense.receipt && isEdit"
          >Current Receipt: {{ this.expense.receipt }}</v-card-text
        >

        <!-- Notes section -->
        <v-textarea v-model="expense.note" label="Notes (optional)" data-vv-name="Description"></v-textarea>

        <!-- Reference URL -->
        <v-text-field v-model="expense.url" label="URL (Optional)"></v-text-field>

        <!-- Buttons -->

        <!-- cancel button -->
        <v-btn color="white" @click="clearForm"> <icon class="mr-1" name="ban"></icon>Cancel</v-btn>

        <!-- submit button -->
        <v-btn
          outline
          color="success"
          @click="checkCoverage"
          :disabled="!valid || (!isSuperAdmin && isReimbursed)"
          :loading="loading"
        >
          <icon class="mr-1" name="save"></icon>Submit</v-btn
        >
        <!-- End Buttons -->
      </v-form>
      <confirmation-box :activate="submitting" :expense="expense"></confirmation-box>
    </v-container>
  </v-card>
</template>

<script>
import api from '@/shared/api.js';
import { getRole } from '@/utils/auth';
import moment from 'moment';
import ConfirmationBox from './ConfirmationBox.vue';
import _ from 'lodash';
import dateUtils from '@/shared/dateUtils';
import employeeUtils from '@/shared/employeeUtils';
import FileUpload from './FileUpload.vue';
// import { isError } from 'util';

// METHODS
function setFile(file) {
  if (file) {
    this.file = file;
  } else {
    this.file = undefined;
  }
}
async function checkCoverage() {
  if (this.expense) {
    let expenseType = _.find(this.expenseTypes, type => this.expense.expenseTypeId === type.value);
    let employee = {};
    if (getRole() === 'user') {
      employee = await api.getUser();
    } else {
      employee = await api.getItem(api.EMPLOYEES, this.expense.userId);
    }
    console.log('employee', employee);
    let budgets = await api.getBudgetItem(this.expense.userId);
    let employeeExpenseTypeBudget = _.find(budgets, budget => {
      return budget.expenseTypeId === expenseType.value;
    });
    console.log('employeeExpenseTypeBudget', employeeExpenseTypeBudget);

    // Keep the cost data as a string. This allows us to keep it formatted as ##.##
    // -- If you parse the Expense object's cost field itself into a float, it drops the second
    //    decimal place, then fails validation
    // -- Remove commas from the input
    //let costInput = this.expense.cost.replace(/,/g, '');
    let cost = parseFloat(this.expense.cost);
    this.$set(this.expense, 'cost', this.expense.cost);

    if (employeeExpenseTypeBudget) {
      let committedAmount = employeeExpenseTypeBudget.pendingAmount + employeeExpenseTypeBudget.reimbursedAmount;
      let allExpenses = await api.getAggregate();
      let match = _.find(allExpenses, entry => {
        return entry.id === this.expense.id;
      });
      // For subsequent calculations, remove matched entry cost from committed amount
      let newCommittedAmount = match ? committedAmount - match.cost : committedAmount;
      if (expenseType.odFlag) {
        // Selected Expense Type allows overdraft
        if (2 * expenseType.budget !== newCommittedAmount) {
          //under budget
          if (newCommittedAmount + cost <= 2 * expenseType.budget) {
            //full amount reimbursed
            this.submit();
          } else {
            // not maxed out but also not fully covered
            this.$set(this.expense, 'budget', expenseType.budget);
            this.$set(this.expense, 'remaining', 2 * expenseType.budget - newCommittedAmount);
            this.$set(this.expense, 'od', true);
            this.submitting = true;
          }
        } else {
          //already overbudget handled by backend after submit
          this.submit();
        }
      } else {
        this.$set(this.expense, 'od', false);
        if (expenseType.budget !== newCommittedAmount) {
          //under budget
          if (newCommittedAmount + cost <= expenseType.budget) {
            //full amount reimbursed
            this.submit();
          } else {
            // not maxed out but also not fully covered
            this.$set(this.expense, 'budget', expenseType.budget);
            this.$set(this.expense, 'remaining', expenseType.budget - newCommittedAmount);
            this.submitting = true;
          }
        } else {
          //already overbudget handled by backend after submit
          this.submit();
        }
      }
    } else {
      // Submitting a new Expense
      if (!expenseType.odFlag && expenseType.budget < cost) {
        // This Expense Type does not allow overdraft, and the budget is less than the
        // cost of the current expense
        this.$set(this.expense, 'budget', expenseType.budget);
        this.$set(this.expense, 'remaining', expenseType.budget);
        this.submitting = true;
      } else {
        // Good to go. Send it!
        this.submit();
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
function betweenDates(startDate, endDate) {
  let today = new Date();
  let start = startDate.split('-');
  let end = endDate.split('-');

  return (
    (today.getUTCFullYear() < parseInt(end[0]) ||
      (today.getUTCFullYear() == parseInt(end[0]) && today.getUTCMonth() + 1 < parseInt(end[1])) ||
      (today.getUTCFullYear() == parseInt(end[0]) &&
        today.getUTCMonth() + 1 == parseInt(end[1]) &&
        today.getUTCDate() <= parseInt(end[2]))) &&
    (today.getUTCFullYear() > parseInt(start[0]) ||
      (today.getUTCFullYear() == parseInt(start[0]) && today.getUTCMonth() + 1 > parseInt(start[1])) ||
      (today.getUTCFullYear() == parseInt(start[0]) &&
        today.getUTCMonth() + 1 == parseInt(start[1]) &&
        today.getUTCDate() >= parseInt(start[2])))
  );
}

// filter for expenses recurring or containing todays date
function filteredExpenseTypes() {
  let filteredExpType = [];

  if (this.employeeRole === 'super-admin' && this.$route.path === '/expenses') {
    this.expenseTypes.forEach(function(element) {
      if (!element.isInactive) {
        filteredExpType.push(element);
      }
    });
  } else {
    this.expenseTypes.forEach(function(element) {
      if (!element.isInactive) {
        if (element.recurringFlag || (element.endDate != null && betweenDates(element.startDate, element.endDate))) {
          filteredExpType.push(element);
        }
      }
    });
  }

  return filteredExpType;
}

function formatDate(date) {
  return dateUtils.formatDate(date);
}

function parseDate(date) {
  return dateUtils.parseDate(date);
}

async function submit() {
  this.loading = true;
  this.submitting = false;
  if (this.$refs.form.validate()) {
    this.expense.receipt = undefined;
    if (!this.expense.note) {
      this.expense.note = null;
    }
    console.log(this.expense);
    if (this.expense.id) {
      if (this.file) {
        this.$set(this.expense, 'receipt', this.file.name); //stores file name for lookup later
      }
      let updatedExpense = await api.updateItem(api.EXPENSES, this.expense.id, this.expense);
      if (updatedExpense.id) {
        // submit attachment
        if (this.isRequired && this.allowReceipt) {
          let attachment = await api.createAttachment(this.expense, this.file);
          console.log('attachment', attachment);
        }
        this.$emit('update', updatedExpense);
      } else {
        this.$emit('error', updatedExpense.response.data.message);
      }
      this.clearForm();
    } else {
      this.$set(this.expense, 'createdAt', moment().format('MM-DD-YYYY'));
      if (this.file) {
        this.$set(this.expense, 'receipt', this.file.name); //stores file name for lookup later
      }
      let newExpense = await api.createItem(api.EXPENSES, this.expense);
      console.log(newExpense.id);
      if (newExpense.id) {
        // submit attachment
        if (this.isRequired) {
          let attachment = await api.createAttachment(newExpense, this.file);
          console.log('attachment', attachment);
        }
        this.$set(this.expense, 'id', newExpense.id);
        this.$emit('add', newExpense);
        window.EventBus.$emit('showSnackbar', newExpense);
        window.EventBus.$emit('refreshChart', newExpense);
        this.clearForm();
      } else {
        this.$emit('error', newExpense.response.data.message);
      }
    }
  }
  this.loading = false;
}

function expenseTypeSelected(value) {
  return (this.selectedExpenseType = _.find(this.expenseTypes, expenseType => {
    if (expenseType.value === value) {
      return expenseType;
    }
  }));
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

function isAdmin() {
  return this.employeeRole === 'admin' || this.employeeRole === 'super-admin';
}

function isReimbursed() {
  return this.reimbursedDateFormatted !== null;
}

function isSuperAdmin() {
  return this.employeeRole === 'super-admin';
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
  let employeeRole = getRole();
  this.userInfo = await api.getUser();

  window.EventBus.$on('canceledSubmit', () => (this.submitting = false));
  window.EventBus.$on('confirmSubmit', this.submit);

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
      isInactive: expenseType.isInactive
    };
  });

  if (this.$route.path === '/home') {
    this.$set(this.expense, 'employeeName', this.userInfo.id);
    this.$set(this.expense, 'userId', this.userInfo.id);
  } else {
    if (employeeRole === 'super-admin') {
      let employees = await api.getItems(api.EMPLOYEES);
      this.employees = employees.map(employee => {
        return {
          text: employeeUtils.fullName(employee),
          value: employee.id
        };
      });
    } else {
      this.$set(this.expense, 'employeeName', this.userInfo.id);
      this.$set(this.expense, 'userId', this.userInfo.id);
    }
  }
  this.employeeRole = employeeRole;
}

export default {
  data() {
    return {
      allowReceipt: false,
      loading: false,
      employeeRole: '',
      submitting: false,
      date: null,
      purchaseDateFormatted: null,
      reimbursedDateFormatted: null,
      selectedExpenseType: {},
      expenseTypes: [],
      selectedEmployee: {},
      employees: [],
      menu1: false,
      menu2: false,
      userInfo: {},
      descriptionRules: [
        v => !!v || 'Description is a required field.',
        v => (v && v.replace(/\s/g, '').length > 0) || 'Description is a required field.'
      ],
      costRules: [
        v => !!v || 'Cost is a required field.',
        v => v > 0 || 'Cost must be greater than 0.',
        v =>
          /^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?$/.test(v) ||
          'Expense amount must be a number with two decimal digits.',
        v => v < 1000000000 || 'Nice try' //when a user tries to fill out expense that is over a million
        // ,v => v == Math.round(v * 100) / 100 || 'Cost must rounded to 2 places after the decimal.' // rules need to return booleans
      ],
      componentRules: [v => !!v || 'Required field.'],
      dateRules: [
        v => !!v || 'Date must be valid. Format: MM/DD/YYYY',
        v => (!!v && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/DD/YYYY'
      ],
      optionalDateRules: [v => !v || /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) || 'Date must be valid. Format: MM/DD/YYYY'],
      receiptRules: [v => !!v || 'Receipts are required.'],
      valid: false,
      file: undefined
    };
  },
  components: {
    ConfirmationBox,
    FileUpload
  },
  watch: {
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
    }
  },
  props: ['expense', 'isEdit'],
  computed: {
    isAdmin,
    isReimbursed,
    isSuperAdmin,
    isUser,
    isRequired,
    updateIsRequired
  },
  methods: {
    checkCoverage,
    clearForm,
    customFilter,
    betweenDates,
    formatDate,
    parseDate,
    submit,
    setFile,
    expenseTypeSelected,
    filteredExpenseTypes
  },
  created
};
</script>

<style>
.optional {
  font-size: 0.5em;
}
</style>
