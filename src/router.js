import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home.vue';
import ExpenseTypes from '@/views/ExpenseTypes.vue';
import Employees from '@/views/Employees.vue';
import Expenses from '@/views/Expenses.vue';
import Help from '@/views/Help.vue';
import Callback from '@/views/Callback';

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/expenseTypes',
      name: 'expenseTypes',
      component: ExpenseTypes
    },
    {
      path: '/employees',
      name: 'employees',
      component: Employees
    },
    {
      path: '/expenses',
      name: 'expenses',
      component: Expenses
    },
    {
      path: '/help',
      name: 'help',
      component: Help
    },
    {
      path: '/callback',
      name: 'callback',
      component: Callback
    }
  ]
});

// // very basic "setup" of a global guard
// router.beforeEach((to, from, next) => {
//   if (to.name === 'callback') {
//     // check if "to"-route is "callback" and allow access
//     next();
//   } else if (router.app.$auth.isAuthenticated()) {
//     // if authenticated allow access
//     next();
//   } else {
//     // trigger auth0 login
//     router.app.$auth.login();
//   }
// });

export default router;
