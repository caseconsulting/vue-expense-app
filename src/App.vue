<template>
  <b-container fluid id="app">
    <b-row>
      <b-col sm="12" md="1">
        <main-nav></main-nav>
      </b-col>
      <b-col sm="12" md="11">
        <router-view/>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  // @ is an alias to /src
  import MainNav from "@/components/MainNav.vue";

  export default {
    components: {
      MainNav
    }
  };
</script>

<style lang="scss">
  @import 'src/assets/styles/styles.scss';

  #app {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }

  #nav {
    padding: 30px;
    a {
      font-weight: bold;
      color: #2c3e50;
      &.router-link-exact-active {
        color: #42b983;
      }
    }
  }
</style>
