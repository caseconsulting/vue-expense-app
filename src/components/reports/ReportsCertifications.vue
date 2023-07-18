<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <v-autocomplete
            id="employeesSearch"
            v-model="search"
            :filter="customEmployeeFilter"
            :items="employees"
            label="Search By Employee Name"
            auto-select-first
            clearable
            @change="refreshDropdownItems()"
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
            clearable
            auto-select-first
            @change="refreshDropdownItems()"
            @click:clear="certificationSearch = null"
          ></v-autocomplete>
        </v-col>
        <v-col cols="6" xl="3" lg="3" md="3" sm="6" class="my-0 py-0">
          <v-autocomplete
            class="d-inline-block"
            clearable
            label="Filter by Tag (click to flip)"
            v-model="selectedTags"
            :items="tags"
            multiple
            variant="solo-filled"
            item-color="gray"
            item-text="tagName"
            item-value="id"
            @change="refreshDropdownItems()"
            return-object
          >
            <template v-slot:selection="data">
              <v-chip
                close
                @click="negateTag(data.item)"
                @click:close="removeTag(data.item)"
                :color="chipColor(data.item.id)"
              >
                {{ tagFlip.includes(data.item.id) ? 'NOT ' : '' }}
                {{ data.item.tagName }}
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
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
        :items-per-page="-1"
        class="elevation-1 row-pointer"
        @click:row="handleClick"
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
        <!-- Alert for no search results -->
        <v-alert slot="no-results" :value="true" color="error" icon="warning">
          Your search for "{{ search }}" found no results.
        </v-alert>
      </v-data-table>
      <!-- END EMPLOYEE TABLE -->
    </v-container>
  </div>
</template>

<script>
import _ from 'lodash';
import { customEmployeeFilter, getActive, getFullName, populateEmployeesDropdown } from './reports-utils';
import { getTodaysDate, isSameOrBefore } from '@/shared/dateUtils';

// |--------------------------------------------------|
// |                                                  |
// |                LIFECYCLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * The created lifecycle hook.
 */
