<template>
  <v-card>
    <v-card-title class="header_style d-flex align-center justify-space-between">
      <span class="text-body-1 text-md-h5">Anniversaries in {{ format(date, DEFAULT_ISOFORMAT, 'MMMM YYYY') }}</span>
      <div>
        <v-btn variant="text" icon="" density="comfortable" :size="isMobile ? 'small' : 'large'">
          <v-tooltip activator="parent" location="top">Previous Month</v-tooltip>
          <v-icon @click="showPreviousMonth()" :size="isMobile ? 'large' : 'x-large'">mdi-arrow-left-thin</v-icon>
        </v-btn>
        <v-btn variant="text" icon="" class="mr-2" density="comfortable" :size="isMobile ? 'small' : 'large'">
          <v-tooltip activator="parent" location="top">Next Month</v-tooltip>
          <v-icon @click="showNextMonth()" :size="isMobile ? 'large' : 'x-large'">mdi-arrow-right-thin</v-icon>
        </v-btn>
      </div>
    </v-card-title>
    <v-card-text>
      <v-list>
        <div v-if="!anniversaries || anniversaries.length === 0" class="ml-7 my-4 text-body-1">
          There are no anniversaries this month!
        </div>
        <v-list-item
          v-for="anniversary in anniversaries"
          :key="anniversary.text"
          :ripple="false"
          inactive
          :lines="isMobile ? 'three' : 'one'"
          class="mt-2"
        >
          <template v-slot:prepend>
            <v-avatar>
              <v-icon :color="item.color">{{ item.icon }}</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title>{{ anniversary.date }}</v-list-item-title>
          <v-list-item-subtitle>{{ anniversary.text }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="gray darken-1" variant="text" @click="emit('close-anniversaries-modal')"> Close </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import _ from 'lodash';
import { DEFAULT_ISOFORMAT, add, difference, format, getMonth, getYear, subtract } from '@/shared/dateUtils';
import { isMobile } from '../../utils/utils';
import { setYear } from '../../shared/dateUtils';

// |--------------------------------------------------|
// |                                                  |
// |                LIFECYCLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

function created() {
  this.anniversaries = _.cloneDeep(this.item.events);
  this.date = format(this.item.date.split(' in ')[1], 'MMM YYYY', DEFAULT_ISOFORMAT);
}

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits a message.
 *
 * @param msg - Message to emit
 */
function emit(msg) {
  this.emitter.emit(msg);
} // emit

function isEmployeeAnniversaryMonth(employee) {
  if (getMonth(this.date) === getMonth(employee.hireDate)) {
    let hireDate = format(employee.hireDate, null, DEFAULT_ISOFORMAT);
    let anniversary = setYear(hireDate, getYear(this.date));
    let diff = difference(anniversary, hireDate, 'month');
    return diff >= 12;
  }

  return false;
}

function populateAnniversaries() {
  this.anniversaries = [];
  let activeEmployees = _.filter(this.$store.getters.employees, (e) => e.workStatus > 0);
  _.forEach(activeEmployees, (e) => {
    if (this.isEmployeeAnniversaryMonth(e)) {
      let hireDate = format(e.hireDate, null, DEFAULT_ISOFORMAT);
      let anniversary = setYear(hireDate, getYear(this.date));
      let yearsDiff = difference(anniversary, hireDate, 'year');
      console.log(yearsDiff);
      let employeeAnniversaryObj = {
        text: `${e.nickname || e.firstName} ${e.lastName} is celebrating ${yearsDiff} ${
          yearsDiff > 1 ? 'years' : 'year'
        } at CASE!`,
        anniversary: anniversary,
        icon: `mdi-party-popper`,
        date: format(anniversary, null, 'll'),
        color: this.caseRed
      };
      this.anniversaries.push(employeeAnniversaryObj);
    }
  });
  this.anniversaries.sort((a, b) => new Date(a.anniversary) - new Date(b.anniversary));
}

function showPreviousMonth() {
  this.date = subtract(this.date, 1, 'month', DEFAULT_ISOFORMAT);
  this.populateAnniversaries();
}

function showNextMonth() {
  this.date = add(this.date, 1, 'month', DEFAULT_ISOFORMAT);
  this.populateAnniversaries();
}

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  data() {
    return {
      date: null,
      anniversaries: null
    };
  },
  computed: {
    isMobile
  },
  methods: {
    emit,
    isEmployeeAnniversaryMonth,
    populateAnniversaries,
    showPreviousMonth,
    showNextMonth,
    format
  },
  props: [
    'item' // the passed event item
  ]
};
</script>
