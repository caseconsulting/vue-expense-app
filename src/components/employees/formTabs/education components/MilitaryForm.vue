<template>
  <div>
    <div v-for="i in [0]" :key="i">
      <!-- Name of Branch -->
      <v-text-field
        ref="formFields"
        :refInFor="true"
        v-model="military.branch"
        :rules="getRequiredRules()"
        label="Military Branch"
        clearable
      ></v-text-field>
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
                ref="formFields"
                :value="military.startDate | formatDateMonthYear"
                :rules="getDateMonthYearRules()"
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
                ref="formFields"
                :value="military.completeDate | formatDateMonthYear"
                :rules="[...getDateMonthYearRules(), ...dateSubmissionRules()]"
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
  </div>
</template>

<script>
import _ from 'lodash';
import { mask } from 'vue-the-mask';
import { getDateMonthYearRules, getRequiredRules } from '@/shared/validationUtils.js';
import { formatDateMonthYear, parseDateMonthYear } from '@/utils/utils';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');

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
  let errorCount = 0;
  //ensures that refs are put in an array so we can reuse forEach loop
  let components = !_.isArray(this.$refs.formFields) ? [this.$refs.formFields] : this.$refs.formFields;
  _.forEach(components, (field) => {
    if (field && !field.validate()) errorCount++;
  });
  window.EventBus.$emit('doneValidatingEducation', this.military, this.militaryIndex, errorCount); // emit done validating
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
function watchValidating() {
  if (this.validating) this.validateFields();
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
    dateSubmissionRules: function () {
      return this.military.startDate && this.military.completeDate
        ? moment(this.military.startDate).isBefore(moment(this.military.completeDate)) ||
            'Complete date must be before start date'
        : true;
    },
    parseDateMonthYear,
    parseEventDate,
    validateFields,
    getDateMonthYearRules,
    getRequiredRules
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
