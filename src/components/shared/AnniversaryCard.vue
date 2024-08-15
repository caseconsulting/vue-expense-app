<template>
  <div>
    <!-- Anniversary Date -->
    <v-card>
      <v-row no-gutters class="pa-4">
        <v-col class="col-10">
          <v-card-title class="pa-0">
            <!-- display the next anniversary date -->
            <div v-if="viewingCurrentBudgetYear || location == 'home'">
              <p class="font-16 font-weight-bold">Anniversary Date: {{ getAnniversary }}</p>
              <div class="font-14">
                <div>Days Until: {{ getDaysUntil }}</div>
              </div>
            </div>
            <!-- Display the budget history year -->
            <div v-else>
              <p class="font-16 font-weight-bold">
                Viewing inactive budgets from {{ getFiscalYearView }} - {{ getFiscalYearView + 1 }}
              </p>
            </div>
          </v-card-title>
        </v-col>
        <v-col class="col-2 text-right" v-if="location != 'home'">
          <v-icon @click="changingBudgetView = !changingBudgetView" icon="mdi-history" />
        </v-col>
      </v-row>
    </v-card>
    <budget-select-modal
      v-if="location != 'home'"
      :toggleBudgetSelectModal="changingBudgetView"
      :budgetYears="budgetYears"
      :current="fiscalDateView"
      :hireDate="hireDate"
      :hasBudgets="hasBudgets"
    ></budget-select-modal>
  </div>
</template>

<script setup>
import BudgetSelectModal from '@/components/modals/BudgetSelectModal.vue';
import api from '@/shared/api.js';
import {
  add,
  DEFAULT_ISOFORMAT,
  difference,
  format,
  getTodaysDate,
  isAfter,
  ISO8601,
  isValid,
  setYear
} from '@/shared/dateUtils';
import { getCurrentBudgetYear } from '@/utils/utils';
import _filter from 'lodash/filter';
import _map from 'lodash/map';
import _reverse from 'lodash/reverse';
import _sortBy from 'lodash/sortBy';
import _uniqBy from 'lodash/uniqBy';
import { computed, inject, onBeforeMount, onBeforeUnmount, ref } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['employee', 'hasBudgets', 'location', 'emitCatcher']);
const emitter = inject(['emitter']);

const allUserBudgets = ref(null);
const budgetYears = ref([]);
const changingBudgetView = ref(false);
const hireDate = ref('');
const fiscalDateView = ref('');

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * created lifecycle hook
 */
onBeforeMount(async () => {
  await loadData();

  emitter.on('selected-budget-year', (date) => {
    if (date != fiscalDateView.value) {
      fiscalDateView.value = date;
      emitter.emit(`change-budget-year-${props.emitCatcher}`, date);
    }
  });
}); //created

/**
 * beforeUnmount lifecycle hook
 */
onBeforeUnmount(() => {
  emitter.off('selected-budget-year');
}); //beforeUnmount

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Viewing the current active budget year. Returns true if the budget year being viwed is todays budget.
 *
 * @return boolean - viewing the current active year budget
 */
const viewingCurrentBudgetYear = computed(() => {
  return fiscalDateView.value == getCurrentBudgetYear(hireDate.value);
}); // viewingCurrentBudgetYear

/**
 * Get the next anniversary date for the employee based on their hire date.
 *
 * @return String - next employee anniversary date (day of year, month, day, year)
 */
const getAnniversary = computed(() => {
  if (isValid(hireDate.value, DEFAULT_ISOFORMAT)) {
    // if valid date
    let now = getTodaysDate();
    let curYear = now.split('-')[0];

    if (isAfter(now, hireDate.value)) {
      // employee's hire date is before today
      let anniversary = setYear(hireDate.value, curYear);
      // employee's hire date is before today
      if (isAfter(add(now, 1, 'days'), anniversary)) {
        // employee's anniversary date has already occured this year
        anniversary = add(anniversary, 1, 'years');
        return format(anniversary, null, 'LL');
      } else {
        // employee's anniversary date still has to happen between now and the end of year
        return format(anniversary, null, 'LL');
      }
    } else {
      // employee's hire date is in the future
      return format(add(hireDate.value, 1, 'years'), null, 'LL');
    }
  } else {
    // TODO: Return something for invalid date
    return 'Ooops no anniversary, when did you start working here again?';
  }
}); // getAnniversary

/**
 * Get the days until the employee's next anniversary date.
 *
 * @return number - returns the number of days until next anniversary
 */
const getDaysUntil = computed(() => {
  if (!hireDate.value) return 0; // fail safe

  let now = getTodaysDate();
  let curYear = now.split('-')[0];

  let anniversary = setYear(hireDate.value, curYear);

  if (isAfter(now, hireDate.value)) {
    // employee's hire date is before today
    if (isAfter(add(now, 1, 'days'), anniversary)) {
      // employee's anniversary date has already occured this year
      anniversary = add(anniversary, 1, 'years');
    }
  } else {
    // employee's hire date is in the future
    anniversary = add(hireDate.value, 1, 'years');
  }

  return difference(anniversary, now, 'days');
}); // getDaysUntil

/**
 * Get the year for the employee budget year view.
 *
 * @return Int - year for budget year view
 */
const getFiscalYearView = computed(() => {
  let [year] = fiscalDateView.value.split('-');
  return parseInt(year);
}); // getFiscalYearView;

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * load the data and api call to get budgets
 */
async function loadData() {
  hireDate.value = format(props.employee.hireDate, [ISO8601, DEFAULT_ISOFORMAT], DEFAULT_ISOFORMAT);
  fiscalDateView.value = getCurrentBudgetYear(hireDate.value);
  allUserBudgets.value = await api.getEmployeeBudgets(props.employee.id);
  refreshBudgetYears();
} // loadData

/**
 * Refresh and sets the budget year view options for the employee.
 */
function refreshBudgetYears() {
  let tempBudgetYears = [];
  // push all employee budget years
  let budgetDates = _uniqBy(_map(allUserBudgets.value, 'fiscalStartDate'));
  budgetDates.forEach((date) => {
    const [year] = date.split('-');
    tempBudgetYears.push(parseInt(year));
  });
  // push active budget year
  let [currYear] = getCurrentBudgetYear(hireDate.value).split('-');
  tempBudgetYears.push(parseInt(currYear));
  // remove duplicate years and filter to include only active and previous years
  tempBudgetYears = _filter(_uniqBy(tempBudgetYears), (year) => {
    return parseInt(year) <= parseInt(currYear);
  });
  budgetYears.value = _reverse(_sortBy(tempBudgetYears)); // sort budgets from current to past
} // refreshBudgetYears
</script>
