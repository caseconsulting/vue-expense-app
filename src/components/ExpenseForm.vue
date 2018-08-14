<template>
<v-card hover>
  <v-container fluid>
    <v-card-title>
      <h3 v-if="expense.id && (isSuperAdmin || !isReimbursed)"> Edit Expense </h3>
      <h3 v-else-if="expense.id && !isSuperAdmin && isReimbursed"> View Expense </h3>
      <h3 v-else> Create New Expense </h3>
    </v-card-title>
    <v-form ref="form" v-model="valid" lazy-validation>
      <!--Employee picker if admin level -->
      <v-select v-if="employeeRole === 'super-admin' && this.$route.path !== '/home'" :items="employees" :rules="componentRules" :filter="customFilter" v-model="expense.userId" item-text="text" label="Employee" autocomplete></v-select>
      <!--Expense type picker -->
      <v-select :items="expenseTypes" :rules="componentRules" :filter="customFilter" v-model="expense.expenseTypeId" label="Expense Type" autocomplete :disabled="!!expense.id"></v-select>
      <!--Cost input field -->
      <v-text-field prefix="$" v-model="expense.cost" :rules="costRules" label="Cost" data-vv-name="Cost"></v-text-field>
      <!--Description input field -->
      <v-text-field v-model="expense.description" :rules="descriptionRules" label="Description" data-vv-name="Description"></v-text-field>


      <!-- Date Picker 1-->
      <v-menu ref="menu1" :close-on-content-click="true" v-model="menu1" :nudge-right="40" lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
        <v-text-field slot="activator" v-model="purchaseDateFormatted" :rules="dateRules" label="Purchase Date" hint="MM/DD/YYYY format" persistent-hint prepend-icon="event" @blur="expense.purchaseDate = parseDate(purchaseDateFormatted)"></v-text-field>
        <v-date-picker v-model="expense.purchaseDate" no-title @input="menu1 = false"></v-date-picker>
      </v-menu>
      <!-- Date Picker 2-->
      <v-menu v-if="isSuperAdmin" ref="menu2" :close-on-content-click="false" v-model="menu2" :nudge-right="40" lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
        <v-text-field slot="activator" v-model="reimbursedDateFormatted" label="Reimburse Date (optional)" hint="MM/DD/YYYY format " persistent-hint prepend-icon="event" @blur="expense.reimbursedDate = parseDate(reimbursedDateFormatted)"></v-text-field>
        <v-date-picker v-model="expense.reimbursedDate" no-title @input="menu2 = false"></v-date-picker>
      </v-menu>

      <v-text-field v-model="expense.note" label="Notes (optional)" data-vv-name="Description" multi-line></v-text-field>

      <!-- Buttons -->
      <v-btn outline color="error" @click="deleting=true" :disabled="!isSuperAdmin && isReimbursed">
        <icon class="mr-1" name="trash"></icon>Delete</v-btn>
      <v-btn color="white" @click="clearForm">
        <icon class="mr-1" name="ban"></icon>Cancel</v-btn>
      <v-btn v-if="" outline color="success" @click="checkCoverage" :disabled="!valid || (!isSuperAdmin && isReimbursed)">
        <icon class="mr-1" name="save"></icon>Submit</v-btn>
    </v-form>
    <confirmation-box :activate="submitting" :expense="expense"></confirmation-box>
    <delete-modal :activate="deleting" :type="'expense'"></delete-modal>
  </v-container>
</v-card>
</template>

