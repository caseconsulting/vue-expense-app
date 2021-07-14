import Vue from 'vue';
import Router from 'vue-router';
import Reimbursements from '@/views/Reimbursements.vue';
import Login from '@/views/Login.vue';
import LoginFailed from '@/views/LoginFailed.vue';
import ExpenseTypes from '@/views/ExpenseTypes.vue';
import Employees from '@/views/Employees.vue';
import Employee from '@/views/Employee.vue';
import StatsDashboard from '@/views/StatsDashboard.vue';
import Audit from '@/views/Audit.vue';
import Expenses from '@/views/MyExpenses.vue';
import Help from '@/views/Help.vue';
import Reports from '@/views/Reports.vue';
import Callback from '@/views/Callback';
import EmployeeHome from '@/views/MyBudgets.vue';
import Home from '@/views/Home.vue';
import Blog from '@/views/Blog.vue';
import BlogPreview from '@/views/BlogPreview.vue';
import PostEditor from '@/views/PostEditor.vue';
import TrainingAnalytics from '@/views/TrainingAnalytics';
import PageNotFound from '@/views/PageNotFound';
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
      path: '/reimbursements',
      name: 'reimbursements',
      component: Reimbursements,
      beforeEnter: multiguard([requireAuth, isAdmin])
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
      path: '/audits',
      name: 'audits',
      component: Audit,
      beforeEnter: multiguard([requireAuth, isAdmin])
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
      path: '/help/HoursInfo',
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
    // commenting in-progress training page out before deploying
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
    {
      path: '/blog',
      name: 'blog',
      component: Blog,
      beforeEnter: requireAuth
    },
    {
      path: '/blogPreview/:id',
      name: 'blogPreview',
      component: BlogPreview,
      beforeEnter: requireAuth
    },
    {
      path: '/postEditor/:id',
      name: 'postEditor',
      component: PostEditor,
      beforeEnter: requireAuth
    },
    //Below catch-all code works for Vue 2
    //For Vue 3 change the path variable to path: '/:pathMatch(.*)*'
    {
      path: '*',
      name: 'pageNotFound',
      component: PageNotFound,
      beforeEnter: requireAuth
    }
  ]
});

export default router;
