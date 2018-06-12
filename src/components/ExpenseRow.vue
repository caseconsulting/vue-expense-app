<template>
    <tr>
      <td>{{ expense.description }}</td>
      <td>{{ expense.cost }}</td>
      <td>{{ budgetName }}</td>
      <td>{{ employeeName }}</td>
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
import api from '@/shared/api.js';

export default {
  props: ['expense'],
  data() {
    return {
      budgetName: 'Loading...',
      employeeName: 'Loading...'
    };
  },
  async created() {
    let promise = await api.getItem(
      api.EXPENSE_TYPES,
      this.expense.expenseTypeId
    );
    this.budgetName = await promise.budgetName;

    promise = await api.getItem(api.EMPLOYEES, this.expense.userId);

    this.employeeName =
      (await promise.firstName) +
      ' ' +
      (await promise.middleName) +
      ' ' +
      (await promise.lastName);
  }
};
</script>
