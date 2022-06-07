<template>
  <v-col class="pa-1 pb-0" cols="12">
    <!-- <v-alert v-if="alert" :type="alert.status" color="#f27311" dense id="alert" justify="center" dismissible>
      {{ alert.message }}
    </v-alert> -->
    <v-alert v-if="alert" color="light-green lighten-1" class="mb-0" dense dark dismissible>
      {{ alert.message }}
    </v-alert>
  </v-col>
</template>

<script>
import moment from 'moment-timezone';
import api from '@/shared/api.js';
moment.tz.setDefault('America/New_York');

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Checks to see if the user has any expenses that have been reimbursed.
 *
 * @return alert with message if any expenses have been reimbursed
 */
async function checkWarnings() {
  // api to get all expenses for user
  let expenses = await api.getAllEmployeeExpenses(this.user.id);
  console.log(expenses);

  //if reimbursement dates are after last login... be careful that the new last login isn't the one being referenced (see App.vue populateStore)
  if (this.user.clearances != null) {
    this.user.clearances.forEach((clearance) => {
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
  this.$router.push({ name: 'employee', params: { id: `${this.user.employeeNumber}` } });
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
 * Checks if there are any expiring badges and sorts by days until expiration.
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
      alert: {},
      badgeExpiring: false,
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
