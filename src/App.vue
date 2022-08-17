<template>
  <div id="app">
    <v-app>
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
        <div class="d-flex align-center siteId" @click="goToHome">
          <v-avatar size="40" color="grey lighten-4" class="mr-2">
            <img src="@/assets/img/case-logo-circle.png" class="logo-bar" />
          </v-avatar>
          <v-toolbar-title v-show="!isMobile">
            <h1>Case Portal</h1>
          </v-toolbar-title>
          <!-- In Mobile View decrease title size-->
          <h1 v-show="isMobile" class="font-25">Case Portal</h1>
        </div>
        <v-spacer></v-spacer>
        <!-- Display social media icons and links dropdown menu -->
        <v-item-group class="hidden-sm-and-down" v-show="isLoggedIn() && !isMobile">
          <v-menu open-on-hover offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn top text small class="my-2" v-bind="attrs" v-on="on" id="links-btn">Links &#9662; </v-btn>
            </template>

            <v-list>
              <v-list-item
                v-for="(l, index) in links"
                @click="badumbadumdodooodoo(index)"
                :key="index"
                :id="l.link"
                :href="l.link"
                target="_blank"
              >
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
            <v-icon>{{ link.icon }}</v-icon>
          </v-btn>
        </v-item-group>

        <!-- User image and logout -->
        <v-menu bottom offset-y open-on-click v-if="isLoggedIn()">
          <template v-slot:activator="{ on }">
            <v-avatar id="profile" class="profile-button ml-3" size="40">
              <img :src="profilePic" alt="avatar" v-on="on" />
            </v-avatar>
          </template>
          <v-list v-if="!(isMobile || isSmallScreen)">
            <v-list-item>
              <v-btn :disabled="onUserProfile" text @click="handleProfile()">Profile</v-btn>
            </v-list-item>
            <v-list-item>
              <v-btn id="logoutBtn" text @click="handleLogout()">Logout</v-btn>
            </v-list-item>
            <v-list-item v-if="environment != 'https://app.consultwithcase.com'">
              <v-btn text id="switchRoleBtn" @click="switchRole = true">Switch Role</v-btn>
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
            <v-list-item v-if="environment != 'https://app.consultwithcase.com'">
              <v-btn text id="switchRoleBtn" @click="switchRole = true">Switch Role</v-btn>
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
              <v-icon large>{{ link.icon }}</v-icon>
              <span class="mr-2"> </span>
              <v-list-item-title> {{ link.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <!-- End user image and logout -->
      </v-app-bar>
      <v-main :style="{ padding: getMainPadding() }">
        <v-container fluid grid-list-lg>
          <notification-banners v-if="isLoggedIn() && storeIsPopulated" />
          <router-view></router-view>
        </v-container>
      </v-main>
      <v-footer padless v-if="isLoggedIn()">
        <v-col class="text-right text-caption" cols="12">
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <a
                v-on="on"
                id="P"
                class="black--text"
                target="_blank"
                href="https://3.basecamp.com/3097063/buckets/4708396/documents/5215706428"
                ><strong>Version</strong> {{ version }}</a
              >
            </template>
            <span>View Release Notes</span>
          </v-tooltip>
        </v-col>
      </v-footer>
      <switch-role-modal
        v-if="environment != 'https://app.consultwithcase.com'"
        :toggleSwitchRole="switchRole"
        @close="switchRole = false"
      ></switch-role-modal>
      <time-out-modal :toggleTimeOut="timedOut"></time-out-modal>
      <time-out-warning-modal :toggleWarning="session"></time-out-warning-modal>
    </v-app>
  </div>
</template>

<script>
import { isLoggedIn, logout, getProfile, getTokenExpirationDate, getAccessToken } from '@/utils/auth';
import { isMobile, isSmallScreen, storeIsPopulated } from '@/utils/utils';
import {
  updateStoreUser,
  updateStoreEmployees,
  updateStoreAvatars,
  updateStoreBudgets,
  updateStoreExpenseTypes
} from '@/utils/storeUtils';
import floorPlan from '@/assets/img/MakeOfficesfloorplan.jpg';
import moment from 'moment-timezone';
import MainNav from '@/components/MainNav.vue';
import NotificationBanners from './components/modals/NotificationBanners.vue';
import SwitchRoleModal from '@/components/modals/SwitchRoleModal.vue';
import TimeOutModal from '@/components/modals/TimeOutModal.vue';
import TimeOutWarningModal from '@/components/modals/TimeOutWarningModal.vue';
moment.tz.setDefault('America/New_York');

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

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
} // onUserProfile

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * idk what this does
 *
 * @param index - its a rick roll interns 2021
 */
function badumbadumdodooodoo(index) {
  let oldLink = this.links[index].link;
  let roll = Math.ceil(
    Math.random() *
      Math.ceil((Math.sin(Math.PI * 2) * (50 * 4)) / (1 << 1) - 100 + ((2 << 5) + 1) * 3 + 4 + Math.log(Math.E))
  );
  if (roll === 69 || roll == 42.0) {
    this.links[index].link = `https://ww
    w.yo
    utu
    be
    .co
    m/w
    atch?v=dQ
    w4w9Wg
    XcQ`.replace(/\s/g, '');
    setTimeout(() => {
      this.links[index].link = oldLink;
    }, 2000);
  }
} // badumbadumdodooodoo

/**
 * Determines if the screens padding based off if the user is mobile.
 *
 * @returns String - The padding value
 */
function getMainPadding() {
  if (!this.isMobile) {
    return '64px 0px 0px 56px';
  } else {
    return '56px 0px 0px 0px';
  }
}

/*
 * Logout of expense app
 */
function handleLogout() {
  logout();
} // handleLogout

/**
 * redirects to user's employee page
 */
function handleProfile() {
  // We don't use this.userId becuase it may be null by the time we click the button
  this.$router.push({ name: 'employee', params: { id: `${this.userId}`, replace: true } });
} // handleProfile

/**
 * resize the window for small screens
 */
async function populateStore() {
  // login
  let lastLogin = localStorage.getItem('lastLogin'); // item is set in Callback.vue
  let employee;
  if (lastLogin) {
    employee = JSON.parse(localStorage.getItem('user')); // gets data from Callback.vue after login
    employee.lastLogin = lastLogin;
    this.$store.dispatch('setUser', { user: employee }); // dispatch data to the vuex store
    this.$store.dispatch('setLoginTime', { loginTime: lastLogin });
    //await updateEmployee(employee);
  } else {
    await this.updateStoreUser(); // calling first since updateStoreExpenseTypes relies on user data
    employee = this.$store.getters.user;
  }
  localStorage.removeItem('user');
  localStorage.removeItem('lastLogin'); // remove from local storage to prevent login audit on refresh

  // This is used to help pages know when data is loaded into the store.
  // Otherwise, on reload, pages would try to access the store before it was populated.
  this.$store.dispatch('setStoreIsPopulated', { populated: true });
} // populateStore

/**
 * Scrolls up to the home page
 */
function goToHome() {
  this.$router.push({ path: '/' });
  this.$vuetify.goTo(0);
} // goToHome

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * created lifecycle hook - set up listeners and getting access token and handle things for login
 */
async function created() {
  this.loadingCreated = true;

  this.environment = process.env.VUE_APP_AUTH0_CALLBACK;

  window.EventBus.$on('relog', handleLogout); // Session end - log out
  window.EventBus.$on('badgeExp', () => {
    this.badgeKey++;
  }); // used to refresh badge expiration banner
  // set expiration date if access token received
  let accessToken = getAccessToken();
  if (accessToken && isLoggedIn()) {
    this.date = Math.trunc(getTokenExpirationDate(accessToken).getTime());
    this.now = Math.trunc(new Date().getTime());
    let timeRemaining = this.date - this.now; // default access key (2 hours)

    window.setTimeout(() => {
      this.timedOut = true;
      this.session = false;
    }, timeRemaining);

    // Time minus 300000 = - 5 min
    if (timeRemaining > 300000) {
      window.setTimeout(() => {
        this.session = true;
      }, timeRemaining - 300000);
    }

    await this.populateStore();

    //stores the employee number
    this.userId = this.$store.getters.employeeNumber;
  }

  let pic = getProfile();

  if (pic) {
    this.profilePic = pic;
  }

  //This has some security implications
  this.version = require('../package.json').version;

  this.loadingCreated = false;
} // created

/**
 * beforeDestroy lifecycle hook - close event listener
 */
function beforeDestroy() {
  window.EventBus.$off('relog');
  window.EventBus.$off('badgeExp');
} //beforeDestroy

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * fixes route to profile
 *
 * @param to - the place to route to
 * @param from - the place you were routed from
 */
function $route(to, from) {
  if (to.params.id && from.params.id) {
    this.$router.go(this.$router.currentPath);
  }
  //updates badge expiration warning whenever you leave your user profile
  if (from.params.id) {
    this.badgeKey++;
  }
} // $route

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  data: () => ({
    loadingCreated: false,
    environment: '',
    switchRole: false,
    floorPlan: floorPlan,
    drawer: isLoggedIn(),
    inset: false,
    profilePic: 'src/assets/img/logo-big.png',
    timedOut: false,
    session: false,
    now: Math.trunc(new Date().getTime() / 1000),
    userId: null,
    badgeKey: 0,
    date: null,
    links: [
      { name: 'Case Website', link: 'https://www.consultwithcase.com/' },
      { name: 'Case Information', link: 'https://3.basecamp.com/3097063/buckets/4708396/messages/650777910' },
      { name: 'Basecamp', link: 'https://3.basecamp.com/3097063' },
      { name: 'Net Benefits/Fidelity', link: 'https://nb.fidelity.com/public/nb/default/home' },
      { name: 'Health Insurance', link: 'https://3.basecamp.com/3097063/buckets/179119/messages/4799723388' },
      { name: 'QuickBooks Time', link: 'https://tsheets.intuit.com/page/login_oii' },
      { name: 'ADP', link: 'https://my.adp.com/' },
      { name: 'Life Insurance', link: 'https://www.reliancestandard.com/home/' },
      {
        name: 'Jira',
        link: 'https://consultwithcase.atlassian.net/jira/your-work'
      }
    ],
    mediaLinks: [
      { name: 'Github', link: 'https://github.com/caseconsulting', icon: 'mdi-github' },
      { name: 'LinkedIn', link: 'https://linkedin.com/company/case-consulting-inc', icon: 'mdi-linkedin' },
      { name: 'Youtube', link: 'https://www.youtube.com/channel/UC_oJY4OrOpLNrIBAN7Y-9fA', icon: 'mdi-youtube' },
      { name: 'Twitter', link: 'https://twitter.com/consultwithcase?lang=en', icon: 'mdi-twitter' },
      { name: 'Facebook', link: 'https://www.facebook.com/ConsultwithCase/', icon: 'mdi-facebook' }
    ],
    version: null
  }),
  props: {
    source: String
  },
  computed: {
    isMobile,
    isSmallScreen,
    onUserProfile,
    storeIsPopulated
  },
  components: {
    MainNav,
    NotificationBanners,
    TimeOutModal,
    TimeOutWarningModal,
    SwitchRoleModal
  },
  methods: {
    badumbadumdodooodoo,
    getMainPadding,
    handleLogout,
    handleProfile,
    isLoggedIn,
    populateStore,
    goToHome,
    updateStoreUser,
    updateStoreEmployees,
    updateStoreAvatars,
    updateStoreBudgets,
    updateStoreExpenseTypes
  },
  watch: {
    $route
  },
  beforeDestroy,
  created
};
</script>

<style lang="scss">
@import '../node_modules/vuetify/dist/vuetify.min.css';
@import 'src/assets/styles/styles';

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #3f3f3c;
  background: #f5f5f5;
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
  width: 0 px;
  background: transparent;
}

.profile-button {
  cursor: pointer;
  border: 1px solid $case-darkgray;
}

#P {
  text-decoration: none;
}
</style>

<style>
.siteId {
  cursor: pointer;
}
</style>
