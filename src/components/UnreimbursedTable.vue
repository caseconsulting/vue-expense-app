<template>
<div>
  <b-table :sort-by.sync="sortBy" :sort-desc.sync="sortDesc" :items="expenses" :fields="fields">
  </b-table>
  <p>
    Sorting By: <b>{{ sortBy }}</b>, Sort Direction: <b>{{ sortDesc ? 'Descending' : 'Ascending' }}</b>
  </p>
</div>
</template>

<script>
import api from '@/shared/api.js';


export default {
  data() {
    return {
      sortBy: 'age',
      sortDesc: false,
      fields: [{
          key: 'reimbursedDate',
          sortable: false
        },
        {
          key: 'userId',
          sortable: true
        },
        {
          key: 'expenseTypeId',
          sortable: true
        },
        {
          key: 'cost',
          sortable: true
        },
        {
          key: 'purchaseDate',
          sortable: true
        },
        {
          key: 'description',
          sortable: true
        }
      ],
      expenses: []
    }
  },
  async created() {
    this.expenses = await api.getItems(api.EXPENSES);
    console.log(this.expenses);
  }
}
</script>
<style></style>
