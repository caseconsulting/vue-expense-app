<template>
  <div>
    <v-container fluid class="px-1 px-md-4">
      <v-row>
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <v-autocomplete
            id="employeesSearch"
            v-model="search"
            :custom-filter="employeeFilter"
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
            v-model="awardSearch"
            :items="awards"
            label="Search By Award"
            variant="underlined"
            clearable
            auto-select-first
            @update:model-value="refreshDropdownItems()"
            @click:clear="awardSearch = null"
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
        <!-- Awards Item Slot -->
        <template v-slot:[`item.awardNames`]="{ item }">
          <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
            {{ item.awardNames }}
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
import { onMounted, ref, inject, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import _ from 'lodash';
import { userRoleIsAdmin, userRoleIsManager } from '@/utils/utils';
<<<<<<< HEAD
import { employeeFilter } from '@/shared/filterUtils';
import { getActive, getFullName, populateEmployeesDropdown } from './reports-utils';
=======
import { customEmployeeFilter, getActive, getFullName, populateEmployeesDropdown } from './reports-utils';
const emitter = inject('emitter');
const store = useStore();
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
    title: 'Awards',
    key: 'awardNames'
  },
  {
    title: 'Email',
    key: 'email'
  }
]); // datatable headers
const awardSearch = ref(null);
const awards = ref([]);
const search = ref(null); // query text for datatable search field
const selectedTags = ref([]);
const showInactiveEmployees = ref(false);
const sortBy = ref([{ key: 'employeeNumber' }]); // sort datatable items
const tags = ref([]);
const tagFlip = ref([]);
>>>>>>> 6fbab3b3 (POR-2608: saving)

// |--------------------------------------------------|
// |                                                  |
// |                LIFECYCLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * The created lifecycle hook.
 */
onMounted(() => {
  emitter.on('get-employees-to-contact', (tab) => {
    if (tab === 'awards') {
      emitter.emit('list-of-employees-to-contact', filteredEmployees.value);
    }
  });
  employeesInfo.value = getActive(store.getters.employees); // default to filtered
  tags.value = store.getters.tags;
  filteredEmployees.value = employeesInfo.value; // this one is shown
  populateDropdowns(employeesInfo.value);
  buildAwardsColumns();
  if (localStorage.getItem('requestedFilter')) {
    awardSearch.value = localStorage.getItem('requestedFilter');
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
 * Gets all of the active awards for each employee and displays the column on the table.
 */
function buildAwardsColumns() {
  employeesInfo.value.forEach((currentEmp) => {
    if (currentEmp.awards) {
      let hasAward = false;
      let awards = '';
      currentEmp.awards.forEach((award) => {
        hasAward = true;
        awards += `${award.name} & `;
      });
      if (hasAward) {
        // remove & at the end
        awards = awards.slice(0, -2);
        currentEmp.awardNames = awards;
      }
    }
  });
} // buildAwardsColumns

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
 * Populates all awards in the search dropdown.
 */
function populateAwardsDropdown() {
  awards.value = [];
  _.forEach(filteredEmployees.value, (employee) =>
    _.forEach(employee.awards, (award) => {
      awards.value.push(award.name);
    })
  );
  awards.value = new Set(awards.value);
} // populateAwardsDropdown

/**
 * Populate drop downs with information that other employees have filled out.
 *
 * @param employees - array of employees for dropdown and to get contracts
 */
function populateDropdowns(employees) {
  // refresh the employees autocomplete list to be those that match the query
  employees.value = populateEmployeesDropdown(employees);
  populateAwardsDropdown(employees);
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
  if (awardSearch.value) {
    searchAwards();
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
 * Filters employees on the data table by the award entered by the user.
 */
function searchAwards() {
  filteredEmployees.value = _.filter(filteredEmployees.value, (employee) => {
    if (employee.awardNames) {
      return employee.awardNames.includes(awardSearch.value);
    } else {
      return false;
    }
  });
} // searchAwards

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
 * Emit new data for this tab
 *
 * @param event the event data containing the table information
 */
function updateTableDownload(event) {
  emitter.emit('reports-table-update', { tab: 'awards', table: event });
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
}); // watchShowInactiveUsers

/**
 * In the case that the page has been force reloaded (and the store cleared)
 * this watcher will be activated when the store is populated again.
 */
watch(tagFlip, () => {
  refreshDropdownItems();
}); // watchTagFlip

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
<<<<<<< HEAD
  this.refreshDropdownItems();
} // watchSelectedTags

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  data() {
    return {
      employees: [],
      employeesInfo: [],
      filteredEmployees: [],
      headers: [
        {
          title: 'Employee #',
          key: 'employeeNumber'
        },
        {
          title: 'Name',
          key: 'fullName'
        },
        {
          title: 'Awards',
          key: 'awardNames'
        },
        {
          title: 'Email',
          key: 'email'
        }
      ], // datatable headers
      awardSearch: null,
      awards: [],
      search: null, // query text for datatable search field
      selectedTags: [],
      showInactiveEmployees: false,
      sortBy: [{ key: 'employeeNumber' }], // sort datatable items
      sortDesc: false,
      tags: [],
      tagFlip: [],
      tagSearchString: ''
    };
  },
  methods: {
    buildAwardsColumns,
    chipColor,
    employeeFilter,
    getActive,
    getFullName,
    handleClick,
    negateTag,
    populateEmployeesDropdown,
    populateAwardsDropdown,
    populateDropdowns,
    refreshDropdownItems,
    removeTag,
    searchAwards,
    selectedTagsHasEmployee,
    updateTableDownload,
    userRoleIsAdmin,
    userRoleIsManager
  },
  watch: {
    showInactiveEmployees: watchShowInactiveUsers,
    tagFlip: { handler: watchTagFlip, deep: true },
    selectedTags: { handler: watchSelectedTags, deep: true }
  }
};
=======
  refreshDropdownItems();
}); // watchSelectedTags
>>>>>>> 6fbab3b3 (POR-2608: saving)
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
