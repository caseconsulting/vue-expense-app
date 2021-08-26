<template>
  <v-container fluid>
    <v-row class="mb-3">
      <h1>Audits</h1>
    </v-row>
    <v-row>
      <v-menu>
        <template v-slot:activator="{ on, attrs }">
          <v-btn text color="#bc3825" dark class="font-weight-bold" v-bind="attrs" v-on="on"
            >{{ selectedDropdown }}<v-icon class="pb-1">expand_more</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="selectDropDown('Resume Parser')">Resume Parser</v-list-item>
          <v-list-item @click="selectDropDown('Login')">Login</v-list-item>
          <v-list-item @click="selectDropDown('Mifi Status Changes')">Mifi Status Changes</v-list-item>
        </v-list>
      </v-menu>
    </v-row>
    <v-row class="mx-2 mb-2">
      <v-col cols="4">
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
      <v-col cols="2">
        <v-btn class="mt-3 ml-2" @click="setDateRange">Apply</v-btn>
      </v-col>
    </v-row>
    <v-card color="#bc3825">
      <v-card-title
        ><h2 class="white--text">{{ selectedDropdown }} Audits</h2>
      </v-card-title>
    </v-card>
    <resume-parser-audit-page
      v-if="selectedDropdown === 'Resume Parser'"
      :queryStartDate="auditsQueryFormatted.range[0]"
      :queryEndDate="auditsQueryFormatted.range[1]"
    ></resume-parser-audit-page>
    <login-audit-page
      v-if="selectedDropdown === 'Login'"
      :queryStartDate="auditsQueryFormatted.range[0]"
      :queryEndDate="auditsQueryFormatted.range[1]"
    ></login-audit-page>
    <mifi-log-audit
      v-if="selectedDropdown === 'Mifi Status Changes'"
      :queryStartDate="auditsQueryFormatted.range[0]"
      :queryEndDate="auditsQueryFormatted.range[1]"
    ></mifi-log-audit>
  </v-container>
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
  this.selectedDropdown = tab;
}

export default {
  components: {
    ResumeParserAuditPage,
    LoginAuditPage,
    MifiLogAudit
  },
  data() {
    return {
      selectedDropdown: 'Resume Parser',
      editedNumDaysBackToQuery: 1,
      numDaysBackToQuery: 1,
      numDaysBackRules: [(v) => v >= 0 || 'Number of days back cannot be negative'],
      auditsQuery: {
        range: [],
        showRangeMenu: false
      },
      auditsQueryFormatted: {
        range: [moment().subtract(1, 'd').format(), moment().format()]
      },
      requiredRules: [(v) => !isEmpty(v) || 'This field is required'] // rules for a required field
    };
  },
  methods: {
    setDateRange,
    formatRange,
    selectDropDown
  },
  watch: {
    editedNumDaysBackToQuery: function (val) {
      this.editedNumDaysBackToQuery = Number(val);
    }
  }
};
</script>

<style>
.clear {
  color: rgba(0, 0, 0, 0);
}
</style>
