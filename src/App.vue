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
        <v-toolbar-title v-show="!isMobile">
          <h1 class="d-inline" style="text-align: center;">Case Portal</h1>
        </v-toolbar-title>
        <!-- In Mobile View decrease title size-->
        <h1 v-show="isMobile" class="font-25" style="text-align: center;">
          Case Portal
        </h1>

        <v-spacer></v-spacer>
        <!-- Display social media icons and links dropdown menu -->
        <v-item-group class="hidden-sm-and-down" v-show="isLoggedIn() && !isMobile">
          <v-menu open-on-hover offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn top text small class="my-2" v-bind="attrs" v-on="on">Links &#9662; </v-btn>
            </template>

            <v-list>
              <v-list-item v-for="(l, index) in links" :key="index" :href="l.link" target="_blank">
                <v-list-item-title>{{ l.name }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-btn
            class="mx-auto white--text"
            v-for="link in mediaLinks"
            :key="link.name"
            :href="link.link"
            icon
            target="_blank"
          >
            <icon :name="link.icon"></icon>
          </v-btn>
        </v-item-group>

        <!--In MOBILE VIEW/Smaller Screen sizes display all links under the links dropdown-->

        <v-item-group class="hidden-md-and-up" v-show="isLoggedIn() | isMobile">
          <v-menu open-on-hover offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn top text small class="my-2" v-bind="attrs" v-on="on">
                <v-icon color="white">menu</v-icon>
              </v-btn>
            </template>

            <v-list class="scrollLink">
              <v-list-item v-for="(l, index) in links" :key="index" :href="l.link" target="_blank">
                <v-list-item-title>{{ l.name }}</v-list-item-title>
              </v-list-item>
              <hr
                role="separator"
                aria-orientation="horizontal"
                class="v-divider theme--light"
                :inset="inset"
                vertical
              />
              <div class="v-subheader theme--light">Social</div>
              <v-list-item v-for="link in mediaLinks" :key="link.name" :href="link.link" icon target="_blank">
                <icon :name="link.icon"></icon>
                <span class="mr-2"> </span>
                <v-list-item-title> {{ ( link.name) }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-item-group>

        <v-toolbar-items v-show="isLoggedIn()">
          <v-flex xs12 sm6 md8 align-center justify-left layout text-xs-center>
            <v-menu bottom offset-y open-on-hover>
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
import MobileDetect from 'mobile-detect';
import TimeOutModal from '@/components/TimeOutModal.vue';
import TimeOutWarningModal from '@/components/TimeOutWarningModal.vue';

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|
/**
 * Checks if the current device used is mobile. Return true if it is mobile. Returns false if it is not mobile.
 *
 * @return boolean - if the device is mobile
 */
function isMobile() {
  let md = new MobileDetect(window.navigator.userAgent);
  return md.os() === 'AndroidOS' || md.os() === 'iOS';
}

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

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

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

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

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  data: () => ({
    drawer: isLoggedIn(),
    inset: false,
    profilePic: 'src/assets/img/logo-big.png',
    hasBeenLoggedInBefore: false,
    timedOut: false,
    session: false,
    now: Math.trunc(new Date().getTime() / 1000),
    date: null,
    links: [
      { name: 'Basecamp', link: 'https://3.basecamp.com/3097063' },
      { name: '401k', link: 'https://3.basecamp.com/3097063/buckets/179119/vaults/29920981' },
      { name: 'Health Insurance', link: 'https://3.basecamp.com/3097063/buckets/179119/vaults/29920949' },
      { name: 'TSheets', link: 'https://caseconsulting.tsheets.com/' },
      { name: 'ADP', link: 'https://www.adp.com/' }
    ],
    mediaLinks: [
      { name: 'Github', link: 'https://github.com/caseconsulting', icon: 'brands/github' },
      { name: 'LinkedIn', link: 'https://linkedin.com/company/case-consulting-inc', icon: 'brands/linkedin' },
      { name: 'Youtube', link: 'https://www.youtube.com/channel/UC_oJY4OrOpLNrIBAN7Y-9fA', icon: 'brands/youtube' },
      { name: 'Twitter', link: 'https://twitter.com/consultwithcase?lang=en', icon: 'brands/twitter' },
      { name: 'Facebook', link: 'https://www.facebook.com/ConsultwithCase/', icon: 'brands/facebook' }
    ]
  }),
  props: {
    source: String
  },
  computed: {
    isMobile
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

.scrollLink {
  width: 150px;
  max-height: 300px;
  overflow-y: scroll;
}

.scroll::-webkit-scrollbar {
  width: 0 px; // remove space
  background: transparent; // make scroll bar invisible
}
</style>
