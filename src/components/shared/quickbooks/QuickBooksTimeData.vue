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
      </v-card-title>
      <v-card-text class="pt-5 pb-0 black--text">
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
  props: ['employee']
};
</script>
