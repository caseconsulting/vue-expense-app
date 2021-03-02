<template>
  <div>
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
            class="mt-8 shrink"
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
            class="mt-8 shrink"
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

    <!-- End Loop Technologies -->
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
}
// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Deletes interval from parent.
 */
async function deleteInterval() {
  //TODO: send event to technology tab with index for deleting that entry
  this.tempStartIntervalDate = null;
  this.tempEndIntervalDate = null;
  window.EventBus.$emit('date-interval-delete-technology', this.technologyIndex, this.intervalIndex);
} // deleteTechnology

export default {
  created,
  data() {
    return {
      startIntervalMenu: false,
      tempStartIntervalDate: null,
      startIntervalDateEdited: _.cloneDeep(this.startIntervalDate),
      endIntervalMenu: false,
      tempEndIntervalDate: _.cloneDeep(this.endIntervalDate),
      endIntervalDateEdited: null,
      dateOptionalRules: [
        (v) => isEmpty(v) || /^\d{1,2}\/\d{4}$/.test(v) || 'Date must be valid. Format: MM/YYYY',
        (v) => isEmpty(v) || moment(v, 'MM/YYYY').isValid() || 'Date must be valid',
        (v) =>
          isEmpty(v) || moment(v, 'MM/YYYY').isAfter(this.startIntervalDateEdited) || 'Date must be after start date'
      ], // rules for an optional date
      dateRules: [
        (v) => !isEmpty(v) || 'Date required',
        (v) => (!isEmpty(v) && /^\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/YYYY',
        (v) => moment(v, 'MM/YYYY').isValid() || 'Date must be valid',
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
  props: ['startIntervalDate', 'endIntervalDate', 'technologyIndex', 'intervalIndex'],
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

      //TODO: send updated startInterval (given index back)
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
      //TODO: send updated startInterval (given index back)
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
.errorBox {
  color: red !important;
  border: 2px solid red !important;
}
</style>
