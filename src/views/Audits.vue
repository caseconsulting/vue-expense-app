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
            <template #activator="{ props }">
              <v-btn variant="text" theme="dark" class="font-weight-bold" v-bind="props">
                {{ selectedDropdown }}
                <v-icon>mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item v-if="selectedDropdown !== 'User Logins'" @click="selectDropDown('User Logins')">
                User Logins
              </v-list-item>
              <v-list-item v-if="selectedDropdown !== 'Resume Parser'" @click="selectDropDown('Resume Parser')">
                Resume Parser
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
      </v-row>
      <v-row>
        <!-- Data Picker for Query -->
        <v-col cols="8" xl="2" lg="2">
          <v-form ref="dateRange">
            <v-menu v-model="auditsQuery.showRangeMenu" :close-on-content-click="false">
              <template #activator="{ props }">
                <v-text-field
                  class="mt-0 ml-1 pt-0 pointer"
                  :model-value="formatRange(auditsQuery.range)"
                  label="Date Range"
                  readonly
                  variant="underlined"
                  clearable
                  prepend-icon="mdi-calendar"
                  v-bind="props"
                  :rules="requiredRules"
                  @click:clear="auditsQuery.range = []"
                />
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
              />
            </v-menu>
          </v-form>
        </v-col>
        <!-- Submit Button -->
        <v-col cols="1" class="d-flex align-center">
          <v-btn class="ml-2" @click="setDateRange()">
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
        :query-start-date="queryA"
        :query-end-date="queryB"
        :show24-hour-title="firstLoad"
      />
      <resume-parser-audits
        v-if="selectedDropdown === 'Resume Parser'"
        :key="reloader"
        :query-start-date="queryA"
        :query-end-date="queryB"
        :show24-hour-title="firstLoad"
      />
    </v-container>
  </v-card>
</template>

<script setup>
import ResumeParserAudits from '@/components/audits/ResumeParserAudits.vue';
import LoginAudits from '@/components/audits/LoginAudits.vue';
import _isEmpty from 'lodash/isEmpty';
import { storeIsPopulated } from '@/utils/utils';
import { updateStoreEmployees } from '@/utils/storeUtils';
import { isAfter, format, subtract, getTodaysDate } from '../shared/dateUtils';
import { useStore } from 'vuex';
import { ref, onBeforeMount } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SET UP                      |
// |                                                  |
// |--------------------------------------------------|

const store = useStore();
const auditsQuery = ref({
  range: [],
  showRangeMenu: false
});
const firstLoad = ref(true); // this is used to set chart titles to "last 24 hours" if a custom date range has not been set
const queryA = ref(subtract(getTodaysDate('YYYY-MM-DDTHH:mm:ssZ'), 1, 'd', 'YYYY-MM-DDTHH:mm:ssZ'));
const queryB = ref(getTodaysDate('YYYY-MM-DDTHH:mm:ssZ'));
const reloader = ref(0);
const requiredRules = ref([(v) => !_isEmpty(v) || 'This field is required']); // rules for a required field
const selectedDropdown = ref('User Logins');
const today = getTodaysDate();
const dateRange = ref(null);

// |--------------------------------------------------|
// |                                                  |
// |                LIFECYLCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * created lifecycle hook
 */
onBeforeMount(async () => {
  if (storeIsPopulated) {
    if (!store.getters.employees) {
      await updateStoreEmployees();
    }
  }
}); // created

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * sets the dateRange of the audits to get
 */
function setDateRange() {
  if (dateRange.value.validate()) {
    // Hide the calendar popup
    auditsQuery.value.showRangeMenu = false;

    // Temp variables
    let start = auditsQuery.value.range[0];
    let end = auditsQuery.value.range[1];
    // Flips date values if user selected end date and THEN selected start date
    // Then sets values to a date array which is passed to the parser audit page
    queryB.value = isAfter(start, end) ? format(start, null, 'YYYY-MM-DD') : format(end, null, 'YYYY-MM-DD');
    queryA.value = isAfter(start, end) ? format(end, null, 'YYYY-MM-DD') : format(start, null, 'YYYY-MM-DD');
    // Display chart titles with date ranges rather than 'last 24 hours'
    firstLoad.value = false;
    reloader.value++; // refreshes the charts
  }
} // setDateRange

/**
 * Format date range as 'DD/MM/YY' - 'DD/MM/YY' in chronological order.
 *
 * @param range - Array of String dates
 * @return String - 'DD/MM/YY' - 'DD/MM/YY' date range
 */
function formatRange(range) {
  if (_isEmpty(range)) {
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
  dateRange.value.reset();
  // Set query to last 24 hours
  this.auditsQueryFormatted = {
    range: [
      subtract(getTodaysDate('YYYY-MM-DDTHH:mm:ssZ'), 1, 'd', 'YYYY-MM-DDTHH:mm:ssZ'),
      getTodaysDate('YYYY-MM-DDTHH:mm:ssZ')
    ]
  };
  // Reset variable to show 'last 24 hours' chart title
  firstLoad.value = true;
  // Change the view to selected tab
  selectedDropdown.value = tab;
} // selectDropDown
</script>
