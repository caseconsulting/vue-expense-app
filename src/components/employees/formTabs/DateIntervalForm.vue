<template>
  <v-form ref="form">
    <div style="border: 1px solid grey" class="pt-3 pb-1 px-5">
      <!--Duplicate chip if tech name is already entered by user-->
      <v-row v-if="intervalOverlaps" justify="end">
        <v-chip class="ma-2" color="error" text-color="white"> Overlapping interval or field error </v-chip>
      </v-row>
      <v-row class="pt-5 pl-3">
        <h3>Time Interval</h3>
        <v-spacer></v-spacer>
        <v-btn-toggle v-model="formatToggle" mandatory>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" text>
                <icon class="mr-1" name="calendar-alt"></icon>
              </v-btn>
            </template>
            <span>MM-YYYY</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" text>
                <icon class="mr-1" name="globe-americas"></icon>
              </v-btn>
            </template>
            <span>YYYY</span>
          </v-tooltip>
        </v-btn-toggle>
      </v-row>
      <v-row class="mb-5">
        <!--Interval  Start Date Picker-->
        <v-menu
          v-if="formatToggle == 0"
          v-model="startIntervalMenu"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          min-width="290px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              ref="formFields"
              :value="startIntervalDateEdited | formatDateMonthYear"
              v-mask="'##/####'"
              color="#A17C6B"
              label="Start Date"
              clearable
              class="mt-8 shrink mx-3"
              prepend-icon="event"
              background-color="white"
              v-bind="attrs"
              v-on="on"
              placeholder="Start Date"
              :rules="dateRules"
              lazy-validation
              persistent-hint
              hint="(MM/YYYY)"
              @blur="startIntervalDateEdited = parseDateMonthYear($event.target.value)"
              @input="startIntervalMenu = false"
              @click:clear="startIntervalDateEdited = parseDateMonthYear($event.target.value)"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="startIntervalDateEdited"
            @input="startIntervalMenu = false"
            type="month"
            :landscape="$vuetify.breakpoint.smAndUp"
          ></v-date-picker>
        </v-menu>
        <!--End of Interval Start Date Picker-->
        <!--Interval End Date Picker-->
        <v-menu
          v-if="formatToggle == 0"
          v-model="endIntervalMenu"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          min-width="290px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              ref="formFields"
              :value="endIntervalDateEdited | formatDateMonthYear"
              v-mask="'##/####'"
              color="#A17C6B"
              label="End Date (optional)"
              clearable
              class="mt-8 shrink px-3"
              prepend-icon="event"
              background-color="white"
              v-bind="attrs"
              v-on="on"
              placeholder="End Date (optional)"
              :rules="dateOptionalRules"
              lazy-validation
              persistent-hint
              hint="(MM/YYYY)"
              @blur="endIntervalDateEdited = parseDateMonthYear($event.target.value)"
              @input="endIntervalMenu = false"
              @click:clear="endIntervalDateEdited = parseDateMonthYear($event.target.value)"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="endIntervalDateEdited"
            @input="endIntervalMenu = false"
            type="month"
            :landscape="$vuetify.breakpoint.smAndUp"
          ></v-date-picker>
        </v-menu>
        <!--Interval End Date Picker-->

        <v-text-field
          v-if="formatToggle == 1"
          ref="formFields"
          v-model="startIntervalDateEdited"
          v-mask="'####'"
          color="#A17C6B"
          label="Start Date"
          clearable
          class="mt-8 shrink mx-3"
          prepend-icon="event"
          background-color="white"
          placeholder="Start Date"
          :rules="yearStartRules"
          lazy-validation
          persistent-hint
          hint="(YYYY)"
        ></v-text-field>

        <!--End of Interval Start Date Picker-->

        <!--Interval End Date Picker-->
        <v-text-field
          v-if="formatToggle == 1"
          ref="formFields"
          v-model="endIntervalDateEdited"
          v-mask="'####'"
          color="#A17C6B"
          label="End Date (optional)"
          clearable
          class="mt-8 shrink px-3"
          prepend-icon="event"
          background-color="white"
          placeholder="End Date (optional)"
          :rules="yearEndRules"
          lazy-validation
          persistent-hint
          hint="(YYYY)"
        ></v-text-field>
        <!--Interval End Date Picker-->

        <!-- Button to Delete Interval -->
        <v-tooltip bottom slot="append-outer">
          <template v-slot:activator="{}">
            <v-btn class="mt-8" text icon v-if="allIntervals.length > 1"
              ><v-icon @click="deleteInterval">delete</v-icon></v-btn
            >
          </template>
          <span>Delete Interval</span>
        </v-tooltip>
      </v-row>
      <v-row class="pb-5 caption text--darken-2 grey--text">
        If you are unsure about the exact date, please put an approximate one.
      </v-row>
    </div>
  </v-form>
