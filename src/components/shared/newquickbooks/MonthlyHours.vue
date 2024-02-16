<template>
  <div>
    <v-row>
      <v-col order="1" cols="12" sm="12" md="6" lg="6" xl="6" xxl="6">
        <div class="d-flex justify-space-evenly align-center mb-1">
          <!-- JS % operator is remainder, not mod. Needed a workaround for negative numbers in @click -->
          <v-btn
            :disabled="isMonthly && month !== getMonth(getTodaysDate())"
            icon=""
            variant="text"
            size="large"
            density="compact"
            @click="month = (((month - 1) % 12) + 12) % 12"
          >
            <v-tooltip activator="parent" location="top">Previous Month</v-tooltip>
            <v-icon size="x-large"> mdi-arrow-left-thin </v-icon>
          </v-btn>
          <h3>{{ format(String(month + 1), 'M', 'MMMM') }}</h3>
          <v-btn
            :disabled="isMonthly && month === getMonth(getTodaysDate())"
            icon=""
            variant="text"
            size="large"
            density="compact"
            @click="month = (month + 1) % 12"
          >
            <v-tooltip activator="parent" location="top">Next Month</v-tooltip>
            <v-icon size="x-large"> mdi-arrow-right-thin </v-icon>
          </v-btn>
        </div>
        <timesheets-chart :completed="periodCompleted" :needed="periodTotalNeeded"></timesheets-chart>
      </v-col>
      <v-col :order="$vuetify.display.mdAndUp ? 2 : 3" cols="12" md="6" lg="6" xl="6" xxl="6">
        <h3 class="d-flex align-center mb-3 mt-1">
          <v-icon class="mr-2">mdi-book-open-variant-outline</v-icon>
          Monthly Details
        </h3>

        <div class="d-flex justify-space-between my-3">
          <div class="mr-3">Remaining</div>
          <div class="dotted-line"></div>
          <div class="ml-3">38h</div>
        </div>
        <div class="d-flex justify-space-between my-3">
          <div class="mr-3">Remaining Avg/Day</div>
          <div class="dotted-line"></div>
          <div class="text-red font-weight-bold ml-3">10.5h</div>
        </div>
        <div class="d-flex justify-space-between my-3">
          <div class="mr-3">Behind By</div>
          <div class="dotted-line"></div>
          <div class="text-red font-weight-bold ml-3">8h</div>
        </div>
        <div class="d-flex justify-space-between my-3">
          <div class="mr-3">Days Remaining</div>
          <div class="dotted-line"></div>
          <div class="ml-3">16</div>
        </div>
      </v-col>
      <v-col :order="$vuetify.display.mdAndUp ? 3 : 2" cols="12">
        <h3 class="d-flex align-center"><v-icon class="mr-2">mdi-briefcase-outline</v-icon>Monthly Job Codes</h3>
        <div
          v-for="[name, hoursWorked] in Object.entries(getTimeData)"
          :key="name"
          class="d-flex justify-space-between my-3"
        >
          <div class="mr-3">{{ name }}</div>
          <div class="dotted-line"></div>
          <div class="ml-3">{{ convertToHours(hoursWorked) }}h</div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import TimesheetsChart from '@/components/charts/custom-charts/TimesheetsChart.vue';
import _ from 'lodash';
import { getMonth, getTodaysDate, format } from '@/shared/dateUtils';

function created() {
  console.log(this.month);
  console.log(this.format(this.month.toString(), 'M', 'MMMM'));
}

function convertToHours(seconds) {
  return Number(seconds / 60 / 60)
    ?.toFixed(2)
    ?.replace(/[.,]00$/, ''); // removes decimals if a whole number
}

function getTimeData() {
  if (this.isMonthly) {
    return this.timesheets[this.month];
  } else {
    let timesheets = {};
    _.forEach(this.timesheets, (monthTimesheets) => {
      _.forEach(monthTimesheets, (duration, jobName) => {
        if (!timesheets[jobName]) timesheets[jobName] = 0;
        timesheets[jobName] += duration;
      });
    });
    return timesheets;
  }
}

function periodCompleted() {
  if (this.isMonthly) {
    return 160;
  } else {
    return 1508;
  }
}

function periodTotalNeeded() {
  if (this.isMonthly) {
    return 176;
  } else {
    return 2080;
  }
}

export default {
  components: {
    TimesheetsChart
  },
  computed: {
    getTimeData,
    periodCompleted,
    periodTotalNeeded
  },
  created,
  data() {
    return {
      isMonthly: true,
      month: getMonth(getTodaysDate())
    };
  },
  methods: {
    convertToHours,
    getMonth,
    getTodaysDate,
    format
  },
  props: ['timesheets']
};
</script>

<style scoped>
.dotted-line {
  height: 0.8em;
  background-image: linear-gradient(to right, rgb(210, 210, 210) 33%, rgba(184, 184, 184, 0) 0%);
  background-position: bottom;
  background-size: 7px 1px;
  background-repeat: repeat-x;
  flex-grow: 2;
}
</style>
