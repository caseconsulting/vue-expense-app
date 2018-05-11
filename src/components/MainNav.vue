<template>
  <b-navbar toggleable="md" type="dark" variant="dark">
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

    <b-navbar-brand to="/">
      <img src="@/assets/img/logo-big.png" height="52" width="52" class="mr-1"/>Case Consulting Expense App
    </b-navbar-brand>

    <b-collapse is-nav id="nav_collapse">
      <b-navbar-nav class="ml-auto">
        <b-nav-item v-show="isLoggedIn()" to="/expenseTypes">
          <icon name="book" class="mr-1"/>Expense Types
        </b-nav-item>
        <b-nav-item v-show="isLoggedIn()" to="/employees">
          <icon name="users" class="mr-1"/>Employees
        </b-nav-item>
        <b-nav-item v-show="isLoggedIn()" to="/expenses">
          <icon name="dollar-sign" class="mr-1"/>Expenses
        </b-nav-item>
        <b-nav-item v-show="isLoggedIn()" to="/help">
          <icon name="question" class="mr-1"/>Help
        </b-nav-item>
        <b-nav-item v-show="isLoggedIn()" @click="handleLogout()">
          <icon name="sign-out-alt" class="mr-1"/>Logout
        </b-nav-item>
        <b-nav-item v-show="!isLoggedIn()" @click="handleLogin()">
          <icon name="sign-in-alt" class="mr-1"/>Login
        </b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
// @ is an alias to /src
import { isLoggedIn, login, logout } from '@/utils/auth';

export default {
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

<style scoped lang="scss">
</style>
