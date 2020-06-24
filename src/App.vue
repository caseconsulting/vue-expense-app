<template>
  <div id="app">
    <v-app style="background: #f5f5f5;">
      <v-navigation-drawer
        light
        v-model="drawer"
        fixed
        app
        disableResizeWatcher
        expand-on-hover
        :permanent="isLoggedIn()"
        clipped
      >
        <main-nav></main-nav>
      </v-navigation-drawer>
      <v-app-bar class="nav-color" dark fixed app clipped-left>
        <v-avatar size="40" color="grey lighten-4" class="mr-2">
          <img src="@/assets/img/case-logo-circle.png" class="logo-bar" />
        </v-avatar>
        <v-toolbar-title>
          <h1 class="d-inline" style="text-align: center;">Case Portal</h1>
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

      <v-main>
        <v-container fluid grid-list-lg>
          <router-view></router-view>
        </v-container>
      </v-main>
      <v-footer app></v-footer>
      <time-out-modal :activate="timedOut"></time-out-modal>
      <time-out-warning-modal :activate="session"></time-out-warning-modal>
    </v-app>
  </div>
</template>

<script>
import { isLoggedIn, logout, getProfile, getTokenExpirationDate, getAccessToken } from '@/utils/auth';
import MainNav from '@/components/MainNav.vue';
import router from './router.js';
import TimeOutModal from '@/components/TimeOutModal.vue';
import TimeOutWarningModal from '@/components/TimeOutWarningModal.vue';

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
  const timeout = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));
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
  window.EventBus.$on('relog', handleLogout); // Session end - log out

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
    drawer: isLoggedIn(),
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
    TimeOutModal,
    TimeOutWarningModal
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

.logo-bar {
  width: 25px;
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
