<template>
  <div>
    <v-container fluid class="px-1 px-md-4">
      <v-row>
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-2 py-0">
          <v-autocomplete
            id="employeesSearch"
            v-model="search"
            :custom-filter="employeeFilter"
            :items="employees"
            label="Search By Employee Name"
            variant="underlined"
            auto-select-first
            clearable
            hide-details
            item-title="text"
            item-value="value"
            @update:model-value="refreshDropdownItems()"
            @click:clear="
              search = null;
              refreshDropdownItems();
            "
          ></v-autocomplete>
        </v-col>
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-2 py-0">
          <v-autocomplete
            v-model="technologySearch"
            :items="technologies"
            label="Search By Technology"
            variant="underlined"
            clearable
            hide-details
            auto-select-first
            @update:model-value="refreshDropdownItems()"
            @click:clear="technologySearch = null"
          ></v-autocomplete>
        </v-col>
        <v-col v-if="userRoleIsAdmin() || userRoleIsManager()" cols="6" xl="3" lg="3" md="3" sm="6" class="my-2 py-0">
          <tags-filter v-model="tagsInfo" @update:modelValue="refreshDropdownItems()"></tags-filter>
        </v-col>
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-2 py-0">
          <v-checkbox v-model="showAllTechnologies" hide-details label="Show All Technologies"></v-checkbox>
        </v-col>
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-2 py-0">
          <v-checkbox v-model="showInactiveEmployees" hide-details label="Show Inactive Users"></v-checkbox>
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
        <!-- Technology Item Slot -->
        <template v-slot:[`item.technologyNames`]="{ item }">
          <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
            {{ item.technologyNames }}
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
import _forEach from 'lodash/forEach';
import _filter from 'lodash/filter';
import { employeeFilter } from '@/shared/filterUtils';
import { getActive, getFullName, populateEmployeesDropdown } from './reports-utils';
import { onMounted, ref, inject, watch, defineProps } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { selectedTagsHasEmployee } from '@/shared/employeeUtils';
import { userRoleIsAdmin, userRoleIsManager } from '@/utils/utils';
import TagsFilter from '@/components/shared/TagsFilter.vue';
const store = useStore();
const emitter = inject('emitter');
const router = useRouter();
const props = defineProps(['requestedFilter', 'name']);

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
    title: 'All Technologies',
    key: 'technologyNames'
  },
  {
    title: 'Email',
    key: 'email'
  }
]); // datatable headers
const technologySearch = ref(null);
const technologies = ref([]);
const search = ref(null); // query text for datatable search field
const showAllTechnologies = ref(true);
const showInactiveEmployees = ref(false);
const sortBy = ref([{ key: 'employeeNumber' }]); // sort datatable items
const tagsInfo = ref({
  selected: [],
  flipped: []
});

// |--------------------------------------------------|
// |                                                  |
// |                LIFECYCLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * The created lifecycle hook.
 */
onMounted(() => {
  employeesInfo.value = getActive(store.getters.employees); // default to filtered
  filteredEmployees.value = employeesInfo.value; // one.value is shown
  populateDropdowns(employeesInfo.value);
  buildTechnologiesColumns();
  if (props.requestedFilter && props.requestedFilter.tab === props.name) {
    technologySearch.value = props.requestedFilter.search;
    refreshDropdownItems();
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
 * Gets all of the active technologies for each employee and displays the column on the table.
 */
function buildTechnologiesColumns() {
  employeesInfo.value.forEach((currentEmp) => {
    if (currentEmp.technologies) {
      let techs = '';
      currentEmp.technologies.forEach((tech) => {
        if (showAllTechnologies.value || tech.current) {
          techs += `${tech.name} & `;
        }
      });
      if (techs.length > 0) {
        // remove & at the end
        techs = techs.slice(0, -2);
        currentEmp.technologyNames = techs;
      }
    }
  });
} // buildTechnologiesColumns

/**
 * handles click event of the employee table entry
 *
 * @param item - the employee
 */
function handleClick(_, { item }) {
  router.push(`/employee/${item.employeeNumber}`);
} //handleClick

/**
 * Populates all technologies in the search dropdown.
 */
function populateTechnologiesDropdown() {
  technologies.value = [];
  _forEach(filteredEmployees.value, (employee) =>
    _forEach(employee.technologies, (tech) => {
      if (showAllTechnologies.value || tech.current) {
        technologies.value.push(tech.name);
      } else {
        let t = technologies.value.findIndex((t) => t === tech.name);
        if (t != -1) {
          technologies.value.splice(t, 1);
        }
      }
    })
  );
  technologies.value = Array.from(new Set(technologies.value));
} // populateTechnologiesDropdown

/**
 * Populate drop downs with information that other employees have filled out.
 *
 * @param employees - array of employees for dropdown and to get contracts
 */
function populateDropdowns(emps) {
  // refresh the employees autocomplete list to be those that match the query
  employees.value = populateEmployeesDropdown(emps);
  populateTechnologiesDropdown(emps);
} // populateDropdowns

/**
 * Refresh the list based on the current queries
 */
function refreshDropdownItems() {
  filteredEmployees.value = employeesInfo.value;
  if (search.value) {
    filteredEmployees.value = _filter(filteredEmployees.value, (employee) => {
      return employee.employeeNumber == search.value;
    });
  }
  if (technologySearch.value) {
    searchTechnologies();
  }
  if (tagsInfo.value.selected.length > 0) {
    filteredEmployees.value = _filter(filteredEmployees.value, (employee) => {
      return selectedTagsHasEmployee(employee.id, tagsInfo.value);
    });
  }

  populateDropdowns(filteredEmployees.value);
} // refreshDropdownItems

/**
 * Filters employees on the data table by the technology entered by the user.
 */
function searchTechnologies() {
  filteredEmployees.value = _filter(employeesInfo.value, (employee) => {
    if (employee.technologyNames) {
      if (employee.technologyNames.includes('&')) {
        return employee.technologyNames.split(' & ').find((t) => t.trim() === technologySearch.value);
      } else {
        return employee.technologyNames.trim() === technologySearch.value;
      }
    } else {
      return false;
    }
  });
  if (search.value) {
    // if there is a desired employee search then only show that employee
    filteredEmployees.value = _filter(employeesInfo.value, (employee) => {
      return employee.employeeNumber == search.value;
    });
  }
} // searchTechnologies

/**
 * Emit new data for tab.value
 *
 * @param event the event data containing the table information
 */
function updateTableDownload(event) {
  emitter.emit('reports-table-update', { tab: 'technologies', table: event, headers: headers });
}

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Watches the showAllTechnologies to refilter the table as needed
 */
watch(showAllTechnologies, () => {
  populateDropdowns(employeesInfo.value);
  buildTechnologiesColumns();
  refreshDropdownItems();
  if (showAllTechnologies.value) {
    headers.value[2].title = 'All Technologies';
  } else {
    headers.value[2].title = 'Current Technologies';
  }
});

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
</script>

<style lang="css" scoped>
.row-pointer :deep(tbody tr :hover) {
  cursor: pointer;
}
</style>

<style lang="scss" scoped>
@use '@/assets/styles/styles' as *;
.inactive {
  color: $case-red;
}
</style>
