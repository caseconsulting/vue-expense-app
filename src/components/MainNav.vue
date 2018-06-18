<template>
<div>


  <v-container fluid>
    <div class="top-header text-center">


      <v-layout justify-left>
        <v-btn icon light @click.stop="drawer = !drawer">
          <icon name="bars"></icon>
        </v-btn>
      </v-layout>
      <h1 id="main-header" class="text-center"><span class="e">€</span>xpense App</h1>
    </div>
  </v-container>
  <v-navigation-drawer
    v-model="drawer"
    temporary
    absolute
  >
    <v-list class="pa-1">
      <v-list-tile avatar>
        <v-list-tile-avatar>
          <img src="@/assets/img/logo-big.png" height="52" width="52" class="mr-1" />
        </v-list-tile-avatar>
      </v-list-tile>
      <v-list-tile v-show="isLoggedIn()" @click="handleLogout()">Logout &nbsp; <icon name="sign-out-alt" class="mr-1"></icon></v-list-tile>
      <v-list-tile v-show="!isLoggedIn()" @click="handleLogin()"><icon name="sign-in-alt" class="mr-1"></icon>Login</v-list-tile>
    </v-list>
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
  </v-navigation-drawer>
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
        { title: 'Home', icon: 'desktop', route: 'home' },
        { title: 'Expenses', icon: 'dollar-sign', route: 'expenses' },
        {
          title: 'Expense Types',
          icon: 'book',
          route: 'expenseTypes'
        },
        { title: 'Employees', icon: 'users', route: 'employees' },
        { title: 'Help', icon: 'life-ring', route: 'help' }
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
