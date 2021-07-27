<template>
  <v-col cols="12" v-if="badgeExpiring">
    <v-alert v-if="alert" :type="alert.status" :color="alert.color" dense id="alert" justify="center">
      {{ alert.message }}
      <v-btn class="right-shift" color="#F44336" @click="handleProfile()" :disabled="onUserProfile" small
        >Go To Profile</v-btn
      >
    </v-alert>
  </v-col>
</template>

<script>
import api from '@/shared/api.js';
import moment from 'moment-timezone';
moment.tz.setDefault('America/New_York');

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
          this.badgeExpiring = true;
          let msg = `Badge expiring on ${momentDate} for clearance: ${clearance.type}`;
          this.alert = { status: 'error', message: msg, color: 'red' };
        } else if (daysUntilExpiration <= 0) {
          this.badgeExpiring = true;
          let msg = `Badge expired on ${momentDate} for clearance: ${clearance.type}`;
          this.alert = { status: 'error', message: msg, color: 'red' };
        }
      }
    });
  }
}

function handleProfile() {
  this.$router.push(`employee/${this.employee.employeeNumber}`);
}

function onUserProfile() {
  return this.$route.params.id == this.employee.employeeNumber;
}

/**
 * Checks if there are any expiring badges and sorts by days until expiration.
 */
async function created() {
  this.employee = await api.getUser();
  this.checkWarnings();
}

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
    handleProfile
  }
};
</script>

<style scoped>
.right-shift {
  float: right;
}
</style>
