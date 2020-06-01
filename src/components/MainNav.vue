<template>
  <div>
    <!-- Logo -->
    <v-flex>
      <img src="@/assets/img/logo-banner.gif" class="logo" />
    </v-flex>

    <!-- Navigation Links -->
    <v-list class="pt-0" dense>
      <v-divider></v-divider>
      <v-list-item
        v-for="item in visibleTiles"
        :key="item.title"
        active-class="red--text v-list__tile--active"
        :to="{ name: item.route }"
        @click="scrollUp"
      >
        <!-- Icon -->
        <v-list-item-icon style="width: 30px;">
          <icon :name="item.icon" class="navbar-icons"></icon>
        </v-list-item-icon>

        <!-- Title -->
        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
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
          title: 'My Budgets',
          icon: 'hand-holding-usd',
          route: 'home',
          permission: ['user', 'admin']
        },
        {
          title: 'Admin Dashboard',
          icon: 'desktop',
          route: 'admin',
          permission: ['admin']
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
  height: 50%;
  width: 50%;
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
