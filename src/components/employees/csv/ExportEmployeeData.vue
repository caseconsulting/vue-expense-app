<template>
  <!-- Download CSV Button -->
  <v-card>
    <!-- Modal Title -->
    <v-card-title class="d-flex align-center text-h5 header_style">Employee Export</v-card-title>
    <!-- Modal Content -->
    <v-card-text class="px-5 pa-md-4 mt-4">
      <v-row justify="center">
        <v-col>
          <!-- EEO vs Employee export type -->
          <h3>Export Type</h3>
          <v-radio-group v-model="exportType" inline>
            <v-radio label="Employee Data" value="employee"></v-radio>
            <v-radio label="EEO Data" value="eeo"></v-radio>
            <v-radio label="Both" value="both"></v-radio>
          </v-radio-group>

          <!-- Year selector -->
          <h3>Report Year</h3>
          <v-select
            class="d-inline-block w-75"
            label="Year"
            v-model="filters.year"
            :items="filterOptions.years"
            variant="underlined"
          ></v-select>
        </v-col>
        <v-col>
          <!-- EEO vs Employee export type -->
          <h3>Filter by tag</h3>
          <v-autocomplete
            clearable
            class="w-75"
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

          <!-- Year selector -->
          <h3>Filter by status</h3>
          <v-autocomplete
            class="w-75"
            label="Filter by status"
            v-model="filters.statuses"
            :items="filterOptions.statuses"
            multiple
            variant="underlined"
            chips
            closable-chips
          >
          </v-autocomplete>
        </v-col>
      </v-row>

      <br />

      <!-- Action Button (Close) -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="outlined" @click="download()"
          >Download <v-icon size="large">mdi-download</v-icon></v-btn
        >
        <v-btn color="grey-darken-3" variant="text" @click="close()"> Close </v-btn>
      </v-card-actions>
    </v-card-text>
  </v-card>
</template>

<script>
import { isMobile, isSmallScreen } from '@/utils/utils';
import dateUtils from '@/shared/dateUtils';
import _ from 'lodash';
const employeeCsv = require('@/utils/csv/employeeCsv.js');
const eeoCsv = require('@/utils/csv/eeoCsv.js');
const baseCsv = require('@/utils/csv/baseCsv.js');

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

  // fill in year options
  let years = _.uniq(_.map(this.employees, (e) => dateUtils.format(e.hireDate, null, 'YYYY'))); // get unique hire dates
  years = _.orderBy(years, null, ['desc']); // sort
  years.unshift(this.filters.year); // default value shouldn't have changed yet
  this.filterOptions.years = years;
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
function download() {
  // filter CSV info
  let csvInfo = this.employees;
  csvInfo = this.filterEmployees(csvInfo);
  let yearText = this.filters.year;
  if (yearText == this.filterOptions.years[0]) yearText = dateUtils.getTodaysDate('YYYY');

  // download from proper csv util
  let filename;
  if (this.exportType == 'employee') {
    filename = `Employee Export - ${this.filters.year}`;
    employeeCsv.download(csvInfo, this.contracts, this.filterOptions.tags, filename);
  } else if (this.exportType == 'eeo') {
    filename = `EEO Compliance Report - ${this.filters.year}`;
    eeoCsv.download(csvInfo, filename);
  } else {
    // get EEO and Employee CSV strings
    let emp = employeeCsv.fileString(csvInfo, this.contracts, this.filterOptions.tags, filename);
    let eeo = eeoCsv.fileString(csvInfo, filename);
    let csvText = [
      {
        name: 'Employee Export',
        csv: emp
      },
      {
        name: 'EEO Compliance Report',
        csv: eeo
      }
    ];
    filename = `CASE employee and EEO report (${this.filters.year})`;
    baseCsv.download(csvText, filename);
  }

  // close the modal
  this.close();
} // download

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
    if (f.year != this.filterOptions.years[0]) {
      let hireYearValid = !!e.hireDate && dateUtils.isSameOrBefore(e.hireDate, f.year, 'year');
      let deptYearValid = !this.deptDate || dateUtils.isSameOrAfter(e.deptDate, f.year, 'year');
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
    let statusOpts = this.filterOptions.statuses; // ['Active', 'Part Time', 'Inactive']
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
 * In the case that the page has been force reloaded (and the store cleared)
 * this watcher will be activated when the store is populated again.
 */
function watchTagFlip() {
  this.refreshDropdownItems();
} // watchTagFlip

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  computed: {
    isMobile,
    isSmallScreen
  },
  data() {
    return {
      exportType: 'employee',
      tagFlip: [],
      filterOptions: {
        statuses: ['Active', 'Part Time', 'Inactive'], // order matters to filterEmployees() > status filter
        tags: null,
        years: []
      },
      filters: {
        statuses: ['Active'],
        tags: [],
        year: 'Current'
      }
    };
  },
  watchers: {
    tagFlip: { handler: watchTagFlip, deep: true }
  },
  methods: {
    close,
    chipColor,
    download,
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
</style>
