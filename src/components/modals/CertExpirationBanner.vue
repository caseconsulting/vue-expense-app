<template>
  <div>
    <v-col v-for="alert in alerts" :key="alert.msg" class="pa-1 pb-0" cols="12">
      <v-alert v-if="alert" :type="alert.status" color="#2a49a8" dense id="alert" justify="center" class="my-1">
        {{ alert.message }}
        <v-btn
          class="right-shift black--text"
          elevation="0"
          color="#f5f5f5"
          @click="handleProfile()"
          :disabled="onUserProfile"
          small
        >
          Go To Profile
        </v-btn>
      </v-alert>
    </v-col>
  </div>
</template>

<script>
import moment from 'moment-timezone';
moment.tz.setDefault('America/New_York');

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Checks to see if the user has any certs expiring.
 *
 * @return alert with message based on if cert has expired or not
 */
function checkWarnings() {
  if (this.user.certifications != null) {
    this.user.certifications.forEach((cert) => {
      // determines if a user has a cert expiring within 30 days
      if (cert.expirationDate && moment(cert.expirationDate).isBefore(moment().add(30, 'days'))) {
        const expire = moment(cert.expirationDate).isBefore(moment()) ? 'expired' : 'is expiring';
        let momentDate = moment(cert.expirationDate).format('MMM Do, YYYY');
        this.alerts.push(this.createAlert(`Certification ${expire} on ${momentDate} for certification: ${cert.name}`));
      }
    });
  }
} // checkWarnings

/**
 * Takes users to their profile page
 */
function handleProfile() {
  this.$router.push({ name: 'employee', params: { id: `${this.user.employeeNumber}` } });
} // handleProfile

/**
 * Sets the alert status and message
 *
 * @param msg - message to display
 */
function createAlert(msg) {
  return { status: 'error', message: msg };
} // createAlert

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Checks if the current profile someone is on is the user's profile
 *
 * @return boolean - checks to see if the current banner is on user profile
 */
function onUserProfile() {
  return this.$route.params.id == this.user.employeeNumber;
} // onUserProfile

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Checks if there are any expiring cert and sorts by days until expiration.
 */
async function created() {
  this.user = this.$store.getters.user;
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
      alerts: [],
      certExpiring: false,
      user: null
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
