<template>
  <div id="t-sheets-data">
    <v-card density="compact">
      <v-card-title class="header_style py-0">
        <v-row class="ma-0 nudge-up-row on-top">
          <v-col cols="6" class="pa-0 ma-0">
            <v-autocomplete
              v-if="userRoleIsAdmin() || userRoleIsManager()"
              v-model="passedEmployee"
              class="pt-0 mt-0"
              base-color="transparent"
              bg-color="transparent"
              density="compact"
              :items="filteredEmployees"
              :customFilter="customFilter"
              hide-details
              variant="plain"
              item-title="text"
              item-value="value"
              return-object
            >
            </v-autocomplete>
          </v-col>
          <v-col cols="6" class="d-flex justify-end align-center pa-0 ma-0 mt-1">
            <div v-if="lastUpdated && passedEmployee?.id === $store.getters.user?.id" class="tiny-text">
              {{ lastUpdated }}
            </div>
          </v-col>
        </v-row>

        <div class="d-flex align-center justify-space-between nudge-up-title">
          <h3 v-if="!isMobile" class="d-inline-block">QuickBooks Time Data</h3>
          <h5 v-else class="d-inline-block">QuickBooks Time Data</h5>
          <div class="d-flex">
            <!--Switch between minutes and hours-->
            <v-tooltip :text="tooltipText" location="top">
              <template v-slot:activator="{ props }">
                <v-switch
                  v-model="showMinutes"
                  density="compact"
                  hide-details
                  color="gray"
                  class="mr-2 my-0 py-0"
                  v-bind="props"
                >
                </v-switch>
              </template>
            </v-tooltip>
            <!--End of Switch-->
            <!-- Start of Refresh Button -->
            <v-btn
              @click="
                emitter.emit('refresh-quickbooks-data');
                refreshed = true;
              "
              variant="text"
              icon="mdi-refresh"
            >
              <template v-slot:default>
                <v-tooltip activator="parent" location="top">Refresh Quickbooks Time Data</v-tooltip>
                <v-icon color="white" size="large">mdi-refresh</v-icon>
              </template>
            </v-btn>
            <!-- End of Refresh Button -->
          </div>
        </div>
      </v-card-title>
      <v-card-text class="pt-0 pb-0 text-black nudge-down-title mb-3">
        <monthly-charges :passedEmployee="passedEmployee" :showMinutes="showMinutes"></monthly-charges>
        <v-divider></v-divider>
        <balances :passedEmployee="passedEmployee" :showMinutes="showMinutes"></balances>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import _ from 'lodash';
import MonthlyCharges from '@/components/shared/quickbooks/MonthlyCharges.vue';
import Balances from '@/components/shared/quickbooks/Balances.vue';
import { nicknameAndLastName } from '@/shared/employeeUtils';
import { isMobile, userRoleIsAdmin, userRoleIsManager } from '@/utils/utils';
import { qbStorageLastUpdated } from './quickbooks-helpers';
import { now } from '@/shared/dateUtils';

// |--------------------------------------------------|
// |                                                  |
// |                LIFECYCLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * The created lifecycle hook.
 */
function created() {
  if (this.$store.getters.employees) {
    this.filteredEmployees = this.filteredEmployees.filter((e) => e.workStatus > 0);
    this.filteredEmployees = this.$store.getters.employees.map((employee) => {
      return {
        text: nicknameAndLastName(employee),
        value: employee,
        workStatus: employee.workStatus,
        firstName: employee.firstName,
        nickname: employee.nickname,
        lastName: employee.lastName
      };
    });
    let employee = _.find(this.$store.getters.employees, (e) => e.id === this.employee.id);
    this.passedEmployee = {
      text: nicknameAndLastName(employee),
      value: employee,
      workStatus: employee.workStatus,
      firstName: employee.firstName,
      nickname: employee.nickname,
      lastName: employee.lastName
    };
  }
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Computed function for the vuex store employees
 */
function allEmployees() {
  return this.$store.getters.employees;
} // allEmployees

/**
 * Returns the last updated message
 */
function lastUpdated() {
  if (!this.refreshed && this.employee.id == this.$store.getters.user.id) {
    let lastUpdated = this.qbStorageLastUpdated('quickbooksData');
    if (lastUpdated) {
      if (lastUpdated < 1) {
        let minutes = parseInt(lastUpdated * 60);
        if (minutes > 0) {
          return `Last updated ${minutes} ${minutes == 1 ? 'minute' : 'minutes'} ago`;
        }
      } else {
        let hours = parseInt(lastUpdated);
        return `Last updated ${hours} ${hours == 1 ? 'hour' : 'hours'} ago`;
      }
    }
  }
} // lastUpdated

/**
 * Calculates the tooltip text to display on v-switch based on value of showMinutes.
 *
 * @return String - the tooltip text to display based on if showMinutes is true
 */
function tooltipText() {
  return this.showMinutes ? 'Hours <- Minutes' : 'Hours -> Minutes';
} //tooltipText

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Custom filter for employee autocomplete options.
 *
 * @param item - employee
 * @param queryText - text used for filtering
 * @return string - filtered employee name
 */
function customFilter(itemValue, queryText, itemObject) {
  const item = itemObject.raw;
  const query = queryText ? queryText : '';
  const nickNameFullName = item.nickname ? `${item.nickname} ${item.lastName}` : '';
  const firstNameFullName = `${item.firstName} ${item.lastName}`;

  const queryContainsNickName = nickNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase()) >= 0;
  const queryContainsFirstName =
    firstNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase()) >= 0;

  return queryContainsNickName || queryContainsFirstName;
} // customFilter

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * A watcher for when the vuex store is populated with necessary data.
 */
async function watchEmployees() {
  if (this.$store.getters.employees) {
    this.filteredEmployees = this.$store.getters.employees.filter((employee) => employee.workStatus > 0);
    this.filteredEmployees = this.$store.getters.employees.map((employee) => {
      return {
        text: nicknameAndLastName(employee),
        value: employee,
        workStatus: employee.workStatus,
        firstName: employee.firstName,
        nickname: employee.nickname,
        lastName: employee.lastName
      };
    });
    this.passedEmployee = _.find(this.$store.getters.employees, (e) => e.id === this.employee.id);
  }
} // watchStoreIsPopulated

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    Balances,
    MonthlyCharges
  },
  computed: {
    allEmployees,
    isMobile,
    lastUpdated,
    tooltipText
  },
  created,
  data() {
    return {
      filteredEmployees: [],
      passedEmployee: null,
      refreshed: false,
      showMinutes: false
    };
  },
  methods: {
    customFilter,
    qbStorageLastUpdated,
    nicknameAndLastName,
    now,
    userRoleIsAdmin,
    userRoleIsManager
  },
  props: ['employee'],
  watch: {
    allEmployees: watchEmployees
  }
};
</script>

<style scoped>
.nudge-up-title {
  position: relative;
  top: -18px;
}
.nudge-down-title {
  position: relative;
  top: 12px;
}
.nudge-up-row {
  position: relative;
  top: -5px;
}
.on-top {
  z-index: 999999 !important;
}
.tiny-text {
  font-size: 10px !important;
}
</style>
