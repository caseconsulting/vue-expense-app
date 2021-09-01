<template>
  <v-card>
    <!-- Red header title -->
    <v-card color="#bc3825">
      <v-card-title headline
        ><h2 class="white--text">{{ selectedDropdown }} Audits</h2>
      </v-card-title>
    </v-card>
    <v-container fluid>
      <!-- Drop down for selecting audit tabs -->
      <v-row>
        <v-col cols="2" align-self="center">
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn text color="#bc3825" dark class="font-weight-bold" v-bind="attrs" v-on="on"
                >{{ selectedDropdown }}<v-icon>expand_more</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item v-if="selectedDropdown !== 'Resume Parser'" @click="selectDropDown('Resume Parser')"
                >Resume Parser</v-list-item
              >
              <v-list-item v-if="selectedDropdown !== 'User Logins'" @click="selectDropDown('User Logins')"
                >User Logins</v-list-item
              >
              <v-list-item
                v-if="selectedDropdown !== 'Mifi Status Changes'"
                @click="selectDropDown('Mifi Status Changes')"
                >Mifi Status Changes</v-list-item
              >
            </v-list>
          </v-menu>
        </v-col>
      </v-row>
      <v-row>
        <!-- Data Picker for Query -->
        <v-col cols="2">
          <v-form ref="dateRange">
            <v-menu
              v-model="auditsQuery.showRangeMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  class="mt-0 ml-1 pt-0"
                  :value="formatRange(auditsQuery.range)"
                  label="Date Range"
                  prepend-icon="date_range"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                  clearable
                  @click:clear="auditsQuery.range = []"
                  :rules="requiredRules"
                ></v-text-field>
              </template>
              <v-date-picker v-model="auditsQuery.range" no-title type="date" range></v-date-picker>
            </v-menu>
          </v-form>
        </v-col>
        <!-- Submit Button -->
        <v-col cols="1">
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn class="mt-1 ml-2" @click="setDateRange" v-bind="attrs" v-on="on">Apply</v-btn>
            </template>
            <span>Show data from 12am on start date up to 12am on end date</span>
          </v-tooltip>
        </v-col>
      </v-row>
      <!-- Displays of Audit Data -->
      <resume-parser-audit-page
        v-if="selectedDropdown === 'Resume Parser'"
        :queryStartDate="auditsQueryFormatted.range[0]"
        :queryEndDate="auditsQueryFormatted.range[1]"
        :show24HourTitle="firstLoad"
      ></resume-parser-audit-page>
      <login-audit-page
        v-if="selectedDropdown === 'User Logins'"
        :queryStartDate="auditsQueryFormatted.range[0]"
        :queryEndDate="auditsQueryFormatted.range[1]"
        :show24HourTitle="firstLoad"
      ></login-audit-page>
      <mifi-log-audit
        v-if="selectedDropdown === 'Mifi Status Changes'"
        :queryStartDate="auditsQueryFormatted.range[0]"
        :queryEndDate="auditsQueryFormatted.range[1]"
        :show24HourTitle="firstLoad"
      ></mifi-log-audit>
    </v-container>
  </v-card>
</template>

<script>
import ResumeParserAuditPage from '@/components/audit pages/ResumeParserAuditPage.vue';
import LoginAuditPage from '@/components/audit pages/LoginAuditPage.vue';
import MifiLogAudit from '@/components/audit pages/MifiLogAudit.vue';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');
import _ from 'lodash';
import { isEmpty } from '@/utils/utils';

function setDateRange() {
  if (this.$refs.dateRange.validate()) {
    // Hide the calendar popup
    this.auditsQuery.showRangeMenu = false;

    // Temp variables
    let start = moment(this.auditsQuery.range[0]);
    let end = moment(this.auditsQuery.range[1]);
    // Flips date values if user selected end date and THEN selected start date
    // Then sets values to a date array which is passed to the parser audit page
    this.auditsQueryFormatted.range[1] = start.isAfter(end) ? start.format() : end.format();
    this.auditsQueryFormatted.range[0] = start.isAfter(end) ? end.format() : start.format();
    // Display chart titles with date ranges rather than 'last 24 hours'
    this.firstLoad = false;
  }
}

/**
 * Format date range as 'DD/MM/YY' - 'DD/MM/YY' in chronological order.
 *
 * @param range - Array of String dates
 * @return String - 'DD/MM/YY' - 'DD/MM/YY' date range
 */
function formatRange(range) {
  if (_.isEmpty(range)) {
    return null;
  }
  let start = moment(range[0], 'YYYY-MM-DD');
  if (range[1]) {
    // end date selected
    let end = moment(range[1], 'YYYY-MM-DD');
    if (start.isAfter(end)) {
      // start date is listed after end date
      return `${end.format('MM/DD/YY')} - ${start.format('MM/DD/YY')}`;
    } else {
      // start date is listed before end date
      return `${start.format('MM/DD/YY')} - ${end.format('MM/DD/YY')}`;
    }
  } else {
    // no end date selected
    return `${start.format('MM/DD/YY')} - Present`;
  }
} // formatRange

function selectDropDown(tab) {
  // Clear date query field
  this.$refs.dateRange.reset();
  // Set query to last 24 hours
  this.auditsQueryFormatted = {
    range: [moment().subtract(1, 'd').format(), moment().format()]
  };
  // Reset variable to show 'last 24 hours' chart title
  this.firstLoad = true;
  // Change the view to selected tab
  this.selectedDropdown = tab;
}

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    ResumeParserAuditPage,
    LoginAuditPage,
    MifiLogAudit
  },
  data() {
    return {
      auditsQuery: {
        range: [],
        showRangeMenu: false
      },
      auditsQueryFormatted: {
        range: [moment().subtract(1, 'd').format(), moment().format()]
      },
      firstLoad: true, // this is used to set chart titles to "last 24 hours" if a custom date range has not been set
      selectedDropdown: 'Resume Parser',
      requiredRules: [(v) => !isEmpty(v) || 'This field is required'] // rules for a required field
    };
  },
  methods: {
    isEmpty,
    setDateRange,
    formatRange,
    selectDropDown
  }
};
</script>

<style>
.clear {
  color: rgba(0, 0, 0, 0);
}
</style>
