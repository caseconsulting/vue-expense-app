import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import ExpenseTypes from "./views/ExpenseTypes.vue";
import Employees from "./views/Employees.vue";
import Expenses from "./views/Expenses.vue";
import Help from "./views/Help.vue";
import Callback from '@/components/Callback';

Vue.use(Router);

export default new Router({
  routes: [{
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/expenseTypes",
      name: "expenseTypes",
      component: ExpenseTypes
    },
    {
      path: "/employees",
      name: "employees",
      component: Employees
    },
    {
      path: "/expenses",
      name: "expenses",
      component: Expenses
    },
    {
      path: "/help",
      name: "help",
      component: Help
    },
    {
      path: '/callback',
      name: 'Callback',
      component: Callback
    }
  ]
});
