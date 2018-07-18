import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home.vue';
import Login from '@/views/Login.vue';
import LoginFailed from '@/views/LoginFailed.vue';
import ExpenseTypes from '@/views/ExpenseTypes.vue';
import Employees from '@/views/Employees.vue';
import Expenses from '@/views/Expenses.vue';
import Help from '@/views/Help.vue';
import Callback from '@/views/Callback';
import EmployeeHome from '@/views/EmployeeHome';
import { requireAuth } from '@/utils/auth';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login
    },
    {
      path: '/loginFailed',
      name: 'loginFailed',
      component: LoginFailed
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
      beforeEnter: requireAuth
    },
    {
      path: '/expenseTypes',
      name: 'expenseTypes',
      component: ExpenseTypes,
      beforeEnter: requireAuth
    },
    {
      path: '/employees',
      name: 'employees',
      component: Employees,
      beforeEnter: requireAuth
    },
    {
      path: '/expenses',
      name: 'expenses',
      component: Expenses,
      beforeEnter: requireAuth
    },
    {
      path: '/help',
      name: 'help',
      component: Help,
      beforeEnter: requireAuth
    },
    {
      path: '/employeeHome',
      name: 'employeeHome',
      component: EmployeeHome,
      beforeEnter: requireAuth
    },
    {
      path: '/callback',
      name: 'callback',
      component: Callback
    }
  ]
});

export default router;
