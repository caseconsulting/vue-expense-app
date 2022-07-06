<template>
  <div v-if="alerts" class="py-2 px-10 justify-center">
    <v-col v-for="alert in alerts" :key="alert.id" id="alert.id" class="mb-4 py-0" cols="12">
      <v-alert
        :type="alert.status"
        :color="alert.color"
        :id="alert.id"
        :dismissible="alert.closeable"
        class="my-0"
        dense
      >
        {{ alert.message }}
        <v-btn
          :disabled="onPage(alert.handler.page)"
          @click="handleClick(alert.handler.page, alert.handler.extras)"
          class="right-shift black--text"
          elevation="0"
          color="#f5f5f5"
          small
        >
          Go To {{ alert.handler.name }}
        </v-btn>
        <v-btn
          @click="handleMarkSeen(alert.type, alert.item, alert.id)"
          v-if="!!alert.seenButton"
          class="right-shift black--text mr-2"
          elevation="0"
          color="#f5f5f5"
          small
        >
          Mark seen
        </v-btn>
      </v-alert>
    </v-col>
  </div>
</template>

<script>
import moment from 'moment-timezone';
import api from '@/shared/api.js';
import _ from 'lodash';
import { asyncForEach } from '@/utils/utils.js';
moment.tz.setDefault('America/New_York');

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function checkBadges() {
  if (this.user.clearances != null) {
    this.user.clearances.forEach((clearance) => {
      // determines if a user has a badge expiring within 30 days
      if (clearance.badgeExpirationDate) {
        const needToShow = moment(clearance.badgeExpirationDate).isBefore(moment().add(31, 'days'));
        if (needToShow) {
          const expire = moment(clearance.badgeExpirationDate).isBefore(moment()) ? 'expired' : 'is expiring';
          let momentDate = moment(clearance.badgeExpirationDate).format('MMMM Do, YYYY');
          this.alerts.push({
            handler: {
              name: 'Profile',
              page: `employee`,
              extras: { id: `${this.user.employeeNumber}` }
            },
            closeable: false,
            status: 'error',
            color: '#f27311',
            message: `Badge ${expire} on ${momentDate} for clearance: ${clearance.type}`,
            id: this.randId(),
            item: clearance
          });
        }
      }
    });
  }
} // checkBadges

function checkCertifications() {
  if (this.user.certifications != null) {
    this.user.certifications.forEach((cert) => {
      // determines if a user has a cert expiring within 30 days
      const needToShow =
        (cert.expirationWasSeen == undefined || !cert.expirationWasSeen) &&
        cert.expirationDate &&
        moment(cert.expirationDate).isBefore(moment().add(31, 'days'));
      if (needToShow) {
        const expire = moment(cert.expirationDate).isBefore(moment()) ? 'expired' : 'is expiring';
        let momentDate = moment(cert.expirationDate).format('MMMM Do, YYYY');
        this.alerts.push({
          handler: {
            name: 'Profile',
            page: `employee`,
            extras: { id: `${this.user.employeeNumber}` }
          },
          closeable: false,
          status: 'error',
          color: '#2a49a8',
          message: `Certification ${expire} on ${momentDate} for certification: ${cert.name}`,
          // below only needed for mark seen button
          seenButton: true,
          type: 'certification',
          id: this.randId(),
          item: cert
        });
      }
    });
  }
} // checkExpirations

async function checkReimbursements() {
  // api to get all expenses for user, filtering out inactive expense types
  let expenses = await api.getAllEmployeeExpenses(this.user.id);
  let expenseTypes = _.filter(this.$store.getters.expenseTypes, (t) => {
    return !t.isInactive;
  });
  expenseTypes = _.map(expenseTypes, 'id');
  expenses = _.filter(expenses, (e) => {
    return expenseTypes.includes(e.expenseTypeId);
  });
  let reimbusementsCount = 0;
  let promises = [];

  // check all expenses to decide if we should include them in the banner, adding them
  // to the "mark read" list for later
  if (expenses != null) {
    await asyncForEach(expenses, async (expense) => {
      // determines if a user has an unseen reimbursement
      if ((expense.reimbursementWasSeen == undefined || !expense.reimbursementWasSeen) && expense.reimbursedDate) {
        reimbusementsCount++;
        expense.reimbursementWasSeen = true;
        promises.push(api.updateItem(api.EXPENSES, expense));
      }
    });
  }

  // push to the banner array
  if (reimbusementsCount != 0) {
    const s = reimbusementsCount != 1 ? 's' : '';
    this.alerts.push({
      handler: {
        name: 'Expenses',
        page: 'expenses',
        extras: {}
      },
      closeable: true,
      status: 'info',
      color: 'teal',
      message: `You have ${reimbusementsCount} new reimbursed expense${s}`,
      id: this.randId()
    });

    // resolve promises to mark read
    await Promise.all(promises);
  }
} // checkReimbursements

/**
 * Redirect to the given page. There might be a more elegant way to
 * accomplish this but I've been on this story for too long so
 */
function handleClick(pageName, extras = {}) {
  this.$router.push({ name: pageName, params: extras });
} // handleClick

/**
 * Marks item as seen in whatever way is necessary. So far there
 * is only one type (certifications) that uses this.
 * @param type - the type of item, ie certification
 * @param item - the actual object that caused the notif
 * @param id - the DOM id to use for CSS selction
 */
async function handleMarkSeen(type, item, id) {
  // update UI first
  document.getElementById(id).style.display = 'none';
  // update in api
  let cert;
  switch (type) {
    case 'certification':
      cert = _.find(this.user.certifications, (c) => {
        return c === item;
      });
      cert.expirationWasSeen = true;
      await api.updateItem(api.EMPLOYEES, this.user);
      break;
    default:
      break;
  }
} // handleMarkSeen

/**
 * Helper function to return a random id, odds are astronomically
 * low that one will be duplicated
 * @return - random 8 character hex string
 */
function randId() {
  return Math.floor(Math.random() * 0xffffffff).toString(16);
} // randId

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
function onPage(pageName) {
  return this.$route.params.name == pageName;
} // onPage

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
  this.checkBadges();
  this.checkCertifications();
  await this.checkReimbursements();
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
      user: null
    };
  },
  methods: {
    asyncForEach,
    checkBadges,
    checkCertifications,
    checkReimbursements,
    handleClick,
    handleMarkSeen,
    randId,
    onPage
  }
};
</script>

<style scoped>
.right-shift {
  float: right;
}
</style>
