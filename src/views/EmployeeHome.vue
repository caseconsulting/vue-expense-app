<template>
<v-container fill-height>
  <v-layout row wrap align-center justify-center>
    <v-flex text-xs-center lg5 md3 sm3 pb-5>
      <v-select
       :items="employees"
       :v-model="employee"
       label="Temporary Employee Select">
     </v-select>
    </v-flex>


    <v-flex text-xs-center lg10 md6 sm6 pb-5>
      <budget-table
      :employee="employee"
      :expenseTypes="expenseTypes"
      :expenses="expenses"></budget-table>
    </v-flex>

    <v-flex text-xs-center lg7 md6 sm6>
      <budget-chart
      :employee="employee"
      :expenseTypes="expenseTypes"
      :expenses="expenses"
      :budgetNames="budgetNames"></budget-chart>
    </v-flex>
  </v-layout>
</v-container>
</template>

<script>
import BudgetChart from '../components/BudgetChart.vue';
import BudgetTable from '../components/BudgetTable.vue';
export default {
  data() {
    return {
      employee: {
        id: '4178d87c-0044-47e4-a85c-03785a60846a',
        firstName: 'Morse',
        middleName: '-... ..- -- -... .-',
        lastName: 'Code',
        empId: '12345',
        hireDate: '2018-04-03',
        isActive: true,
        expenseTypes: [
          {
            balance: 5,
            id: '303ed9cb-a0e6-4090-949b-fd7f526debb2',
            owedAmount: 0
          },
          {
            balance: 200,
            id: '20d1aa5b-687e-42c5-96c2-a824baa54cef',
            owedAmount: 0
          },
          {
            balance: 2,
            id: 'ce671ddc-474c-42fa-9755-1a3e167b33cd',
            owedAmount: 0
          }
        ]
      },
      expenseTypes: [
        {
          budget: 5,
          budgetName: 'Sleeping',
          description: 'Too tired',
          id: '303ed9cb-a0e6-4090-949b-fd7f526debb2',
          odFlag: false
        },
        {
          budget: 3400,
          budgetName: 'Training',
          description: 'Do better',
          id: '20d1aa5b-687e-42c5-96c2-a824baa54cef',
          odFlag: false
        },
        {
          budget: 7,
          budgetName: 'Dragon Balls',
          description: 'Free Wishes',
          id: 'ce671ddc-474c-42fa-9755-1a3e167b33cd',
          odFlag: false
        }
      ],
      expenses: [
        {
          purchaseDate: "2018-07-05",
          note: null,
          cost: 2,
          receipt: null,
          reimbursedDate: null,
          userId: "4178d87c-0044-47e4-a85c-03785a60846a",
          expenseTypeId: "ce671ddc-474c-42fa-9755-1a3e167b33cd",
          description: "twesgfd",
          id: "1e8a8abc-4fa9-4b9c-bc5d-aab2632e74fe"
        },
        {
          purchaseDate: "2018-07-09",
          note: null,
          cost: 3,
          receipt: null,
          reimbursedDate: null,
          userId: "364f1788-43ac-4df8-ad34-9d6d5d74b50a",
          expenseTypeId: "ce671ddc-474c-42fa-9755-1a3e167b33cd",
          description: "251`",
          id: "32074f0d-a91e-4214-af50-8b6f87fbb05e"
        },
        {
          purchaseDate: "2018-07-19",
          note: null,
          cost: 1,
          receipt: null,
          reimbursedDate: null,
          userId: "998440f3-a89d-4654-993d-08deafb47d53",
          expenseTypeId: "ce671ddc-474c-42fa-9755-1a3e167b33cd",
          description: "dbz",
          id: "d4a0ecba-5158-47eb-aa66-650e0bad3902"
        }
      ]
    };
  },
  async created() {
    this.refreshBudget();
  },
  methods: {
    async refreshBudget() {

    },
    onSelect() {
      TODO
    },
    addModelToTable() {

    },
    deleteModelFromTable(){

    },
    updateModelInTable() {

    }
  },
  computed: {
    budgetNames() {
      let budgets = [];
      for(var i = 0; i < this.expenseTypes.length; i++) {
        budgets.push(this.expenseTypes[i].budgetName);
      }
      return budgets;
    },
    budgets() {
      let budgetCosts = [];
      for(var i = 0; i < this.expenseTypes.length; i++) {
        budgetCosts.push(this.expenseTypes[i].budget);
      }
      return budgetCosts;
    },
    remainingBudgets() {
      let remainders = [];
      for(var i = 0; i < this.expenseTypes.length; i++) {
        remainders.push(this.expenseTypes[i].budget);
      }
      return remainders;
    }
  },
  components: {
    BudgetChart,
    BudgetTable
  }
};
</script>
<style>
</style>
