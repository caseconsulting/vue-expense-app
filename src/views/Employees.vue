<template>
  <div>
    <h1>Employees</h1>
  <ul v-if="employees && employees.length">
    <li v-for="emp of employees">
      <p><strong>{{emp.id}}</strong></p>
      <p>{{emp.firstName}} {{emp.lastName}}</p>
    </li>
  </ul>

  <ul v-if="errors && errors.length">
    <li v-for="error of errors">
      {{error.message}}
    </li>
  </ul>
  </div>
</template>

<script>
import apiRequest from '@/shared/apiRequest.js';

export default {
  // computed: {
  //   fullName() => {
  //     return 
  //   }
  // },
  data() {
    return {
      employees: [],
      errors: []
    }
  },

  // Fetches posts when the component is created.
  created() {
    apiRequest.get('employees').then(data => {
      this.employees = data;
    });
  }
}
</script>
