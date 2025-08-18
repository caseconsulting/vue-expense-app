<template>
  <div>
    <v-container fluid class="px-1 px-md-4">
      <v-row>
        <!-- employee name filter -->
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <v-autocomplete
            id="employeesSearch"
            v-model="employeeSearch"
            :custom-filter="employeeFilter"
            :items="dropdownEmployees"
            item-title="text"
            item-value="text"
            label="Search By Employee Name"
            variant="underlined"
            auto-select-first
            clearable
            @update:model-value="refreshDropdowns()"
            @click:clear="
              employeeSearch = null;
              refreshDropdowns();
            "
          />
        </v-col>

        <!-- education name filter -->
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <v-autocomplete
            v-model="educationsSearch"
            :items="dropdownEducations"
            item-title="name"
            item-value="name"
            label="Search By Education"
            variant="underlined"
            clearable
            auto-select-first
            @update:model-value="refreshDropdowns()"
            @click:clear="
              educationsSearch = null;
              refreshDropdowns();
            "
          />
        </v-col>

        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <v-autocomplete
            v-model="selectedDisplayType"
            :items="DISPLAY_TYPES"
            label="Filter by Type"
            variant="underlined"
            clearable
            auto-select-first
            @update:model-value="refreshDropdowns()"
            @click:clear="
              selectedDisplayType = 'None';
              refreshDropdowns();
            "
          />
        </v-col>

        <!-- tags filter -->
        <v-col v-if="userRoleIsAdmin() || userRoleIsManager()" cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <tags-filter v-model="tagFilters" @update:modelValue="refreshDropdowns()" />
        </v-col>

        <!-- show inactive employees -->
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <v-checkbox v-model="showInactiveEmployees" label="Show Inactive Users" />
        </v-col>

        <!-- only show employees with nonzero educations -->
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <v-checkbox v-model="onlyNonemptyEducations" label="At least one education" />
        </v-col>
      </v-row>

      <!-- START EMPLOYEE TABLE -->
      <v-data-table
        :headers="headers"
        :items="tableEmployees"
        :sort-by="sortBy"
        :items-per-page="-1"
        class="elevation-1 row-pointer"
        @click:row="handleClick"
        @update:current-items="updateTableInfo($event)"
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

        <!-- Educations Item Slot -->
        <template v-slot:[`item.eduNames`]="{ item }">
          <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
            {{ item.eduNames }}
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
import TagsFilter from '@/components/shared/TagsFilter.vue';
import { selectedTagsHasEmployee } from '@/shared/employeeUtils';
import { employeeFilter } from '@/shared/filterUtils';
import { userRoleIsAdmin, userRoleIsManager } from '@/utils/utils';
import _filter from 'lodash/filter';
import _sortBy from 'lodash/sortBy';
import _sortedUniqBy from 'lodash/sortedUniqBy';
import { computed, inject, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { getActive, getFullName } from './reports-utils';
const emitter = inject('emitter');
const store = useStore();
const router = useRouter();

// Useful for type-aware code completion:

/** @typedef {import('../../shared/models/employeeTypes').Employee} Employee */
/** @typedef {import('../../shared/models/employeeTypes').Education} Education */
/** @typedef {{ title: string, key: string }} DataTableHeader */

/**
 * DropdownEmployee extends Employee with the text and value properties
 * @typedef {Employee & { text: string, value: string }} DropdownEmployee
 */

/**
 * DropdownEducation extends Education with the text and value properties
 * @typedef {Education & { text: string, value: string }} DropdownEducation
 */

// |--------------------------------------------------|
// |                                                  |
// |                       DATA                       |
// |                                                  |
// |--------------------------------------------------|

/**
 * Data table headers
 * @type import('vue').Ref<DataTableHeader[]>
 */
const headers = ref([
  { title: 'Employee #', key: 'employeeNumber' },
  { title: 'Name', key: 'fullName' },
  { title: 'Education Name', key: 'eduNames' },
  { title: 'Email', key: 'email' }
]);

/**
 * List of all active employees. Do not remove from this list
 * @type import('vue').Ref<Employee[]>
 * */
const allEmployees = ref([]);

/**
 * List of employees displayed in dropdown
 * @type import('vue').Ref<DropdownEmployee[]>
 * */
const dropdownEmployees = ref([]);

/**
 * List of employees displayed in data table
 * @type import('vue').Ref<Employee[]>
 * */
const tableEmployees = ref([]);

/**
 * List of all educations in dropdownEmployees, without duplicates
 * @type import('vue').ComputedRef<Education[]>
 */
const allEducations = computed(() => {
  // computed is fine here bc the value is cached until dependencies change
  let edus = [];

  // grab every education
  dropdownEmployees.value.forEach((emp) => {
    emp.education?.forEach((edu) => {
      // military doesn't have a name property, for consistency we'll define it as the branch name
      if (edu.type === 'military') edu.name = edu.branch;
      edus.push(edu);
    });
  });

  // only unique items
  return _sortedUniqBy(
    _sortBy(edus, (edu) => edu.name.toLowerCase()),
    'name'
  );
});

/**
 * List of educations displayed in dropdown
 * @type import('vue').Ref<DropdownEducation[]>
 */
const dropdownEducations = ref([]);

// SEARCH SETTINGS:

/**
 * Current search input to filter employees
 @type import('vue').Ref<string>
 */
const employeeSearch = ref(null);

/**
 * Current search input to filter educations
 * @type import('vue').Ref<string>
 */
const educationsSearch = ref(null);

/** @type import('vue').Ref<boolean> */
const showInactiveEmployees = ref(false);

/** @type import('vue').Ref<boolean> */
const onlyNonemptyEducations = ref(false);

/**
 * Sort datatable by these keys
 * @type import('vue').Ref<DataTableHeader[]>
 */
const sortBy = ref([{ key: 'employeeNumber' }]);

const DISPLAY_TYPES = ['None', 'University', 'Military', 'High School'];
// maps displayed education types to their model value
const TYPE_MAP = { None: 'none', University: 'university', Military: 'military', 'High School': 'highSchool' };

// currently selected display type in dropdown
const selectedDisplayType = ref('None');
// currently selected education type in its model form
const filterType = computed(() => TYPE_MAP[selectedDisplayType.value]);

const tagFilters = ref({
  selected: [],
  flipped: []
});

// |--------------------------------------------------|
// |                                                  |
// |                LIFECYCLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

onMounted(() => {
  allEmployees.value = getActive(store.getters.employees); // get all employees

  // load education name filter from local storage, if it exists
  if (localStorage.getItem('requestedFilter')) {
    educationsSearch.value = localStorage.getItem('requestedFilter');
    localStorage.removeItem('requestedFilter');
  }

  refreshDropdowns();

  // initial set of table download data
  updateTableInfo(tableEmployees.value);
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets all of the active educations for each employee and displays the column on the table.
 */
function buildEducationColumns() {
  allEmployees.value.forEach((/** @type Employee */ emp) => {
    if (emp.education) {
      let edus = [];

      emp.education.forEach((/** @type Education */ edu) => {
        // if filter not specified, add unconditionally. else use filter
        if (filterType.value === 'none' || edu.type === filterType.value) {
          if (edu.type === 'military') {
            edus.push(edu.branch);
          } else {
            edus.push(edu.name);
          }
        }
      });

      emp.eduNames = edus.join(' & ');
    }
  });
}

/**
 * Handles click event of the employee table entry
 *
 * @param item - the employee
 */
function handleClick(_, { item }) {
  router.push(`/employee/${item.employeeNumber}`);
}

/**
 * Recalculates items in all dropdown lists
 */
function refreshDropdowns() {
  // refresh employee dropdown
  dropdownEmployees.value = _filter(allEmployees.value, (/** @type Employee */ emp) => {
    // employee name filter
    let nameMatches = true;
    if (employeeSearch.value) {
      nameMatches = getFullName(emp).includes(employeeSearch.value);
    }

    // tags filter
    let tagsMatch = true;
    if (tagFilters.value.selected.length > 0 || tagFilters.value.flipped.length > 0) {
      tagsMatch = selectedTagsHasEmployee(emp.id, tagFilters.value);
    }

    return nameMatches && tagsMatch;
  });

  // add text and value properties
  dropdownEmployees.value = dropdownEmployees.value.map((emp) => {
    return {
      ...emp,
      text: getFullName(emp),
      value: emp.employeeNumber.toString()
    };
  });

  // sort by name
  dropdownEmployees.value = _sortBy(dropdownEmployees.value, (emp) => emp.text.toLowerCase());

  // refresh education dropdown. must be done after employee dropdown bc allEducations depends on dropdownEmployees
  dropdownEducations.value = _filter(allEducations.value, (/** @type Education */ edu) => {
    let nameMatches = !educationsSearch.value; // name matches via not specifying filter
    let typeMatches = filterType.value === 'none'; // type matches via not specifying filter

    // i.e. if name search IS specified
    if (!nameMatches) {
      nameMatches = edu.name.includes(educationsSearch.value);
    }

    // i.e. if type fitler is not none
    if (!typeMatches) {
      typeMatches = edu.type === filterType.value;
    }

    return nameMatches && typeMatches;
  });

  dropdownEducations.value = dropdownEducations.value.map((edu) => {
    if (edu.type === 'military') edu.name = edu.branch;
    return edu;
  });

  // dropdownEducations comes from allEducations which is sorted. items only ever get filtered out, not added, so it should be sorted already
  dropdownEducations.value = _sortedUniqBy(dropdownEducations.value, 'name');

  refreshTable();
}

/**
 * Recaulcates employees displayed in the table
 */
function refreshTable() {
  tableEmployees.value = _filter(allEmployees.value, (/**@type Employee */ emp) => {
    // employee name filter
    let nameMatches = true;
    if (employeeSearch.value) {
      nameMatches = getFullName(emp).includes(employeeSearch.value);
    }

    // at least one education checkbox
    let hasEdus = true;
    if (onlyNonemptyEducations.value) {
      hasEdus = emp.education && emp.education.length > 0;
    }

    // education filters
    // These default to true if no filters are specified, bc we want to include all entries.
    // If filters are specified, they default to false and become true if they match the filters.
    let eduNameMatches = !educationsSearch.value;
    let eduTypeMatches = filterType.value === 'none';
    emp.education?.forEach((edu) => {
      if (!eduNameMatches) {
        // include employee in table if at least one name matches
        if (edu.name.includes(educationsSearch.value)) eduNameMatches = true;
      }

      if (!eduTypeMatches) {
        // similarly, if at least one type matches
        if (edu.type === filterType.value) eduTypeMatches = true;
      }
    });

    // tag filters
    let tagsMatch = true;
    if (tagFilters.value.selected.length > 0 || tagFilters.value.flipped.length > 0) {
      tagsMatch = selectedTagsHasEmployee(emp.id, tagFilters.value);
    }

    // match all filters
    return nameMatches && hasEdus && eduNameMatches && eduTypeMatches && tagsMatch;
  });

  buildEducationColumns();
}

/**
 * Refreshes the data in the table
 *
 * @param event the event data containing the table information
 */
function updateTableInfo(event) {
  emitter.emit('reports-table-update', { tab: 'education', table: event, headers: headers });
}

// ╭--------------------------------------------------╮
// |                   ╭----------╮                   |
// |-------------------| WATCHERS |-------------------|
// |                   ╰----------╯                   |
// ╰--------------------------------------------------╯

watch(showInactiveEmployees, () => {
  employeeSearch.value = null;
  allEmployees.value = store.getters.employees;
  if (!showInactiveEmployees.value) allEmployees.value = getActive(allEmployees.value);
  refreshDropdowns();
});

watch(onlyNonemptyEducations, () => {
  // doesn't modify the dropdowns, they're already all nonempty
  refreshTable();
});

// Keep actual selected filter type synced with dropdown
watch(selectedDisplayType, (val) => {
  console.log(TYPE_MAP[val]);
  filterType.value = TYPE_MAP[val];

  refreshDropdowns();
});
</script>

<style lang="css" scoped>
.row-pointer :deep(tbody tr :hover) {
  cursor: pointer;
}
</style>

<style lang="scss" scoped>
@use 'src/assets/styles/styles' as *;
.inactive {
  color: $case-red;
}
</style>
