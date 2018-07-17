<template>
<v-card hover>
  <v-card-title>
    <h3 v-if="model.id"> Edit Employee </h3>
    <h3 v-else> Create New Employee </h3>
  </v-card-title>
  <v-container fluid>
    <v-form ref="form" v-model="valid" lazy-validation>

      <!-- Name -->
      <v-text-field v-model="model.firstName" :rules="genericRules" label="First Name" data-vv-name="First Name"></v-text-field>
      <v-text-field v-model="model.middleName" label="Middle Name (optional)" data-vv-name="Middle Name"></v-text-field>
      <v-text-field v-model="model.lastName" :rules="genericRules" label="Last Name" data-vv-name="Last Name"></v-text-field>

      <!-- Employee ID -->
      <v-text-field v-model="model.empId" :rules="numberRules" label="Employee ID" data-vv-name="Employee ID"></v-text-field>

      <!-- Hire Date -->
      <v-menu ref="menu1" :close-on-content-click="true" v-model="menu1" :nudge-right="40" lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
        <v-text-field slot="activator" v-model="hireDateFormatted" :rules="dateRules" label="Hire Date" hint="MM/DD/YYYY format" persistent-hint prepend-icon="event" @blur="model.hireDate = parseDate(hireDateFormatted)"></v-text-field>
        <v-date-picker v-model="model.hireDate" no-title @input="menu1 = false"></v-date-picker>
      </v-menu>

      <!-- Buttons -->
      <v-btn outline color="error" @click="deleteEmployee">
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
      hireDateFormatted: null,
      menu1: false,
      genericRules: [v => !!v || 'This field is required'],
      numberRules: [
        v => !!v || 'Cost is required',
        v => /^\d+$/.test(v) || 'Cost must be a number'
      ],
      dateRules: [v => !!v || 'Date must be valid. MM/DD/YYYY format'],
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
    'model.hireDate': function(val) {
      this.hireDateFormatted = this.formatDate(this.model.hireDate);
    }
  },
  props: ['model'],
  methods: {
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
    // formatDate(date) {
    //   if (!date) return null;
    //
    //   const [year, month, day] = date.split('-');
    //   return `${month}/${day}/${year}`;
    // },
    // parseDate(date) {
    //   if (!date) return null;
    //
    //   const [month, day, year] = date.split('/');
    //   return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    // },
    async submit() {
      if (this.$refs.form.validate()) {
        let newEmployee;
        if (this.model.id) {
          newEmployee = await api.updateItem(
            api.EMPLOYEES,
            this.model.id,
            this.model
          );
          console.log('*****', newEmployee);
          this.$emit('update', newEmployee);
        } else {
          newEmployee = await api.createItem(api.EMPLOYEES, this.model);
        }
        console.log('*****', newEmployee);
        this.model.id = newEmployee.id;
        this.$emit('add', newEmployee);
      }
    },
    async deleteEmployee() {
      if (confirm('Are you sure you want to delete this employee?')) {
        await api.deleteItem(api.EMPLOYEES, this.model.id);
        this.$emit('delete');
        this.clearForm();
      }
    },
    clearForm() {
      this.$refs.form.reset();
      this.model.firstName = '';
      this.model.middleName = '';
      this.model.lastName = '';
      this.model.empId = '';
      this.model.expenseTypes = [];
      this.model.hireDate = '';
      this.model.id = '';
    }
  }
};
</script>
<style>
</style>
