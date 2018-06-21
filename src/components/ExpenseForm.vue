<template>
<!-- <form @submit.prevent=""> -->
  <v-card :header="(model.id ? 'Edit Expense' : 'New Expense')">
    <v-text-field
    v-model="model.description"
    :counter="1"
    label="Description"
    data-vv-name="Description"
    required
  ></v-text-field>
  <v-text-field
  v-model="model.cost"
  :counter="1"
  label="Cost"
  data-vv-name="Cost"
  required
></v-text-field>
      <v-select :items="expenseTypes" :filter="customFilter" v-model="model.expenseTypeId" item-text="text" label="Expense Type" autocomplete></v-select>
      <v-select :items="employees" :filter="customFilter" v-model="model.userId" item-text="text" label="Employee" autocomplete></v-select>
      <v-text-field
      v-model="model.note"
      label="Notes"
      data-vv-name="Description"
      multi-line
    ></v-text-field>
    <v-menu
  ref="menu1"
  :close-on-content-click="false"
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
    v-model="dateFormatted"
    label="Date"
    hint="MM/DD/YYYY format"
    persistent-hint
    prepend-icon="event"
    @blur="model.purchaseDate = parseDate(dateFormatted)"
  ></v-text-field>
  <v-date-picker v-model="model.purchaseDate" no-title @input="menu1 = false"></v-date-picker>
</v-menu>
      <datepicker v-model="model.reimbursedDate" format="MM/dd/yyyy" initial-view="year" :bootstrap-styling="true" :typeable=true :placeholder=" 'MM/DD/YYYY' "></datepicker>
    <!-- <div slot="footer" class="all-footer-buttons"> -->
      <v-btn outline color="error" @click="$emit('delete-form')">
        <icon class="mr-1" name="trash"></icon>
        Delete
      </v-btn>
      <!-- <div class="footer-buttons"> -->
        <v-btn color="white" @click="$emit('clear-form')">
          <icon class="mr-1" name="ban"></icon>
          Cancel
        </v-btn>
        <v-btn outline color="success" @click="$emit('submit-form')" type="submit">
          <icon class="mr-1" name="save"></icon>
          Submit
        </v-btn>
      <!-- </div> -->
    <!-- </div> -->
  </v-card>
<!-- </form> -->
</template>

<script>
import api from '@/shared/api.js';
import Datepicker from 'vuejs-datepicker';
export default {
  components: {
    Datepicker
  },
  data() {
    return {
      date: null,
      dateFormatted: null,
      selectedExpenseType: {},
      expenseTypes: [],
      selectedEmployee: {},
      employees: [],
      menu1: false,
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
      }
    };
  },
  watch: {
    'model.purchaseDate': function(val) {
      this.dateFormatted = this.formatDate(this.model.purchaseDate);
    }
  },
  props: ['model'],
  computed: {
    computedDateFormatted() {
      return this.formatDate(this.model.purchaseDate);
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return null;

      const [year, month, day] = date.split('-');
      return `${month}/${day}/${year}`;
    },
    parseDate(date) {
      if (!date) return null;

      const [month, day, year] = date.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  },
  async created() {
    let expenseTypes = await api.getItems(api.EXPENSE_TYPES);
    this.expenseTypes = expenseTypes.map(expenseType => {
      return { text: expenseType.budgetName, value: expenseType.id };
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
</style>
