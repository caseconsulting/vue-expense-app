<template>
  <div id="monthly-charges">
    <v-card>
      <v-card-title class="header_style">
        <h4 class="white--text">Hours for {{ month }} {{ year }}</h4>
      </v-card-title>
      <v-card-text class="px-7 pt-5 pb-1 black--text">
        <v-row></v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import moment from 'moment';
// import api from '@/shared/api.js';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 *  Set budget information for employee. Creates event listeners.
 */
async function created() {
  let now = moment();
  let currMonth = now._d.getMonth();
  this.month = now._locale._months[currMonth];
  this.year = now._d.getFullYear();
  console.log(this.year);
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
      month: '',
      year: ''
    };
  },
  props: ['employee'] // employee
};
</script>
