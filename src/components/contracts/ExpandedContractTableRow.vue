<template>
  <td :colspan="colspan" class="pa-0 ma-0">
    <v-container fluid class="pa-0 ma-0">
      <!-- START EXPANDED PROJECTS DATA TABLE-->
      <v-form ref="projectForm" v-model="valid" lazy-validation>
        <v-data-table
          :headers="projectHeaders"
          :items="contract.item.projects"
          :row-props="rowProps"
          :cellProps="cellProps"
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

          <!-- Just a spacer -->
          <template v-if="!editingProjectItem" v-slot:[`item.spacer`]="{ item }">
            <span>{{ item.spacer }}</span>
          </template>

          <!-- Item CheckBox Slot -->
          <template v-slot:[`item.data-table-select`]="{ item }">
            <v-checkbox :model-value="item.checkBox" primary hide-details @click.stop="toggleProjectCheckBox(item)">
            </v-checkbox>
          </template>

          <!-- Project Name Slot -->
          <template v-slot:[`item.projectName`]="{ item }">
            <v-text-field
              :rules="[(v) => !!v || 'Field is required', duplicateProjects(contract.item)]"
              v-if="editingProjectItem && editingProjectItem.id == item.id"
              v-model="editingProjectItem.projectName"
              label="Project Name"
              variant="underlined"
            ></v-text-field>
            <span v-else>{{ item.projectName }}</span>
          </template>

          <!-- Customer Org -->
          <template v-slot:[`item.customerOrg`]="{ item }">
            <v-combobox
              v-if="editingProjectItem && editingProjectItem.id == item.id"
              v-model="editingProjectItem.customerOrg"
              :items="
                getOrgList('customerOrg', {
                  directorate: editingProjectItem.directorate,
                  org2: editingProjectItem.org2,
                  org3: editingProjectItem.org3
                })
              "
              label="Customer Org"
              variant="underlined"
            ></v-combobox>
            <span v-else>{{ item.customerOrg }}</span>
          </template>

          <!-- Directorate -->
          <template v-slot:[`item.directorate`]="{ item }">
            <v-combobox
              v-if="editingProjectItem && editingProjectItem.id == item.id"
              v-model="editingProjectItem.directorate"
              :items="
                getOrgList('directorate', {
                  customerOrg: editingProjectItem.customerOrg,
                  org2: editingProjectItem.org2,
                  org3: editingProjectItem.org3
                })
              "
              label="Directorate (Org 1)"
              variant="underlined"
            ></v-combobox>
            <span v-else>{{ item.directorate }}</span>
          </template>

          <!-- Org 2 -->
          <template v-slot:[`item.org2`]="{ item }">
            <v-combobox
              v-if="editingProjectItem && editingProjectItem.id == item.id"
              v-model="editingProjectItem.org2"
              :items="
                getOrgList('org2', {
                  customerOrg: editingProjectItem.customerOrg,
                  directorate: editingProjectItem.directorate,
                  org3: editingProjectItem.org3
                })
              "
              label="Org 2"
              variant="underlined"
            ></v-combobox>
            <span v-else>{{ item.org2 }}</span>
          </template>

          <!-- Org 3 -->
          <template v-slot:[`item.org3`]="{ item }">
            <v-combobox
              v-if="editingProjectItem && editingProjectItem.id == item.id"
              v-model="editingProjectItem.org3"
              :items="
                getOrgList('org3', {
                  customerOrg: editingProjectItem.customerOrg,
                  directorate: editingProjectItem.directorate,
                  org2: editingProjectItem.org2
                })
              "
              label="Org 3"
              variant="underlined"
            ></v-combobox>
            <span v-else>{{ item.org3 }}</span>
          </template>

          <!-- Location -->
          <template v-slot:[`item.location`]="{ item }">
            <v-combobox
              v-if="editingProjectItem && editingProjectItem.id == item.id"
              v-model="editingProjectItem.location"
              :items="getProjectLocations()"
              label="Location"
              variant="underlined"
            ></v-combobox>
            <span v-else>{{ item.location }}</span>
          </template>

          <!-- Work Type -->
          <template v-slot:[`item.workType`]="{ item }">
            <v-select
              v-if="editingProjectItem && editingProjectItem.id == item.id"
              v-model="editingProjectItem.workType"
              :items="['On-site', 'Hybrid', 'Remote']"
              label="Work Type"
              variant="underlined"
              clearable
            ></v-select>
            <span v-else>{{ item.workType }}</span>
          </template>

          <!-- PoP Start Date Slot -->
          <template v-slot:[`item.popStartDate`]="{ item }">
            <v-text-field
              v-if="editingProjectItem && editingProjectItem.id == item.id"
              v-model="editingProjectItem.popStartDate"
              label="PoP Start Date"
              variant="underlined"
            ></v-text-field>
            <span v-else>{{ item.popStartDate }}</span>
          </template>

          <!-- PoP End Date Slot -->
          <template v-slot:[`item.popEndDate`]="{ item }">
            <v-text-field
              v-if="editingProjectItem && editingProjectItem.id == item.id"
              v-model="editingProjectItem.popEndDate"
              label="PoP End Date"
              variant="underlined"
            ></v-text-field>
            <span v-else>{{ item.popEndDate }}</span>
          </template>

          <!-- Project Description Slot -->
          <template v-slot:[`item.description`]="{ item }">
            <v-textarea
              v-if="editingProjectItem && editingProjectItem.id == item.id"
              v-model="editingProjectItem.description"
              name="description"
              auto-grow
              label="Description"
              variant="underlined"
              class="smaller-text description"
              rows="2"
              @click.stop
            ></v-textarea>
            <span v-else class="smaller-text">{{ item.description }}</span>
          </template>

          <!-- Project Active Employees Slot -->
          <template v-slot:[`item.projectActiveEmployees`]="{ item }">
            <span class="smaller-text">
              <span
                v-for="(emp, i) in getProjectCurrentEmployees(contract.item, item, $store.getters.employees)"
                :key="emp.employeeNumber"
              >
                <a @click="$router.push(`/employee/${emp.employeeNumber}`)" class="pointer">{{
                  nicknameAndLastName(emp)
                }}</a>
                <span v-if="i != getProjectCurrentEmployees(contract.item, item, $store.getters.employees).length - 1"
                  >,
                </span>
              </span>
            </span>
          </template>

          <!-- Actions -->
          <template v-slot:[`item.actions`]="{ item }">
            <div v-if="editingProjectItem && editingProjectItem.id == item.id">
              <div v-if="!projectLoading">
                <!-- Save Project -->
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      @click.stop="updateProject(contract.item)"
                      :disabled="!valid"
                      icon
                      variant="text"
                      v-bind="props"
                    >
                      <v-icon class="case-gray" icon="mdi-content-save" />
                    </v-btn>
                  </template>
                  <span>Save</span>
                </v-tooltip>

                <!-- Cancel Project Edit -->
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn icon variant="text" @click.stop="clickedCancel()" v-bind="props">
                      <v-icon class="case-gray" icon="mdi-close-circle" />
                    </v-btn>
                  </template>
                  <span>Cancel</span>
                </v-tooltip>
              </div>
              <div v-else><v-progress-circular color="#bc3825" indeterminate /></div>
            </div>
            <div v-else>
              <div>
                <!-- Employees Assigned -->
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      :disabled="editingProjectItem != null || isEditingContractItem || projectLoading"
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

                <!-- Edit Project -->
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      :disabled="editingProjectItem != null || isEditingContractItem || projectLoading"
                      icon
                      variant="text"
                      density="comfortable"
                      @click.stop="clickedEdit(item)"
                      v-bind="props"
                    >
                      <v-icon class="case-gray" icon="mdi-pencil" />
                    </v-btn>
                  </template>
                  <span>Edit</span>
                </v-tooltip>
              </div>
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
import _some from 'lodash/some';
import _cloneDeep from 'lodash/cloneDeep';
import api from '@/shared/api';
import { nicknameAndLastName } from '@/shared/employeeUtils';
import ProjectsEmployeesAssignedModal from '../modals/ProjectsEmployeesAssignedModal.vue';
import { getOrgList, getProjectCurrentEmployees, getProjectLocations } from '@/shared/contractUtils';
import { ref, onBeforeMount, inject } from 'vue';
import { useStore } from 'vuex';
import { useDisplayError, useDisplaySuccess } from '@/components/shared/StatusSnackbar.vue';
import { useDisplay } from 'vuetify';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const store = useStore();
const props = defineProps([
  'contract',
  'isEditingContractItem',
  'isContractDeletingOrUpdatingStatus',
  'colspan',
  'cellProps',
  'rowProps'
]);
const { lgAndDown } = useDisplay();
const emitter = inject('emitter');
const duplicateProjects = ref((contractOfProject) => {
  if (contractOfProject) {
    let contract = _find(store.getters.contracts, (c) => {
      return c.id == contractOfProject.id;
    });
    let found = _some(contract.projects, (p) => {
      if (p.id == editingProjectItem.value.id) return false;
      return p.projectName === editingProjectItem.value.projectName;
    });
    return !found || 'Duplicate project names';
  }
});
const projectLoading = ref(false);
const editingProjectItem = ref(null);
const toggleProjectEmployeesModal = ref(false);
const contractEmployeesAssigned = ref(null);
const projectEmployeesAsseigned = ref(null);
const valid = ref(true);
const projectHeaders = ref([
  {
    text: '',
    value: 'spacer',
    customWidth: 'small'
  },
  {
    text: 'Project',
    value: 'projectName',
    align: 'start',
    customWidth: 'small'
  },
  {
    title: 'Customer Org',
    key: 'customerOrg',
    align: 'start',
    customWidth: 'x-small'
  },
  {
    text: 'Directorate',
    value: 'directorate',
    align: 'start',
    customWidth: 'x-small'
  },
  {
    text: 'Org 2',
    value: 'org2',
    align: 'start',
    customWidth: 'x-small'
  },
  {
    text: 'Org 3',
    value: 'org3',
    align: 'start',
    customWidth: 'x-small'
  },
  {
    title: 'Location',
    key: 'location',
    align: 'start',
    customWidth: 'x-small'
  },
  {
    title: 'Work Type',
    key: 'workType',
    align: 'start',
    customWidth: 'x-small'
  },
  {
    text: 'PoP-Start Date',
    value: 'popStartDate',
    align: 'start',
    customWidth: lgAndDown.value ? 'x-small' : 'medium'
  },
  {
    text: 'PoP-End Date',
    value: 'popEndDate',
    align: 'start',
    customWidth: lgAndDown.value ? 'x-small' : 'medium'
  },
  {
    text: 'Description',
    value: 'description',
    align: 'start',
    customWidth: 'large'
  },
  {
    text: 'Active Employees',
    value: 'projectActiveEmployees',
    align: 'start',
    customWidth: 'large'
  },
  {
    value: 'actions',
    sortable: false,
    align: 'end',
    customWidth: lgAndDown.value ? 'x-small' : 'large'
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
}); // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Click edit handler
 *
 * @param item item that is being edited
 */
function clickedEdit(item) {
  editingProjectItem.value = _cloneDeep(item);
  emitter.emit('is-editing-project-item', true);
} // clickedEdit

/**
 * Handler for clicked cancel
 */
function clickedCancel() {
  editingProjectItem.value = null;
  emitter.emit('is-editing-project-item', false);
} // clickedCancel

/**
 * Updates project in inline row edit (expandable row)
 *
 * @param contract contract object that project is under
 */
async function updateProject(contract) {
  valid.value = projectForm.value.validate();
  if (!valid.value) return;
  try {
    projectLoading.value = true;
    let contractObj = _cloneDeep(contract);
    let projectIndex = contractObj.projects.findIndex((item) => item.id == editingProjectItem.value.id);
    contractObj.projects[projectIndex] = editingProjectItem.value;
    let response = await api.updateItem(api.CONTRACTS, contractObj);
    if (response.name === 'AxiosError') {
      throw new Error(response.response.data.message);
    }
    let contracts = _cloneDeep(store.getters.contracts);
    let contractIndex = contracts.findIndex((c) => c.id == contractObj.id);
    contracts[contractIndex] = contractObj;
    store.dispatch('setContracts', { contracts });
    useDisplaySuccess('Item was successfully saved!');
    projectLoading.value = false;
  } catch (err) {
    useDisplayError(err);
    projectLoading.value = false;
  }
  editingProjectItem.value = null;
  emitter.emit('is-editing-project-item', false);
} // updateProject

/**
 * Toggles project checkBox item
 *
 * @param projectItem projectItem checkbox to toggle
 */
function toggleProjectCheckBox(projectItem) {
  emitter.emit('toggle-project-checkBox', { contract: props.contract, project: projectItem });
} // toggleProjectCheckBox
</script>

<style lang="scss">
@import 'src/assets/styles/styles';

.projects-table > div > table > tbody > tr > td {
  padding: 0px 12px 0px 12px !important;
}

.projects-table > div > table > tbody > tr > td:first-of-type {
  min-width: 70px !important;
}

.description textarea {
  line-height: 1.2;
  font-size: 11px;
  padding-top: 18px !important;
}

.smaller-text {
  display: block;
  font-size: 11px;
  line-height: 1.2;
}
</style>

<style scoped>
a {
  color: #0000ee;
}
</style>
