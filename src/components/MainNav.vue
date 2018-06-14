<template>
<div id="nav-slider" class="con-example-sidebar">
<vs-button id="nav-button" @click="active=!active" vs-type="dark-flat" vs-icon="menu"></vs-button>


<vs-sidebar vs-parent="#nav-slider" :vs-active.sync="active">
  <vs-sidebar-item @click="navigate(1)" :vs-active="actives==1" >
    Dashboard
  </vs-sidebar-item>
  <vs-sidebar-item @click="navigate(2)" :vs-active="actives==2">
    <icon name="book" class="mr-1" /> Expense Types
  </vs-sidebar-item>
  <vs-sidebar-item @click="navigate(3)" :vs-active="actives==3">
    <icon name="users" class="mr-1" />Employees
  </vs-sidebar-item>
  <vs-sidebar-item @click="navigate(4)" :vs-active="actives==4">
    <icon name="dollar-sign" class="mr-1" />Expenses
  </vs-sidebar-item>
  <vs-sidebar-item @click="navigate(5)" :vs-active="actives==5">
    <icon name="question" class="mr-1" />Help
  </vs-sidebar-item>
</vs-sidebar>
</div>

<!-- <b-navbar toggleable="md" type="dark" variant="dark">
  <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>


  <b-navbar-brand to="/">
    <img src="@/assets/img/logo-big.png" height="52" width="52" class="mr-1" />Case Consulting Expense App
  </b-navbar-brand>

  <b-collapse is-nav id="nav_collapse">
    <b-navbar-nav class="ml-auto">
      <b-nav-item v-show="isLoggedIn()" to="/expenseTypes">
        <icon name="book" class="mr-1" />Expense Types
      </b-nav-item>
      <b-nav-item v-show="isLoggedIn()" to="/employees">
        <icon name="users" class="mr-1" />Employees
      </b-nav-item>
      <b-nav-item v-show="isLoggedIn()" to="/expenses">
        <icon name="dollar-sign" class="mr-1" />Expenses
      </b-nav-item>
      <b-nav-item v-show="isLoggedIn()" to="/help">
        <icon name="question" class="mr-1" />Help
      </b-nav-item>
      <b-nav-item v-show="isLoggedIn()" @click="handleLogout()">
        <icon name="sign-out-alt" class="mr-1" />Logout
      </b-nav-item>
      <b-nav-item v-show="!isLoggedIn()" @click="handleLogin()">
        <icon name="sign-in-alt" class="mr-1" />Login
      </b-nav-item>
    </b-navbar-nav>
  </b-collapse>
</b-navbar> -->
</template>

<script>
// @ is an alias to /src
import {
  isLoggedIn,
  login,
  logout
} from '@/utils/auth';

export default {
  data(){
    return{
      active: false,
      actives: 1
    };
 },
 components: {

 },
  methods: {
    navigate(selected) {
      this.actives = selected;
      switch (selected) {
        case 1:
            this.$router.push({name: 'home'});
          break;
        case 2:
          this.$router.push({name: 'expenseTypes'});
            break;
        case 3:
          this.$router.push({name: 'employees'});
          break;
        case 4:
          this.$router.push({name: 'expenses'});
          break;
        case 5:
          this.$router.push({name: 'help'});
          break;
        default:
          this.$router.push({name: 'login'});

      }
      this.active = false;

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
  }
};
</script>

<style lang="scss">
#nav-slider span .material-icons {
  font-size: 32px;

}
#nav-button :focus {
  outline:none;
}
</style>
