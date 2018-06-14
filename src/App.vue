<template>
  <div id="app">
    <main-nav></main-nav>
    <b-container fluid>
      <router-view class="mt-3"/>
    </b-container>
  </div>
</template>

<script>
// @ is an alias to /src
import MainNav from '@/components/MainNav.vue';

export default {
  components: {
    MainNav
  }
};
</script>

<style lang="scss">
@import 'src/assets/styles/styles.scss';

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
