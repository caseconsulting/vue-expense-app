<template>
  <div>
    <!-- Name of Branch -->
    <v-text-field v-model="military.branch" label="Military Branch" clearable></v-text-field>
    <v-row>
      <v-col cols="12" sm="6">
        <!-- Starting Date -->
        <v-menu
          v-model="military.showStartMenu"
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
              @input="military.showStartMenu = false"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="military.startDate"
            no-title
            @input="military.showStartMenu = false"
            type="month"
          ></v-date-picker>
        </v-menu>
        <!-- End Starting Date -->
      </v-col>

      <!-- Completed Date -->
      <v-col cols="12" sm="6">
        <v-menu
          v-model="military.showCompleteMenu"
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
              @input="military.showCompleteMenu = false"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="military.completeDate"
            no-title
            @input="military.showCompleteMenu = false"
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

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM format
 */
function parseEventDate() {
  return this.parseDateMonthYear(event.target.value);
} // parseEventDate

/**
 * Validate all input fields are valid.
 */
function validateFields() {
  console.log('in military validate fields');
  window.EventBus.$emit('doneValidatingEducation', this.military, this.militaryIndex); // emit done validating
} // validateFields

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for validating - validates fields
 *
 * @param val - val prop that needs to exist before validating
 */
function watchValidating(val) {
  if (val) {
    // parent component triggers validation
    this.validateFields();
  }
} // watchValidating

// |--------------------------------------------------|
// |                                                  |
// |                     EXPORT                       |
// |                                                  |
// |--------------------------------------------------|

export default {
  props: ['service', 'militaryIndex', 'validating'],
  directives: { mask },
  filters: {
    formatDateMonthYear
  },
  methods: {
    parseDateMonthYear,
    parseEventDate,
    validateFields
  },
  data() {
    return {
      military: { ..._.cloneDeep(this.$props.service), showStartMenu: false, showCompleteMenu: false }
    };
  },
  watch: {
    validating: watchValidating
  }
};
</script>
