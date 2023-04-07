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
      <v-card-text class="pt-5 pb-0 black--text">
        <monthly-charges :passedEmployee="employee" :showMinutes="showMinutes"></monthly-charges>
        <v-divider></v-divider>
        <balances :passedEmployee="employee" :showMinutes="showMinutes"></balances>
        <button
          class="home_buttons"
          @click="
            () => {
              showPTOCashOutFormModal = true;
            }
          "
        >
          Cash out PTO
        </button>
      </v-card-text>
    </v-card>
    <v-dialog v-model="showPTOCashOutFormModal" persistent max-width="500">
      <p-t-o-cashout-form :showModal="showPTOCashOutFormModal" />
    </v-dialog>
  </div>
</template>

<script>
import MonthlyCharges from '@/components/shared/quickbooks/MonthlyCharges.vue';
import Balances from '@/components/shared/quickbooks/Balances.vue';
import PTOCashoutForm from '../PTOCashOutForm.vue';
// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|
/**
 * Created lifecycle hook
 */
function created() {
  window.EventBus.$on('close-pto-cash-out-form', () => {
    this.showPTOCashOutFormModal = false;
  });
} // created

/**
 * BeforeDestroy lifecycle hook
 */
function beforeDestroy() {
  window.EventBus.$off('close-pto-cash-out-form');
} // beforeDestroy

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

function emit(name) {
  window.EventBus.$emit(name);
}

export default {
  created,
  beforeDestroy,
  components: {
    Balances,
    MonthlyCharges,
    PTOCashoutForm
  },
  computed: {
    tooltipText
  },
  data() {
    return {
      showMinutes: false,
      showPTOCashOutFormModal: false
    };
  },
  methods: {
    emit
  },
  props: ['employee']
};
</script>
