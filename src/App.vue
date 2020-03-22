<template>
  <div id="app">
    <v-app style="background: #F5F5F5">
      <v-navigation-drawer light v-model="drawer" fixed app disableResizeWatcher>
        <main-nav></main-nav>
      </v-navigation-drawer>
      <v-app-bar class="nav-color" dark fixed app>
        <v-app-bar-nav-icon v-show="isLoggedIn()" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <v-toolbar-title>
          <h2 style="text-align:center"><span class="e">€</span>xpense App</h2>
        </v-toolbar-title>
        <v-spacer></v-spacer>

        <v-toolbar-items v-show="isLoggedIn()">
          <v-flex xs12 sm6 md8 align-center justify-left layout text-xs-center>
            <v-menu bottom offset-y open-on-click>
              <template v-slot:activator="{ on }">
                <v-avatar size="50" color="grey lighten-4">
                  <img :src="profilePic" alt="avatar" v-on="on" />
                </v-avatar>
              </template>
              <v-list>
                <v-btn text @click="handleLogout()">Logout</v-btn>
              </v-list>
            </v-menu>
          </v-flex>
        </v-toolbar-items>
      </v-app-bar>

      <v-content>
        <v-container fluid grid-list-lg>
          <router-view></router-view>
        </v-container>
      </v-content>
      <v-footer app></v-footer>
      <time-out-model :activate="timedOut"></time-out-model>
      <time-out-warning-model :activate="session"></time-out-warning-model>
    </v-app>
  </div>
</template>

<script>
import { isLoggedIn, logout, getProfile, getTokenExpirationDate, getAccessToken } from '@/utils/auth';
import MainNav from '@/components/MainNav.vue';
import router from './router.js';
import TimeOutModel from '@/components/TimeOutModel.vue';
import TimeOutWarningModel from '@/components/TimeOutWarningModel.vue';

/* METHODS */

/*
 * Logout of expense app
 */
function handleLogout() {
  this.session = false;
  this.timedOut = false;
  logout();
}

async function initSession() {
  const timeout = seconds => new Promise(resolve => setTimeout(resolve, seconds * 1000));
  await timeout(60); //wait 60 seconds

  if (!this.isLoggedIn() && this.hasBeenLoggedInBefore) {
    this.hasBeenLoggedInBefore = false; //prevents looping for no reason
    router.push({ path: '/home' });
  }

  this.initSession();
}

/* LIFECYCLE HOOKS */

async function created() {
  window.EventBus.$on('sessionContinue', () => (this.session = false)); // Confirm 5 minute warning
  window.EventBus.$on('relog', this.handleLogout); // Session end - log out

  // set expiration date if access token received
  let accessToken = getAccessToken();

  if (accessToken) {
    this.date = Math.trunc(getTokenExpirationDate(accessToken).getTime());
    this.now = Math.trunc(new Date().getTime());
    let timeRemaining = this.date - this.now; // default access key (2 hours)

    window.setTimeout(() => {
      this.timedOut = true;
    }, timeRemaining);

    if (timeRemaining > 300000) {
      window.setTimeout(() => {
        this.session = true;
      }, timeRemaining - 300000);
    }
  }

  let pic = getProfile();

  if (pic) {
    this.profilePic = pic;
  }

  if (this.isLoggedIn()) this.hasBeenLoggedInBefore = true;

  this.initSession(); //starts session checking
}

export default {
  data: () => ({
    drawer: false,
    profilePic: 'src/assets/img/logo-big.png',
    hasBeenLoggedInBefore: false,
    timedOut: false,
    session: false,
    now: Math.trunc(new Date().getTime() / 1000),
    date: null
  }),
  props: {
    source: String
  },
  components: {
    MainNav,
    TimeOutModel,
    TimeOutWarningModel
  },
  methods: {
    handleLogout,
    isLoggedIn,
    initSession
  },
  created
};
</script>

<style lang="scss">
@import '../node_modules/vuetify/dist/vuetify.min.css';
@import 'src/assets/styles/styles.scss';

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #3f3f3c;
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
    color: white;
  }

  100% {
    color: gold;
  }
}

@-moz-keyframes color-change {
  0% {
    color: white;
  }

  100% {
    color: gold;
  }
}

@-ms-keyframes color-change {
  0% {
    color: white;
  }

  100% {
    color: gold;
  }
}

@-o-keyframes color-change {
  0% {
    color: white;
  }

  100% {
    color: gold;
  }
}

@keyframes color-change {
  0% {
    color: white;
  }

  100% {
    color: gold;
  }
}
</style>
