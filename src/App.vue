<template>
  <div id="app" @mousedown="refreshSession()">
    <v-app>
      <status-snackbar></status-snackbar>
      <v-icon color="purple-lighten-5" id="jellyfish">mdi-jellyfish</v-icon>
      <v-navigation-drawer
        v-if="isLoggedIn()"
        v-model="drawer"
        :rail="!isMobile()"
        @update:rail="mainNavReloadKey++"
        order="1"
        :expand-on-hover="!isMobile()"
        :permanent="isLoggedIn() && !isMobile()"
        :key="logoutReloadKey"
      >
        <main-nav :key="mainNavReloadKey"></main-nav>
      </v-navigation-drawer>
      <v-app-bar class="nav-color" theme="dark">
        <v-app-bar-nav-icon v-show="isLoggedIn() && isMobile()" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <div class="d-flex align-center pointer ml-4" @click="goToHome()">
          <v-avatar size="40" color="grey-lighten-4" class="mr-2">
            <img src="@/assets/img/logo-big.png" class="logo-bar" />
          </v-avatar>
          <div v-if="!isMobile()" class="app-title">
            <h1>CASE Portal</h1>
          </div>
          <!-- In Mobile View decrease title size-->
          <h1 v-show="isMobile()" class="font-25">CASE Portal</h1>
        </div>
        <v-spacer></v-spacer>
        <!-- Display social media icons and links dropdown menu -->
        <v-item-group class="hidden-sm-and-down" v-show="isLoggedIn() && !isMobile()">
          <v-menu open-on-hover open-delay="0" theme="light">
            <template v-slot:activator="{ props }">
              <v-btn id="links-btn" size="small" class="my-2" v-bind="props">Links &#9662; </v-btn>
            </template>
            <v-list>
              <!-- Misc links -->
              <v-list-item
                v-for="({ name, link }, i) in links"
                @click="badumbadumdodooodoo(i)"
                :title="name"
                :key="i"
                :id="link"
                :href="link"
                target="_blank"
              ></v-list-item>
              <!-- Benefits links -->
              <v-list-group value="Benefits">
                <template v-slot:activator="{ props }">
                  <v-list-item v-bind="props" @click.stop.prevent title="Benefits"></v-list-item>
                </template>
                <v-list-item
                  v-for="({ name, link }, i) in benefitsLinks"
                  @click="badumbadumdodooodoo(i)"
                  :title="name"
                  :key="i"
                  :id="link"
                  :href="link"
                  target="_blank"
                ></v-list-item>
              </v-list-group>
            </v-list>
          </v-menu>
          <v-btn
            class="mx-auto text-white"
            v-for="link in mediaLinks"
            :key="link.name"
            :id="link.name"
            :href="link.link"
            icon
            target="_blank"
          >
            <v-avatar rounded="0" :size="link.size || 21">
              <v-img class="whiteImage" :src="link.img" :alt="`${link.name} icon`"></v-img>
            </v-avatar>
          </v-btn>
        </v-item-group>

        <!-- User image and logout -->
        <v-menu location="bottom" theme="light" open-on-click v-if="isLoggedIn() && store.getters.user">
          <template v-slot:activator="{ props }">
            <user-avatar class="pointer mx-3" v-bind="props" :employee="store.getters.user" :image="profilePic" />
          </template>
          <v-list v-if="!(isMobile() || isSmallScreen())">
            <v-list-item>
              <v-btn :disabled="onUserProfile()" variant="text" @click="handleProfile()">Profile</v-btn>
            </v-list-item>
            <v-list-item>
              <v-btn id="logoutBtn" variant="text" @click="handleLogout()">Logout</v-btn>
            </v-list-item>
            <v-list-item v-if="environment != 'https://app.consultwithcase.com'">
              <v-btn variant="text" id="switchRoleBtn" @click="switchRole = true">Switch Role</v-btn>
            </v-list-item>
          </v-list>
          <!--In MOBILE VIEW/Smaller Screen sizes display all links under the user image dropdown-->
          <v-list v-else class="scrollLink mx-1">
            <v-list-item>
              <v-btn variant="text" :disabled="onUserProfile()" @click="handleProfile()">Profile</v-btn>
            </v-list-item>
            <v-list-item>
              <v-btn variant="text" @click="handleLogout()">Logout</v-btn>
            </v-list-item>
            <v-list-item v-if="environment != 'https://app.consultwithcase.com'">
              <v-btn variant="text" id="switchRoleBtn" @click="switchRole = true">Switch Role</v-btn>
            </v-list-item>
            <hr role="separator" aria-orientation="horizontal" class="v-divider theme--light" :inset="inset" vertical />
            <div class="v-subheader theme--light case-red-text mt-2 ml-4">Company Links</div>
            <v-list-item v-for="(l, index) in links" :key="index" :href="l.link" target="_blank">
              <v-list-item-title>{{ l.name }}</v-list-item-title>
            </v-list-item>
            <v-list-item :href="floorPlan" target="_blank" id="floorPlan">MakeOffices Map</v-list-item>
            <hr role="separator" aria-orientation="horizontal" class="v-divider theme--light" :inset="inset" vertical />
            <div class="v-subheader theme--light case-red-text mt-2 ml-4">Social</div>
            <v-list-item v-for="link in mediaLinks" :key="link.name" :href="link.link" icon target="_blank">
              <v-list-item-title> {{ link.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <!-- End user image and logout -->
      </v-app-bar>
      <v-main :style="{ padding: getMainPadding() }" class="app-bg-color">
        <v-container fluid grid-list-lg class="px-2 px-md-4">
          <notification-banners v-if="isLoggedIn() && storeIsPopulated() && !isTimedOut()" />
          <router-view></router-view>
        </v-container>
      </v-main>
      <v-footer v-if="isLoggedIn()" class="app-bg-color">
        <v-col class="text-right text-caption" cols="12">
          <a
            id="P"
            class="text-black"
            target="_blank"
            href="https://3.basecamp.com/3097063/buckets/4708396/documents/7593856742"
          >
            <v-tooltip activator="parent" location="top">View Release Notes</v-tooltip>
            <strong>Version</strong> {{ version }}
          </a>
        </v-col>
      </v-footer>
      <switch-role-modal
        v-if="environment != 'https://app.consultwithcase.com'"
        :toggleSwitchRole="switchRole"
      ></switch-role-modal>
      <time-out-warning-modal :toggleWarning="session"></time-out-warning-modal>
    </v-app>
  </div>
</template>

<script setup>
import {
  isLoggedIn,
  isTimedOut,
  logout,
  getProfile,
  getTokenExpirationDate,
  getAccessToken,
  refreshUserSession
} from '@/utils/auth';
import { isMobile, isSmallScreen, storeIsPopulated, updateEmployeeLogin } from '@/utils/utils';
import { updateStoreUser, updateStoreEmployees } from '@/utils/storeUtils';
import p from '../package.json';
import floorPlan from '@/assets/img/MakeOfficesfloorplan.jpg';
import facebook from '@/assets/img/trademarks/facebook.png';
import github from '@/assets/img/trademarks/github.png';
import linkedin from '@/assets/img/trademarks/linkedin.png';
import x from '@/assets/img/trademarks/x.png';
import youtube from '@/assets/img/trademarks/youtube.png';
import MainNav from '@/components/utils/MainNav.vue';
import NotificationBanners from '@/components/utils/NotificationBanners.vue';
import SwitchRoleModal from '@/components/modals/SwitchRoleModal.vue';
import TimeOutWarningModal from '@/components/modals/TimeOutWarningModal.vue';
import StatusSnackbar from '@/components/shared/StatusSnackbar.vue';
import { onBeforeMount, onBeforeUnmount, ref, inject, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');
// const props = defineProps({ source: String });
const route = useRoute();
const router = useRouter();
const store = useStore();

const loadingCreated = ref(false);
const environment = ref('');
const switchRole = ref(false);
const drawer = ref(isLoggedIn());
const inset = ref(false);
const profilePic = ref('src/assets/img/logo-big.png');
const session = ref(false);
const sessionTimeout = ref(null);
const sessionTimeoutWarning = ref(null);
const userId = ref(null);
const badgeKey = ref(0);
const links = ref([
  { name: 'CASE Website', link: 'https://www.consultwithcase.com/' },
  { name: 'Submit New Referral', link: 'https://www.consultwithcase.com/apply-form' },
  { name: 'CASE Information', link: 'https://3.basecamp.com/3097063/buckets/4708396/messages/650777910' },
  { name: 'Basecamp', link: 'https://3.basecamp.com/3097063' },
  { name: 'QuickBooks Time', link: 'https://tsheets.intuit.com/page/login_oii' },
  { name: 'ADP', link: 'https://workforcenow.adp.com/' },
  { name: 'BambooHR', link: 'https://consultwithcase.bamboohr.com/home/' },
  { name: 'Jira', link: 'https://consultwithcase.atlassian.net/jira/your-work' },
  {
    name: 'Portal & Basecamp How-Tos',
    link: 'https://3.basecamp.com/3097063/buckets/34631168/message_boards/6620373851'
  },
  { name: 'Workspace at Reston Town Center Map', link: floorPlan }
]);
const benefitsLinks = [
  { name: 'Net Benefits/Fidelity', link: 'https://nb.fidelity.com/public/nb/default/home' },
  { name: 'Benefits Booklet', link: 'https://3.basecamp.com/3097063/buckets/4708396/uploads/6746972426' },
  { name: 'Medical (Health) Insurance', link: 'https://www.anthem.com/' },
  { name: 'Disability & Life Insurance', link: 'https://www.mutualofomaha.com/' },
  { name: 'Dental & Vision Insurance', link: 'https://www.sunlife.com/' },
  { name: 'Dependent Care', link: 'https://www.wageworks.com/' }
];
const mediaLinks = [
  { name: 'Github', link: 'https://github.com/caseconsulting', img: github },
  { name: 'LinkedIn', link: 'https://linkedin.com/company/case-consulting-inc', img: linkedin },
  { name: 'Youtube', link: 'https://www.youtube.com/channel/UC_oJY4OrOpLNrIBAN7Y-9fA', img: youtube, size: 23 },
  { name: 'X', link: 'https://x.com/consultwithcase?lang=en', img: x, size: 17 },
  { name: 'Facebook', link: 'https://www.facebook.com/ConsultwithCase/', img: facebook }
];

// these values are updated to force-reload the components they belong to
const mainNavReloadKey = ref(0);
const logoutReloadKey = ref(0);

const version = ref(null);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * created lifecycle hook - set up listeners and getting access token and handle things for login
 */
onBeforeMount(async () => {
  loadingCreated.value = true;

  environment.value = import.meta.env.VITE_AUTH0_CALLBACK;

  emitter.on('timeout-acknowledged', () => {
    handleLogout();
  }); // Session end - log out

  emitter.on('close', () => (switchRole.value = false));
  emitter.on('badgeExp', () => {
    badgeKey.value++;
  }); // used to refresh badge expiration banner

  emitter.on('user-session-refreshed', () => {
    clearTimeout(sessionTimeout.value);
    clearTimeout(sessionTimeoutWarning.value);
    session.value = false;
    setSessionTimeouts();
  });

  // set expiration date if access token received
  let accessToken = getAccessToken();
  if (accessToken && isLoggedIn()) {
    setSessionTimeouts();

    await populateStore();

    //stores the employee number
    userId.value = store.getters.employeeNumber;

    store.getters.loginTime ? updateEmployeeLogin(store.getters.user) : '';
    // run API calls in background
    Promise.all([updateStoreEmployees()]);
  }

  let pic = getProfile();

  if (pic) {
    profilePic.value = pic;
  }

  version.value = p.version;

  loadingCreated.value = false;
}); // created

/**
 * beforeUnmount lifecycle hook - close event listener
 */
onBeforeUnmount(() => {
  emitter.off('close');
  emitter.off('relog');
  emitter.off('badgeExp');
  emitter.off('user-session-refreshed');
}); //beforeUnmount

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
  let oldLink = links.value[index].link;
  let roll = Math.ceil(
    Math.random() *
      Math.ceil((Math.sin(Math.PI * 2) * (50 * 4)) / (1 << 1) - 100 + ((2 << 5) + 1) * 3 + 4 + Math.log(Math.E))
  );
  if (roll === 69 || roll == 42.0) {
    links.value[index].link = `https://ww
    w.yo
    utu
    be
    .co
    m/w
    atch?v=dQ
    w4w9Wg
    XcQ`.replace(/\s/g, '');
    setTimeout(() => {
      links.value[index].link = oldLink;
    }, 2000);
  }
} // badumbadumdodooodoo

/**
 * Determines if the screens padding based off if the user is mobile.
 *
 * @returns String - The padding value
 */
function getMainPadding() {
  if (!isLoggedIn()) {
    return '64px 0px 0px 0px';
  } else if (!isMobile() && isLoggedIn()) {
    return '64px 0px 0px 56px';
  } else {
    return '56px 0px 0px 0px';
  }
} // getMainPadding

/*
 * Logout of expense app
 */
function handleLogout() {
  logoutReloadKey.value++;
  logout();
} // handleLogout

/**
 * redirects to user's employee page
 */
function handleProfile() {
  // We don't use userId.value becuase it may be null by the time we click the button
  router.push({ name: 'employee', params: { id: `${userId.value}`, replace: true } });
  emitter.emit('profile-clicked');
} // handleProfile

/**
 * Checks if the user is visiting their own profile or not
 *
 * @return boolean - if the user is visiting their profile
 */
function onUserProfile() {
  let routeId = window.location.pathname?.split('/')?.pop();
  if (userId.value == null) {
    return false;
  }
  return routeId === userId.value.toString();
} // onUserProfile

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
    store.dispatch('setUser', { user: employee }); // dispatch data to the vuex store
    store.dispatch('setLoginTime', { loginTime: lastLogin });
    //await updateEmployee(employee);
  } else {
    await updateStoreUser();
    employee = store.getters.user;
  }
  localStorage.removeItem('user');
  localStorage.removeItem('lastLogin'); // remove from local storage to prevent login audit on refresh

  // This is used to help pages know when data is loaded into the store.
  // Otherwise, on reload, pages would try to access the store before it was populated.
  store.dispatch('setStoreIsPopulated', { populated: true });
} // populateStore

