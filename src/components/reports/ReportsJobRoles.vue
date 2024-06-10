<template>
  <div>
    <v-container fluid class="px-1 px-md-4">
      <v-row>
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <v-autocomplete
            id="employeesSearch"
            v-model="search"
            :customFilter="customEmployeeFilter"
            :items="employees"
            label="Search By Employee Name"
            variant="underlined"
            auto-select-first
            clearable
            item-title="text"
            item-value="value"
            @update:model-value="refreshDropdownItems()"
            @click:clear="
              search = null;
              refreshDropdownItems();
            "
          ></v-autocomplete>
        </v-col>
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <v-autocomplete
            v-model="jobRoleSearch"
            :items="jobRoles"
            label="Search By Job Role"
            variant="underlined"
            clearable
            auto-select-first
            @update:model-value="refreshDropdownItems()"
            @click:clear="jobRoleSearch = null"
          ></v-autocomplete>
        </v-col>
        <v-col v-if="userRoleIsAdmin() || userRoleIsManager()" cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <v-autocomplete
            clearable
            label="Filter by Tag (click to flip)"
            variant="underlined"
            v-model="selectedTags"
            :items="tags"
            multiple
            item-title="tagName"
            item-value="id"
            @update:model-value="refreshDropdownItems()"
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
        </v-col>
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <v-checkbox v-model="showInactiveEmployees" label="Show Inactive Users"></v-checkbox>
        </v-col>
      </v-row>

      <!-- START EMPLOYEE TABLE -->
      <v-data-table
        :headers="headers"
        :items="filteredEmployees"
        :sort-by="sortBy"
        :items-per-page="-1"
        class="elevation-1 row-pointer"
        @click:row="handleClick"
        @update:current-items="updateTableDownload($event)"
      >
        <!-- Employee Number Slot -->
        <template v-slot:[`item.employeeNumber`]="{ item }">
          <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
            {{ item.employeeNumber }}
          </p>
        </template>
        <!-- Full Name Item Slot -->
        <template v-slot:[`item.fullName`]="{ item }">
          <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
            {{ getFullName(item) }}
          </p>
        </template>
        <!-- Job Role Item Slot -->
        <template v-slot:[`item.jobRole`]="{ item }">
          <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
            {{ item.jobRole }}
          </p>
        </template>
        <!-- Email Name Item Slot -->
        <template v-slot:[`item.email`]="{ item }">
          <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
            {{ item.email }}
          </p>
        </template>
      </v-data-table>
      <!-- END EMPLOYEE TABLE -->
    </v-container>
  </div>
</template>

