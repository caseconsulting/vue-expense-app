<template>
  <td :colspan="colspan" class="pa-0 ma-0">
    <v-container fluid class="pa-0 ma-0">
      <!-- START EXPANDED PROJECTS DATA TABLE-->
      <v-form ref="projectForm" v-model="valid" lazy-validation>
        <v-data-table
          :headers="projectHeaders"
          :items="contract.item.projects"
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
            <div class="checkBox-container fill-height fill-width align-center">
              <div :class="`${item.status}-status status-indicator`"></div>
              <v-checkbox
                :model-value="item.checkBox"
                primary
                class="ma-0 pl-4"
                hide-details
                @click.stop="toggleProjectCheckBox(item)"
              >
              </v-checkbox>
            </div>
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

          <!-- Directorate -->
          <template v-slot:[`item.directorate`]="{ item }">
            <v-text-field
              v-if="editingProjectItem && editingProjectItem.id == item.id"
              v-model="editingProjectItem.directorate"
              label="Directorate"
              variant="underlined"
            ></v-text-field>
            <span v-else>{{ item.directorate }}</span>
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
<script>
import _ from 'lodash';
import api from '@/shared/api';
import { nicknameAndLastName } from '@/shared/employeeUtils';
import ProjectsEmployeesAssignedModal from '../modals/ProjectsEmployeesAssignedModal.vue';
import { getProjectCurrentEmployees } from '@/shared/contractUtils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * created life cycle hook
 */
function created() {
  this.emitter.on('closed-project-employees-assigned-modal', () => {
    this.toggleProjectEmployeesModal = false;
  });
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Adds grey highlight to project row when editing or deleting
 *
 * @param item Item in projects v-data-table row
 */
function projectRowClass(item) {
  if (
    (this.editingProjectItem && this.editingProjectItem.id == item.id) ||
    (this.deleteProjectItem && this.deleteProjectItem.project && this.deleteProjectItem.project.id == item.id)
  ) {
    return 'highlight-project-row';
  }
  return 'highlight-project-row';
} // projectRowClass

/**
 * Click edit handler
 *
 * @param item item that is being edited
 */
function clickedEdit(item) {
  this.editingProjectItem = _.cloneDeep(item);
  this.emitter.emit('is-editing-project-item', true);
} // clickedEdit

/**
 * Handler for clicked cancel
 */
function clickedCancel() {
  this.editingProjectItem = null;
  this.emitter.emit('is-editing-project-item', false);
} // clickedCancel

/**
 * Updates project in inline row edit (expandable row)
 *
 * @param contract contract object that project is under
 */
async function updateProject(contract) {
  this.valid = this.$refs.projectForm.validate();
  if (!this.valid) return;
  try {
    this.projectLoading = true;
    let contractObj = _.cloneDeep(contract);
    let projectIndex = contractObj.projects.findIndex((item) => item.id == this.editingProjectItem.id);
    contractObj.projects[projectIndex] = this.editingProjectItem;
    let response = await api.updateItem(api.CONTRACTS, contractObj);
    if (response.name === 'AxiosError') {
      throw new Error(response.response.data.message);
    }
    let contracts = _.cloneDeep(this.$store.getters.contracts);
    let contractIndex = contracts.findIndex((c) => c.id == contractObj.id);
    contracts[contractIndex] = contractObj;
    this.$store.dispatch('setContracts', { contracts });
    this.displaySuccess('Item was successfully saved!');
    this.projectLoading = false;
  } catch (err) {
    this.displayError(err);
    this.projectLoading = false;
  }
  this.editingProjectItem = null;
  this.emitter.emit('is-editing-project-item', false);
} // updateProject

/**
 * Displays success message
 * @param msg success message to display
 */
function displaySuccess(msg) {
  let status = {
    statusType: 'SUCCESS',
    statusMessage: msg,
    color: 'green'
  };
  this.emitter.emit('status-alert', status);
} // displaySuccess

/**
 * Displays error snackbar
 *
 * @param err error message to display
 */
function displayError(err) {
  let status = {
    statusType: 'ERROR',
    statusMessage: err,
    color: 'red'
  };

  this.emitter.emit('status-alert', status);
} // displayError

/**
 * Toggles project checkBox item
 *
 * @param projectItem projectItem checkbox to toggle
 */
function toggleProjectCheckBox(projectItem) {
  this.emitter.emit('toggle-project-checkBox', { contract: this.contract, project: projectItem });
} // toggleProjectCheckBox

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  components: { ProjectsEmployeesAssignedModal },
  methods: {
    projectRowClass,
    updateProject,
    clickedEdit,
    clickedCancel,
    displaySuccess,
    displayError,
    nicknameAndLastName,
    getProjectCurrentEmployees,
    toggleProjectCheckBox
  },
  data() {
    return {
      duplicateProjects: (contractOfProject) => {
        if (contractOfProject) {
          let contract = _.find(this.$store.getters.contracts, (c) => {
            return c.id == contractOfProject.id;
          });
          let found = _.some(contract.projects, (p) => {
            if (p.id == this.editingProjectItem.id) return false;
            return p.projectName === this.editingProjectItem.projectName;
          });
          return !found || 'Duplicate project names';
        }
      },
      projectLoading: false,
      relationships: [],
      editingProjectItem: null,
      toggleProjectEmployeesModal: false,
      contractEmployeesAssigned: null,
      projectEmployeesAsseigned: null,
      contractStatuses: api.CONTRACT_STATUSES,
      valid: true,
      projectHeaders: [
        {
          text: '',
          value: 'spacer'
        },
        {
          text: 'Project',
          value: 'projectName'
        },
        {
          text: 'Directorate',
          value: 'directorate'
        },
        {
          text: 'PoP-Start Date',
          value: 'popStartDate'
        },
        {
          text: 'PoP-End Date',
          value: 'popEndDate'
        },
        {
          text: 'Description',
          value: 'description'
        },
        {
          text: 'Active Employees',
          value: 'projectActiveEmployees'
        },
        {
          value: 'actions',
          sortable: false,
          align: 'end'
        }
      ]
    };
  },

  props: ['contract', 'isEditingContractItem', 'isContractDeletingOrUpdatingStatus', 'colspan']
};
</script>
<style lang="scss">
@import 'src/assets/styles/styles';

.projects-table > div > table > tbody > tr > td {
  padding-left: 0px !important;
}

.projects-table > div {
  overflow-y: hidden !important;
}

.highlight-project-row {
  background-color: rgb(255, 255, 255) !important;
}

.smaller-text {
  display: block;
  font-size: 11px;
  line-height: 1.2;
}

.description textarea {
  line-height: 1.2;
  font-size: 11px;
  padding-top: 18px !important;
}
</style>

<style scoped>
a {
  color: #0000ee;
}
</style>
