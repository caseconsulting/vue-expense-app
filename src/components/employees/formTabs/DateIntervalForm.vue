<template>
  <div style="border: 1px solid grey" class="pt-3 pb-1 px-5" v-bind:class="{ errorText: intervalOverlaps }">
    <!--Duplicate chip if tech name is already entered by user-->
    <v-row v-if="intervalOverlaps" justify="end">
      <v-chip class="ma-2" color="error" text-color="white"> Overlapping Interval </v-chip>
    </v-row>
    <h3>Time Interval {{ technologyIndex }} {{ intervalIndex }}</h3>
    <v-row class="mb-5">
      <!--Interval  Start Date Picker-->
      <v-menu
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
            v-model="tempStartIntervalDate"
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
            @blur="startIntervalDateEdited = parseDateMonthYear(tempStartIntervalDate)"
            @click:clear="startIntervalDateEdited = parseDateMonthYear(tempStartIntervalDate)"
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
            v-model="tempEndIntervalDate"
            v-mask="'##/####'"
            color="#A17C6B"
            label="End Date"
            clearable
            class="mt-8 shrink px-3"
            prepend-icon="event"
            background-color="white"
            v-bind="attrs"
            v-on="on"
            placeholder="End Date"
            :rules="dateOptionalRules"
            lazy-validation
            persistent-hint
            hint="(MM/YYYY)"
            @blur="endIntervalDateEdited = parseDateMonthYear(tempEndIntervalDate)"
            @click:clear="endIntervalDateEdited = parseDateMonthYear(tempEndIntervalDate)"
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

      <!-- Button to Delete Interval -->
      <v-btn class="mt-8" text icon><v-icon @click="deleteInterval">delete</v-icon></v-btn>
    </v-row>
  </div>
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
 * Sets up temp variables.
 */
async function created() {
  //set temp start date interval variable
  this.tempStartIntervalDate = formatDateMonthYear(this.startIntervalDateEdited) || this.tempStartIntervalDate;
  // fixes v-date-picker error so that if the format of date is incorrect it is set to null
  if (this.startIntervalDateEdited !== null && !formatDateMonthYear(this.startIntervalDateEdited)) {
    // clear birthday date if fails to format
    this.startIntervalDateEdited = null;
  }

  //set temp end date interval variable
  this.tempEndIntervalDate = formatDateMonthYear(this.endIntervalDateEdited) || this.tempEndIntervalDate;
  // fixes v-date-picker error so that if the format of date is incorrect it is set to null
  if (this.endIntervalDateEdited !== null && !formatDateMonthYear(this.endIntervalDateEdited)) {
    // clear birthday date if fails to format
    this.endIntervalDateEdited = null;
  }
} //created

/**
 * Computed property to calculate if interval overlaps any of the other intervals in the allIntervals prop. Sends back the error status to the parent component.
 *
 * @returns boolean true if there is an error (interval overlaps) false otherwise
 */
function intervalOverlaps() {
  let hasErrors = false;
  for (let i = 0; i < this.allIntervals.length; i++) {
    if (i != this.intervalIndex) {
      if (!this.allIntervals[i].endDate) {
        //if no end date date interval cannot be after date interval
        if (
          moment(this.startIntervalDateEdited, 'YYYY-MM').isSameOrAfter(
            moment(this.allIntervals[i].startDate, 'YYYY-MM')
          )
        ) {
          hasErrors = true;
        }
      } else if (
        //start date cannot be in between start end and end date
        moment(this.startIntervalDateEdited, 'YYYY-MM').isAfter(moment(this.allIntervals[i].startDate, 'YYYY-MM')) &&
        moment(this.startIntervalDateEdited, 'YYYY-MM').isBefore(moment(this.allIntervals[i].endDate, 'YYYY-MM'))
      ) {
        hasErrors = true;
      } else if (
        //end date cannot be in between start and end date
        moment(this.endIntervalDateEdited, 'YYYY-MM').isAfter(moment(this.allIntervals[i].startDate, 'YYYY-MM')) &&
        moment(this.endIntervalDateEdited, 'YYYY-MM').isBefore(moment(this.allIntervals[i].endDate, 'YYYY-MM'))
      ) {
        hasErrors = true;
      }
    }
  }

  //send validation result back to parent
  window.EventBus.$emit('validated-technology-interval', this.technologyIndex, this.intervalIndex, hasErrors);
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
  window.EventBus.$emit('date-interval-delete-technology', this.technologyIndex, this.intervalIndex);
} // deleteTechnology

export default {
  created,
  computed: {
    intervalOverlaps
  },
  data() {
    return {
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
      ] // rules for a required date
    };
  },
  directives: { mask },
  methods: {
    deleteInterval,
    isEmpty,
    parseDateMonthYear,
    formatDateMonthYear
  },
  props: ['startIntervalDate', 'endIntervalDate', 'technologyIndex', 'intervalIndex', 'allIntervals'],
  watch: {
    startIntervalDate: function () {
      this.startIntervalDateEdited = _.cloneDeep(this.startIntervalDate);
      this.$refs.formFields.validate(); //validate dates everytime a date changes
    },
    endIntervalDate: function () {
      this.endIntervalDateEdited = _.cloneDeep(this.endIntervalDate);
      this.$refs.formFields.validate(); //validate dates everytime a date changes
    },
    startIntervalDateEdited: function () {
      //function that updates the text box when date picker is changed
      this.tempStartIntervalDate = formatDateMonthYear(this.startIntervalDateEdited) || this.tempStartIntervalDate;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.startIntervalDateEdited !== null && !formatDateMonthYear(this.startIntervalDateEdited)) {
        this.startIntervalDateEdited = null;
      }

      //send updated startInterval (given index back)
      window.EventBus.$emit(
        'update-start-interval-technology',
        this.technologyIndex,
        this.intervalIndex,
        this.startIntervalDateEdited
      );
    },
    endIntervalDateEdited: function () {
      //function that updates the text box when date picker is changed
      this.tempEndIntervalDate = formatDateMonthYear(this.endIntervalDateEdited) || this.tempEndIntervalDate;
      //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
      if (this.endIntervalDateEdited !== null && !formatDateMonthYear(this.endIntervalDateEdited)) {
        this.endIntervalDateEdited = null;
      }
      // send updated startInterval (given index back)
      window.EventBus.$emit(
        'update-end-interval-technology',
        this.technologyIndex,
        this.intervalIndex,
        this.endIntervalDateEdited
      );
    }
  }
};
</script>
<style>
.errorText {
  border: 2px solid red !important;
}
</style>
