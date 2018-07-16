<template>
<v-card hover>
  <v-card-title>
    <h3 v-if="expense.id"> Edit Expense </h3>
    <h3 v-else> Create New Expense </h3>
  </v-card-title>
  <v-container fluid>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-select :items="employees" :rules="componentRules" :filter="customFilter" v-model="expense.userId" item-text="text" label="Employee" autocomplete></v-select>
      <v-select :items="expenseTypes" :rules="componentRules" :filter="customFilter" v-model="expense.expenseTypeId" label="Expense Type" autocomplete></v-select>
      <v-text-field v-model="expense.description" :rules="descriptionRules" label="Description" data-vv-name="Description"></v-text-field>
      <v-text-field prefix="$" v-model="expense.cost" :rules="costRules" label="Cost" data-vv-name="Cost"></v-text-field>

      <!-- Date Picker 1-->
      <v-menu ref="menu1" :close-on-content-click="true" v-model="menu1" :nudge-right="40" lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
        <v-text-field slot="activator" v-model="purchaseDateFormatted" :rules="dateRules" label="Purchase Date" hint="MM/DD/YYYY format" persistent-hint prepend-icon="event" @blur="expense.purchaseDate = parseDate(purchaseDateFormatted)"></v-text-field>
        <v-date-picker v-model="expense.purchaseDate" no-title @input="menu1 = false"></v-date-picker>
      </v-menu>
      <!-- Date Picker 2-->
      <v-menu ref="menu2" :close-on-content-click="false" v-model="menu2" :nudge-right="40" lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
        <v-text-field slot="activator" v-model="reimbursedDateFormatted" label="Reimburse Date (optional)" hint="MM/DD/YYYY format " persistent-hint prepend-icon="event" @blur="expense.reimbursedDate = parseDate(reimbursedDateFormatted)"></v-text-field>
        <v-date-picker v-model="expense.reimbursedDate" no-title @input="menu2 = false"></v-date-picker>
      </v-menu>

      <v-text-field v-model="expense.note" label="Notes (optional)" data-vv-name="Description" multi-line></v-text-field>

      <!-- Buttons -->
      <v-btn outline color="error" @click="deleteExpense">
        <icon class="mr-1" name="trash"></icon>Delete</v-btn>
      <v-btn color="white" @click="clearForm">
        <icon class="mr-1" name="ban"></icon>Cancel</v-btn>
      <v-btn outline color="success" @click="submit" :disabled="!valid">
        <icon class="mr-1" name="save"></icon>Submit</v-btn>
    </v-form>
  </v-container>
</v-card>
</template>

<script>
import api from '@/shared/api.js';
import moment from 'moment';
export default {
  data() {
    return {
      date: null,
      purchaseDateFormatted: null,
      reimbursedDateFormatted: null,
      selectedExpenseType: {},
      expenseTypes: [],
      selectedEmployee: {},
      employees: [],
      menu1: false,
      menu2: false,
      descriptionRules: [v => !!v || 'Description is required'],
      costRules: [
        v => !!v || 'Cost is required',
        v => /^\d+$/.test(v) || 'Cost must be a number'
      ],
      componentRules: [v => !!v || 'Something must be selected'],
      dateRules: [v => !!v || 'Date must be valid. MM/DD/YYYY format'],
      valid: false
    };
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
  methods: {
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
      if (confirm('Are you sure you want to delete this expense?')) {
        await api.deleteItem(api.EXPENSES, this.expense.id);
        this.$emit('delete');
        this.clearForm();
      }
    },
    async submit() {
      this.expense.cost = parseInt(this.expense.cost);
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
        } else {
          let newExpense = await api.createItem(api.EXPENSES, this.expense);
          if (newExpense.id) {
            this.expense.id = newExpense.id;
            this.$emit('add', newExpense);
          } else {
            this.$emit('error', newExpense.response.data.message);
          }
        }
      }
    },
    clearForm() {
      this.$refs.form.reset();
      this.expense.budgetName = '';
      this.expense.employeeName = '';
      this.expense.id = '';
      this.expense.purchaseDate = null;
      this.expense.reimbursedDate = null;
    }
  },
  async created() {
    let expenseTypes = await api.getItems(api.EXPENSE_TYPES);
    this.expenseTypes = expenseTypes.map(expenseType => {
      return {
        /* beautify preserve:start */
        text: `${expenseType.budgetName} - ＄${expenseType.budget}`,
        /* beautify preserve:end */
        value: expenseType.id
      };
    });

    let employees = await api.getItems(api.EMPLOYEES);
    this.employees = employees.map(employee => {
      return {
        text: `${employee.firstName} ${employee.middleName} ${
          employee.lastName
        }`,
        value: employee.id
      };
    });
  }
};
</script>
<style>
.optional {
  font-size: 0.5em;
}
</style>
