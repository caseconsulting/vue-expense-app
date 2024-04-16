/**
 * Constants to use for testing.
 */
module.exports = {
  URL: 'http://localhost:8080', // no trailing slash
  WAIT_TIME: 30000,
  SMALL_PAUSE: 500,
  LONG_PAUSE: 3000,
  DATE_FORMAT: 'MM/DD/YYYY',

  // Nightwatch "Owl" Tester user info
  tester: {
    username: import.meta.env.VITE_AUTH0_EMAIL,
    password: import.meta.env.VITE_AUTH0_PASSWORD,
    firstName: 'Nightwatch',
    middleName: null, // set to null if no middle name
    lastName: 'Tester',
    nickName: 'Owl'
  },

  // main navigation
  nav: {
    home: {
      title: 'Home',
      icon: '#home',
      route: 'home'
    },
    expenses: {
      title: 'Expenses',
      icon: '#mdi-currency-usd',
      budgets: {
        title: 'My Budgets',
        icon: '#mdi-hand-coin',
        route: 'myBudgets'
      },
      expenses: {
        title: 'My Expenses',
        icon: '#mdi-currency-usd',
        route: 'myExpenses'
      },
      types: {
        title: 'Expense Types',
        icon: '#mdi-book',
        route: 'expenseTypes'
      },
      reimbursements: {
        title: 'Reimbursements',
        icon: '#mdi-monitor',
        route: 'reimbursements'
      }
    },
    employees: {
      title: 'Employees',
      icon: '#mdi-account-group',
      route: 'employees'
    },
    statistics: {
      title: 'Statistics Dashboard',
      icon: '#mdi-chart-bar',
      route: 'stats'
    },
    audits: {
      title: 'Audits',
      icon: '#mdi-clipboard-check',
      route: 'audits'
    },
    reports: {
      title: 'Reports',
      icon: '#mdi-clipboard-list',
      route: 'reports'
    },
    training: {
      title: 'Training',
      icon: '#mdi-fire',
      route: 'training'
    },
    help: {
      title: 'Help',
      icon: '#mdi-lifebuoy',
      route: 'help'
    }
  }
};
