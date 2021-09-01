<template>
  <div>
    <!-- Navigation Links -->
    <v-list class="pt-0" dense>
      <v-divider></v-divider>
      <div v-for="(item, i) in visibleTiles" :key="i">
        <!-- Grouped Navigation Links -->
        <v-list-group v-if="item.subItems" :key="item.title" no-action active-class="red--text v-list__tile--active">
          <template v-slot:activator>
            <!-- Parent Item Icon -->
            <v-list-item-icon>
              <icon
                :id="item.icon"
                :name="item.icon"
                v-bind:class="{ iconSelected: item.active }"
                class="navbar-icons"
              ></icon>
            </v-list-item-icon>

            <!-- Parent Item Title -->
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item
            v-for="subItem in item.subItems"
            :key="subItem.title"
            active-class="red--text v-list__tile--active"
            :to="{ name: subItem.route }"
            @click="scrollUp"
          >
            <!-- SubItems Title -->
            <v-list-item-content>
              <v-list-item-title>{{ subItem.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-group>
        <!-- End Grouped Navigation Links -->

        <!-- Individual Navavigation Links -->
        <v-list-item
          v-else
          :id="item.icon"
          :key="item.title"
          active-class="red--text v-list__tile--active"
          :to="{ name: item.route }"
          @click="scrollUp"
        >
          <!--NavBar icons-->
          <!-- Item Icon -->

          <v-list-item-icon>
            <icon :name="item.icon" v-bind:class="{ iconSelected: item.active }" class="navbar-icons"></icon>
          </v-list-item-icon>

          <!-- Item mTitle -->
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
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
 * Updates active field of item with subItems
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
 * Scrolls up the page
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
          icon: 'home',
          route: 'home',
          permission: ['user', 'admin', 'intern', 'manager'],
          active: false
        },
        {
          title: 'Expenses',
          icon: 'dollar-sign',
          subItems: [
            {
              title: 'My Budgets',
              icon: 'hand-holding-usd',
              route: 'myBudgets',
              permission: ['user', 'admin', 'intern', 'manager']
            },
            {
              title: 'My Expenses',
              icon: 'dollar-sign',
              route: 'expenses',
              permission: ['admin', 'user', 'intern', 'manager']
            },
            {
              title: 'Expense Types',
              icon: 'book',
              route: 'expenseTypes',
              permission: ['admin', 'user', 'manager']
            },
            {
              title: 'Reimbursements',
              icon: 'desktop',
              route: 'reimbursements',
              permission: ['admin']
            }
          ],
          permission: ['user', 'admin', 'intern', 'manager'],
          active: false
        },
        {
          title: 'Employees',
          alias: ['employee'],
          icon: 'users',
          route: 'employees',
          permission: ['admin', 'user', 'intern', 'manager'],
          active: false
        },
        {
          title: 'Statistics Dashboard',
          alias: ['stats'],
          icon: 'chart-bar',
          route: 'stats',
          permission: ['admin', 'user', 'intern', 'manager'],
          active: false
        },
        {
          title: 'Audits',
          alias: ['audit'],
          icon: 'clipboard-check',
          route: 'audits',
          permission: ['admin', 'manager']
        },
        {
          title: 'Reports',
          alias: ['reports'],
          icon: 'clipboard-list',
          route: 'reports',
          permission: ['admin', 'user', 'intern', 'manager'],
          active: false
        },
        {
          title: 'Training',
          icon: 'fire',
          route: 'training',
          permission: ['admin', 'user', 'intern', 'manager'],
          active: false
        },
        {
          title: 'Help',
          icon: 'life-ring',
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
      handler: function () {
        this.route = this.$route.name;
      },
      deep: true
    },
    route: checkActive
  }
};
</script>

<style lang="scss" scoped>
#main-header {
  font-family: 'Quicksand', sans-serif;
  font-weight: bold;
  font-size: 48px;
  color: #38424d;
  padding-top: 1%;
  padding-bottom: 2%;
}

.navbar-icons,
.icon-text {
  vertical-align: middle;
}

.navbar-icons {
  color: #646460;
  text-align: center;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
}

#nav-button {
  float: left;
}

#nav-button :focus {
  outline: none;
}

#slider-logo {
  margin-bottom: 5px;
}
</style>
