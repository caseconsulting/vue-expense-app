<template>

        <tr v-if="!loading" @click="onSelect(expense)">
          <td class="text-xs-left">{{ expense.employeeName }}</td>
          <td class="text-xs-left">{{ expense.budgetName }}</td>
          <td class="text-xs-left">{{ expense.cost ? expense.cost : 0 | moneyValue}}</td>
          <td class="text-xs-left">{{ expense.purchaseDate | dateFormat }}</td>
          <td class="text-xs-left">{{ expense.reimbursedDate |dateFormat }}</td>
          <td class="text-xs-left">{{ expense.description }}</td>
        </tr>

</template>
<script>

  export default {
    props: ['expense', 'loading'],
    data() {
      return {
        firstName: '',
        middleName: '',
        lastName: ''
      }
    },
    filters: {
      moneyValue: value => {
        return `${new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value)}`;
      },
      dateFormat: value => {
        if (value) {
          let date = new Date(value);
          let options = {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          };
          return date.toLocaleDateString('en-US', options);
        } else {
          return '';
        }
      }
    },
    methods: {
      onSelect(expense) {
        this.$emit('select-expense', expense);
      }
    }


};
</script>
