<template>
  <div>
    <!-- Navigation Links -->
    <v-list class="pt-0" density="compact">
      <v-divider></v-divider>
      <div v-for="(item, i) in visibleTiles" :key="i">
        <!-- Grouped Navigation Links -->
        <v-list-group v-if="item.subItems" color="red">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              active-class="case-red-text"
              :color="item.active ? caseRed : caseGray"
              :class="item.active ? 'case-red-text' : ''"
            >
              <!-- Parent Item Icon -->
              <template v-slot:prepend>
                <v-icon :id="item.icon" :color="item.active ? caseRed : caseGray" class="navbar-icons">
                  {{ item.icon }}
                </v-icon>
              </template>
              <!-- Parent Item Title -->
              <v-list-item-title class="nav-item">{{ item.title }}</v-list-item-title>
            </v-list-item>
          </template>

          <v-list-item
            v-for="subItem in item.subItems"
            :key="subItem.title"
            :color="'#bc3825'"
            :class="subItem.active ? 'case-red-text' : ''"
            @click="handleNavigation(subItem)"
          >
            <!-- SubItems Title -->
            <v-list-item-title class="nav-item">{{ subItem.title }}</v-list-item-title>
          </v-list-item>
        </v-list-group>
        <!-- End Grouped Navigation Links -->

        <!-- Individual Navavigation Links -->
        <v-list-item
          v-else
          :id="item.icon"
          :color="item.active ? caseRed : caseGray"
          :class="item.active ? 'case-red-text' : ''"
          @click="handleNavigation(item)"
        >
          <!--NavBar icons-->
          <!-- Item Icon -->
          <template v-slot:prepend>
            <v-icon :id="item.icon" :color="item.active ? caseRed : caseGray" class="navbar-icons">
              {{ item.icon }}
            </v-icon>
          </template>
          <!-- Item mTitle -->
          <v-list-item-title class="nav-item">{{ item.title }}</v-list-item-title>
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
          this.items[i].subItems[j].active = true;
          isAnyActive = true;
        } else {
          this.items[i].subItems[j].active = false;
        }
      }
      this.items[i].active = isAnyActive;
    } else {
      this.items[i].active = this.route
        ? this.route.includes(this.items[i].route) ||
          !_.isNil(
            _.find(this.items[i].alias, (alias) => {
              return this.route.includes(alias);
            })
          )
        : null;
    }
  }
} // checkActive

/**
 * Scrolls up the page.
 */
function handleNavigation(item) {
  this.$router.push({ name: item.route });
  window.scrollTo(0, 0);
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
              permission: ['user', 'admin', 'intern', 'manager'],
              active: false
            },
            {
              title: 'My Expenses',
              icon: 'mdi-currency-usd',
              route: 'expenses',
              permission: ['admin', 'user', 'intern', 'manager'],
              active: false
            },
            {
              title: 'Expense Types',
              icon: 'mdi-book',
              route: 'expenseTypes',
              permission: ['admin', 'user', 'manager'],
              active: false
            },
            {
              title: 'Reimbursements',
              icon: 'mdi-monitor',
              route: 'reimbursements',
              permission: ['admin', 'manager'],
              active: false
            }
          ],
          permission: ['user', 'admin', 'intern', 'manager'],
          active: false
        },
        {
          title: 'PTO Cash Outs',
          icon: 'mdi-cash',
          route: 'ptoCashOuts',
          permission: ['admin', 'user', 'manager'],
          active: false
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
          permission: ['admin', 'manager'],
          active: false
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
    handleNavigation
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
.case-red-text {
  color: #bc3825;
}

.navbar-icons {
  vertical-align: middle;
  text-align: center;
  opacity: 1 !important;
}

.list-icons {
  width: 24px;
}

.nav-item {
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1rem;
}
</style>
