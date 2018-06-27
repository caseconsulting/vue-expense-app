<template>
<div>
  <v-layout row wrap>
    <v-flex lg8 md12 sm12>
      <v-card>
        <v-card-title>
          <h2>Employees</h2>
          <v-spacer></v-spacer>
          <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
        </v-card-title>
        <v-data-table :headers="headers" :items="employees" :search="search" item-key="name" class="elevation-1">
          <template slot="items" slot-scope="props">
              <tr @click="onSelect(props.item)">
                <td class="text-xs-left">{{ props.item.firstName }}</td>
                <td class="text-xs-left">{{ props.item.middleName }}</td>
                <td class="text-xs-left">{{ props.item.lastName }}</td>
                <td class="text-xs-left">{{ props.item.hireDate }}</td>
                <td class="text-xs-left">{{ props.item.empId }}</td>
              </tr>
            </template>
          <v-alert slot="no-results" :value="true" color="error" icon="warning">
            Your search for "{{ search }}" found no results.
          </v-alert>
        </v-data-table>
      </v-card>
    </v-flex>
    <v-flex lg4 md12 sm12>
      <employee-form :model="model" v-on:form-cleared="clearModel" v-on:update-table="refreshEmployees"></employee-form>
    </v-flex>
  </v-layout>
</div>
</template>

<script>
import api from '@/shared/api.js';
import EmployeeForm from '../components/EmployeeForm.vue';
export default {
  data() {
    return {
      search: '',
      loading: false,
      employees: [],
      errors: [],
      headers: [
        {
          text: 'First Name',
          value: 'firstName'
        },
        { text: 'Middle Name', value: 'middleName' }, //change value to call a function
        { text: 'Last Name', value: 'lastName' },
        { text: 'Hire Date', value: 'hireDate' },
        { text: 'Employee ID', value: 'empId' }
      ],
      model: {
        id: '',
        firstName: '',
        middleName: '',
        lastName: '',
        empId: null,
        hireDate: null
      }
    };
  },
  components: {
    EmployeeForm
  },

  async created() {
    this.refreshEmployees();
  },
  methods: {
    async refreshEmployees() {
      this.loading = true;
      this.employees = await api.getItems(api.EMPLOYEES);
      this.loading = false;
    },
    onSelect(item) {
      this.model = {
        id: item.id,
        firstName: item.firstName,
        middleName: item.middleName,
        lastName: item.lastName,
        empId: item.empId,
        hireDate: item.hireDate
      };
    },
    clearModel() {
      this.model = {
        id: '',
        firstName: '',
        middleName: '',
        lastName: '',
        empId: null,
        hireDate: null
      };
    }
  }
};
</script>
