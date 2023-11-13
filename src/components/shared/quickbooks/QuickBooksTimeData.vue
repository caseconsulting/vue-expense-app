<template>
  <div id="t-sheets-data">
    <v-card density="compact">
      <v-card-title class="header_style py-0">
        <v-autocomplete
          v-if="userRoleIsAdmin() || userRoleIsManager()"
          class="pb-0 mt-0 nudge-up-autocomplete"
          :style="autocompleteWidth"
          v-model="passedEmployee"
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
        <div
          class="d-flex align-center justify-space-between"
          :class="userRoleIsAdmin() || userRoleIsManager() ? 'nudge-up-title' : 'nudge-down-title'"
        >
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
            <v-btn @click="emitter.emit('refresh-quickbooks-data')" variant="text" icon="mdi-refresh">
              <template v-slot:default>
                <v-tooltip activator="parent" location="top">Refresh Quickbooks Time Data</v-tooltip>
                <v-icon color="white" size="large">mdi-refresh</v-icon>
              </template>
            </v-btn>
            <!-- End of Refresh Button -->
          </div>
        </div>
      </v-card-title>
      <v-card-text class="pt-0 pb-0 text-black" :class="userRoleIsAdmin() || userRoleIsManager() ? 'nudge-up' : 'mt-4'">
        <semi-monthly-charges
          v-if="passedEmployee && isLegacyFireTeam"
          :passedEmployee="passedEmployee"
          :showMinutes="showMinutes"
        ></semi-monthly-charges>
        <monthly-charges v-else :passedEmployee="passedEmployee" :showMinutes="showMinutes"></monthly-charges>
        <v-divider></v-divider>
        <balances :passedEmployee="passedEmployee" :showMinutes="showMinutes"></balances>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import _ from 'lodash';
import MonthlyCharges from '@/components/shared/quickbooks/MonthlyCharges.vue';
import SemiMonthlyCharges from '@/components/shared/quickbooks/SemiMonthlyCharges.vue';
import Balances from '@/components/shared/quickbooks/Balances.vue';
import { nicknameAndLastName } from '@/shared/employeeUtils';
import { isMobile, userRoleIsAdmin, userRoleIsManager } from '@/utils/utils';

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
 * Gets the width for the autocomplete component based on screen size.
 */
function autocompleteWidth() {
  switch (this.$vuetify.display.name) {
    case 'xs':
      return 'width: 50%';
    case 'sm':
      return 'width: 50%';
    case 'md':
      return 'width: 40%;';
    case 'lg':
      return 'width: 40%';
    case 'xl':
      return 'width: 30%';
  }
} // autocompleteWidth

/**
 * Determines if an employee is a legacy FireTeam employee.
 *
 * @returns Boolean - whether the employee was FireTeam or not
 */
function isLegacyFireTeam() {
  if (!this.passedEmployee.value) {
    return parseInt(this.employee.employeeNumber, 10) < 100;
  } else {
    return parseInt(this.passedEmployee.value.employeeNumber, 10) < 100;
  }
} // isLegacyFireTeam

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
    MonthlyCharges,
    SemiMonthlyCharges
  },
  computed: {
    allEmployees,
    autocompleteWidth,
    isLegacyFireTeam,
    isMobile,
    tooltipText
  },
  created,
  data() {
    return {
      filteredEmployees: [],
      passedEmployee: null,
      showMinutes: false
    };
  },
  methods: {
    customFilter,
    nicknameAndLastName,
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
.nudge-up-autocomplete {
  position: relative;
  top: -8px;
}
</style>
