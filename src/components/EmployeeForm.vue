<template>
  <form @submit.prevent="saveEmployee">
    <b-card :header="(model.id ? 'Edit Employee' : 'New Employee')">
      <b-form-group label="Employee ID">
        <b-form-input type="text" v-model="model.empId"></b-form-input>
      </b-form-group>
      <b-form-group label="First Name">
        <b-form-input type="text" v-model="model.firstName"></b-form-input>
      </b-form-group>
      <b-form-group label="Middle Name">
        <b-form-input type="text" v-model="model.middleName"></b-form-input>
      </b-form-group>
      <b-form-group label="Last Name">
        <b-form-input type="text" v-model="model.lastName"></b-form-input>
      </b-form-group>
      <b-form-group label="Hire Date">
        <datepicker v-model="model.hireDate" format="MM/dd/yyyy" initial-view="month" :bootstrap-styling="true"
        :typeable=true :placeholder=" 'MM/DD/YYYY' "></datepicker>
      </b-form-group>
      <div slot="footer" class="footer-buttons">
        <b-btn @click.prevent="clearEmployeeToEdit()" variant="default" class="mr-1">Cancel</b-btn>
        <b-btn type="submit" variant="success">Save Employee</b-btn>
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
