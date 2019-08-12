import Vue from 'vue';
import Router from 'vue-router';
import AdminDashboard from '@/views/AdminDashboard.vue';
import Login from '@/views/Login.vue';
import LoginFailed from '@/views/LoginFailed.vue';
import ExpenseTypes from '@/views/ExpenseTypes.vue';
import Employees from '@/views/Employees.vue';
import Expenses from '@/views/Expenses.vue';
import Help from '@/views/Help.vue';
import Callback from '@/views/Callback';
import EmployeeHome from '@/views/EmployeeHome';
import TrainingAnalytics from '@/views/TrainingAnalytics';
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
      path: '/admin-dashboard',
      name: 'admin',
      component: AdminDashboard,
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
      path: '/home',
      name: 'home',
      component: EmployeeHome,
      beforeEnter: requireAuth
    },
    {
      path: '/callback',
      name: 'callback',
      component: Callback
    },
    {
      path: '/training',
      name: 'training',
      component: TrainingAnalytics
    }
  ]
});

export default router;
