<template>
  <v-card>
    <!-- Red header title -->
    <v-card color="#bc3825">
      <v-card-title class="d-flex align-center header_style">
        <h2 class="text-white">{{ selectedDropdown }} Audits</h2>
      </v-card-title>
    </v-card>
    <v-container fluid class="px-0 px-md-4">
      <!-- Drop down for selecting audit tabs -->
      <v-row>
        <v-col cols="6" md="3" align-self="center">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn variant="text" color="#bc3825" theme="dark" class="font-weight-bold" v-bind="props">
                {{ selectedDropdown }}
                <v-icon>mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item v-if="selectedDropdown !== 'User Logins'" @click="selectDropDown('User Logins')"
                >User Logins</v-list-item
              >
              <v-list-item v-if="selectedDropdown !== 'Resume Parser'" @click="selectDropDown('Resume Parser')"
                >Resume Parser</v-list-item
              >
            </v-list>
          </v-menu>
        </v-col>
      </v-row>
      <v-row>
        <!-- Data Picker for Query -->
        <v-col cols="8" xl="2" lg="2">
          <v-form ref="dateRange">
            <v-menu v-model="auditsQuery.showRangeMenu" :close-on-content-click="false">
              <template v-slot:activator="{ props }">
                <v-text-field
                  class="mt-0 ml-1 pt-0 pointer"
                  :model-value="formatRange(auditsQuery.range)"
                  label="Date Range"
                  readonly
                  variant="underlined"
                  clearable
                  prepend-icon="mdi-calendar"
                  v-bind="props"
                  @click:clear="auditsQuery.range = []"
                  :rules="requiredRules"
                >
                </v-text-field>
              </template>
              <v-date-picker
                v-model="auditsQuery.range"
                :max="today"
                multiple
                show-adjacent-months
                hide-actions
                keyboard-icon=""
                color="#bc3825"
                title="Date Range"
              ></v-date-picker>
            </v-menu>
          </v-form>
        </v-col>
        <!-- Submit Button -->
        <v-col cols="1" class="d-flex align-center">
          <v-btn class="ml-2" @click="setDateRange">
            <v-tooltip activator="parent" location="top">
              Show data from 12am on start date up to 12am on end date.
            </v-tooltip>
            Apply
          </v-btn>
        </v-col>
      </v-row>
      <!-- Displays of Audit Data -->
      <login-audits
        v-if="selectedDropdown === 'User Logins'"
        :queryStartDate="queryA"
        :queryEndDate="queryB"
        :show24HourTitle="firstLoad"
      ></login-audits>
      <resume-parser-audits
        v-if="selectedDropdown === 'Resume Parser'"
        :queryStartDate="queryA"
        :queryEndDate="queryB"
        :show24HourTitle="firstLoad"
        :key="reloader"
      ></resume-parser-audits>
    </v-container>
  </v-card>
</template>

<script>
import ResumeParserAudits from '@/components/audits/ResumeParserAudits.vue';
import LoginAudits from '@/components/audits/LoginAudits.vue';
import _ from 'lodash';
import { storeIsPopulated } from '@/utils/utils';
import { updateStoreEmployees } from '@/utils/storeUtils';
import { isAfter, format, subtract, getTodaysDate } from '../shared/dateUtils';

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
    let start = this.auditsQuery.range[0];
    let end = this.auditsQuery.range[1];
    // Flips date values if user selected end date and THEN selected start date
    // Then sets values to a date array which is passed to the parser audit page
    this.queryB = isAfter(start, end) ? format(start, null, 'YYYY-MM-DD') : format(end, null, 'YYYY-MM-DD');
    this.queryA = isAfter(start, end) ? format(end, null, 'YYYY-MM-DD') : format(start, null, 'YYYY-MM-DD');
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
  let start = range[0];

  if (range[1]) {
    // end date selected
    let end = range[1];
    if (isAfter(range[0], range[1], 'day')) {
      // start date is listed after end date
      return `${format(end, null, 'MM/DD/YY')} - ${format(start, null, 'MM/DD/YY')}`;
    } else {
      // start date is listed before end date
      return `${format(start, null, 'MM/DD/YY')} - ${format(end, null, 'MM/DD/YY')}`;
    }
  } else {
    // no end date selected
    return `${format(start, null, 'MM/DD/YY')} - Present`;
  }
} // formatRange

/**
 * Selects which audit view to change to (Login, Resume Parser)
 *
 * @param tab - the dropdown to select
 */
function selectDropDown(tab) {
  // Clear date query field
  this.$refs.dateRange.reset();
  // Set query to last 24 hours
  this.auditsQueryFormatted = {
    range: [
      subtract(getTodaysDate('YYYY-MM-DDTHH:mm:ssZ'), 1, 'd', 'YYYY-MM-DDTHH:mm:ssZ'),
      getTodaysDate('YYYY-MM-DDTHH:mm:ssZ')
    ]
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
    ResumeParserAudits
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
      queryA: subtract(getTodaysDate('YYYY-MM-DDTHH:mm:ssZ'), 1, 'd', 'YYYY-MM-DDTHH:mm:ssZ'),
      queryB: getTodaysDate('YYYY-MM-DDTHH:mm:ssZ'),
      reloader: 0,
      requiredRules: [(v) => !_.isEmpty(v) || 'This field is required'], // rules for a required field
      selectedDropdown: 'User Logins',
      today: getTodaysDate()
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
