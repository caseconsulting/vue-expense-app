<template>
  <!-- Download CSV Button -->
  <v-card>
    <!-- Modal Title -->
    <v-card-title class="d-flex align-center text-h5 header_style">Employee Export</v-card-title>
    <!-- Modal Content -->
    <v-card-text class="d-flex justify-center">
      <div class="w-100">
        <!-- EEO vs Employee export type -->
        <h3 class="mt-4">Export Type</h3>
        <v-radio-group :disabled="loading" hide-details v-model="exportType">
          <v-radio v-for="(t, i) in exportTypes" :key="i" :label="t.title" :value="t"></v-radio>
        </v-radio-group>

        <!-- Period selector -->
        <!-- <h3 :class="exportType?.periodType ? '' : 'disabled'" class="cap-first mt-4">
          Report {{ exportType?.periodType || 'Period' }}
        </h3>
        <v-select
          :disabled="loading || !exportType?.periodType"
          class="d-inline-block w-100"
          v-model="filters.period"
          :items="filterOptions[exportType?.periodType]"
          item-title="text"
          item-value="value"
          variant="underlined"
        /> -->

        <!-- Start date selector -->
        <h3 class="mt-4">Timeframe</h3>
        <v-row>
          <v-col>
            <date-picker v-model="filters.periodStart" label="Start Date" />
          </v-col>
          <v-col>
            <div>date: {{ filters.periodEnd }}</div>
            <date-picker v-model="filters.periodEnd" label="End Date" />
          </v-col>
        </v-row>

        <!-- Status selector -->
        <h3 class="mt-4">Filter by status</h3>
        <v-autocomplete
          :disabled="loading"
          label="Filter by status"
          v-model="filters.statuses"
          :items="filterOptions.statuses"
          multiple
          variant="underlined"
          chips
          closable-chips
        >
        </v-autocomplete>

        <!-- Employee Role selector -->
        <h3 class="mt-4">Filter by employee role</h3>
        <v-autocomplete
          :disabled="loading"
          label="Filter by employee role"
          v-model="filters.employeeRoles"
          :items="filterOptions.employeeRoles"
          multiple
          variant="underlined"
          chips
          closable-chips
        >
        </v-autocomplete>

        <!-- Tag selector -->
        <h3 class="mt-4">Filter by tag</h3>
        <tags-filter v-model="filters.tagsInfo"></tags-filter>
      </div>
    </v-card-text>

    <!-- Action Button (Close) -->
    <v-card-actions class="mb-2 mr-4">
      <v-spacer></v-spacer>
      <p class="mb-0 mr-2 w-50 text-end text-caption text-grey font-italic" v-if="typeof loading == 'string'">
        {{ loading }}
      </p>
      <p class="mb-0 mr-2 w-50 text-end text-caption text-red font-italic" v-else-if="typeof status == 'string'">
        {{ status }}
      </p>
      <v-btn :disabled="loading" color="primary" variant="outlined" @click="download()">
        Download <v-icon size="large">mdi-download</v-icon>
      </v-btn>
      <v-btn color="grey-darken-3" variant="text" @click="close()"> Close </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { getTodaysDate, format, startOf, endOf, subtract, isSameOrBefore, isSameOrAfter } from '@/shared/dateUtils';
import _uniq from 'lodash/uniq';
import _map from 'lodash/map';
import _orderBy from 'lodash/orderBy';
import _filter from 'lodash/filter';
import baseCsv from '@/utils/csv/baseCsv.js';
import employeeCsv from '@/utils/csv/employeeCsv.js';
import eeoCsv from '@/utils/csv/eeoCsv.js';
import qbCsv from '@/utils/csv/qbCsv.js';
import pptoCsv from '@/utils/csv/pptoCsv.js';
import TagsFilter from '@/components/shared/TagsFilter.vue';
import { ref, inject, onBeforeUnmount, watch, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { updateStoreContracts, updateStoreTags } from '@/utils/storeUtils';
import DatePicker from '@/components/shared/DatePicker.vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');
const props = defineProps(['employees']);
const store = useStore();
const exportType = ref(null);
const exportTypes = ref([
  { title: 'Employee Data', value: 'emp', periodType: 'year' },
  { title: 'EEO Data', value: 'eeo', periodType: 'year' },
  { title: 'Timesheet Data', value: 'qb', periodType: 'month' },
  { title: 'Planned PTO Data', value: 'ppto', periodType: null }
]);
const tagsInfo = ref({
  selected: [],
  flipped: []
});
const filterOptions = ref({
  statuses: ['Full Time', 'Part Time', 'Inactive'], // order matters to filterEmployees() -> status filter
  tagsInfo: null,
  year: [],
  month: [],
  employeeRoles: ['Admin', 'User', 'Manager', 'Intern']
});
const filters = ref({
  statuses: ['Full Time', 'Part Time'],
  tagsInfo: {
    selected: [],
    flipped: []
  },
  period: 'All',
  periodStart: startOf(getTodaysDate(), 'year', 'YYYY-MM-DD'),
  periodEnd: getTodaysDate('YYYY-MM-DD'),
  employeeRoles: ['Admin', 'User', 'Manager']
});
const status = ref(false);
const loading = ref(false);

