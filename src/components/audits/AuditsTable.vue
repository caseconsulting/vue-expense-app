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
          :sort-by="sortBy"
          :search="search"
          class="elevation-1"
        ></v-data-table>
      </v-col>
    </v-row>
  </span>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { difference } from '../../shared/dateUtils';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|
const IsoFormat = 'MMMM Do YYYY, h:mm:ss a';
const props = defineProps(['audits']);

const headers = ref([
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
]); // datatable headers
const search = ref(null);
const sortBy = ref([{ key: 'dateCreated' }]);

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
 * @param shouldSortDesc - whether or not to flip the sort
 * @return array - the audits or sorted items
 */
function customDateSort(items, sortBy, shouldSortDesc) {
  if (!shouldSortDesc) {
    return props.audits;
  }

  if (sortBy[0] === 'dateCreated') {
    return items.sort((a, b) => {
      return shouldSortDesc[0]
        ? difference(a.dateCreated, b.dateCreated, 'second', IsoFormat)
        : difference(b.dateCreated, a.dateCreated, 'second', IsoFormat);
    });
  } else if (sortBy[0] === 'description' || sortBy[0] === 'employeeName') {
    return items.sort((a, b) => {
      return shouldSortDesc[0]
        ? a.description.localeCompare(b.description)
        : b.description.localeCompare(a.description);
    });
  }

  return props.audits;
} // customDateSort
</script>
