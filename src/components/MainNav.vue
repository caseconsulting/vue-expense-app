<template>
  <div>
    <!-- Logo -->
    <v-flex>
      <img src="@/assets/img/logo-banner.gif" class="logo" />
    </v-flex>

    <!-- Navigation Links -->
    <v-list class="pt-0" dense>
      <v-divider></v-divider>
      <template v-for="item in visibleTiles" class="navbar-icons">
        <v-list-group v-if="item.subItems" :key="item.title" active-class="v-list__tile--active">
          <template v-slot:activator>
            <!-- Parent Item Icon -->
            <v-list-item-icon style="width: 30px;">
              <icon :name="item.icon" class="navbar-icons"></icon>
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
            <v-list-item-content style="margin-left: 75px;">
              <v-list-item-title>{{ subItem.title }}</v-list-item-title>
            </v-list-item-content>

            <!-- SubItems Icon -->
            <v-list-item-icon style="width: 30px;">
              <icon :name="subItem.icon" class="navbar-icons"></icon>
            </v-list-item-icon>
          </v-list-item>
        </v-list-group>
        <v-list-item
          v-else
          :key="item.title"
          active-class="red--text v-list__tile--active"
          :to="{ name: item.route }"
          @click="scrollUp"
        >
          <!-- Item Icon -->
          <v-list-item-icon style="width: 30px;">
            <icon :name="item.icon" class="navbar-icons"></icon>
          </v-list-item-icon>

          <!-- Item mTitle -->
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
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
    return _.includes(item.permission, this.permissions);
  });
} // visibleTiles

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

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
async function created() {
  this.permissions = getRole();
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
          permission: ['user', 'admin']
        },
        {
          title: 'Expenses',
          icon: 'dollar-sign',
          subItems: [
            {
              title: 'My Budgets',
              icon: 'hand-holding-usd',
              route: 'myBudgets',
              permission: ['user', 'admin']
            },
            {
              title: 'My Expenses',
              icon: 'dollar-sign',
              route: 'expenses',
              permission: ['admin', 'user']
            },
            {
              title: 'Expense Types',
              icon: 'book',
              route: 'expenseTypes',
              permission: ['admin', 'user']
            },
            {
              title: 'Admin Dashboard',
              icon: 'desktop',
              route: 'admin',
              permission: ['admin']
            }
          ],
          permission: ['user', 'admin']
        },
        {
          title: 'Employees',
          icon: 'users',
          route: 'employees',
          permission: ['admin', 'user']
        },
        {
          title: 'Training',
          icon: 'fire',
          route: 'training',
          permission: ['admin', 'user']
        },
        {
          title: 'Help',
          icon: 'life-ring',
          route: 'help',
          permission: ['admin', 'user']
        }
      ], // navigation options
      permissions: '' // user role
    };
  },
  methods: {
    scrollUp
  }
};
</script>

<style lang="scss">
.e {
  color: #68caa6;
}

.logo {
  width: 100%;
}

#main-header {
  font-family: 'Quicksand', sans-serif;
  font-weight: bold;
  font-size: 48px;
  color: #38424d;
  padding-top: 1%;
  padding-bottom: 2%;
}

.navbar-icons {
  color: #646460;
  width: auto;
  height: 2em;
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