<script setup>
import _ from 'lodash';
import { userRoleIsAdmin, userRoleIsManager } from '@/utils/utils';
import { customEmployeeFilter, getActive, getFullName, populateEmployeesDropdown } from './reports-utils';
import { onMounted, ref, inject, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
const store = useStore();
const emitter = inject('emitter');
const router = useRouter();

// |--------------------------------------------------|
// |                                                  |
// |                       DATA                       |
// |                                                  |
// |--------------------------------------------------|
const employees = ref([]);
const employeesInfo = ref([]);
const filteredEmployees = ref([]);
const headers = ref([
  {
    title: 'Employee #',
    key: 'employeeNumber'
  },
  {
    title: 'Name',
    key: 'fullName'
  },
  {
    title: 'Job Role',
    key: 'jobRole'
  },
  {
    title: 'Email',
    key: 'email'
  }
]); // datatable headers
const jobRoleSearch = ref(null);
const jobRoles = ref([]);
const search = ref(null); // query text for datatable search field
const selectedTags = ref([]);
const showInactiveEmployees = ref(false);
const sortBy = ref([{ key: 'employeeNumber' }]); // sort datatable items
const tags = ref([]);
const tagFlip = ref([]);

// |--------------------------------------------------|
// |                                                  |
// |                LIFECYCLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * The created lifecycle hook.
 */
onMounted(() => {
  employeesInfo.value = getActive(store.getters.employees); // default to filtered list
  tags.value = store.getters.tags;
  filteredEmployees.value = employeesInfo.value; // one.value is shown
  populateDropdowns(employeesInfo.value);
  if (localStorage.getItem('requestedFilter')) {
    jobRoleSearch.value = localStorage.getItem('requestedFilter');
    refreshDropdownItems();
    localStorage.removeItem('requestedFilter');
  }

  // initial set of table download data
  updateTableDownload(filteredEmployees.value);
}); // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Returns the color that at tag filter chip should be
 *
 * @param id ID of the tag item
 *
 */
function chipColor(id) {
  return tagFlip.value.includes(id) ? 'red' : 'gray';
} // chipColor

/**
 * handles click event of the employee table entry
 *
 * @param item - the employee
 */
function handleClick(_, { item }) {
  router.push(`/employee/${item.employeeNumber}`);
} //handleClick

/**
 * negates a tag
 */
function negateTag(item) {
  // try to find the id in the tagFlip array, if it is there then remove it else add it
  const index = tagFlip.value.indexOf(item.id);
  if (index >= 0) {
    tagFlip.value.splice(index, 1);
  } else {
    tagFlip.value.push(item.id);
  }
} // negateTag

/**
 * Populates all job roles in the search dropdown.
 */
function populateJobRoleDropdown() {
  jobRoles.value = [];
  let employeeJobRoles = _.map(filteredEmployees.value, (employee) => employee.jobRole);
  employeeJobRoles = _.compact(employeeJobRoles);
  _.forEach(employeeJobRoles, (jobRole) => jobRoles.value.push(jobRole));
  jobRoles.value = new Set(jobRoles.value);
} // populateJobRoleDropdown

/**
 * Populate drop downs with information that other employees have filled out.
 *
 * @param employees - array of employees for dropdown and to get contracts
 */
function populateDropdowns(emps) {
  // refresh the employees autocomplete list to be those that match the query
  employees.value = populateEmployeesDropdown(emps);
  populateJobRoleDropdown(emps);
} // populateDropdowns

/**
 * Refresh the list based on the current queries
 */
function refreshDropdownItems() {
  filteredEmployees.value = employeesInfo.value;
  if (search.value) {
    filteredEmployees.value = _.filter(filteredEmployees.value, (employee) => {
      return employee.employeeNumber == search.value;
    });
  }
  if (jobRoleSearch.value) {
    searchJobRoles();
  }
  if (selectedTags.value.length > 0) {
    filteredEmployees.value = _.filter(filteredEmployees.value, (employee) => {
      return selectedTagsHasEmployee(employee);
    });
  }

  populateDropdowns(filteredEmployees.value);
} // refreshDropdownItems

/**
 * Removes an item from the tag filters's active filters
 *
 * @param item - The filter to remove
 */
function removeTag(item) {
  const selIndex = selectedTags.value.findIndex((t) => t.id === item.id);
  if (selIndex >= 0) {
    selectedTags.value.splice(selIndex, 1);
  }
} // remove

/**
 * Filters employees on the data table by the job role entered by the user.
 */
function searchJobRoles() {
  filteredEmployees.value = _.filter(employeesInfo.value, (employee) => {
    if (employee.jobRole) {
      return employee.jobRole.includes(jobRoleSearch.value);
    } else {
      return false;
    }
  });
  if (search.value) {
    // if there is a desired employee search then only show that employee
    filteredEmployees.value = _.filter(employeesInfo.value, (employee) => {
      return employee.employeeNumber == search.value;
    });
  }
} // searchJobRoles

/**
 * helper function: return true if any selected tag has employee listed under it.
 *
 * @param e - the employee
 * @return true if the employee has a tag selected in filters
 */
function selectedTagsHasEmployee(e) {
  let inTag, tagFlipped;
  for (let i = 0; i < selectedTags.value.length; i++) {
    inTag = selectedTags.value[i].employees.includes(e.id);
    tagFlipped = tagFlip.value.includes(selectedTags.value[i].id);
    if (inTag != tagFlipped) {
      return true;
    }
  }
  return false;
} // selectedTagsHasEmployee

/**
 * Emit new data for tab.value
 *
 * @param event the event data containing the table information
 */
function updateTableDownload(event) {
  emitter.emit('reports-table-update', { tab: 'jobRoles', table: event, headers: headers });
}

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Watches the showInactiveUsers to refilter the table as needed
 */
watch(showInactiveEmployees, () => {
  search.value = null;
  employeesInfo.value = store.getters.employees;
  if (!showInactiveEmployees.value) employeesInfo.value = getActive(employeesInfo.value);
  populateDropdowns(employeesInfo.value);
  refreshDropdownItems();
});

/**
 * In the case that the page has been force reloaded (and the store cleared)
 * watcher.value will be activated when the store is populated again.
 */
watch(tagFlip, () => {
  refreshDropdownItems();
});

/**
 * Remove items from tagFlip array when they are removed from the selected
 * tags
 */
watch(selectedTags, () => {
  let negatedTagRemoved = true;
  // use normal for loop to have the index
  for (let i = 0; i < tagFlip.value.length; i++) {
    // try to find the current tag in the selectedTags
    _.forEach(selectedTags.value, (t) => {
      if (t.id === tagFlip.value[i]) negatedTagRemoved = false;
    });
    // if it isn't there, remove it from tagFlip too
    if (negatedTagRemoved) {
      tagFlip.value.splice(i, 1);
    }
  }
  refreshDropdownItems();
});
</script>

<style lang="css" scoped>
.row-pointer :deep(tbody tr :hover) {
  cursor: pointer;
}
</style>

<style lang="scss" scoped>
@import 'src/assets/styles/styles';
.inactive {
  color: $case-red;
}
</style>
