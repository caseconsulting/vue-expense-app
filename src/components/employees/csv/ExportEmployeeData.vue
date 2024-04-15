<template>
  <!-- Download CSV Button -->
  <v-card>
    <!-- Modal Title -->
    <v-card-title class="d-flex align-center text-h5 header_style">Employee Export</v-card-title>
    <!-- Modal Content -->
    <v-card-text class="d-flex justify-center">
      <div class="w-75">
        <!-- EEO vs Employee export type -->
        <h3 class="mt-4">Export Type</h3>
        <v-radio-group :disabled="loading" hide-details v-model="exportType">
          <v-radio v-for="(t, i) in exportTypes" :key="i" :label="t.title" :value="t"></v-radio>
        </v-radio-group>

        <!-- Period selector -->
        <h3 class="cap-first mt-4">Report {{ exportType.periodType }}</h3>
        <v-select
          :disabled="loading"
          class="d-inline-block w-100"
          v-model="filters.period"
          :items="filterOptions[exportType.periodType]"
          item-title="text"
          item-value="value"
          variant="underlined"
        />

        <!-- Year selector -->
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

        <!-- Tag selector -->
        <h3 class="mt-4">Filter by tag</h3>
        <v-autocomplete
          :disabled="loading"
          clearable
          label="Filter by Tag (click to flip)"
          v-model="filters.tags"
          :items="filterOptions.tags"
          multiple
          variant="underlined"
          item-title="tagName"
          item-value="id"
          return-object
        >
          <template v-slot:selection="{ item }">
            <v-chip
              size="small"
              closable
              @click.stop
              @click="negateTag(item.raw)"
              @click:close="removeTag(item.raw)"
              :color="chipColor(item.raw.id)"
            >
              {{ tagFlip.includes(item.raw.id) ? 'NOT ' : '' }}
              {{ item.raw.tagName }}
            </v-chip>
          </template>
        </v-autocomplete>
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

<script>
import { isMobile, isSmallScreen } from '@/utils/utils';
import { getTodaysDate, format, subtract, isSameOrBefore, isSameOrAfter } from '../../../shared/dateUtils';
import _ from 'lodash';
const employeeCsv = require('@/utils/csv/employeeCsv.js');
const eeoCsv = require('@/utils/csv/eeoCsv.js');
const qbCsv = require('@/utils/csv/qbCsv.js');

// |--------------------------------------------------|
// |                                                  |
// |                     LIFECYCLE                    |
// |                                                  |
// |--------------------------------------------------|

/**
 * Created
 */
function created() {
  // fill in tag options
  this.filterOptions.tags = this.$store.getters.tags;

  // default export type
  this.exportType = this.exportTypes[0];

  // fill in year options
  let years = _.uniq(_.map(this.employees, (e) => format(e.hireDate, null, 'YYYY'))); // get unique hire dates
  years = _.orderBy(years, null, ['desc']); // sort
  years.push('All'); // add "All" to beginning
  this.filterOptions.year = years;

  // fill in month options (only current and previous)
  let lastMonth = subtract(getTodaysDate(), 1, 'month');
  let thisMonth = getTodaysDate();
  lastMonth = { text: format(lastMonth, null, 'MMMM'), value: format(lastMonth, null, 'YYYY-MM') };
  thisMonth = { text: format(thisMonth, null, 'MMMM'), value: format(thisMonth, null, 'YYYY-MM') };
  this.filterOptions.month.push(lastMonth);
  this.filterOptions.month.push(thisMonth);

  // allow loading messages
  this.emitter.on('update-export-employee-data-loading', (msg) => {
    this.loading = msg;
  });
}

/**
 * beforeUnmount lifecycle hook - close event listener
 */
function beforeUnmount() {
  this.emitter.off('update-export-employee-data-loading');
}

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to close modal
 */
function close() {
  this.emitter.emit(`close-employee-export`);
}

/**
 * Returns the color that at tag filter chip should be
 *
 * @param id ID of the tag item
 *
 */
function chipColor(id) {
  return this.tagFlip.includes(id) ? 'red' : 'gray';
} // chipColor

/**
 * Downloads employees as CSV
 */
