<template>
  <div>
    <h1>Expense Types</h1>
    <b-alert :show="loading" variant="info">Loading...</b-alert>
    <b-row>
      <b-col>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Budget Name</th>
              <th>Description</th>
              <th>Budget</th>
              <th>&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="expTypes in expenseTypes" :key="expTypes.id">
              <td>{{ expTypes.id }}</td>
              <td>{{ expTypes.budgetName }}</td>
              <td>{{ expTypes.description }}</td>
              <td>{{ expTypes.budget }}</td>
              <td class="text-right">
                <!--<a href="#" @click.prevent="populateExpenseTypeToEdit(expType)">Edit</a> - -->
                <!--<a href="#" @click.prevent="deleteExpenseType(expType.id)">Delete</a>-->
              </td>
            </tr>
          </tbody>
        </table>
      </b-col>
      <b-col lg="3">
        <!--<b-card :title="(model.id ? 'Edit Post ID#' + model.id : 'New Post')">-->
        <!--  <form @submit.prevent="savePost">-->
        <!--    <b-form-group label="Title">-->
        <!--      <b-form-input type="text" v-model="model.title"></b-form-input>-->
        <!--    </b-form-group>-->
        <!--    <b-form-group label="Body">-->
        <!--      <b-form-textarea rows="4" v-model="model.body"></b-form-textarea>-->
        <!--    </b-form-group>-->
        <!--    <div>-->
        <!--      <b-btn type="submit" variant="success">Save Post</b-btn>-->
        <!--    </div>-->
        <!--  </form>-->
        <!--</b-card>-->
      </b-col>
    </b-row>
  </div>
</template>

<script>
import apiRequest from '@/shared/apiRequest.js';

export default {
  data() {
    return {
      expenseTypes: [],
      errors: []
    }
  },

  // Fetches posts when the component is created.
  created() {
    apiRequest.get('expense-types').then(data => {
      this.expenseTypes = data;
    });

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
