<template>
  <span>
    <h1 class="mx-2 mt-2">Audits</h1>
    <v-row class="pa-0">
      <v-col cols="12" xl="4" lg="4">
        <v-text-field
          id="employeesSearch"
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          variant="underlined"
          single-line
          hide-details
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-data-table
          :headers="headers"
          :items="audits"
          :custom-sort="customDateSort"
          :sort-by.sync="sortBy"
          :search="search"
          class="elevation-1"
        ></v-data-table>
      </v-col>
    </v-row>
  </span>
</template>

<script>
import { difference } from '../../shared/dateUtils';

const IsoFormat = 'MMMM Do YYYY, h:mm:ss a';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * variable sort for the date
 *
 * @param items - items to sort
 * @param sortBy - the things to sort by
 * @param sortDesc - whether or not to flip the sort
 * @return array - the audits or sorted items
 */
function customDateSort(items, sortBy, sortDesc) {
  if (!sortDesc) {
    return this.audits;
  }

  if (sortBy[0] === 'dateCreated') {
    return items.sort((a, b) => {
      return sortDesc[0]
        ? difference(a.dateCreated, b.dateCreated, 'second', IsoFormat)
        : difference(b.dateCreated, a.dateCreated, 'second', IsoFormat);
    });
  } else if (sortBy[0] === 'description' || sortBy[0] === 'employeeName') {
    return items.sort((a, b) => {
      return sortDesc[0] ? a.description.localeCompare(b.description) : b.description.localeCompare(a.description);
    });
  }

  return this.audits;
} // customDateSort

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  data() {
    return {
      headers: [
        {
          title: 'Event Date',
          key: 'dateCreated'
        },
        {
          title: 'Employee Name',
          key: 'employeeName'
        },
        {
          title: 'Description',
          key: 'description'
        }
      ], // datatable headers
      search: null,
      sortBy: [{ key: 'dateCreated' }],
      sortDesc: false
    };
  },
  props: ['audits'],
  methods: { customDateSort }
};
</script>
