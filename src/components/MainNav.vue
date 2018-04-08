<template>
  <div class="row">
    <div class=" col-1 navbar navbar-fixed-left text-center">
      <a id="logo" class="navbar-brand"><router-link to="/"><img src="src/assets/img/logo-big.png" height="52" width="52" /></router-link></a>
      <ul class="nav navbar-nav">
        <li>
          <i class="fa fa-book fa-3x"/>
          <router-link to="/expenseTypes">Expense Types</router-link>
        </li>
        <li>
          <i class="fa fa-users fa-3x"/>
          <router-link to="/employees">Employees</router-link>
        </li>
        <li>
          <i class="fa fa-usd fa-3x"/>
          <router-link to="/expenses">Expenses</router-link>
        </li>
        <li>
          <i class="fa fa-question fa-3x"/>
          <router-link to="/help">Help</router-link>
        </li>
      </ul>
    </div>
  </div>
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