<template>
  <div>
    <h1>Expense Types</h1>
  <ul v-if="expenseTypes && expenseTypes.length">
    <li v-for="expTypes of expenseTypes">
      <p><strong>{{expTypes.budgetName}}</strong></p>
      <p>{{expTypes.description}}</p>
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
import axios from 'axios';

export default {
  data() {
    return {
      expenseTypes: [],
      errors: []
    }
  },

  // Fetches posts when the component is created.
  created() {
    axios.get(`http://localhost:3000/expense-types`)
    .then(response => {
      // JSON responses are automatically parsed.
      this.expenseTypes = response.data
    })
    .catch(e => {
      this.errors.push(e)
    })

    // async / await version (created() becomes async created())
    //
    // try {
    //   const response = await axios.get(`http://jsonplaceholder.typicode.com/posts`)
    //   this.posts = response.data
    // } catch (e) {
    //   this.errors.push(e)
    // }
  }
}
</script>
