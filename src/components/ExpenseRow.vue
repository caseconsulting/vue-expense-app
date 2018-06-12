<template>

    <tr>
      <td>{{ expense.description }}</td>
      <td>{{ expense.cost }}</td>
      <td>{{ expense.expenseTypeId }}</td>
      <td>{{ expense.userId }}</td>
      <td>{{ expense.note }}</td>
      <td>{{ expense.purchaseDate }}</td>
      <td>{{ expense.reimbursedDate }}</td>
      <td class="text-right">
        <!-- <a href="#" @click.prevent="populateExpenseToEdit(expense)">Edit</a> - -->
        <!-- <a href="#" @click.prevent="deleteExpense(expense.id)">Delete</a> -->
      </td>
    </tr>

</template>

<script>
export default {
  props: ['expense'],
  methods: {}
};
</script>
