<template>
  <div id="app">
    <v-app>
      <v-navigation-drawer v-model="drawer" fixed app disableResizeWatcher>
        <main-nav></main-nav>
      </v-navigation-drawer>
      <v-toolbar color="primary" dark fixed app>
        <v-toolbar-side-icon v-show="isLoggedIn()" @click.stop="drawer = !drawer"></v-toolbar-side-icon>
        <v-toolbar-title>
          <h2 style="text-align:center"><span class="e">€</span>xpense App</h2></v-toolbar-title
        >
        <v-spacer></v-spacer>

        <v-toolbar-items v-show="isLoggedIn()">
          <v-flex xs12 sm6 md8 align-center justify-left layout text-xs-center>
            <v-menu bottom offset-y open-on-click>
              <v-avatar slot="activator" size="50" color="grey lighten-4">
                <img :src="profilePic" alt="avatar" />
              </v-avatar>
              <v-list>
                <v-btn flat @click="handleLogout()">Logout</v-btn>
              </v-list>
            </v-menu>
          </v-flex>
        </v-toolbar-items>
      </v-toolbar>
      <v-content>
        <v-container fluid grid-list-lg>
          <router-view></router-view>
        </v-container>
      </v-content>
      <v-footer app></v-footer>
    </v-app>
  </div>
</template>

<script>
import { isLoggedIn, logout, getProfile } from '@/utils/auth';
import MainNav from '@/components/MainNav.vue';
import router from './router.js';
export default {
  data: () => ({
    drawer: false,
    profilePic: 'src/assets/img/logo-big.png',
    hasBeenLoggedInBefore: false
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
    },
    async initSession() {
      const timeout = seconds => new Promise(resolve => setTimeout(resolve, seconds * 1000));
      await timeout(60); //wait 60 seconds

      if (!this.isLoggedIn() && this.hasBeenLoggedInBefore) {
        this.hasBeenLoggedInBefore = false; //prevents looping for no reason
        router.push({ path: '/home' });
      }
      this.initSession();
    }
  },
  created() {
    let pic = getProfile();
    if (pic) {
      this.profilePic = pic;
    }
    if (this.isLoggedIn()) this.hasBeenLoggedInBefore = true;
    this.initSession(); //starts session checking
  }
};
</script>

<style lang="scss">
@import '../node_modules/vuetify/dist/vuetify.min.css';
@import 'src/assets/styles/styles.scss';

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.e {
  -webkit-animation: color-change 1s infinite alternate both;
  -moz-animation: color-change 10s infinite alternate both;
  -o-animation: color-change 10s infinite alternate both;
  -ms-animation: color-change 10s infinite alternate both;
  animation: color-change 5s infinite alternate both;
}

@-webkit-keyframes color-change {
  0% {
    color: black;
  }
  100% {
    color: gold;
  }
}
@-moz-keyframes color-change {
  0% {
    color: black;
  }
  100% {
    color: gold;
  }
}
@-ms-keyframes color-change {
  0% {
    color: black;
  }
  100% {
    color: gold;
  }
}
@-o-keyframes color-change {
  0% {
    color: black;
  }
  100% {
    color: gold;
  }
}
@keyframes color-change {
  0% {
    color: black;
  }
  100% {
    color: gold;
  }
}
</style>
