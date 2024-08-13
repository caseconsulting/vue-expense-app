<template>
  <div v-if="alerts" class="justify-center">
    <v-col v-for="alert in alerts" :key="alert.id" id="alert.id" class="mb-4 py-0" cols="12">
      <v-alert
        :type="alert.status"
        :color="alert.color"
        :id="alert.id"
        :closable="alert.closeable"
        class="my-0"
        density="compact"
      >
        <p class="ma-0" style="display: inline-block">{{ alert.message }}</p>
        <div :class="getButtonStyling()">
          <v-btn
            :disabled="onPage(alert.handler.page)"
            @click="handleClick(alert.handler.page, alert.handler.extras)"
            class="justify-center text-black notif-action-btn"
            elevation="0"
            color="#f5f5f5"
            size="small"
          >
            Go To {{ alert.handler.name }}
          </v-btn>
          <v-btn
            @click="handleMarkSeen(alert.type, alert.item, alert.id)"
            v-if="!!alert.seenButton"
            class="right-shift text-black notif-action-btn"
            elevation="0"
            color="#f5f5f5"
            size="small"
          >
            Mark seen
          </v-btn>
        </div>
      </v-alert>
    </v-col>
  </div>
</template>

<script setup>
import api from '@/shared/api.js';
import { add, format, getTodaysDate, isBefore } from '@/shared/dateUtils';
import { updateStoreExpenseTypes } from '@/utils/storeUtils';
import { asyncForEach, isMobile, isSmallScreen, userRoleIsIntern } from '@/utils/utils.js';
import _filter from 'lodash/filter';
import _map from 'lodash/map';
import _forEach from 'lodash/forEach';
import _find from 'lodash/find';
import { onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const store = useStore();
const route = useRoute();
const router = useRouter();

const alerts = ref([]);
const user = ref(null);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

// Checks if there are any expiring cert and sorts by days until expiration.
onBeforeMount(async () => {
  user.value = store.getters.user;
  checkBadges();
  checkCertifications();
  await checkReimbursements();
  //interns don't have access to pto
  if (!userRoleIsIntern()) {
    await checkPtoCashOuts();
  }
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Checks if the user is already on the given page.
 *
 * @param page String - The page of the button
 * @return boolean - checks to see if the current banner is on the page
 */
function onPage(page) {
  return page === route.name;
} // onPage

/**
 * Checks if a badge for a clearance is expiring within a time period.
 */
function checkBadges() {
  if (user.value.clearances != null) {
    user.value.clearances.forEach((clearance) => {
      // determines if a user has a badge expiring within 30 days
      if (clearance.badgeExpirationDate) {
        const needToShow = isBefore(clearance.badgeExpirationDate, add(getTodaysDate(), 31, 'days'));
        if (needToShow) {
          const expire = isBefore(clearance.badgeExpirationDate, getTodaysDate()) ? 'expired' : 'is expiring';
          let formattedDate = format(clearance.badgeExpirationDate, null, 'MMMM Do, YYYY');
          alerts.value.push({
            handler: {
              name: 'Profile',
              page: `employee`,
              extras: { id: `${user.value.employeeNumber}` }
            },
            closeable: false,
            status: 'error',
            color: '#f27311',
            message: `Badge ${expire} on ${formattedDate} for clearance: ${clearance.type}`,
            id: randId(),
            item: clearance
          });
        }
      }
    });
  }
} // checkBadges

/**
 * Checks if a certification is expiring within a time period.
 */
function checkCertifications() {
  if (user.value.certifications != null) {
    user.value.certifications.forEach((cert) => {
      // determines if a user has a cert expiring within 30 days
      const needToShow =
        (cert.expirationWasSeen == undefined || !cert.expirationWasSeen) &&
        cert.expirationDate &&
        isBefore(cert.expirationDate, add(getTodaysDate(), 31, 'days'));
      if (needToShow) {
        const expire = isBefore(cert.expirationDate, getTodaysDate()) ? 'expired' : 'is expiring';
        let formattedDate = format(cert.expirationDate, null, 'MMMM Do, YYYY');
        alerts.value.push({
          handler: {
            name: 'Profile',
            page: `employee`,
            extras: { id: `${user.value.employeeNumber}` }
          },
          closeable: false,
          status: 'error',
          color: '#2a49a8',
          message: `Certification ${expire} on ${formattedDate} for certification: ${cert.name}`,
          // below only needed for mark seen button
          seenButton: true,
          type: 'certification',
          id: randId(),
          item: cert
        });
      }
    });
  }
} // checkExpirations

/**
 * Checks for any recently reimbursed expenses for a user.
 */
async function checkReimbursements() {
  // api to get all expenses for user, filtering out inactive expense types
  let expenses;
  [expenses] = await Promise.all([
    api.getAllEmployeeExpenses(user.value.id),
    !store.getters.expenseTypes ? updateStoreExpenseTypes() : ''
  ]);

  let activeExpenseTypes = _filter(store.getters.expenseTypes, (t) => {
    return !t.isInactive;
  });
  let expenseTypes = _map(activeExpenseTypes, 'id');
  expenses = _filter(expenses, (e) => {
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
        // if expense doesnt have reciept and expense type requires a reciept then set reciept to a dummy reciept
        let expenseType = _filter(activeExpenseTypes, (t) => {
          return t.id == expense.expenseTypeId;
        })[0];
        if (!expense.receipt && expenseType.requiredFlag) {
          expense.receipt = 'doNotOpenNonExistant.png';
        }

        // update the expense
        promises.push(api.updateItem(api.EXPENSES, expense));
      }
    });
  }

  // push to the banner array
  if (reimbusementsCount != 0) {
    const s = reimbusementsCount != 1 ? 's' : '';
    alerts.value.push({
      handler: {
        name: 'Expenses',
        page: 'expenses',
        extras: {}
      },
      closeable: true,
      status: 'info',
      color: 'teal',
      message: `You have ${reimbusementsCount} new reimbursed expense${s}`,
      id: randId()
    });

    // resolve promises to mark read
    await Promise.all(promises);
  }
} // checkReimbursements

/**
 * Checks if a PTO Cash Out was approved.
 */
async function checkPtoCashOuts() {
  let cashOuts = await api.getEmployeePtoCashOuts(user.value.id);
  let unseenApprovedCashOuts = _filter(cashOuts, (c) => c.approvedDate && !c.approvalWasSeen);

  if (unseenApprovedCashOuts && unseenApprovedCashOuts.length > 0) {
    let promises = [];
    let cashOutAmount = 0;
    _forEach(unseenApprovedCashOuts, async (cashOut) => {
      // determines if a user has an unseen cash out approval
      if (!cashOut.approvalWasSeen && cashOut.approvedDate) {
        cashOutAmount += cashOut.amount;
        cashOut.approvalWasSeen = true;

        // update the cash out item
        promises.push(api.updateItem(api.PTO_CASH_OUTS, cashOut));
      }
    });
    alerts.value.push({
      handler: {
        name: 'PTO Cash Outs',
        page: 'ptoCashOuts',
        extras: {}
      },
      closeable: true,
      status: 'info',
      color: 'cyan',
      message: `Your PTO cash out request of ${cashOutAmount} ${cashOutAmount == 1 ? 'hour' : 'hours'} was approved`,
      id: randId()
    });
    // resolve promises to mark read
    await Promise.all(promises);
  }
} // checkPtoCashOuts

/**
 * Determines what styles to put on the buttons.
 */
function getButtonStyling() {
  if (isMobile() && isSmallScreen()) {
    return 'notif-btn-mobile';
  } else {
    return 'notif-btn-normal';
  }
} // getButtonStyling

/**
 * Redirect to the given page. There might be a more elegant way to
 * accomplish this but I've been on this story for too long so.
 */
function handleClick(pageName, extras = {}) {
  router.push({ name: pageName, params: extras });
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
      cert = _find(user.value.certifications, (c) => {
        return c === item;
      });
      cert.expirationWasSeen = true;
      await api.updateItem(api.EMPLOYEES, user.value);
      break;
    default:
      break;
  }
} // handleMarkSeen

/**
 * Helper function to return a random id, odds are astronomically
 * low that one will be duplicated.
 * @return - random 8 character hex string
 */
function randId() {
  return Math.floor(Math.random() * 0xffffffff).toString(16);
} // randId
</script>

<style scoped>
.right-shift {
  float: right;
}
.notif-btn-mobile {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
.notif-btn-normal {
  float: right;
}
.notif-action-btn:not(:first-of-type) {
  margin-left: 1em;
}
</style>
