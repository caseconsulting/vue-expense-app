<template>
<form @submit.prevent="">
  <v-card :header="(model.id ? 'Edit Expense' : 'New Expense')">
    <b-form-group label="Description">
      <b-form-input type="text" v-model="model.description"></b-form-input>
    </b-form-group>
    <b-form-group label="Cost">
      <b-input-group prepend="$">
        <b-form-input v-model="model.cost"></b-form-input>
      </b-input-group>
    </b-form-group>
    <b-form-group label="Expense Type">
      <v-select :items="expenseTypes" :filter="customFilter" v-model="model.expenseTypeId" item-text="text" label="Select" autocomplete></v-select>

    </b-form-group>
    <b-form-group label="Employee">
      <v-select :items="employees" :filter="customFilter" v-model="model.userId" item-text="text" label="Select" autocomplete></v-select>
    </b-form-group>
    <b-form-group label="Note">
      <b-form-textarea rows="2" type="text" v-model="model.note"></b-form-textarea>
    </b-form-group>
    <b-form-group label="Purchase Date">
      <datepicker v-model="model.purchaseDate" format="MM/dd/yyyy" initial-view="year" :bootstrap-styling="true" :typeable=true :placeholder=" 'MM/DD/YYYY' "></datepicker>
    </b-form-group>
    <b-form-group label="Reimbursed Date">
      <datepicker v-model="model.reimbursedDate" format="MM/dd/yyyy" initial-view="year" :bootstrap-styling="true" :typeable=true :placeholder=" 'MM/DD/YYYY' "></datepicker>
    </b-form-group>

    <div slot="footer" class="all-footer-buttons">
      <v-btn outline color="error" @click="$emit('delete-form')">
        <icon class="mr-1" name="trash"></icon>
        Delete
      </v-btn>
      <div class="footer-buttons">
        <v-btn color="white" @click="$emit('clear-form')">
          <icon class="mr-1" name="ban"></icon>
          Cancel
        </v-btn>
        <v-btn outline color="success" @click="$emit('submit-form')" type="submit">
          <icon class="mr-1" name="save"></icon>
          Submit
        </v-btn>
      </div>
    </div>
  </v-card>
</form>
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
      selectedExpenseType: {},
      expenseTypes: [],
      selectedEmployee: {},
      employees: [],
      customFilter(item, queryText, itemText) {
        const hasValue = val => val != null ? val : ''
        const text = hasValue(item.text)
        const query = hasValue(queryText)
        return text.toString()
          .toLowerCase()
          .indexOf(query.toString().toLowerCase()) > -1
      }
    };
  },
  props: ['model'],
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
<style></style>
