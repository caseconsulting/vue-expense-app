<template>
  <div>
    <h1>Employees</h1>
    <b-alert :show="loading" variant="info">Loading...</b-alert>
    <b-row>
      <b-col>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Hire Date</th>
              <th>&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="employee in employees" :key="employee.id">
              <td>{{ employee.id }}</td>
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
        <b-card :title="(model.id ? 'Edit Employee ID#' + model.id : 'New Employee')">
          <form @submit.prevent="saveEmployee">
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
              <b-form-input rows="4" v-model="model.hireDate"></b-form-input>
            </b-form-group>
            <div>
              <b-btn type="submit" variant="success">Save Employee</b-btn>
            </div>
          </form>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import api from '@/shared/api.js';

export default {
  data() {
    return {
      loading: false,
      employees: [],
      errors: [],
      model: {}
    }
  },

  // Fetches posts when the component is created.
  async created() {
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
