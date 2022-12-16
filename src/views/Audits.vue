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
              <v-list-item v-if="selectedDropdown !== 'User Logins'" @click="selectDropDown('User Logins')"
                >User Logins</v-list-item
              >
              <v-list-item v-if="selectedDropdown !== 'Resume Parser'" @click="selectDropDown('Resume Parser')"
                >Resume Parser</v-list-item
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
        <v-col cols="8" xl="2" lg="2">
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
              <v-date-picker v-model="auditsQuery.range" no-title type="date" range :max="today"></v-date-picker>
            </v-menu>
          </v-form>
        </v-col>
        <!-- Submit Button -->
        <v-col cols="1">
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn class="ml-2" @click="setDateRange" v-bind="attrs" v-on="on">Apply</v-btn>
            </template>
            <span>Show data from 12am on start date up to 12am on end date.</span>
          </v-tooltip>
        </v-col>
      </v-row>
      <login-audits
        v-if="selectedDropdown === 'User Logins'"
        :queryStartDate="queryA"
        :queryEndDate="queryB"
        :show24HourTitle="firstLoad"
      ></login-audits>
      <!-- Displays of Audit Data -->
      <resume-parser-audits
        v-if="selectedDropdown === 'Resume Parser'"
        :queryStartDate="queryA"
        :queryEndDate="queryB"
        :show24HourTitle="firstLoad"
        :key="reloader"
      ></resume-parser-audits>
      <mifi-log-audits
        v-if="selectedDropdown === 'Mifi Status Changes'"
        :queryStartDate="queryA"
        :queryEndDate="queryB"
        :show24HourTitle="firstLoad"
        :key="reloader"
      ></mifi-log-audits>
    </v-container>
  </v-card>
</template>

<script>
import ResumeParserAudits from '@/components/audits/ResumeParserAudits.vue';
import LoginAudits from '@/components/audits/LoginAudits.vue';
import MifiLogAudits from '@/components/audits/MifiLogAudits.vue';
const moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');
import _ from 'lodash';
import { storeIsPopulated } from '@/utils/utils';
import { updateStoreEmployees } from '@/utils/storeUtils';

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * sets the dateRange of the audits to get
 */
function setDateRange() {
  if (this.$refs.dateRange.validate()) {
    // Hide the calendar popup
    this.auditsQuery.showRangeMenu = false;

    // Temp variables
    let start = moment(this.auditsQuery.range[0]);
    let end = moment(this.auditsQuery.range[1]);
    // Flips date values if user selected end date and THEN selected start date
    // Then sets values to a date array which is passed to the parser audit page
    this.queryB = start.isAfter(end) ? start.format() : end.format();
    this.queryA = start.isAfter(end) ? end.format() : start.format();
    // Display chart titles with date ranges rather than 'last 24 hours'
    this.firstLoad = false;
    this.reloader++; // refreshes the charts
  }
} // setDateRange

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

/**
 * Selects which audit view to change to (Login, Mifi, Resume Parser)
 *
 * @param tab - the dropdown to select
 */
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
} // selectDropDown

// |--------------------------------------------------|
// |                                                  |
// |                LIFECYLCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * created lifecycle hook
 */
async function created() {
  if (this.storeIsPopulated) {
    if (!this.$store.getters.employees) {
      await this.updateStoreEmployees();
    }
  }
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * updates employees if they are not already populated, this happens if the user directly navigates to the audits page
 */
async function watchStoreIsPopulated() {
  if (!this.$store.getters.employees) {
    await this.updateStoreEmployees();
  }
} // watchStoreIsPopulated

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    LoginAudits,
    ResumeParserAudits,
    MifiLogAudits
  },
  computed: {
    storeIsPopulated
  },
  created,
  data() {
    return {
      auditsQuery: {
        range: [],
        showRangeMenu: false
      },
      firstLoad: true, // this is used to set chart titles to "last 24 hours" if a custom date range has not been set
      queryA: moment().subtract(1, 'd').format(),
      queryB: moment().format(),
      reloader: 0,
      requiredRules: [(v) => !_.isEmpty(v) || 'This field is required'], // rules for a required field
      selectedDropdown: 'User Logins',
      today: moment().format('YYYY-MM-DD')
    };
  },
  methods: {
    setDateRange,
    formatRange,
    selectDropDown,
    updateStoreEmployees
  },
  watch: {
    storeIsPopulated: watchStoreIsPopulated
  }
};
</script>