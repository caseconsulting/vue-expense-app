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
            v-model="certificationSearch"
            :items="certifications"
            label="Search By Certification"
            variant="underlined"
            clearable
            auto-select-first
            @update:model-value="refreshDropdownItems()"
            @click:clear="certificationSearch = null"
          ></v-autocomplete>
        </v-col>
        <v-col v-if="userRoleIsAdmin() || userRoleIsManager()" cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <tags-filter v-model="tagsInfo" @update:modelValue="refreshDropdownItems()"></tags-filter>
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
        <!-- Certifications Item Slot -->
        <template v-slot:[`item.certificationNames`]="{ item }">
          <p :class="{ inactive: item.workStatus <= 0 }" class="mb-0">
            {{ item.certificationNames }}
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
import _cloneDeep from 'lodash/cloneDeep';
import { getActive, getFullName, populateEmployeesDropdown } from './reports-utils';
import { getTodaysDate, isSameOrBefore } from '@/shared/dateUtils';
import { employeeFilter } from '@/shared/filterUtils';
import { onMounted, ref, inject, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { selectedTagsHasEmployee } from '@/shared/employeeUtils';
import { userRoleIsAdmin, userRoleIsManager } from '@/utils/utils';
import TagsFilter from '@/components/shared/TagsFilter.vue';

const store = useStore();
const emitter = inject('emitter');
const router = useRouter();
const props = defineProps(['requestedFilter', 'name']);

const employees = ref([]);
const employeesInfo = ref([]);
const filteredEmployees = ref([]);
const certificationSearch = ref(null);
const certifications = ref([]);
const search = ref(null); // query text for datatable search field
const showInactiveEmployees = ref(false);
const sortBy = ref([{ key: 'employeeNumber' }]); // sort datatable items
const tagsInfo = ref({
  selected: [],
  flipped: []
});

// datatable headers
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
    title: 'Active Certifications',
    key: 'certificationNames'
  },
  {
    title: 'Email',
    key: 'email'
  }
]);

// code-only variables
const certGlue = ' & ';
const certIndex = {};

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
  buildCertificationsColumns();
  if (props.requestedFilter && props.requestedFilter.tab === props.name) {
    certificationSearch.value = props.requestedFilter.search;
    refreshDropdownItems();
  }
}); // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets all of the active certifications for each employee and displays the column on the table.
 */
function buildCertificationsColumns() {
  for (let emp of employeesInfo.value) {
    certIndex[emp.employeeNumber] = [];
    let activeCerts = certIndex[emp.employeeNumber]; // pointer-esque
    for (let cert of emp.certifications || []) {
      if (!cert.expirationDate || (isSameOrBefore(getTodaysDate(), cert.expirationDate))) {
        activeCerts.push(cert.name);
      }
    }
    emp.certificationNames = activeCerts.join(certGlue);
  }
}

/**
 * handles click event of the employee table entry
 *
 * @param item - the employee
 */
function handleClick(_, { item }) {
  router.push(`/employee/${item.employeeNumber}`);
} //handleClick

/**
 * Populates all certifications in the search dropdown.
 */
function populateCertificationsDropdown() {
  certifications.value = [];
  _forEach(filteredEmployees.value, (employee) =>
    _forEach(employee.certifications, (cert) => {
      if (cert.expirationDate) {
        if (isSameOrBefore(getTodaysDate(), cert.expirationDate)) {
          certifications.value.push(cert.name);
        }
      } else {
        // cert has no expiration date
        certifications.value.push(cert.name);
      }
    })
  );
  certifications.value = Array.from(new Set(certifications.value));
} // populateCertificationsDropdown

/**
 * Populate drop downs with information that other employees have filled out.
 *
 * @param employees - array of employees for dropdown and to get contracts
 */
function populateDropdowns(emps) {
  // refresh the employees autocomplete list to be those that match the query
  employees.value = populateEmployeesDropdown(emps);
  populateCertificationsDropdown(emps);
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
  if (certificationSearch.value) {
    searchCertifications();
  }
  if (tagsInfo.value.selected.length > 0) {
    filteredEmployees.value = _filter(filteredEmployees.value, (employee) => {
      return selectedTagsHasEmployee(employee.id, tagsInfo.value);
    });
  }

  populateDropdowns(filteredEmployees.value);
} // refreshDropdownItems

/**
 * Filters employees on the data table by the certification entered by the user.
 */
function searchCertifications() {
  filteredEmployees.value = _filter(filteredEmployees.value, (employee) => {
    if (employee.certificationNames) {
      return employee.certificationNames.includes(certificationSearch.value);
    } else {
      return false;
    }
  });
} // searchCertifications

/**
 * Emit new data for tab.value
 *
 * @param event the event data containing the table information
 */
function updateTableDownload(event) {
  if (!event?.length) return;
  let toDownload = [];
  let mostCerts = 0;
  for (let e of event) {
    // copy everything except certification names
    let row = _cloneDeep(e);
    delete row.columns.certificationNames;
    // add certifications one by one
    let certs = certIndex[row.columns.employeeNumber];
    for (let i = 0; i < certs.length; i++) {
      row.columns[`Cert ${i + 1}`] = certs[i];
    }
    toDownload.push(row);
    if (mostCerts < certs.length) mostCerts = certs.length;
  }
  // build new headers to include certs
  let dlHeaders = _cloneDeep(headers.value);
  for (let i in dlHeaders) {
    if (dlHeaders[i].key === 'certificationNames') {
      dlHeaders.splice(i, 1);
      break;
    }
  }
  for (let i = 0; i < mostCerts; i++) {
    let c = `Cert ${i + 1}`
    dlHeaders.push({ title: c, key: c });
  }
  // pad employee rows with empty certs for downloadability
  for (let item of toDownload) {
    for (let i = 0; i < mostCerts; i++) {
      item.columns[`Cert ${i + 1}`] ??= '';
    }
  }
  emitter.emit('reports-table-update', { tab: 'certifications', table: toDownload, headers: dlHeaders });
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
