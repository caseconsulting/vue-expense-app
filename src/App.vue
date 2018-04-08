<template>
  <div id="app" class="container-fluid">
    <div class="row">
      <div class="col-1">
        <main-nav></main-nav>
      </div>
  
      <div class="col-11">
        <router-view/>
      </div>
    </div>
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