/**
 * Scrolls up to the home page
 */
function goToHome() {
  if (isLoggedIn()) {
    router.push({ path: '/home' });
    window.scrollTo(0, 0);
  }
} // goToHome

/**
 * Refreshes a user session if they are still actively using the application
 * and the refresh token is expiring soon.
 */
function refreshSession() {
  let accessToken = getAccessToken();
  if (accessToken && isLoggedIn()) {
    let expTime = getTokenExpirationDate(accessToken).getTime();
    let now = Date.now();
    let sessionRemainder = expTime - now;
    let unixHour = 60 * 60 * 1000; // 60 min in unix time difference
    if (sessionRemainder - unixHour <= 0) {
      // session ending in < 60 min while user is still active, refresh access token
      refreshUserSession();
    }
  }
} // refreshSession

/**
 * Sets the session timeout and the session timeout warning
 */
function setSessionTimeouts() {
  const accessToken = getAccessToken();
  const expTime = getTokenExpirationDate(accessToken).getTime();
  const now = Date.now();
  const sessionRemainder = expTime - now;

  // set session timeout
  sessionTimeout.value = window.setTimeout(() => {
    sessionStorage.setItem('timedOut', true);
    session.value = false;

    // logout and redirect to login page
    handleLogout();
    if (route.name !== 'login') {
      router.push({
        name: 'login',
        query: { redirect: route.fullPath }
      });
    }
  }, sessionRemainder);

  // set session warning timeout, time minus 300000 = - 5 min
  if (sessionRemainder > 300000) {
    sessionTimeoutWarning.value = window.setTimeout(() => {
      session.value = true;
    }, sessionRemainder - 300000);
  }
} // setSessionTimeouts

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
watch(
  () => route,
  (to, from) => {
    if (to.params.id && from.params.id) {
      router.go(router.currentPath);
    }
    //updates badge expiration warning whenever you leave your user profile
    if (from.params.id) {
      badgeKey.value++;
    }
  }
); // $route

watch(
  () => sessionStorage.getItem('isTimedOut'),
  () => {
    if (isTimedOut()) handleLogout();
  }
); // watch sessionStorage.isTimedOut
</script>

<style lang="scss">
@import '../node_modules/vuetify/dist/vuetify.min.css';
@import 'src/assets/styles/styles';

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #3f3f3c;
}

.app-bg-color {
  background-color: #f7f7f7 !important;
}

.logo-bar {
  width: 40px;
}

.scrollLink {
  width: 250px;
  max-height: 400px;
  overflow-y: scroll;
}

.scroll::-webkit-scrollbar {
  width: 0 px;
  background: transparent;
}

#P {
  text-decoration: none;
}

.whiteImage {
  -webkit-filter: brightness(0) invert(1);
  filter: brightness(0) invert(1);
}

.app-title {
  font-size: 1.25rem;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

#jellyfish {
  position: fixed;
  bottom: 7px;
  left: 50%;
  z-index: -1;
}
</style>