/**
 * Created
 */
onBeforeMount(async () => {
  // fill in tag options
  await Promise.all([
    !store.getters.contracts ? updateStoreContracts() : '',
    !store.getters.tags ? updateStoreTags() : ''
  ]);
  filterOptions.value.tags = store.getters.tags;

  // default export type
  exportType.value = exportTypes.value[0];

  // fill in year options
  let years = _uniq(_map(props.employees, (e) => format(e.hireDate, null, 'YYYY'))); // get unique hire dates
  years = _orderBy(years, null, ['desc']); // sort
  years.push('All'); // add "All" to beginning
  filterOptions.value.year = years;

  // fill in month options (only current and previous)
  let lastMonth = subtract(getTodaysDate(), 1, 'month');
  let thisMonth = getTodaysDate();
  lastMonth = { text: format(lastMonth, null, 'MMMM'), value: format(lastMonth, null, 'YYYY-MM') };
  thisMonth = { text: format(thisMonth, null, 'MMMM'), value: format(thisMonth, null, 'YYYY-MM') };
  filterOptions.value.month.push(lastMonth);
  filterOptions.value.month.push(thisMonth);

  // allow loading messages
  emitter.on('update-export-employee-data-loading', (msg) => {
    loading.value = msg;
  });
});

// |--------------------------------------------------|
// |                                                  |
// |                     LIFECYCLE                    |
// |                                                  |
// |--------------------------------------------------|

/**
 * beforeUnmount lifecycle hook - close event listener
 */
onBeforeUnmount(() => {
  emitter.off('update-export-employee-data-loading');
});

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to close modal
 */
function close() {
  emitter.emit(`close-employee-export`);
}

/**
 * Downloads employees as CSV
 */
async function download() {
  loading.value = true; // disable download button

  // filter CSV info
  let csvInfo = props.employees;
  csvInfo = filterEmployees(csvInfo);
  if (csvInfo.length === 0) {
    status.value = 'Filters produce no employees. Operation cancelled.';
    loading.value = false;
    return;
  }

  // download from proper csv util
  let filename = `Download (${filters.value.period})`;
  let startDate, endDate;
  if (exportType.value.value === 'emp') {
    filename = `Employee Export - ${filters.value.period}`;
    employeeCsv.download(csvInfo, store.getters.contracts, filterOptions.value.tags, filename);
  } else if (exportType.value.value === 'eeo') {
    let eeo = eeoCsv.fileString(csvInfo);
    csvInfo = filterDeclined(csvInfo);
    let emp = employeeCsv.fileString(csvInfo, store.getters.contracts, filterOptions.value.tags, true);
    let csvText = [
      {
        name: 'EEO Compliance Report',
        csv: eeo
      },
      {
        name: 'Employee Info',
        csv: emp
      }
    ];
    filename = `EEO Compliance Report - ${filters.value.period}`;
    baseCsv.download(csvText, filename);
  } else if (exportType.value.value === 'qb') {
    filename = `Timesheet Report - ${filters.value.period}`;
    startDate = startOf(filters.value.period, 'month');
    endDate = endOf(filters.value.period, 'month');
    startDate = format(startDate, null, 'YYYY-MM-DD');
    endDate = format(endDate, null, 'YYYY-MM-DD');
    loading.value = 'Downloading timesheets from QuickBooks...';
    await qbCsv.download(csvInfo, { filename, startDate, endDate });
  } else if (this.exportType.value === 'ppto') {
    filename = `Planned PTO Report - as of ${getTodaysDate('YYYY-MM-DD')}`;
    await pptoCsv.download(csvInfo, { filename });
  }

  // close the modal
  loading.value = false;
  close();
} // download

