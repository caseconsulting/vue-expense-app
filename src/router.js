import { createRouter, createWebHistory } from 'vue-router';
import Reimbursements from '@/views/Reimbursements.vue';
import Login from '@/views/Login.vue';
import LoginFailed from '@/views/LoginFailed.vue';
import ExpenseTypes from '@/views/ExpenseTypes.vue';
import PTOCashOuts from '@/views/PTOCashOuts.vue';
import Employees from '@/views/Employees.vue';
import Employee from '@/views/Employee.vue';
import StatsDashboard from '@/views/StatsDashboard.vue';
import Audits from '@/views/Audits.vue';
import Expenses from '@/views/MyExpenses.vue';
import Help from '@/views/Help.vue';
import Reports from '@/views/Reports.vue';
import Callback from '@/views/Callback';
import EmployeeHome from '@/views/MyBudgets.vue';
import Home from '@/views/Home.vue';
import TrainingAnalytics from '@/views/TrainingAnalytics';
import PageNotFound from '@/views/PageNotFound';
import Contracts from '@/views/Contracts.vue';
import { requireAuth, isAdminOrManager } from '@/utils/auth';
import multiguard from 'vue-router-multiguard';

const router = createRouter({
  history: createWebHistory(),
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
      path: '/reimbursements',
      name: 'reimbursements',
      component: Reimbursements,
      beforeEnter: multiguard([requireAuth, isAdminOrManager])
    },
    {
      path: '/ptoCashOuts',
      name: 'ptoCashOuts',
      component: PTOCashOuts,
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
      path: '/contracts',
      name: 'contracts',
      component: Contracts,
      beforeEnter: multiguard([requireAuth, isAdminOrManager])
    },
    {
      path: '/audits',
      name: 'audits',
      component: Audits,
      beforeEnter: multiguard([requireAuth, isAdminOrManager])
    },
    {
      path: '/stats',
      name: 'stats',
      component: StatsDashboard,
      beforeEnter: requireAuth
    },
    {
      path: '/reports',
      name: 'reports',
      component: Reports,
      beforeEnter: requireAuth
    },
    {
      path: '/myExpenses',
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
      path: '/help/timesheetCalculations',
      name: 'help2',
      component: Help,
      beforeEnter: requireAuth
    },
    {
      path: '/help/expenseTypes',
      name: 'help3',
      component: Help,
      beforeEnter: requireAuth
    },
    {
      path: '/myBudgets',
      name: 'myBudgets',
      component: EmployeeHome,
      beforeEnter: requireAuth
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
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
      component: TrainingAnalytics,
      beforeEnter: requireAuth
    },
    {
      path: '/employee/:id',
      name: 'employee',
      component: Employee,
      beforeEnter: requireAuth
    },
    //Below catch-all code works for Vue 2
    //For Vue 3 change the path variable to path: '/:pathMatch(.*)*'
    {
      path: '/:pathMatch(.*)*',
      name: 'pageNotFound',
      component: PageNotFound,
      beforeEnter: requireAuth
    }
  ]
});

export default router;
