<template>
  <td :colspan="colspan" class="pa-0 ma-0">
    <v-container fluid class="pa-0 ma-0">
      <!-- START EXPANDED PROJECTS DATA TABLE-->
      <v-form ref="projectForm" v-model="valid" lazy-validation>
        <v-data-table
          :headers="_filter(projectHeaders, (h) => props.expandOrgs || (!props.expandOrgs && !h.expandableOrg))"
          :items="contract.item.projects"
          :sort-by="projectsSortBy"
          :search="search"
          :row-props="rowProps"
          :cellProps="(item) => cellProps(item, projectHeaders)"
          class="projects-table"
          hide-default-footer
          hide-default-header
          :items-per-page="-1"
          no-data-text="No active projects"
          show-select
        >
          <!-- Blank header and footer -->
          <template v-slot:headers></template>
          <template v-slot:bottom></template>

          <!-- Item CheckBox Slot -->
          <template v-slot:[`item.data-table-select`]="{ item }">
            <v-checkbox :model-value="item.checkBox" primary hide-details @click.stop="toggleProjectCheckBox(item)">
            </v-checkbox>
          </template>

          <template
            v-for="header in _filter(projectHeaders, (h) => !h.disableEdit)"
            v-slot:[`item.${header.key}`]="{ item }"
          >
            <contracts-edit-item
              v-if="
                editItem?.item?.id === item.id && editItem?.header?.key === header.key && editItem?.type === 'project'
              "
              :key="item[header.key]"
              :header="header"
              :item="item"
            ></contracts-edit-item>
            <contracts-info-item
              v-else
              :key="item[header.title]"
              :header="header"
              :item="item"
              type="project"
              @click="handleItemClick(item, header)"
              class="d-flex align-center w-100 h-100"
            ></contracts-info-item>
          </template>

          <!-- Project Active Employees Slot -->
          <template v-slot:[`item.projectActiveEmployees`]="{ item }">
            <span class="smaller-text">
              <span
                v-for="(emp, i) in getProjectCurrentEmployees(contract.item, item, $store.getters.employees)"
                :key="emp.employeeNumber"
              >
                <a
                  @click="$router.push(`/employee/${emp.employeeNumber}`)"
                  class="pointer"
                  :class="
                    _isEmpty(getOverridenValues(emp, item))
                      ? 'text-blue-darken-4'
                      : 'font-weight-bold text-blue-lighten-1'
                  "
                >
                  {{ nicknameAndLastName(emp) }}
                  <v-tooltip v-if="!_isEmpty(getOverridenValues(emp, item))" activator="parent">
                    <div v-for="value in getOverridenValues(emp, item)" :key="value">{{ value }}</div>
                  </v-tooltip>
                </a>
                <span v-if="i != getProjectCurrentEmployees(contract.item, item, $store.getters.employees).length - 1">
                  ,
                </span>
              </span>
            </span>
          </template>

          <!-- Actions -->
          <template v-slot:[`item.actions`]="{ item }">
            <div>
              <!-- Employees Assigned -->
              <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    :disabled="projectLoading"
                    @click.stop="
                      () => {
                        toggleProjectEmployeesModal = true;
                        contractEmployeesAssigned = contract.item;
                        projectEmployeesAsseigned = item;
                      }
                    "
                    icon
                    density="comfortable"
                    variant="text"
                    v-bind="props"
                  >
                    <v-icon class="case-gray" icon="mdi-account-group" />
                  </v-btn>
                </template>
                <span>View Employees Assigned to Project</span>
              </v-tooltip>
            </div>
          </template>
        </v-data-table>
      </v-form>
      <!-- END EXPANDED PROJECTS DATA TABLE-->
    </v-container>
    <projects-employees-assigned-modal
      :toggleModal="toggleProjectEmployeesModal"
      :contract="contractEmployeesAssigned"
      :project="projectEmployeesAsseigned"
    />
  </td>
