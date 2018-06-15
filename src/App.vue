<template>
  <div id="app">
    <b-container fluid>
      <main-nav></main-nav>
    </b-container>
    <b-container fluid class="no-right-gutter">
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

.no-right-gutter {
  padding-right: 0
}


</style>
