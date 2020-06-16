<template>
  <div id="balances">
    <v-card>
      <v-card-title class="header_style">
        <h4 class="white--text">Balances</h4>
      </v-card-title>
      <v-card-text class="px-7 pt-5 pb-1 black--text">
        <v-row></v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import api from '@/shared/api.js';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Set budget information for employee. Creates event listeners.
 */
async function created() {
  this.timeSheets = await api.getTimeSheets(this.employee.employeeNumber);
} // created
// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  data() {
    return {};
  },
  props: ['employee'] // employee
};
</script>
