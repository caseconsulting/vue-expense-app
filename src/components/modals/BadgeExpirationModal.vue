<template>
  <v-row justify="center">
    <v-dialog v-model="badgeExpiring" persistent max-width="350">
      <v-card>
        <v-card-title class="headline"> Clearance Badge Expiration </v-card-title>
        <v-card-text class="text--red">
          <ul>
            <li v-for="time in timesUntilExp" :key="time">You have a badge expiring in {{ time }} days</li>
          </ul>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="gray darken-1" text @click="badgeExpiring = false"> OK </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import moment from 'moment-timezone';
moment.tz.setDefault('America/New_York');

/**
 * Checks to see if the user has any badges expiring.
 */
function checkWarnings() {
  if (this.employee.clearances) {
    this.employee.clearances.forEach((clearance) => {
      // determines if a user has a badge/badges expiring in either 30, 15, or 5 days
      if (clearance.badgeExpirationDate) {
        let daysUntilExpiration = moment(clearance.badgeExpirationDate).diff(moment(), 'days');
        if (daysUntilExpiration === 30 || daysUntilExpiration === 15 || daysUntilExpiration === 5) {
          this.badgeExpiring = true;
          this.timesUntilExp.push(daysUntilExpiration);
        }
      }
    });
  }
}

/**
 * Checks if there are any expiring badges and sorts by days until expiration.
 */
async function created() {
  this.checkWarnings();
  this.timesUntilExp.sort((a, b) => a - b);
}

export default {
  created,
  data() {
    return {
      badgeExpiring: false,
      timesUntilExp: []
    };
  },
  methods: {
    checkWarnings
  },
  props: ['employee']
};
</script>

<style scoped>
li {
  color: red;
}
</style>
