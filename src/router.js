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
import { requireAuth, isAdmin } from '@/utils/auth';
import multiguard from 'vue-router-multiguard';

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
      beforeEnter: multiguard([requireAuth, isAdmin])
    },
    {
      path: '/expenseTypes',
      name: 'expenseTypes',
      component: ExpenseTypes,
      beforeEnter: multiguard([requireAuth, isAdmin])
    },
    {
      path: '/employees',
      name: 'employees',
      component: Employees,
      beforeEnter: multiguard([requireAuth, isAdmin])
    },
    {
      path: '/expenses',
      name: 'expenses',
      component: Expenses,
      beforeEnter: multiguard([requireAuth, isAdmin])
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
