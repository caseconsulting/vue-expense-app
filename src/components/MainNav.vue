<template>
  <b-row>
    <div class="col-1 navbar navbar-fixed-left text-center">
      <a id="logo" class="navbar-brand">
        <router-link to="/">
          <img src="@/assets/img/logo-big.png" height="52" width="52" />
        </router-link>
      </a>
      <ul class="nav navbar-nav">
        <li>
          <icon name="book" scale="3"></icon>
          <router-link to="/expenseTypes">Expense Types</router-link>
        </li>
        <li>
          <icon name="users" scale="3"/>
          <router-link to="/employees">Employees</router-link>
        </li>
        <li>
          <icon name="dollar-sign" scale="3"/>
          <router-link to="/expenses">Expenses</router-link>
        </li>
        <li>
          <icon name="question" scale="3"/>
          <router-link to="/help">Help</router-link>
        </li>
      </ul>
    </div>
  </b-row>
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