</template>

<script>
import _ from 'lodash';
import { mask } from 'vue-the-mask';
import moment from 'moment-timezone';
import { isEmpty, parseDateMonthYear, formatDateMonthYear } from '@/utils/utils';
// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Computed property to calculate if interval overlaps any of the other intervals in the allIntervals prop. Sends back the error status to the parent component.
 *
 * @returns boolean true if there is an error (interval overlaps) false otherwise
 */
function intervalOverlaps() {
  let hasErrors = false;
  //sets startDate based on format
  const startDate = this.formatToggle
    ? moment([this.startIntervalDateEdited, 0]).format('YYYY-MM')
    : this.startIntervalDateEdited;
  //sets endDate based on format
  const endDate = this.formatToggle
    ? moment([this.endIntervalDateEdited, 0]).format('YYYY-MM')
    : this.endIntervalDateEdited;
  for (let i = 0; i < this.allIntervals.length; i++) {
    if (i != this.intervalIndex) {
      if (!this.allIntervals[i].endDate) {
        //if no end date date interval cannot be after date interval
        if (moment(startDate, 'YYYY-MM').isSameOrAfter(moment(this.allIntervals[i].startDate, 'YYYY-MM'))) {
          hasErrors = true;
        }
      } else if (
        //start date cannot be in between start end and end date
        moment(startDate, 'YYYY-MM').isSameOrAfter(moment(this.allIntervals[i].startDate, 'YYYY-MM')) &&
        moment(startDate, 'YYYY-MM').isBefore(moment(this.allIntervals[i].endDate, 'YYYY-MM'))
      ) {
        hasErrors = true;
      } else if (
        //end date cannot be in between start and end date
        moment(endDate, 'YYYY-MM').isAfter(moment(this.allIntervals[i].startDate, 'YYYY-MM')) &&
        moment(endDate, 'YYYY-MM').isSameOrBefore(moment(this.allIntervals[i].endDate, 'YYYY-MM'))
      ) {
        hasErrors = true;
      }
    }
  }

  if (this.$refs.form && !hasErrors) {
    hasErrors = !this.$refs.form.validate();
  }

  //send validation result back to parent
  this.$emit('validated', this.technologyIndex, this.intervalIndex, hasErrors);
  return hasErrors;
} //intervalOverlaps
// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|
/**
 * Deletes interval from parent.
 */
async function deleteInterval() {
  this.tempStartIntervalDate = null;
  this.tempEndIntervalDate = null;
  this.$emit('delete', this.technologyIndex, this.intervalIndex);
} // deleteInterval