function created() {
  window.EventBus.$on('get-employees-to-contact', () => {
    window.EventBus.$emit('list-of-employees-to-contact', this.filteredEmployees);
  });

  this.employeesInfo = this.getActive(this.$store.getters.employees); // default to filtered 
  this.tags = this.$store.getters.tags;
  this.filteredEmployees = this.employeesInfo; // this one is shown
  this.populateDropdowns(this.employeesInfo);
  this.buildCertificationsColumns();
  if (this.$route.params.requestedFilter) {
    if (Array.isArray(this.$route.params.requestedFilter)) {
      this.$route.params.requestedFilter = this.$route.params.requestedFilter.join(' ');
    }
    this.certificationSearch = this.$route.params.requestedFilter;
    this.refreshDropdownItems();
    this.$route.params.requestedFilter = null;
  }
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets all of the active certifications for each employee and displays the column on the table.
 */
function buildCertificationsColumns() {
  this.employeesInfo.forEach((currentEmp) => {
    if (currentEmp.certifications) {
      let hasActiveCert = false;
      let certs = '';
      currentEmp.certifications.forEach((cert) => {
        if ((cert.expirationDate && isSameOrBefore(getTodaysDate(), cert.expirationDate)) || !cert.expirationDate) {
          hasActiveCert = true;
          certs += `${cert.name} & `;
        }
      });
      if (hasActiveCert) {
        // remove & at the end
        certs = certs.slice(0, -2);
        currentEmp.certificationNames = certs;
      }
    }
  });
} // buildCertificationsColumns

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
 * handles click event of the employee table entry
 *
 * @param item - the employee
 */
function handleClick(item) {
  this.$router.push(`/employee/${item.employeeNumber}`);
} //handleClick

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
 * Populates all certifications in the search dropdown.
 */
function populateCertificationsDropdown() {
  _.forEach(this.filteredEmployees, (employee) =>
    _.forEach(employee.certifications, (cert) => {
      if (cert.expirationDate) {
        if (isSameOrBefore(getTodaysDate(), cert.expirationDate)) {
          this.certifications.push(cert.name);
        }
      } else {
        // cert has no expiration date
        this.certifications.push(cert.name);
      }
    })
  );
} // populateCertificationsDropdown

/**
 * Populate drop downs with information that other employees have filled out.
 *
 * @param employees - array of employees for dropdown and to get contracts
 */
function populateDropdowns(employees) {
  // refresh the employees autocomplete list to be those that match the query
  this.employees = this.populateEmployeesDropdown(employees);
  this.populateCertificationsDropdown(employees);
} // populateDropdowns

/**
 * Refresh the list based on the current queries
 */
function refreshDropdownItems() {
  if (this.search) {
    this.filteredEmployees = _.filter(this.employeesInfo, (employee) => {
      return employee.employeeNumber == this.search;
    });
  }
  if (this.certificationSearch) {
    this.searchCertifications();
  }
  if (this.search === null && this.certificationSearch === null) {
    this.filteredEmployees = this.employeesInfo;
  }
  if (this.selectedTags.length > 0) {
    this.filteredEmployees = _.filter(this.employeesInfo, (employee) => {
      return this.selectedTagsHasEmployee(employee);
    });
  }

  this.populateDropdowns(this.filteredEmployees);
} // refreshDropdownItems

/**
 * Removes an item from the tag filters's active filters
 *
 * @param item - The filter to remove
 */
function removeTag(item) {
  const selIndex = this.selectedTags.findIndex((t) => t.id === item.id);
  if (selIndex >= 0) {
    this.selectedTags.splice(selIndex, 1);
  }
} // remove

/**
 * Filters employees on the data table by the certification entered by the user.
 */
function searchCertifications() {
  this.filteredEmployees = _.filter(this.employeesInfo, (employee) => {
    if (employee.certificationNames) {
      return employee.certificationNames.includes(this.certificationSearch);
    } else {
      return false;
    }
  });
  if (this.search) {
    // if there is a desired employee search then only show that employee
    this.filteredEmployees = _.filter(this.employeesInfo, (employee) => {
      return employee.employeeNumber == this.search;
    });
  }
} // searchCertifications

/**
 * helper function: return true if any selected tag has employee listed under it.
 *
 * @param e - the employee
 * @return true if the employee has a tag selected in filters
 */
function selectedTagsHasEmployee(e) {
  let inTag, tagFlipped;
  for (let i = 0; i < this.selectedTags.length; i++) {
    inTag = this.selectedTags[i].employees.includes(e.id);
    tagFlipped = this.tagFlip.includes(this.selectedTags[i].id);
    if (inTag != tagFlipped) {
      return true;
    }
  }
  return false;
} // selectedTagsHasEmployee

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Watches the showInactiveUsers to refilter the table as needed
 */
function watchShowInactiveUsers() {
  this.search = null;
  this.employeesInfo = this.$store.getters.employees;
  if (!this.showInactiveEmployees) this.employeesInfo = this.getActive(this.employeesInfo);
  this.populateDropdowns(this.employeesInfo);
  this.refreshDropdownItems();
} // watchShowInactiveUsers

/**
 * In the case that the page has been force reloaded (and the store cleared)
 * this watcher will be activated when the store is populated again.
 */
function watchTagFlip() {
  this.refreshDropdownItems();
} // watchTagFlip

/**
 * Remove items from tagFlip array when they are removed from the selected
 * tags
 */
function watchSelectedTags() {
  let negatedTagRemoved = true;
  // use normal for loop to have the index
  for (let i = 0; i < this.tagFlip.length; i++) {
    // try to find the current tag in the selectedTags
    _.forEach(this.selectedTags, (t) => {
      if (t.id === this.tagFlip[i]) negatedTagRemoved = false;
    });
    // if it isn't there, remove it from tagFlip too
    if (negatedTagRemoved) {
      this.tagFlip.splice(i, 1);
    }
  }
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
          text: 'Employee #',
          value: 'employeeNumber'
        },
        {
          text: 'Name',
          value: 'fullName'
        },
        {
          text: 'Active Certifications',
          value: 'certificationNames'
        },
        {
          text: 'Email',
          value: 'email'
        }
      ], // datatable headers
      certificationSearch: null,
      certifications: [],
      search: null, // query text for datatable search field
      selectedTags: [],
      showInactiveEmployees: false,
      sortBy: 'firstName', // sort datatable items
      sortDesc: false,
      tags: [],
      tagFlip: [],
      tagSearchString: ''
    };
  },
  methods: {
    buildCertificationsColumns,
    customEmployeeFilter,
    chipColor,
    getActive,
    getFullName,
    handleClick,
    negateTag,
    populateEmployeesDropdown,
    populateCertificationsDropdown,
    populateDropdowns,
    refreshDropdownItems,
    removeTag,
    searchCertifications,
    selectedTagsHasEmployee
  },
  watch: {
    showInactiveEmployees: watchShowInactiveUsers,
    tagFlip: watchTagFlip,
    selectedTags: watchSelectedTags
  }
};
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
