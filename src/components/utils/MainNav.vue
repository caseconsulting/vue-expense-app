<template>
  <div>
    <!-- Navigation Links -->
    <v-list class="pt-0" density="compact">
      <v-divider></v-divider>
      <div v-for="(item, i) in visibleTiles" :key="i">
        <!-- Grouped Navigation Links -->
        <v-list-group v-if="item.subItems" color="red" @click="item.active = !item.active">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props">
              <!-- Parent Item Icon -->
              <template v-slot:prepend>
                <v-icon :id="item.icon" class="navbar-icons">
                  {{ item.icon }}
                </v-icon>
              </template>
              <!-- Parent Item Title -->
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </template>

          <v-list-item
            v-for="subItem in item.subItems"
            :key="subItem.title"
            color="red"
            :to="{ name: subItem.route }"
            @click="scrollUp"
          >
            <!-- SubItems Title -->
            <v-list-item-title>{{ subItem.title }}</v-list-item-title>
          </v-list-item>
        </v-list-group>
        <!-- End Grouped Navigation Links -->

        <!-- Individual Navavigation Links -->
        <v-list-item v-else :id="item.icon" color="red" :to="{ name: item.route }" @click="scrollUp">
          <!--NavBar icons-->
          <!-- Item Icon -->
          <template v-slot:prepend>
            <v-icon :id="item.icon" class="navbar-icons">
              {{ item.icon }}
            </v-icon>
          </template>
          <!-- Item mTitle -->
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </div>
    </v-list>
    <!-- End Navigation Links -->
  </div>
</template>

<script>
// @ is an alias to /src
import { getRole } from '@/utils/auth';
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Filter items by user permissions.
 *
 * @return Array - Filtered items
 */
function visibleTiles() {
  return _.filter(this.items, (item) => {
    if (item.subItems) {
      if (_.includes(item.permission, this.permissions)) {
        item.subItems = _.filter(item.subItems, (subItem) => {
          {
            return _.includes(subItem.permission, this.permissions);
          }
        });
        return true;
      } else {
        return false;
      }
    } else {
      return _.includes(item.permission, this.permissions);
    }
  });
} // visibleTiles

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Updates active field of item with subItems.
 */
function checkActive() {
  var isAnyActive;
  for (var i in this.items) {
    if (this.items[i].subItems) {
      isAnyActive = false;
      for (var j in this.items[i].subItems) {
        if (this.items[i].subItems[j].route == this.route) {
          isAnyActive = true;
        }
      }
      this.items[i].active = isAnyActive;
    } else {
      this.items[i].active =
        this.route.includes(this.items[i].route) ||
        !_.isNil(
          _.find(this.items[i].alias, (alias) => {
            return this.route.includes(alias);
          })
        );
    }
  }
} // checkActive

/**
 * Scrolls up the page.
 */
function scrollUp() {
  this.$vuetify.goTo(0);
} // scrollUp

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Set permissions by user role.
 */
function created() {
  this.permissions = this.getRole();
  this.route = this.$route.name;
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Handler for watcher of the route.
 */
function watchRouteHandler() {
  this.route = this.$route.name;
} // watchRouteHandler

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  computed: {
    visibleTiles
  },
  created,
  data() {
    return {
      items: [
        {
          title: 'Home',
          icon: 'mdi-home',
          route: 'home',
          permission: ['user', 'admin', 'intern', 'manager'],
          active: false
        },
        {
          title: 'Expenses',
          icon: 'mdi-currency-usd',
          subItems: [
            {
              title: 'My Budgets',
              icon: 'mdi-hand-coin',
              route: 'myBudgets',
              permission: ['user', 'admin', 'intern', 'manager']
            },
            {
              title: 'My Expenses',
              icon: 'mdi-currency-usd',
              route: 'expenses',
              permission: ['admin', 'user', 'intern', 'manager']
            },
            {
              title: 'Expense Types',
              icon: 'mdi-book',
              route: 'expenseTypes',
              permission: ['admin', 'user', 'manager']
            },
            {
              title: 'Reimbursements',
              icon: 'mdi-monitor',
              route: 'reimbursements',
              permission: ['admin', 'manager']
            }
          ],
          permission: ['user', 'admin', 'intern', 'manager'],
          active: false
        },
        {
          title: 'PTO Cash Outs',
          icon: 'mdi-cash',
          route: 'ptoCashOuts',
          permission: ['admin', 'user', 'manager']
        },
        {
          title: 'Employees',
          alias: ['employee'],
          icon: 'mdi-account-group',
          route: 'employees',
          permission: ['admin', 'user', 'intern', 'manager'],
          active: false
        },
        {
          title: 'Statistics Dashboard',
          alias: ['stats'],
          icon: 'mdi-chart-bar',
          route: 'stats',
          permission: ['admin', 'user', 'intern', 'manager'],
          active: false
        },
        {
          title: 'Audits',
          alias: ['audit'],
          icon: 'mdi-clipboard-check',
          route: 'audits',
          permission: ['admin', 'manager']
        },
        {
          title: 'Contracts',
          icon: 'mdi-file-document-edit',
          route: 'contracts',
          permission: ['admin', 'manager'],
          active: false
        },
        {
          title: 'Reports',
          alias: ['reports'],
          icon: 'mdi-clipboard-list',
          route: 'reports',
          permission: ['admin', 'user', 'intern', 'manager'],
          active: false
        },
        {
          title: 'Training',
          icon: 'mdi-fire',
          route: 'training',
          permission: ['admin', 'user', 'intern', 'manager'],
          active: false
        },
        {
          title: 'Help',
          icon: 'mdi-lifebuoy',
          route: 'help',
          permission: ['admin', 'user', 'intern', 'manager'],
          active: false
        }
      ], // navigation options
      permissions: '', // user role
      route: ''
    };
  },
  methods: {
    checkActive,
    getRole,
    scrollUp
  },
  watch: {
    '$route.name': {
      handler: watchRouteHandler,
      deep: true
    },
    route: checkActive
  }
};
</script>

<style lang="scss" scoped>
.navbar-icons {
  vertical-align: middle;
  text-align: center;
  opacity: 1 !important;
  color: #415364 !important;
}

.list-icons {
  width: 24px;
}
</style>