export default {
  computed: {
    intervalOverlaps
  },
  data() {
    return {
      formatToggle: 0,
      endYear: null,
      startIntervalMenu: false,
      tempStartIntervalDate: null,
      startIntervalDateEdited: _.cloneDeep(this.startIntervalDate),
      endIntervalMenu: false,
      tempEndIntervalDate: null,
      endIntervalDateEdited: _.cloneDeep(this.endIntervalDate),
      dateOptionalRules: [
        (v) => isEmpty(v) || /^\d{1,2}\/\d{4}$/.test(v) || 'Date must be valid. Format: MM/YYYY',
        (v) => isEmpty(v) || moment(v, 'MM/YYYY').isValid() || 'Date must be valid',
        (v) =>
          isEmpty(v) ||
          moment(v, 'MM/YYYY').isBefore(moment()) ||
          `Date must be before or equal to ${moment().format('MM/YYYY')}.`,
        (v) =>
          isEmpty(v) || moment(v, 'MM/YYYY').isAfter(this.startIntervalDateEdited) || 'Date must be after start date'
      ], // rules for an optional date
      dateRules: [
        (v) => !isEmpty(v) || 'Date required',
        (v) => (!isEmpty(v) && /^\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/YYYY',
        (v) => moment(v, 'MM/YYYY').isValid() || 'Date must be valid',
        (v) =>
          moment(v, 'MM/YYYY').isBefore(moment()) || `Date must be before or equal to ${moment().format('MM/YYYY')}.`,
        (v) =>
          !this.endIntervalDateEdited ||
          moment(v, 'MM/YYYY').isBefore(this.endIntervalDateEdited) ||
          'Date must be before end date'
      ], // rules for a required date
      yearStartRules: [
        (v) => !isEmpty(v) || 'Date required',
        (v) => (!isEmpty(v) && /^\d{4}$/.test(v)) || 'Date must be valid. Format: YYYY',
        (v) => moment(v, 'YYYY').isValid() || 'Date must be valid',
        (v) => moment(v, 'YYYY').isBefore(moment()) || `Date must be before or equal to ${moment().format('YYYY')}.`,
        (v) =>
          !this.endIntervalDateEdited ||
          moment(v, 'YYYY').isBefore(this.endIntervalDateEdited) ||
          'Date must be before end date'
      ], // rules for an year start date
      yearEndRules: [
        (v) => isEmpty(v) || /^\d{4}$/.test(v) || 'Date must be valid. Format: YYYY',
        (v) => isEmpty(v) || moment(v, 'YYYY').isValid() || 'Date must be valid',
        (v) =>
          isEmpty(v) ||
          Number(v) <= Number(moment().format('YYYY')) ||
          `Date must be before or equal to ${moment().format('YYYY')}.`,
        (v) =>
          isEmpty(v) ||
          moment(v, 'YYYY').isAfter(this.startIntervalDateEdited) ||
          `Date must be after start date ${this.startIntervalDateEdited}`
      ] // rules for year end date
    };
  },
  directives: { mask },
  filters: {
    formatDateMonthYear,
    getYear(date) {
      if (!date) {
        return null;
      }
      const [year] = date.split('-');
      return year;
    }
  },
  methods: {
    deleteInterval,
    isEmpty,
    parseDateMonthYear,
    formatDateMonthYear
  },
  mounted() {
    this.$emit('validated', this.technologyIndex, this.intervalIndex, 1);
  },
  props: ['startIntervalDate', 'endIntervalDate', 'technologyIndex', 'intervalIndex', 'allIntervals'],
  watch: {
    formatToggle: function () {
      // change to YYYY format
      if (this.formatToggle == 1) {
        this.startIntervalDateEdited = !isEmpty(this.startIntervalDate) ? this.startIntervalDate.split('-')[0] : null;
        this.endIntervalDateEdited = !isEmpty(this.endIntervalDate) ? this.endIntervalDate.split('-')[0] : null;
        //close opened date menus
        this.startIntervalMenu = false;
        this.endIntervalMenu = false;
      }
      //change to MM-YYYY format
      if (this.formatToggle == 0) {
        this.startIntervalDateEdited = this.startIntervalDate;
        this.endIntervalDateEdited = this.endIntervalDate;
      }

      this.$emit('start', this.technologyIndex, this.intervalIndex, this.startIntervalDateEdited);
      this.$emit('end', this.technologyIndex, this.intervalIndex, this.endIntervalDateEdited);

      this.$refs.form.resetValidation();
      this.$refs.form.validate();
    },
    startIntervalDate: function () {
      if (this.formatToggle === 0) {
        this.startIntervalDateEdited = this.parseDateMonthYear(this.startIntervalDate);
      } else {
        this.startIntervalDateEdited = this.parseDateMonthYear(this.startIntervalDate).split('-')[0];
      }
    },
    endIntervalDate: function () {
      if (this.formatToggle === 0) {
        this.endIntervalDateEdited = this.parseDateMonthYear(this.endIntervalDate);
      } else {
        this.endIntervalDateEdited = this.parseDateMonthYear(this.endIntervalDate).split('-')[0];
      }
    },
    startIntervalDateEdited: function () {
      //temp variable for checking equality
      let start =
        this.formatToggle == 1 && this.startIntervalDateEdited
          ? this.startIntervalDateEdited + '-01'
          : this.startIntervalDateEdited;
      //only sends date back to technology tab if in correct format
      if (start && start != this.startIntervalDate && start.length == 7) {
        this.$emit('start', this.technologyIndex, this.intervalIndex, start);
      }
      this.$refs.form.validate();
    },
    endIntervalDateEdited: function () {
      //temp variable for checking equality
      let end =
        this.formatToggle == 1 && this.endIntervalDateEdited
          ? this.endIntervalDateEdited + '-01'
          : this.endIntervalDateEdited;

      //only sends date back to technology tab if in correct format (can be null because date is optional)
      if (end == null || (end && end != this.endIntervalDate && end.length == 7)) {
        this.$emit('end', this.technologyIndex, this.intervalIndex, end);
      }
      this.$refs.form.validate();
    }
  }
};
</script>
<style>
.errorText {
  border: 2px solid red !important;
}
</style>
