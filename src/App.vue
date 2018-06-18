<template>
<div id="app">
  <v-app>
    <v-container fluid>
      <main-nav></main-nav>
    </v-container>
    <v-container fluid class="no-right-gutter">
      <v-layout>
        <router-view class="mt-3" />
      </v-layout>
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

.no-right-gutter {
  padding-right: 0;
}
</style>
