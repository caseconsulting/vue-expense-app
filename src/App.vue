<template>
<div id="app">
  <v-app>
      <main-nav></main-nav>
    <v-container fluid grid-list-lg>
        <router-view class="mt-3"/>
    </v-container>
  </v-app>
</div>
</template>

<script>
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
