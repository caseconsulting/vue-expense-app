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
      <v-card-subtitle>
        <h5 v-if="userRoleIsAdmin() && employee" class="subtitle white--text font-weight-medium">
          {{ nicknameAndLastName(employee) }}
        </h5>
      </v-card-subtitle>
      <v-card-text class="pt-0 pb-0 black--text">
        <monthly-charges :passedEmployee="employee" :showMinutes="showMinutes"></monthly-charges>
        <v-divider></v-divider>
        <balances :passedEmployee="employee" :showMinutes="showMinutes"></balances>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import MonthlyCharges from '@/components/shared/quickbooks/MonthlyCharges.vue';
import Balances from '@/components/shared/quickbooks/Balances.vue';
import { nicknameAndLastName } from '@/shared/employeeUtils';
import { userRoleIsAdmin } from '@/utils/utils';
// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Calculates the tooltip text to display on v-switch based on value of showMinutes.
 *
 * @return String - the tooltip text to display based on if showMinutes is true
 */
function tooltipText() {
  return this.showMinutes ? 'Hours <- Minutes' : 'Hours -> Minutes';
} //tooltipText

/**
 * Emits a message.
 */
function emit(name) {
  window.EventBus.$emit(name);
} // emit

export default {
  components: {
    Balances,
    MonthlyCharges
  },
  computed: {
    tooltipText
  },
  data() {
    return {
      showMinutes: false
    };
  },
  methods: {
    emit,
    nicknameAndLastName,
    userRoleIsAdmin
  },
  props: ['employee']
};
</script>

<style scoped>
.subtitle {
  position: relative;
  top: -50px;
}
</style>
