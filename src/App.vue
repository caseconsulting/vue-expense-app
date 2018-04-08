<template>
  <div id="app">
    <main-nav></main-nav>
    <router-view/>
  </div>
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
  @import '../node_modules/bootstrap/scss/bootstrap.scss';

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