<script>
import api from '@/shared/api.js';
import {
  getRole
} from '@/utils/auth';
import moment from 'moment';
import ConfirmationBox from './ConfirmationBox.vue';
import DeleteModal from './DeleteModal.vue';
import _ from 'lodash';
export default {
  data() {
    return {
      employeeRole: '',
      deleting: false,
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
      descriptionRules: [v => !!v || 'Description is required'],
      costRules: [
        v => !!v || 'Cost is required',
        v => parseInt(v, 10) > 0 || 'Cost must be greater than 0',
        v => /^\d+$/.test(v) || 'Cost must be a number'
      ],
      componentRules: [v => !!v || 'Something must be selected'],
      dateRules: [v => !!v || 'Date must be valid. MM/DD/YYYY format'],
      valid: false
    };
  },
  components: {
    ConfirmationBox,
    DeleteModal
  },
  watch: {
    'expense.purchaseDate': function(val) {
      this.purchaseDateFormatted = this.formatDate(this.expense.purchaseDate);
    },
    'expense.reimbursedDate': function(val) {
      this.reimbursedDateFormatted = this.formatDate(
        this.expense.reimbursedDate
      );
    }
  },
  props: ['expense'],
  computed: {
    isUser() {
      return this.employeeRole === 'user';
    },
    isAdmin() {
      return (this.employeeRole === 'admin' || this.employeeRole === 'super-admin');
    },
    isSuperAdmin() {
      return this.employeeRole === 'super-admin';
    },
    isReimbursed() {
      return this.reimbursedDateFormatted !== null;
    }

  },
  methods: {
    async checkCoverage() {
      if (this.expense) {
        let expenseType = _.find(
          this.expenseTypes,
          type => this.expense.expenseTypeId === type.value
        );
        let employee = {}
        if (getRole() === 'user') {
          employee = await api.getUser();
        } else {
          employee = await api.getItem(api.EMPLOYEES, this.expense.userId);
        }
        let budgets = await api.getItems(api.BUDGETS);
        let employeeExpenseTypeBalance = _.find(
          budgets, budget => {
            return budget.expenseTypeId === expenseType.value;
          }
        )
        let cost = parseInt(this.expense.cost);
        if (employeeExpenseTypeBalance) {
          employeeExpenseTypeBalance = employeeExpenseTypeBalance.pendingAmount + employeeExpenseTypeBalance.reimbursedAmount;
          let editCheck = await api.getAggregate();
          let match = _.find(editCheck, entry => {
            return entry.id === this.expense.id
          })
          if (expenseType.odFlag) {
            if (2 * expenseType.budget !== employeeExpenseTypeBalance) {
              //under budget
              if (employeeExpenseTypeBalance + cost <= 2 * expenseType.budget) {
                //full amount reimbursed
                this.submit();
              } else if (match) {
                if (employeeExpenseTypeBalance + cost <= 2 * expenseType.budget + match.cost) {
                  this.submit();
                } else {
                  this.$set(this.expense, 'budget', expenseType.budget);
                  this.$set(
                    this.expense,
                    'remaining',
                    expenseType.budget * 2 - employeeExpenseTypeBalance + match.cost
                  )
                  this.$set(
                    this.expense,
                    'od',
                    true
                  );
                  this.submitting = true;
                }
              } else {
                //TODO HERE
                // not maxed out but also not fully covered
                this.$set(this.expense, 'budget', expenseType.budget);
                this.$set(
                  this.expense,
                  'remaining',
                  expenseType.budget * 2 - employeeExpenseTypeBalance
                );
                this.$set(
                  this.expense,
                  'od',
                  true
                );
                this.submitting = true;
              }
            } else {
              //already overbudget handled by backend after submit
              this.submit();
            }
          } else {
            this.$set(
              this.expense,
              'od',
              false
            );
            if (expenseType.budget !== employeeExpenseTypeBalance) {
              //under budget
              if (employeeExpenseTypeBalance + cost <= expenseType.budget) {
                //full amount reimbursed
                this.submit();
              } else {
                // not maxed out but also not fully covered
                this.$set(this.expense, 'budget', expenseType.budget);
                this.$set(
                  this.expense,
                  'remaining',
                  expenseType.budget - employeeExpenseTypeBalance
                );
                this.submitting = true;
              }
            } else {
              //already overbudget handled by backend after submit
              this.submit();
            }
          }
        } else {
          //new expense for an expensetype
          if (!expenseType.odFlag) {
            if (expenseType.budget < cost) {
              this.$set(this.expense, 'budget', expenseType.budget);
              this.$set(
                this.expense,
                'remaining',
                expenseType.budget
              );
              this.submitting = true;
            } else {
              this.submit();
            }
          } else {
            this.submit();
          }
        }
      }
    },
    customFilter(item, queryText, itemText) {
      const hasValue = val => (val != null ? val : '');
      const text = hasValue(item.text);
      const query = hasValue(queryText);
      return (
        text
        .toString()
        .toLowerCase()
        .indexOf(query.toString().toLowerCase()) > -1
      );
    },
    formatDate(date) {
      if (!date) return null;
      else {
        const [year, month, day] = date.split('-');
        if (moment(`${month}/${day}/${year}`, 'MM/DD/YYYY', true).isValid()) {
          return `${month}/${day}/${year}`;
        } else {
          return null;
        }
      }
    },
    parseDate(date) {
      if (!date) return null;
      else {
        const [month, day, year] = date.split('/');
        if (month != undefined && day != undefined && year != undefined) {
          if (year <= 40) {
            return `${year.padStart(4, '20')}-${month.padStart(
              2,
              '0'
            )}-${day.padStart(2, '0')}`;
          } else {
            return `${year.padStart(4, '19')}-${month.padStart(
              2,
              '0'
            )}-${day.padStart(2, '0')}`;
          }
        } else {
          return date;
        }
      }
    },
    async deleteExpense() {
      this.deleting = false;
      if (this.expense.id) {
        let deletedExpense = this.expense;
        await api.deleteItem(api.EXPENSES, this.expense.id);
        this.$emit('delete', deletedExpense);
        this.clearForm();
      }
    },
    async submit() {
      this.submitting = false;
      this.$set(this.expense, 'cost', parseInt(this.expense.cost));
      if (this.$refs.form.validate()) {
        if (!this.expense.receipt) {
          this.expense.receipt = null;
        }
        if (this.expense.id) {
          let updatedExpense = await api.updateItem(
            api.EXPENSES,
            this.expense.id,
            this.expense
          );
          this.$emit('update', updatedExpense);
          EventBus.$emit('showSnackbar', newExpense);
          this.clearForm();
        } else {
          this.$set(this.expense, 'createdAt', moment().format('MM-DD-YYYY'));
          let newExpense = await api.createItem(api.EXPENSES, this.expense);
          if (newExpense.id) {
            this.$set(this.expense, 'id', newExpense.id);
            this.$emit('add', newExpense);
            EventBus.$emit('showSnackbar', newExpense);
            EventBus.$emit('refreshChart', newExpense);
            this.clearForm();
          } else {
            this.$emit('error', newExpense.response.data.message);
          }
        }
      }
    },
    clearForm() {
      this.$refs.form.reset();
      this.$set(this.expense, 'budgetName', '');
      this.$set(this.expense, 'id', '');
      this.$set(this.expense, 'purchaseDate', null);
      this.$set(this.expense, 'reimbursedDate', null);
      this.$set(this.expense, 'createdAt', null);
      if (this.isUser) {
        this.$set(this.expense, 'employeeName', this.userInfo.id);
      } else {
        this.$set(this.expense, 'employeeName', '');
      }
    }
  },
  async created() {
    let employeeRole = getRole();
    this.userInfo = await api.getUser();

    EventBus.$on('canceledSubmit', () => (this.submitting = false));
    EventBus.$on('confirmSubmit', this.submit);

    EventBus.$on('canceled-delete-expense', () => (this.deleting = false));
    EventBus.$on('confirm-delete-expense', this.deleteExpense);

    let expenseTypes = await api.getItems(api.EXPENSE_TYPES);
    this.expenseTypes = _.map(expenseTypes, expenseType => {

      return {
        /* beautify preserve:start */
        text: `${expenseType.budgetName} - ＄${expenseType.budget}`,
        /* beautify preserve:end */
        budgetName: expenseType.budgetName,
        value: expenseType.id,
        budget: expenseType.budget,
        odFlag: expenseType.odFlag
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
            text: `${employee.firstName} ${employee.middleName} ${
              employee.lastName
            }`,
            value: employee.id,
          };
        });
      } else {
        this.$set(this.expense, 'employeeName', this.userInfo.id);
        this.$set(this.expense, 'userId', this.userInfo.id);
      }
    }
    this.employeeRole = employeeRole;
  }
};
</script>
<style>
.optional {
  font-size: 0.5em;
}
</style>
