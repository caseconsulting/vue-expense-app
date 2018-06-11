<template>
  <div>
    <h1>Employees</h1>
    <b-alert :show="loading" variant="info">Loading...</b-alert>
    <b-row>
      <b-col>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Hire Date</th>
              <th>&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="employee in employees" :key="employee.id">
              <td>{{ employee.empId }}</td>
              <td>{{ employee.firstName }} {{ employee.middleName }} {{ employee.lastName }}</td>
              <td>{{ employee.hireDate }}</td>
              <td class="text-right">
                <a href="#" @click.prevent="populateEmployeeToEdit(employee)">Edit</a> -
                <a href="#" @click.prevent="deleteEmployee(employee.id)">Delete</a>
              </td>
            </tr>
          </tbody>
        </table>
      </b-col>
      <b-col lg="4">
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
              <datepicker v-model="model.hireDate" format="MM/dd/yyyy" initial-view="year" :bootstrap-styling="true"></datepicker>
            </b-form-group>
            <div slot="footer" class="footer-buttons">
              <b-btn @click.prevent="clearEmployeeToEdit()" variant="default" class="mr-1">Cancel</b-btn>
              <b-btn type="submit" variant="success">Save Employee</b-btn>
            </div>
          </b-card>
        </form>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import Datepicker from 'vuejs-datepicker';

export default {
  data() {
    return {
      loading: false,
      employees: [],
      errors: [],
      model: {}
    }
  },
  components: {
    Datepicker
  },
  async created() {
    // Fetches posts when the component is created.
    this.refreshEmployees()
  },
  methods: {
    async refreshEmployees () {
      this.loading = true
      this.employees = await api.getItems(api.EMPLOYEES)
      this.loading = false
    },
    async populateEmployeeToEdit (employee) {
      this.model = Object.assign({}, employee);
    },
    async clearEmployeeToEdit () {
      this.model = {};
    },
    async saveEmployee () {
      if (this.model.id) {
        await api.updateItem(api.EMPLOYEES, this.model.id, this.model);
      } else {
        await api.createItem(api.EMPLOYEES, this.model);
      }
      this.model = {}; // reset form
      await this.refreshEmployees();
    },
    async deleteEmployee (id) {
      if (confirm('Are you sure you want to delete this employee?')) {
        // if we are editing an expense type we deleted, remove it from the form
        if (this.model.id === id) {
          this.model = {};
        }
        await api.deleteItem(api.EMPLOYEES, id)
        await this.refreshEmployees();
      }
    }
  }
}
</script>
