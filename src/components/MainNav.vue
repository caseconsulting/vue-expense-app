<template>
<div>

  <v-flex>
    <img src="@/assets/img/logo-banner.gif" class="logo" />
  </v-flex>

  <v-list class="pt-0" dense>
    <v-divider></v-divider>
    <v-list-tile v-for="item in items" :key="item.title" @click="" :to='{name: item.route}'>
      <v-list-tile-action>
        <icon :name="item.icon" class="navbar-icons"></icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>{{ item.title }}</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
  </v-list>
</div>
</template>


<script>
// @ is an alias to /src
import { isLoggedIn, login, logout } from '@/utils/auth';

export default {
  data() {
    return {
      drawer: null,
      items: [
        {
          title: 'Employee Home',
          icon: 'hand-holding-usd',
          route: 'home'
        },
        {
          title: 'Admin Dashboard',
          icon: 'desktop',
          route: 'admin'
        },
        {
          title: 'Expenses',
          icon: 'dollar-sign',
          route: 'expenses'
        },
        {
          title: 'Expense Types',
          icon: 'book',
          route: 'expenseTypes'
        },
        {
          title: 'Employees',
          icon: 'users',
          route: 'employees'
        },
        {
          title: 'Help',
          icon: 'life-ring',
          route: 'help'
        }
      ]
    };
  },
  components: {},
  methods: {
    handleLogin() {
      login();
    },
    handleLogout() {
      logout();
    },
    isLoggedIn() {
      return isLoggedIn();
    }
  }
};
</script>

<style lang="scss">
.navbar-icons {
  color: #68caa6;
  width: auto;
  height: 2em;
  max-width: 100%;
  max-height: 100%;
}

.fa-icon {
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
