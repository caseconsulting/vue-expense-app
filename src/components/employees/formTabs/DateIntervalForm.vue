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
import { formatDateDashToSlash, formatDateSlashToDash, isEmpty } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Deletes interval from parent.
 */
function deleteInterval() {
  //TODO: send event to technology tab with index for deleting that entry
  this.tempStartIntervalDate = null;
  this.tempEndIntervalDate = null;
  window.EventBus.$emit('date-interval-delete-technology', this.technologyIndex, this.intervalIndex);
} // deleteTechnology

export default {
  data() {
    return {
      startIntervalMenu: false,
      tempStartIntervalDate: null,
      startIntervalDateEdited: _.cloneDeep(this.startIntervalDate),
      endIntervalMenu: false,
      tempEndIntervalDate: _.cloneDeep(this.endIntervalDate),
      endIntervalDateEdited: null,
      dateOptionalRules: [
        (v) => {
          return !isEmpty(v) ? /^\d{1,2}\/\d{4}$/.test(v) || 'Date must be valid. Format: MM/YYYY' : true;
        }
      ], // rules for an optional date
      dateRules: [
        (v) => !isEmpty(v) || 'Date required',
        (v) => (!isEmpty(v) && /^\d{1,2}\/\d{4}$/.test(v)) || 'Date must be valid. Format: MM/YYYY'
      ] // rules for a required date
    };
  },
  directives: { mask },
  methods: {
    deleteInterval,
    formatDateDashToSlash,
    formatDateSlashToDash,
    isEmpty
  },
  props: ['startIntervalDate', 'endIntervalDate', 'technologyIndex', 'intervalIndex'],
  watch: {
    startIntervalDate: function () {
      this.startIntervalDateEdited = this.startIntervalDate;
    },
    endIntervalDate: function () {
      this.endIntervalDateEdited = this.endIntervalDate;
    },
    tempStartIntervalDate: function () {
      //function that updates the date picker when text field is changed
      if (this.tempStartIntervalDate != null) {
        let splitDate;
        if (this.tempStartIntervalDate !== null) {
          splitDate = this.tempStartIntervalDate.split('/');
        } else {
          return null;
        }
        let date = moment(this.tempStartIntervalDate, 'MM/YYYY');
        if (splitDate.length != 2 || !date.isValid()) {
          return null;
        }
        let year = splitDate[1];
        let month = splitDate[0];

        this.startIntervalDateEdited = year + '-' + month;
      }
    },
    startIntervalDateEdited: function () {
      //function that updates the text box when date picker is changed
      if (this.startIntervalDateEdited != null) {
        if (this.startIntervalDateEdited !== null) {
          var splitDate = this.startIntervalDateEdited.split('-');
        } else {
          return null;
        }
        if (splitDate.length != 2) {
          return null;
        }
        var year = splitDate[0];
        var month = splitDate[1];

        if (year.length != 4 || month.length < 1 || month.length > 2) {
          this.startIntervalDateEdited = null;
          return null;
        }
        this.tempStartIntervalDate = month + '/' + year;

        //TODO: send updated startInterval (given index back)
        window.EventBus.$emit(
          'update-start-interval-technology',
          this.technologyIndex,
          this.intervalIndex,
          this.startIntervalDateEdited
        );
      }
    },
    tempEndIntervalDate: function () {
      //function that updates the date picker when text field is changed
      if (this.tempEndIntervalDate != null) {
        let splitDate;
        if (this.tempEndIntervalDate !== null) {
          splitDate = this.tempEndIntervalDate.split('/');
        } else {
          return null;
        }
        let date = moment(this.tempEndIntervalDate, 'MM/YYYY');
        if (splitDate.length != 2 || !date.isValid()) {
          return null;
        }
        let year = splitDate[1];
        let month = splitDate[0];

        this.endIntervalDateEdited = year + '-' + month;
      }
    },
    endIntervalDateEdited: function () {
      //function that updates the text box when date picker is changed
      if (this.endIntervalDateEdited != null) {
        if (this.endIntervalDateEdited !== null) {
          var splitDate = this.endIntervalDateEdited.split('-');
        } else {
          return null;
        }
        if (splitDate.length != 2) {
          return null;
        }
        var year = splitDate[0];
        var month = splitDate[1];

        if (year.length != 4 || month.length < 1 || month.length > 2) {
          this.endIntervalDateEdited = null;
          return null;
        }
        this.tempEndIntervalDate = month + '/' + year;
        //TODO: send updated startInterval (given index back)

        window.EventBus.$emit(
          'update-end-interval-technology',
          this.technologyIndex,
          this.intervalIndex,
          this.endIntervalDateEdited
        );
      }
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
