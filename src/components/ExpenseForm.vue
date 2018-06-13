<template>
  <form @submit.prevent="saveExpense">
  <b-card :header="(model.id ? 'Edit Expense' : 'New Expense')">
    <b-form-group label="Description">
      <b-form-input type="text" v-model="model.description"></b-form-input>
    </b-form-group>
    <b-form-group label="Cost">
      <b-input-group prepend="$">
        <b-form-input v-model="model.cost"></b-form-input>
      </b-input-group>
    </b-form-group>
    <b-form-group label="Expense Type">
      <vs-select
    vs-autocomplete
    class="selectExample"
      label="Expense Type"
      v-model="selectedExpenseType"
      :options="expenseTypes"
      ></vs-select>
    </b-form-group>
    <b-form-group label="Employee">
      <vs-select
    vs-autocomplete
    class="selectExample"
      label="Employees"
      v-model="selectedEmployee"
      :options="employees"
      ></vs-select>
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
    <div slot="footer" class="footer-buttons">
      <b-btn @click="$emit('clear-form')" variant="default" class="mr-1">Cancel</b-btn>
      <b-btn @click="$emit('submit-form', model)" type="submit" variant="success">Save Expense</b-btn>
    </div>
  </b-card>
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
      employees: []
    };
  },
  props: ['model'],
  async created() {
    let expenseTypes = await api.getItems(api.EXPENSE_TYPES);
    this.expenseTypes = expenseTypes.map(expenseType => {
      return { text: expenseType.budgetName, value: expenseType.id };
    });

    let employees = await api.getItems(api.EMPLOYEES);
    console.log(await employees);
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
