<template>
  <v-col class="pa-1 pb-0" cols="12">
    <v-alert v-if="show" color="teal lighten-1" class="mb-0" type="info" dense dark dismissible
      >You have <b>{{ errorCount }}</b> new reimbursed expenses.
      <v-btn class="right-shift black--text" elevation="0" color="#f5f5f5" @click="handleExpense()" small
        >Go To Expenses</v-btn
      >
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
  this.show = false;
  this.errorCount = 0;

  //if reimbursement dates are after last login... be careful that the new last login isn't the one being referenced (see App.vue populateStore)
  if (expenses != null) {
    expenses.forEach(async (expense) => {
      // determines if a user has a badge/badges expiring within 30 days
      if (expense.reimbursedDate) {
        if (expense.wasSeen !== null && !expense.wasSeen) {
          this.show = true;
          this.errorCount++;
          expense.wasSeen = true;
          expense = await api.updateItem(api.EXPENSES, expense);
        }
      }
    });
  }
} // checkWarnings

/**
 * Takes users to their expenses page
 */
function handleExpense() {
  this.$router.push({ name: 'expenses' });
} // handleExpense

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
      show: false,
      errorCount: 0,
      user: null
    };
  },
  computed: {
    onUserProfile
  },
  methods: {
    checkWarnings,
    handleExpense
  }
};
</script>

<style scoped>
.right-shift {
  float: right;
}
</style>
