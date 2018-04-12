<template>
  <b-navbar toggleable="md" type="dark" variant="dark">
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
  
    <b-navbar-brand to="/">
      <img src="@/assets/img/logo-big.png" height="52" width="52" class="mr-1"/>Case Consulting Expense App
    </b-navbar-brand>
  
    <b-collapse is-nav id="nav_collapse">
      <b-navbar-nav class="ml-auto">
        <b-nav-item to="/expenseTypes">
          <icon name="book" class="mr-1"/>Expense Types
        </b-nav-item>
        <b-nav-item to="/employees">
          <icon name="users" class="mr-1"/>Employees
        </b-nav-item>
        <b-nav-item to="/expenses">
          <icon name="dollar-sign" class="mr-1"/>Expenses
        </b-nav-item>
        <b-nav-item to="/help">
          <icon name="question" class="mr-1"/>Help
        </b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";

export default {
  components: {
  }
};
</script>

<style scoped lang="scss">
</style>