async function download() {
  this.loading = true; // disable download button

  // filter CSV info
  let csvInfo = this.employees;
  csvInfo = this.filterEmployees(csvInfo);
<<<<<<< HEAD
  let yearText = this.filters.year;
  if (yearText == this.filterOptions.years[0]) yearText = getTodaysDate('YYYY');
=======
  if (csvInfo.length === 0) {
    this.status = 'Filters produce no employees. Operation cancelled.';
    this.loading = false;
    return;
  }
>>>>>>> 1de5d8d9 (POR-2537: qb csv download)

  // download from proper csv util
  let filename = `Download (${this.filters.period})`;
  let startDate, endDate;
  switch (this.exportType.value) {
    case 'emp':
      filename = `Employee Export - ${this.filters.period}`;
      employeeCsv.download(csvInfo, this.contracts, this.filterOptions.tags, filename);
      break;
    case 'eeo':
      filename = `EEO Compliance Report - ${this.filters.period}`;
      eeoCsv.download(csvInfo, filename);
      break;
    case 'qb':
      filename = `Timesheet Report - ${this.filters.period}`;
      startDate = this.filters.period;
      endDate = this.filters.period;
      this.loading = 'Downloading timesheets from QuickBooks...';
      await qbCsv.download(csvInfo, { filename, startDate, endDate });
      break;
    default:
      console.log('ERROR: No export type selected');
  }

  // close the modal
  this.loading = false;
  this.close();
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
  return _.filter(employees, (e) => {
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
  let f = this.filters;

  // return all employees that pass the filters
  return _.filter(employees, (e) => {
    // - YEAR FILTER -
    // remove employees that were hired after given year, or departed before given year
    if (f.period.value) f.period = f.period.value; // convert objects into normal
    if (f.period != 'All') {
      let hireYearValid = !!e.hireDate && isSameOrBefore(e.hireDate, f.period, this.exportType.periodType);
      let deptYearValid = !this.deptDate || isSameOrAfter(e.deptDate, f.period, this.exportType.periodType);
      if (!hireYearValid || !deptYearValid) return false;
    }

    // - TAG FILTER -
    // remove employees that do not have a given tag, or who do have a given negated tag
    let tag, tagHasEmployee;
    let employeeHasTag;
    for (let i = 0; i < f.tags.length; i++) {
      tag = f.tags[i];
      tagHasEmployee = tag.employees.includes(e.id);
      if (this.tagFlip.includes(tag.id) && !tagHasEmployee) employeeHasTag = true; // tag is negated and employee is on it
      if (!this.tagFlip.includes(tag.id) && tagHasEmployee) employeeHasTag = true; // tag is normal (not negated) and employee is not on it
      if (employeeHasTag) i = f.tags.length; // exit loop early if employee is on a tag
    }
    if (f.tags.length > 0 && !employeeHasTag) return false;

    // - STATUS FILTER -
    // remove employees that do not have the status
    let statusOpts = this.filterOptions.statuses; // ['Full Time', 'Part Time', 'Inactive']
    // mini function to map employee status (integer) to text used in form (string)
    let statusString = (s) => {
      if (s == 0) return statusOpts[2];
      else if (s == 100) return statusOpts[0];
      else return statusOpts[1];
    };
    // return false if status array does not include the employee's status
    if (!f.statuses.includes(statusString(e.workStatus))) return false;

    // passed all conditions, return this employee
    return true;
  });
}

/**
 * negates a tag
 */
function negateTag(item) {
  // try to find the id in the tagFlip array, if it is there then remove it else add it
  const index = this.tagFlip.indexOf(item.id);
  if (index >= 0) {
    this.tagFlip.splice(index, 1);
  } else {
    this.tagFlip.push(item.id);
  }
} // negateTag

/**
 * Removes an item from the tag filters's active filters
 *
 * @param item - The filter to remove
 */
function removeTag(item) {
  const selIndex = this.filters['tags'].findIndex((t) => t.id === item.id);
  if (selIndex >= 0) {
    this.filters['tags'].splice(selIndex, 1);
  }
} // remove

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
    emp: this.filterOptions.year[0],
    eeo: this.filterOptions.year[0],
    qb: this.filterOptions.month[0]
  };
  this.filters.period = defaults[this.exportType.value];
}

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  beforeUnmount,
  computed: {
    isMobile,
    isSmallScreen
  },
  data() {
    return {
      exportType: null,
      exportTypes: [
        { title: 'Employee Data', value: 'emp', periodType: 'year' },
        { title: 'EEO Data', value: 'eeo', periodType: 'year' },
        { title: 'Timesheet Data', value: 'qb', periodType: 'month' }
      ],
      tagFlip: [],
      filterOptions: {
        statuses: ['Full Time', 'Part Time', 'Inactive'], // order matters to filterEmployees() > status filter
        tags: null,
        year: [],
        month: []
      },
      filters: {
        statuses: ['Full Time', 'Part Time'],
        tags: [],
        period: 'All'
      },
      status: false,
      loading: false
    };
  },
  watch: {
    exportType: { handler: updatePeriodDefault, deep: true }
  },
  methods: {
    close,
    chipColor,
    download,
    filterDeclined,
    filterEmployees,
    negateTag,
    removeTag
  },
  props: ['employees', 'contracts']
};
</script>

<style scoped>
.download {
  font-size: 20px;
  cursor: pointer;
}
.cap-first,
.cap-first-children * {
  text-transform: capitalize;
}
</style>
