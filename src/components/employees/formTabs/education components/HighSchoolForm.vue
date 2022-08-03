<template>
  <div>
    <!-- Name of School -->
    <v-text-field v-model="highSchool.name" label="High School" clearable></v-text-field>
    <!-- Received Date -->
    <v-menu
      v-model="highSchool.showReceivedMenu"
      :close-on-content-click="false"
      transition="scale-transition"
      offset-y
      max-width="290px"
      min-width="290px"
    >
      <template v-slot:activator="{ on }">
        <v-text-field
          :value="highSchool.gradYear | formatDateMonthYear"
          label="Graduation Year"
          prepend-icon="event_available"
          hint="MM/YYYY format"
          v-mask="'##/####'"
          persistent-hint
          v-on="on"
          @blur="highSchool.gradYear = parseEventDate($event)"
          clearable
          @input="highSchool.showReceivedMenu = false"
        ></v-text-field>
      </template>
      <v-date-picker
        v-model="highSchool.gradYear"
        no-title
        @input="highSchool.showReceivedMenu = false"
        type="month"
      ></v-date-picker>
    </v-menu>
    <!-- End Received Date -->
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
  props: ['school'],
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
      highSchool: { ..._.cloneDeep(this.$props.school), showReceivedMenu: false }
    };
  }
};
</script>
