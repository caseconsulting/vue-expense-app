<template>
  <td :colspan="colspan" class="pa-0">
    <v-container fluid class="grey-background">
      <!-- START EXPANDED PROJECTS DATA TABLE-->
      <v-form ref="projectForm" lazy-validation>
        <v-data-table
          :headers="projectHeaders"
          :items="contract.item.projects"
          hide-default-footer
          :item-class="projectRowClass"
        >
          <template v-slot:[`item.projectName`]="{ item }">
            <v-text-field
              :rules="[(v) => !!v || 'Field is required', duplicateProjects(contract.item)]"
              v-if="editingProjectItem && editingProjectItem.id == item.id"
              v-model="editingProjectItem.projectName"
              prepend-icon="mdi-briefcase-outline"
            ></v-text-field>
            <span v-else :class="{ inactive: item.inactive }">{{ item.projectName }}</span>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <div v-if="editingProjectItem && editingProjectItem.id == item.id">
              <div v-if="!projectLoading">
                <!-- Save Project -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn @click.stop="updateProject(contract.item)" icon text v-on="on">
                      <v-icon class="case-gray">save</v-icon>
                    </v-btn>
                  </template>
                  <span>Save</span>
                </v-tooltip>

                <!-- Cancel Project Edit -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn icon text @click.stop="clickedCancel()" v-on="on">
                      <v-icon class="case-gray">cancel</v-icon>
                    </v-btn>
                  </template>
                  <span>Cancel</span>
                </v-tooltip>
              </div>
              <div v-else><v-progress-circular color="#bc3825" indeterminate /></div>
            </div>
            <div v-else>
              <div v-if="!isDeletingOrUpdatingStatus(item)">
                <!-- Employees Assigned -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      :disabled="
                        editingProjectItem != null ||
                        isEditingContractItem ||
                        projectLoading ||
                        isContractDeletingOrUpdatingStatus
                      "
                      @click.stop="
                        () => {
                          toggleProjectEmployeesModal = true;
                          contractEmployeesAssigned = contract.item;
                          projectEmployeesAsseigned = item;
                        }
                      "
                      icon
                      text
                      v-on="on"
                    >
                      <v-icon class="case-gray">group</v-icon>
                    </v-btn></template
                  >
                  <span>View Employees Assigned to Project</span>
                </v-tooltip>

                <!-- Edit Project -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      :disabled="
                        editingProjectItem != null ||
                        isEditingContractItem ||
                        projectLoading ||
                        isContractDeletingOrUpdatingStatus
                      "
                      icon
                      text
                      @click.stop="clickedEdit(item)"
                      v-on="on"
                    >
                      <v-icon class="case-gray">edit</v-icon>
                    </v-btn>
                  </template>
                  <span>Edit</span>
                </v-tooltip>

                <!-- Activate/Deactivate Project -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      icon
                      text
                      :disabled="
                        editingProjectItem != null ||
                        isEditingContractItem ||
                        projectLoading ||
                        isContractDeletingOrUpdatingStatus
                      "
                      v-on="on"
                      @click.stop="
                        toggleProjectStatusModal = true;
                        projectStatusItem = item;
                      "
                    >
                      <v-icon class="case-gray"
                        >mdi-file-document-{{ item.inactive ? 'check' : 'remove-outline' }}</v-icon
                      >
                    </v-btn>
                  </template>
                  <span>{{ item.inactive ? 'Activate' : 'Deactivate' }} Project</span>
                </v-tooltip>

                <!-- Delete Project -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      :disabled="
                        editingProjectItem != null ||
                        isEditingContractItem ||
                        projectLoading ||
                        isContractDeletingOrUpdatingStatus
                      "
                      @click.stop="clickedDeleteProject(contract.item, item)"
                      icon
                      text
                      v-on="on"
                    >
                      <v-icon class="case-gray">delete</v-icon>
                    </v-btn>
                  </template>
                  <span>Delete</span>
                </v-tooltip>
              </div>
              <div v-else><v-progress-circular color="#bc3825" indeterminate /></div>
            </div>
          </template>
        </v-data-table>
      </v-form>
      <!-- END EXPANDED PROJECTS DATA TABLE-->
    </v-container>
    <delete-modal :toggleDeleteModal="toggleProjectDeleteModal" :type="'project'"></delete-modal>
    <contract-project-delete-warning
      :toggleModal="toggleWarningModal"
      :relationships="relationships"
    ></contract-project-delete-warning>
    <general-confirmation-modal
      :title="`Are you sure you want to make this project ${
        projectStatusItem && projectStatusItem.inactive ? 'active' : 'inactive'
      }?`"
      type="contract-project-status"
      :toggleModal="toggleProjectStatusModal"
    ></general-confirmation-modal>
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
import DeleteModal from '../modals/DeleteModal.vue';
import GeneralConfirmationModal from '../modals/GeneralConfirmationModal.vue';
import ProjectsEmployeesAssignedModal from '../modals/ProjectsEmployeesAssignedModal.vue';
import ContractProjectDeleteWarning from '../modals/ContractProjectDeleteWarning.vue';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * created life cycle hook
 */
function created() {
  window.EventBus.$on('confirm-delete-project', async () => {
    await this.deleteProject(this.deleteProjectItem.contract, this.deleteProjectItem.project.id);
    this.deleteProjectItem = null;
  });
  window.EventBus.$on('canceled-delete-project', () => {
    this.deleteProjectItem = null;
  });
  window.EventBus.$on('confirmed-contract-project-status', async () => {
    this.projectLoading = true;
    window.EventBus.$emit('is-editing-project-item', true);
    let contracts = this.$store.getters.contracts;
    let contractIdx = _.findIndex(contracts, (c) => _.find(c.projects, (p) => p.id === this.projectStatusItem.id));
    let projectIdx = _.findIndex(contracts[contractIdx].projects, (p) => p.id === this.projectStatusItem.id);
    await api.updateItem(api.CONTRACTS, contracts[contractIdx]);
    contracts[contractIdx].projects[projectIdx]['inactive'] = !contracts[contractIdx].projects[projectIdx]['inactive'];
    this.displaySuccess(
      `Contract is now ${contracts[contractIdx].projects[projectIdx]['inactive'] ? 'inactive' : 'active'}!`
    );
    this.$store.dispatch('setContracts', { contracts });
    this.projectStatusItem = null;
    this.toggleProjectStatusModal = false;
    this.projectLoading = false;
    window.EventBus.$emit('is-editing-project-item', false);
  });
  window.EventBus.$on('canceled-contract-project-status', () => {
    this.toggleProjectStatusModal = false;
  });
  window.EventBus.$on('closed-project-employees-assigned-modal', () => {
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
    return 'highlight-row';
  }
  return '';
} // projectRowClass

/**
 * Click edit handler
 *
 * @param item item that is being edited
 */
function clickedEdit(item) {
  this.editingProjectItem = _.cloneDeep(item);
  window.EventBus.$emit('is-editing-project-item', true);
} // clickedEdit

/**
 * Handler for clicked cancel
 */
function clickedCancel() {
  this.editingProjectItem = null;
  window.EventBus.$emit('is-editing-project-item', false);
} // clickedCancel

/**
 * Updates project in inline row edit (expandable row)
 *
 * @param contract contract object that project is under
 */
async function updateProject(contract) {
  let valid = this.$refs.projectForm.validate();
  if (!valid) return;
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
  window.EventBus.$emit('is-editing-project-item', false);
} // updateProject

/**
 * Handler for click delete project
 *
 * @param contract contract that project is under
 * @param project project to be deleted
 */
async function clickedDeleteProject(contract, project) {
  let relationships = await this.getEmployeeContractRelationships(contract, project);
  if (relationships.length != 0) {
    this.toggleWarningModal = !this.toggleWarningModal;
    this.relationships = relationships;
  } else {
    this.deleteProjectItem = { contract: contract, project: project };
    this.toggleProjectDeleteModal = !this.toggleProjectDeleteModal;
  }
} // clickedDeleteProject

/**
 * Deletes project given project ID
 *
 * @param contract contract that project is under
 * @param projectID id of project to delete
 */
async function deleteProject(contract, projectID) {
  try {
    this.projectLoading = true;
    window.EventBus.$emit('is-editing-project-item', true);
    let contractObj = _.cloneDeep(contract);
    let projectIndex = contractObj.projects.findIndex((item) => item.id == projectID);
    contractObj.projects.splice(projectIndex, 1);
    await api.updateItem(api.CONTRACTS, contractObj);
    let contracts = _.cloneDeep(this.$store.getters.contracts);
    let contractIndex = contracts.findIndex((c) => c.id == contract.id);
    contracts[contractIndex] = contractObj;
    this.$store.dispatch('setContracts', { contracts: contracts });
    this.displaySuccess('Item was successfully deleted!');
    this.projectLoading = false;
    window.EventBus.$emit('is-editing-project-item', false);
  } catch (err) {
    this.displayError(err);
    this.projectLoading = false;
    window.EventBus.$emit('is-editing-project-item', false);
  }
} // deleteProject

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
  window.EventBus.$emit('status-alert', status);
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

  window.EventBus.$emit('status-alert', status);
} // displayError

/**
 * Gets relationships between projects and employees
 *
 * @param contract contract to find employees under
 * @param project project to find employees under
 *
 * @return list of relationships in the following format
 *        [{contract: "", prime: "", project: {...}, employees: [...]}, ...]
 */
async function getEmployeeContractRelationships(contract, project = null) {
  if (!this.$store.getters.employees) {
    await this.updateStoreEmployees();
  }
  let employees = this.$store.getters.employees;
  let relationships = [];
  employees.forEach((e) => {
    if (e.contracts) {
      let contractObj = e.contracts.find((c) => c.contractId == contract.id);
      if (contractObj) {
        if (project) {
          let employeeAssignedToProject = e.contracts.some((c) => c.projects.some((p) => p.projectId == project.id));
          if (employeeAssignedToProject) {
            let index = relationships.findIndex((r) => r.project.id == project.id);
            if (index < 0) {
              relationships.push({
                contract: contract.contractName,
                prime: contract.primeName,
                project: project,
                employees: [e]
              });
            } else {
              relationships[index].employees.push(e);
            }
          }
        } else {
          contractObj.projects.forEach((p) => {
            let index = relationships.findIndex((r) => r.project.id == p.projectId);
            if (index < 0) {
              relationships.push({
                contract: contract.contractName,
                prime: contract.primeName,
                project: this.getProject(contract.id, p.projectId),
                employees: [e]
              });
            } else {
              relationships[index].employees.push(e);
            }
          });
        }
      }
    }
  });
  return relationships;
} // getEmployeeContractRelationships

/**
 * Gets project object from vuex store based on contract id and project id
 *
 * @param contractId contract id of contract that project is under
 * @param projectId project id
 */
function getProject(contractId, projectId) {
  let contracts = this.$store.getters.contracts;
  return contracts.find((c) => c.id == contractId).projects.find((p) => p.id == projectId);
} // getProject

/**
 * Returns true if project is being deleted or its status is being updated,
 * false otherwise
 *
 * @param projectItem project item in data table row
 * @returns truen if project is being deleted or its status is being updated
 */
function isDeletingOrUpdatingStatus(projectItem) {
  return (
    this.projectLoading &&
    ((this.deleteProjectItem && this.deleteProjectItem.project.id == projectItem.id) ||
      (this.projectStatusItem && this.projectStatusItem.id == projectItem.id))
  );
} // isDeletingOrUpdatingStatus

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  components: { DeleteModal, GeneralConfirmationModal, ProjectsEmployeesAssignedModal, ContractProjectDeleteWarning },
  methods: {
    projectRowClass,
    clickedDeleteProject,
    updateProject,
    clickedEdit,
    clickedCancel,
    deleteProject,
    displaySuccess,
    displayError,
    getEmployeeContractRelationships,
    getProject,
    isDeletingOrUpdatingStatus
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
      deleteProjectItem: null,
      editingProjectItem: null,
      projectStatusItem: null,
      toggleProjectDeleteModal: false,
      toggleProjectStatusModal: false,
      toggleProjectEmployeesModal: false,
      toggleWarningModal: false,
      contractEmployeesAssigned: null,
      projectEmployeesAsseigned: null,
      projectHeaders: [
        {
          text: 'Project',
          value: 'projectName',
          align: 'center',
          width: '85%'
        },
        {
          value: 'actions',
          sortable: false,
          width: '15%'
        }
      ]
    };
  },

  props: ['contract', 'isEditingContractItem', 'isContractDeletingOrUpdatingStatus', 'colspan']
};
</script>
<style lang="scss">
@import 'src/assets/styles/styles';
.inactive {
  color: $case-red;
}

.highlight-row {
  background-color: rgb(238, 238, 238) !important;
}
</style>
