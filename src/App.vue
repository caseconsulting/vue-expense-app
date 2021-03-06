<template>
  <div id="app">
    <v-app style="background: #f5f5f5">
      <v-navigation-drawer
        light
        v-model="drawer"
        fixed
        app
        disableResizeWatcher
        :expand-on-hover="!isMobile"
        :permanent="isLoggedIn() && !isMobile"
        clipped
      >
        <main-nav></main-nav>
      </v-navigation-drawer>
      <v-app-bar class="nav-color" dark fixed app clipped-left>
        <v-app-bar-nav-icon v-show="isLoggedIn() && isMobile" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <v-avatar size="40" color="grey lighten-4" class="mr-2">
          <img src="@/assets/img/case-logo-circle.png" class="logo-bar" />
        </v-avatar>
        <v-toolbar-title v-show="!isMobile">
          <h1 class="d-inline" style="text-align: center">Case Portal</h1>
        </v-toolbar-title>
        <!-- In Mobile View decrease title size-->
        <h1 v-show="isMobile" class="font-25" style="text-align: center">Case Portal</h1>

        <v-spacer></v-spacer>
        <!-- Display social media icons and links dropdown menu -->
        <v-item-group class="hidden-sm-and-down" v-show="isLoggedIn() && !isMobile">
          <v-menu open-on-hover offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn top text small class="my-2" v-bind="attrs" v-on="on" id="links-btn">Links &#9662; </v-btn>
            </template>

            <v-list>
              <v-list-item v-for="(l, index) in links" :key="index" :id="l.link" :href="l.link" target="_blank">
                <v-list-item-title>{{ l.name }}</v-list-item-title>
              </v-list-item>
              <v-list-item :href="floorPlan" target="_blank" id="floorPlan"
                >Workspace at Reston Town Center Map</v-list-item
              >
            </v-list>
          </v-menu>
          <v-btn
            class="mx-auto white--text"
            v-for="link in mediaLinks"
            :key="link.name"
            :id="link.name"
            :href="link.link"
            icon
            target="_blank"
          >
            <icon :name="link.icon"></icon>
          </v-btn>
        </v-item-group>

        <!-- User image and logout -->
        <v-menu bottom offset-y open-on-hover v-if="isLoggedIn()">
          <template v-slot:activator="{ on }">
            <v-avatar id="profile" size="50" color="grey lighten-4">
              <img :src="profilePic" alt="avatar" v-on="on" />
            </v-avatar>
          </template>
          <v-list v-if="!(isLoggedIn() && (isMobile || isSmallScreen))">
            <v-list-item>
              <v-btn :disabled="onUserProfile" text @click="handleProfile()">Profile</v-btn>
            </v-list-item>
            <v-list-item>
              <v-btn id="logoutBtn" text @click="handleLogout()">Logout</v-btn>
            </v-list-item>
          </v-list>
          <!--In MOBILE VIEW/Smaller Screen sizes display all links under the user image dropdown-->
          <v-list class="scrollLink" v-else>
            <v-list-item>
              <v-btn text :disabled="onUserProfile" @click="handleProfile()">Profile</v-btn>
            </v-list-item>
            <v-list-item>
              <v-btn text @click="handleLogout()">Logout</v-btn>
            </v-list-item>
            <hr role="separator" aria-orientation="horizontal" class="v-divider theme--light" :inset="inset" vertical />
            <div class="v-subheader theme--light">Company Links</div>
            <v-list-item v-for="(l, index) in links" :key="index" :href="l.link" target="_blank">
              <v-list-item-title>{{ l.name }}</v-list-item-title>
            </v-list-item>
            <v-list-item :href="floorPlan" target="_blank" id="floorPlan">MakeOffices Map</v-list-item>
            <hr role="separator" aria-orientation="horizontal" class="v-divider theme--light" :inset="inset" vertical />
            <div class="v-subheader theme--light">Social</div>
            <v-list-item v-for="link in mediaLinks" :key="link.name" :href="link.link" icon target="_blank">
              <icon :name="link.icon"></icon>
              <span class="mr-2"> </span>
              <v-list-item-title> {{ link.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <!-- End user image and logout -->
      </v-app-bar>

      <v-main>
        <v-container fluid grid-list-lg>
          <router-view></router-view>
        </v-container>
      </v-main>
      <v-footer padless>
        <v-col class="text-right text-caption" cols="12"><strong>Version</strong> {{ version }}</v-col>
      </v-footer>
      <time-out-modal :toggleTimeOut="timedOut"></time-out-modal>
      <time-out-warning-modal :toggleWarning="session"></time-out-warning-modal>
    </v-app>
  </div>
</template>

<script>
import { isLoggedIn, logout, getProfile, getTokenExpirationDate, getAccessToken } from '@/utils/auth';
import MainNav from '@/components/MainNav.vue';
import MobileDetect from 'mobile-detect';
import TimeOutModal from '@/components/modals/TimeOutModal.vue';
import TimeOutWarningModal from '@/components/modals/TimeOutWarningModal.vue';
import floorPlan from '@/assets/img/MakeOfficesfloorplan.jpg';
import api from '@/shared/api.js';

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

/**
 * Checks if the user is visiting their own profile or not
 *
 * @return boolean - if the user is visiting their profile
 */
function onUserProfile() {
  if (this.userId == null) {
    return false;
  }
  return this.$route.params.id === this.userId.toString();
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
  logout();
}

async function handleProfile() {
  var user = await api.getUser();
  this.$router.push({ name: 'employee', params: { id: `${user.employeeNumber}` } });
}

function onResize() {
  this.isSmallScreen = window.innerWidth < 960;
}

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

async function created() {
  window.EventBus.$on('relog', handleLogout); // Session end - log out
  // set expiration date if access token received
  let accessToken = getAccessToken();
  if (accessToken && isLoggedIn()) {
    this.date = Math.trunc(getTokenExpirationDate(accessToken).getTime());
    this.now = Math.trunc(new Date().getTime());
    let timeRemaining = this.date - this.now; // default access key (2 hours)

    window.setTimeout(() => {
      this.timedOut = !this.timedOut;
    }, timeRemaining);

    if (timeRemaining > 300000) {
      window.setTimeout(() => {
        this.session = !this.session;
      }, timeRemaining - 300000);
    }
    //stores the employee number
    var user = await api.getUser();
    this.userId = user.employeeNumber;
  }

  let pic = getProfile();

  if (pic) {
    this.profilePic = pic;
  }

  //This has some security implications
  this.version = require('../package.json').version;
}

async function beforeDestroy() {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', this.onResize, { passive: true });
  }
}

async function mounted() {
  this.onResize();
  window.addEventListener('resize', this.onResize, { passive: true });
}

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  data: () => ({
    floorPlan: floorPlan,
    drawer: isLoggedIn(),
    inset: false,
    profilePic: 'src/assets/img/logo-big.png',
    timedOut: false,
    session: false,
    now: Math.trunc(new Date().getTime() / 1000),
    userId: null,
    date: null,
    links: [
      { name: 'Basecamp', link: 'https://3.basecamp.com/3097063' },
      { name: 'Net Benefits/Fidelity', link: 'https://nb.fidelity.com/public/nb/default/home' },
      { name: 'Health Insurance', link: 'https://3.basecamp.com/3097063/buckets/179119/messages/2306027830' },
      { name: 'QuickBooks Time', link: 'https://tsheets.intuit.com/page/login_oii' },
      { name: 'ADP', link: 'https://my.adp.com/' },
      { name: 'Life Insurance', link: 'https://www.reliancestandard.com/home/' },
      {
        name: 'Redmine',
        link: 'https://redmine.consultwithcase.com'
      }
    ],
    mediaLinks: [
      { name: 'Github', link: 'https://github.com/caseconsulting', icon: 'brands/github' },
      { name: 'LinkedIn', link: 'https://linkedin.com/company/case-consulting-inc', icon: 'brands/linkedin' },
      { name: 'Youtube', link: 'https://www.youtube.com/channel/UC_oJY4OrOpLNrIBAN7Y-9fA', icon: 'brands/youtube' },
      { name: 'Twitter', link: 'https://twitter.com/consultwithcase?lang=en', icon: 'brands/twitter' },
      { name: 'Facebook', link: 'https://www.facebook.com/ConsultwithCase/', icon: 'brands/facebook' }
    ],
    isSmallScreen: false,
    version: null
  }),
  props: {
    source: String
  },
  computed: {
    isMobile,
    onUserProfile
  },
  components: {
    MainNav,
    TimeOutModal,
    TimeOutWarningModal
  },
  methods: {
    handleLogout,
    handleProfile,
    isLoggedIn,
    onResize
  },
  watch: {
    //fixes when you're on another employee's page and want to access your profile
    $route(to, from) {
      if (to.params.id && from.params.id) {
        this.$router.go(this.$router.currentPath);
      }
    }
  },

  beforeDestroy,
  mounted,
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