/**
 * Filters through given employees, removing employees that have incomplete
 * data in their EEO form
 *
 * @param employees employees to filter through
 */
function filterDeclined(employees) {
  function nullOrUndefined(item) {
    return item == undefined || item == null;
  }
  return _filter(employees, (e) => {
    return (
      !nullOrUndefined(e.eeoGender) &&
      !nullOrUndefined(e.eeoJobCategory) &&
      !nullOrUndefined(e.eeoRaceOrEthnicity) &&
      !nullOrUndefined(e.eeoHispanicOrLatino) &&
      !nullOrUndefined(e.eeoHasDisability) &&
      !nullOrUndefined(e.eeoIsProtectedVeteran)
    );
  });
}

/**
 * Filters employees based on the form's information
 *
 * @input employees - employees to filter
 * @return filtered employees
 */
function filterEmployees(employees) {
  // shortcut filters variable
  let f = filters.value;

  // return all employees that pass the filters
  return _filter(employees, (e) => {
    // - YEAR FILTER -
    // remove employees that were hired after given year, or departed before given year
    let yearFilterExclusions = ['ppto']; // periodTypes to exclude
    if (f.period.value) f.period = f.period.value; // convert objects into normal
    if (f.period != 'All' && !yearFilterExclusions.includes(exportType.value.value)) {
      let hireYearValid = !!e.hireDate && isSameOrBefore(e.hireDate, f.period, exportType.value.periodType);
      let deptYearValid = !f.deptDate || isSameOrAfter(e.deptDate, f.period, exportType.value.periodType);
      if (!hireYearValid || !deptYearValid) return false;
    }

    // - STATUS FILTER -
    // remove employees that do not have the status
    let statusOpts = filterOptions.value.statuses; // ['Full Time', 'Part Time', 'Inactive']
    // mini function to map employee status (integer) to text used in form (string)
    let statusString = (s) => {
      if (s == 0) return statusOpts[2];
      else if (s == 100) return statusOpts[0];
      else return statusOpts[1];
    };
    // return false if status array does not include the employee's status
    if (!f.statuses.includes(statusString(e.workStatus))) return false;

    // - ROLE FILTER -
    // remove employees that are not in the given roles
    let lowercaseRoles = f.employeeRoles.map((role) => role.toLowerCase());
    if (!lowercaseRoles.includes(e.employeeRole)) {
      return false;
    }

    // - TAG FILTER -
    // remove employees that do not have a given tag, or who do have a given negated tag
    let tag, tagHasEmployee;
    let employeeHasTag;
    tagsInfo.value = f.tagsInfo;
    for (let i = 0; i < tagsInfo.value.selected.length; i++) {
      tag = tagsInfo.value.selected[i];
      tagHasEmployee = tag.employees.includes(e.id);
      if (tagsInfo.value.flipped.includes(tag.id) && !tagHasEmployee) employeeHasTag = true; // tag is negated and employee is on it
      if (!tagsInfo.value.flipped.includes(tag.id) && tagHasEmployee) employeeHasTag = true; // tag is normal (not negated) and employee is not on it
      if (employeeHasTag) i = tagsInfo.value.selected.length; // exit loop early if employee is on a tag
    }
    if (tagsInfo.value.selected.length > 0 && !employeeHasTag) return false;

    // passed all conditions, return this employee
    return true;
  });
}

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Changes the default report year to be whatever makes sense for
 * the report type
 */
function updatePeriodDefault() {
  // set default period value based on type of export
  let defaults = {
    emp: filterOptions.value.year[0],
    eeo: filterOptions.value.year[0],
    qb: filterOptions.value.month[0],
    ppto: filters.value.period
  };
  filters.value.period = defaults[exportType.value.value];
}

/**
 * exportType watcher
 */
watch(exportType, updatePeriodDefault, { deep: true });
</script>

<style scoped>
.disabled {
  opacity: 0.6;
}
.download {
  font-size: 20px;
  cursor: pointer;
}
.cap-first,
.cap-first-children * {
  text-transform: capitalize;
}
</style>
