<template>
<v-card hover :header="(model.id ? 'Edit Expense' : 'New Expense')">
  <v-card-title>
    <h3>Expense Form</h3>
  </v-card-title>
  <v-container fluid>
<v-form ref="form" v-model="valid" lazy-validation >
  <v-text-field v-model="model.description" :rules="descriptionRules" label="Description" data-vv-name="Description" required></v-text-field>
  <v-text-field v-model="model.cost" :rules="costRules" label="Cost" data-vv-name="Cost" required></v-text-field>
  <v-select :items="expenseTypes" :rules="componentRules" :filter="customFilter" v-model="model.expenseTypeId" item-text="text" label="Expense Type" autocomplete></v-select>
  <v-select :items="employees" :rules="componentRules" :filter="customFilter" v-model="model.userId" item-text="text" label="Employee" autocomplete></v-select>
  <v-menu ref="menu1" :close-on-content-click="false" v-model="menu1" :nudge-right="40" lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
    <v-text-field slot="activator" v-model="purchaseDateFormatted" :rules="componentRules" label="Purchase Date" hint="MM/DD/YYYY format" persistent-hint prepend-icon="event" @blur="model.purchaseDate = parseDate(purchaseDateFormatted)"></v-text-field>
    <v-date-picker v-model="model.purchaseDate" no-title @input="menu1 = false"></v-date-picker>
  </v-menu>
  <v-menu ref="menu2" :close-on-content-click="false" v-model="menu2" :nudge-right="40" lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
    <v-text-field slot="activator" v-model="reimbursedDateFormatted" label="Reimburse Date" hint="MM/DD/YYYY format" persistent-hint prepend-icon="event" @blur="model.reimbursedDate = parseDate(reimbursedDateFormatted)"></v-text-field>
    <v-date-picker v-model="model.reimbursedDate" no-title @input="menu2 = false"></v-date-picker>
  </v-menu>
  <v-text-field v-model="model.note" label="Notes" data-vv-name="Description" multi-line></v-text-field>
  <v-btn outline color="error" @click="$emit('delete-form')">
    <icon class="mr-1" name="trash"></icon>Delete</v-btn>
  <v-btn color="white" @click="clear"><icon class="mr-1" name="ban"></icon>Cancel</v-btn>
  <v-btn outline color="success" @click="submit" :disabled="!valid"><icon class="mr-1" name="save"></icon>Submit</v-btn>
  </v-form>
  </v-container>
</v-card>
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
      valid: false,

      // TODO: Move this filter to methods
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
      this.purchaseDateFormatted = this.formatDate(this.model.purchaseDate);
    },
    'model.reimbursedDate': function(val) {
      this.reimbursedDateFormatted = this.formatDate(this.model.reimbursedDate);
    }
  },
  props: ['model'],
  // watch: {
  //   model: function(val) {
  //     console.log('val', val);
  //     if (val === { purchaseDate: null, reimbursedDate: null }) {
  //       console.log('matching value');
  //       this.$refs.form.reset();
  //     }
  //   }
  // },
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
    },
    async submit() {
      if (this.$refs.form.validate()) {
        if (this.model.id) {
          await api.updateItem(api.EXPENSES, this.model.id, this.model);
        } else {
          console.log('Creating new item');
          await api.createItem(api.EXPENSES, this.model);
        }
        this.clear();
        this.$emit('submit-form');
      }
    },
    clear() {
      this.$refs.form.reset();
    }
  },
  async created() {
    let expenseTypes = await api.getItems(api.EXPENSE_TYPES);
    this.expenseTypes = expenseTypes.map(expenseType => {
      return {
        text: expenseType.budgetName,
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
</style>
