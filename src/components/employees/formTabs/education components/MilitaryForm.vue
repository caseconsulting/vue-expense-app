<template>
  <div>
    <!-- Name of Branch -->
    <v-text-field v-model="military.branch" label="Military Branch" clearable></v-text-field>
    <v-row>
      <v-col cols="12" sm="6">
        <!-- Starting Date -->
        <v-menu
          v-model="military.showReceivedMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              :value="military.startDate | formatDateMonthYear"
              label="Starting Date"
              prepend-icon="event_available"
              hint="MM/YYYY format"
              v-mask="'##/####'"
              persistent-hint
              v-on="on"
              @blur="military.startDate = parseEventDate($event)"
              clearable
              @input="military.showReceivedMenu = false"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="military.startDate"
            no-title
            @input="military.showReceivedMenu = false"
            type="month"
          ></v-date-picker>
        </v-menu>
        <!-- End Starting Date -->
      </v-col>

      <!-- Completed Date -->
      <v-col cols="12" sm="6">
        <v-menu
          v-model="military.showReceivedMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              :value="military.completeDate | formatDateMonthYear"
              label="Completion Date"
              prepend-icon="event_available"
              hint="MM/YYYY format"
              v-mask="'##/####'"
              persistent-hint
              v-on="on"
              @blur="military.completeDate = parseEventDate($event)"
              clearable
              @input="military.showReceivedMenu = false"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="military.completeDate"
            no-title
            @input="military.showReceivedMenu = false"
            type="month"
          ></v-date-picker>
        </v-menu>
      </v-col>
      <!-- End Completed Date -->
    </v-row>
  </div>
</template>

<script>
import _ from 'lodash';
import { mask } from 'vue-the-mask';
import { formatDateMonthYear, parseDateMonthYear } from '@/utils/utils';

/**
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM format
 */
function parseEventDate() {
  return this.parseDateMonthYear(event.target.value);
} // parseEventDate

export default {
  props: ['service'],
  directives: { mask },
  filters: {
    formatDateMonthYear
  },
  methods: {
    parseDateMonthYear,
    parseEventDate
  },
  data() {
    return {
      military: { ..._.cloneDeep(this.$props.service), showReceivedMenu: false }
    };
  }
};
</script>
