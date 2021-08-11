<template>
  <v-col class="pb-0" cols="12" v-if="badgeExpiring">
    <v-alert v-if="alert" :type="alert.status" color="#f27311" dense id="alert" justify="center">
      {{ alert.message }}
      <v-btn
        class="right-shift black--text"
        elevation="0"
        color="#f5f5f5"
        @click="handleProfile()"
        :disabled="onUserProfile"
        small
        >Go To Profile</v-btn
      >
    </v-alert>
  </v-col>
</template>

<script>
import api from '@/shared/api.js';
import moment from 'moment-timezone';
moment.tz.setDefault('America/New_York');

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Checks to see if the user has any badges expiring.
 */
function checkWarnings() {
  if (this.employee.clearances) {
    this.employee.clearances.forEach((clearance) => {
      // determines if a user has a badge/badges expiring within 30 days
      if (clearance.badgeExpirationDate) {
        let daysUntilExpiration = moment(clearance.badgeExpirationDate).diff(moment(), 'days');
        let momentDate = moment(clearance.badgeExpirationDate).format('MMM Do, YYYY');
        if (daysUntilExpiration <= 30 && daysUntilExpiration > 0) {
          return this.createAlert(`Badge expiring on ${momentDate} for clearance: ${clearance.type}`);
        } else if (daysUntilExpiration <= 0) {
          return this.createAlert(`Badge expired on ${momentDate} for clearance: ${clearance.type}`);
        }
      }
    });
  }
} // checkWarnings

/**
 * Takes users to their profile page
 */
function handleProfile() {
  this.$router.push({ name: 'employee', params: { id: `${this.employee.employeeNumber}` } });
} // handleProfile

/**
 * Sets the alert status and message
 *
 * @param msg - message to display
 */
function createAlert(msg) {
  this.badgeExpiring = true;
  this.alert = { status: 'error', message: msg, color: 'red' };
} // createAlert

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Checks if the current profile someone is on is the user's profile
 */
function onUserProfile() {
  return this.$route.params.id == this.employee.employeeNumber;
} // onUserProfile

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Checks if there are any expiring badges and sorts by days until expiration.
 */
async function created() {
  this.employee = await api.getUser();
  this.checkWarnings();
} // created

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  data() {
    return {
      badgeExpiring: false,
      alert: {},
      employee: null
    };
  },
  computed: {
    onUserProfile
  },
  methods: {
    checkWarnings,
    createAlert,
    handleProfile
  }
};
</script>

<style scoped>
.right-shift {
  float: right;
}
</style>
