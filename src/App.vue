<template>
<div id="app">
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      fixed
      app
    >
      <main-nav></main-nav>
    </v-navigation-drawer>
    <v-toolbar color="primary" dark fixed app>
      <v-toolbar-side-icon v-show="isLoggedIn()" @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title ><h2 style="text-align:center"><span class="e">€</span>xpense App</h2></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items class="hidden-sm-and-down">
        <v-btn flat v-show="isLoggedIn()" @click="handleLogout()">Logout</v-btn flat>
      </v-toolbar-items>
    </v-toolbar>
    <v-content>
      <v-container fluid grid-list-lg>
        <router-view></router-view>
      </v-container>
    </v-content>
    <v-footer app></v-footer>
  </v-app>


  <!-- <v-app>
      <main-nav></main-nav>
    <v-container fluid grid-list-lg>
        <router-view class="mt-3"/>
    </v-container>
  </v-app> -->
</div>
</template>

<script>
import { isLoggedIn, login, logout } from '@/utils/auth';
import MainNav from '@/components/MainNav.vue';
export default {
  data: () => ({
    drawer: false
  }),
  props: {
    source: String
  },
  components: {
    MainNav
  },
  methods: {
    handleLogout() {
      logout();
    },
    isLoggedIn() {
      return isLoggedIn();
    }
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

.e{
    -webkit-animation: color-change 1s infinite alternate both;
    -moz-animation: color-change 10s infinite alternate both;
    -o-animation: color-change 10s infinite alternate both;
    -ms-animation: color-change 10s infinite alternate both;
    animation: color-change 5s infinite alternate both;
}

@-webkit-keyframes color-change {
    0% { color: black; }
    100% { color: gold; }
}
@-moz-keyframes color-change {
    0% { color: black; }
    100% { color: gold; }
}
@-ms-keyframes color-change {
    0% { color: black; }
    100% { color: gold; }
}
@-o-keyframes color-change {
    0% { color: black; }
    100% { color: gold; }
}
@keyframes color-change {
    0% { color: black; }
    100% { color: gold; }
}

</style>
