<template>
  <div>
    <h1>Expenses</h1>
  <ul v-if="expenses && expenses.length">
    <li v-for="exp of expenses">
      <p><strong>{{exp.cost}}</strong></p>
      <p>{{exp.description}}</p>
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
// import apiRequest from '@/shared/apiRequest.js';

export default {
  data() {
    return {
      expenses: [],
      errors: []
    }
  },

  // Fetches posts when the component is created.
  created() {
    // apiRequest.get('expenses').then(data => {
    //   this.expenses = data;
    // });
  }
}
</script>
