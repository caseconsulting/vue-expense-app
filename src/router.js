import { createRouter, createWebHistory } from 'vue-router';
const Reimbursements = () => import('@/views/Reimbursements.vue');
const Login = () => import('@/views/Login.vue');
const LoginFailed = () => import('@/views/LoginFailed.vue');
const ExpenseTypes = () => import('@/views/ExpenseTypes.vue');
const PTOCashOuts = () => import('@/views/PTOCashOuts.vue');
const Employees = () => import('@/views/Employees.vue');
const Employee = () => import('@/views/Employee.vue');
const StatsDashboard = () => import('@/views/StatsDashboard.vue');
const Audits = () => import('@/views/Audits.vue');
const Expenses = () => import('@/views/MyExpenses.vue');
const Help = () => import('@/views/Help.vue');
const Reports = () => import('@/views/Reports.vue');
const Callback = () => import('@/views/Callback');
const EmployeeHome = () => import('@/views/MyBudgets.vue');
const Home = () => import('@/views/Home.vue');
const TrainingAnalytics = () => import('@/views/TrainingAnalytics');
const PageNotFound = () => import('@/views/PageNotFound.vue');
const Contracts = () => import('@/views/Contracts.vue');
const EmployeeBeta = () => import('@/views/EmployeeBeta.vue');
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
      component: EmployeeBeta,
      beforeEnter: requireAuth
    },
    // remove this once the new profile is 100% functional
    {
      path: '/employee-old/:id',
      name: 'employee-old',
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
  ],
  scrollBehavior(to) {
    // resets scroll when going to an employee profile
    if (to.name === 'employee') {
      return { top: 0, left: 0 };
    }
  }
});

export default router;