</template>
<script setup>
import _find from 'lodash/find';
import _findIndex from 'lodash/findIndex';
import _filter from 'lodash/filter';
import _isEmpty from 'lodash/isEmpty';
import _some from 'lodash/some';
import { nicknameAndLastName } from '@/shared/employeeUtils';
import ContractsEditItem from './ContractsEditItem.vue';
import ContractsInfoItem from './ContractsInfoItem.vue';
import ProjectsEmployeesAssignedModal from '../modals/ProjectsEmployeesAssignedModal.vue';
import { getProjectCurrentEmployees } from '@/shared/contractUtils';
import { ref, onBeforeMount, inject, watch, computed } from 'vue';
import { isAfter } from '@/shared/dateUtils';
import { useDisplay } from 'vuetify';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['contract', 'colspan', 'rowProps', 'cellProps', 'editItem', 'expandOrgs', 'sortBy', 'search']);
const { lgAndDown } = useDisplay();
const emitter = inject('emitter');
const duplicateProjects = ref((v) => {
  let item = editItem.value.item;
  if (item) {
    let contract = props.contract.item;
    let found = _some(contract.projects, (p) => {
      if (p.id == item.id) return false;
      return p.projectName === v;
    });
    return !found || 'Duplicate project names';
  }
});
const projectLoading = ref(false);
const editItem = ref(props.editItem);
const toggleProjectEmployeesModal = ref(false);
const contractEmployeesAssigned = ref(null);
const projectEmployeesAsseigned = ref(null);
const valid = ref(true);
const projectHeaders = ref([
  {
    title: '',
    key: 'spacer',
    customWidth: 'small',
    disableEdit: true
  },
  {
    title: 'Project',
    key: 'projectName',
    align: 'start',
    customWidth: 'small',
    rules: [(v) => !!v || 'Field is required', duplicateProjects.value]
  },
  {
    title: 'Directorate',
    key: 'directorate',
    align: 'start',
    customWidth: 'small',
    type: 'combobox'
  },
  {
    title: 'Org 2',
    key: 'org2',
    align: 'start',
    customWidth: 'x-small',
    type: 'combobox',
    expandableOrg: true
  },
  {
    title: 'Org 3',
    key: 'org3',
    align: 'start',
    customWidth: 'x-small',
    type: 'combobox',
    expandableOrg: true
  },
  {
    title: 'Location',
    key: 'location',
    align: 'start',
    customWidth: 'x-small',
    type: 'combobox'
  },
  {
    title: 'Work Type',
    key: 'workType',
    align: 'start',
    customWidth: 'x-small',
    type: 'select'
  },
  {
    title: 'PoP-Start Date',
    key: 'popStartDate',
    align: 'start',
    customWidth: lgAndDown.value ? 'x-small' : 'medium',
    sort: (a, b) => isAfter(new Date(a), new Date(b)) ? 1 : -1
  },
  {
    title: 'PoP-End Date',
    key: 'popEndDate',
    align: 'start',
    customWidth: lgAndDown.value ? 'x-small' : 'medium',
    sort: (a, b) => isAfter(new Date(a), new Date(b)) ? 1 : -1
  },
  {
    title: 'Description',
    key: 'description',
    align: 'start',
    customWidth: 'large',
    class: 'smaller-text description',
    type: 'textarea'
  },
  {
    title: 'Active Employees',
    key: 'projectActiveEmployees',
    align: 'start',
    customWidth: 'large',
    disableEdit: true
  },
  {
    key: 'actions',
    sortable: false,
    align: 'end',
    customWidth: lgAndDown.value ? 'medium' : 'large',
    disableEdit: true
  }
]);
const projectForm = ref(null);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * created life cycle hook
 */
onBeforeMount(() => {
  emitter.on('closed-project-employees-assigned-modal', () => {
    toggleProjectEmployeesModal.value = false;
  });
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function getOverridenValues(employee, item) {
  let values = [];
  let contract = _find(employee.contracts, (c) => _find(c.projects, (p) => p.projectId === item.id));
  let project = _find(contract.projects, (p) => p.projectId === item.id);
  if (project.location && project.location !== item.location) {
    values.push(`Location: ${project.location}`);
  }
  if (project.workType && project.workType !== item.location) {
    values.push(`Work Type: ${project.workType}`);
  }
  return values;
}

/**
 * Sets the item to be edited.
 *
 * @param item - The row item clicked
 * @param header - The header of the cell that was clicked
 */
function handleItemClick(item, header) {
  if (!header.disableEdit) {
    let headerIndex = _findIndex(projectHeaders.value, (h) => header.key === h.key);
    editItem.value = { item, header, type: 'project', headerIndex };
    emitter.emit('change-contracts-edit-item', editItem.value);
  }
}

/**
 * Toggles project checkBox item
 *
 * @param projectItem projectItem checkbox to toggle
 */
function toggleProjectCheckBox(projectItem) {
  emitter.emit('toggle-project-checkBox', { contract: props.contract, project: projectItem });
}

/**
 * Converts contract sortBy into sortBy for projects table, just changing values
 * as needed
 */
let sortMap = { contractName: 'projectName', activeEmployees: 'projectActiveEmployees' }
const projectsSortBy = computed(() => {
  let { key, order } = { ...props.sortBy[0] }; // copy to avoid mutating prop
  const mappedKey = sortMap[key] ?? key;
  return [{ key: mappedKey, order }];
});

watch(
  () => props.editItem,
  () => {
    // sets the edit item from the contracts row so multiple items cannot be edited
    editItem.value = props.editItem;
  }
);
</script>

<style lang="scss">
@use '@/assets/styles/styles' as *;

.projects-table > div > table > tbody > tr > td {
  padding: 0px 12px 0px 12px !important;
}

.projects-table > div > table > tbody > tr > td:first-of-type {
  min-width: 70px !important;
}
</style>

<style scoped>
a {
  color: #0000ee;
}
</style>
