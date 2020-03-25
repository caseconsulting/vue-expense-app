<template>
  <div>
    <v-flex>
      <img src="@/assets/img/logo-banner.gif" class="logo" />
    </v-flex>

    <v-list class="pt-0" dense>
      <v-divider></v-divider>
      <v-list-item
        v-for="item in visibleTiles"
        :key="item.title"
        active-class="red--text v-list__tile--active"
        :to="{ name: item.route }"
        @click="scrollUp"
      >
        <v-list-item-icon style="width: 30px">
          <icon :name="item.icon" class="navbar-icons"></icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import _ from 'lodash';

// @ is an alias to /src
import { isLoggedIn, login, logout, getRole } from '@/utils/auth';

export default {
  data() {
    return {
      permissions: '',
      drawer: null,
      items: [
        {
          title: 'Employee Home',
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
          title: 'Expenses',
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
        //commenting in-progress training page out before deploying
        // {
        //   title: 'Training',
        //   icon: 'fire',
        //   route: 'training',
        //   permission: ['admin', 'user']
        // },
        {
          title: 'Help',
          icon: 'life-ring',
          route: 'help',
          permission: ['admin', 'user']
        }
      ]
    };
  },
  components: {},
  computed: {
    visibleTiles() {
      return _.filter(this.items, item => {
        return _.includes(item.permission, this.permissions);
      });
    }
  },
  methods: {
    scrollUp() {
      this.$vuetify.goTo(0);
    },
    handleLogin() {
      login();
    },
    handleLogout() {
      logout();
    },
    isLoggedIn() {
      return isLoggedIn();
    }
  },
  created() {
    this.permissions = getRole();
  }
};
</script>

<style lang="scss">
.navbar-icons {
  color: #646460;
  width: auto;
  height: 2em;
  max-width: 100%;
  max-height: 100%;
}

#main-header {
  font-family: 'Quicksand', sans-serif;
  font-weight: bold;
  font-size: 48px;
  color: #38424d;
  padding-top: 1%;
  padding-bottom: 2%;
}

.e {
  color: #68caa6;
}

.logo {
  height: 50%;
  width: 50%;
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
