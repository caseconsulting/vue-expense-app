<template>
  <div id="t-sheets-data">
    <v-card>
      <v-card-title class="header_style">
        <h3>QuickBooks Time Data</h3>
        <v-spacer></v-spacer>
        <!--Switch between minutes and hours-->
        <v-tooltip top nudge-top="10">
          <template v-slot:activator="{ on, attrs }">
            <div v-bind="attrs" v-on="on">
              <v-switch v-model="showMinutes" dense hide-details color="gray" class="my-0 py-0"></v-switch>
            </div>
          </template>
          <span>{{ tooltipText }}</span>
        </v-tooltip>
        <!--End of Switch-->
        <!-- Start of Refresh Button -->
        <v-tooltip top nudge-top="10">
          <template v-slot:activator="{ on, attrs }">
            <div v-bind="attrs" v-on="on">
              <v-btn @click="emit('refresh-quickbooks-data')" icon large>
                <v-icon color="white">mdi-refresh</v-icon>
              </v-btn>
            </div>
          </template>
          <span>Refresh Quickbooks Time Data</span>
        </v-tooltip>
        <!-- End of Refresh Button -->
      </v-card-title>
      <v-card-subtitle v-if="userRoleIsAdmin() && passedEmployee" class="pb-0 mt-0 subtitle" :style="autocompleteWidth">
        <v-autocomplete
          class="autocomplete"
          dark
          v-model="passedEmployee"
          :items="filteredEmployees"
          :filter="customFilter"
          dense
        ></v-autocomplete>
      </v-card-subtitle>
      <v-card-text class="pt-0 pb-0 black--text" :class="userRoleIsAdmin() ? 'nudge-up' : 'mt-4'">
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
import { userRoleIsAdmin } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                LIFECYCLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * The created lifecycle hook.
 */
function created() {
  this.passedEmployee = _.cloneDeep(this.employee);
  if (this.$store.getters.employees) {
    this.filteredEmployees = this.$store.getters.employees.map((employee) => {
      if (employee.workStatus > 0) {
        return {
          text: nicknameAndLastName(employee),
          value: employee,
          workStatus: employee.workStatus,
          firstName: employee.firstName,
          nickname: employee.nickname,
          lastName: employee.lastName
        };
      } else {
        return;
      }
    });
  }
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

function allEmployees() {
  return this.$store.getters.employees;
}

function autocompleteWidth() {
  switch (this.$vuetify.breakpoint.name) {
    case 'xs' || 'sm':
      return 'width: 50%';
    case 'md' || 'lg':
      return 'width: 40%';
    case 'xl':
      return 'width: 30%';
  }
}

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
function customFilter(item, queryText) {
  const query = queryText ? queryText : '';
  const nickNameFullName = item.nickname ? `${item.nickname} ${item.lastName}` : '';
  const firstNameFullName = `${item.firstName} ${item.lastName}`;

  const queryContainsNickName = nickNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase()) >= 0;
  const queryContainsFirstName =
    firstNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase()) >= 0;

  return queryContainsNickName || queryContainsFirstName;
} // customFilter

/**
 * Emits a message.
 */
function emit(name) {
  window.EventBus.$emit(name);
} // emit

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
    this.filteredEmployees = this.$store.getters.employees.map((employee) => {
      if (employee.workStatus > 0) {
        return {
          text: nicknameAndLastName(employee),
          value: employee,
          workStatus: employee.workStatus,
          firstName: employee.firstName,
          nickname: employee.nickname,
          lastName: employee.lastName
        };
      } else {
        return;
      }
    });
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
    autocompleteWidth,
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
    emit,
    nicknameAndLastName,
    userRoleIsAdmin
  },
  props: ['employee'],
  watch: {
    allEmployees: watchEmployees
  }
};
</script>

<style scoped>
.autocomplete >>> .v-input__slot::before {
  border-style: none !important;
}
.autocomplete {
  font-size: 12px;
}
.nudge-up {
  position: relative;
  top: -20px;
}
.subtitle {
  position: relative;
  top: -75px;
  width: 40%;
}
</style>
