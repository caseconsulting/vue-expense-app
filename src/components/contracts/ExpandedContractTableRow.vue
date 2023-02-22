<template>
  <td :colspan="colspan" class="pa-0 ma-0">
    <v-container fluid class="pa-0 ma-0">
      <!-- START EXPANDED PROJECTS DATA TABLE-->
      <v-form ref="projectForm" lazy-validation>
        <v-data-table
          :headers="projectHeaders"
          :items="contract.item.projects"
          :item-class="projectRowClass"
          :search="search"
          class="projects-table"
          hide-default-footer
          hide-default-header
          no-data-text="No active projects"
        >
          <!-- Just a spacer -->
          <template v-if="!editingProjectItem" v-slot:[`item.spacer`]="{ item }">
            <span :class="{ inactive: item.inactive }">{{ item.spacer }}</span>
          </template>

          <!-- Project Name -->
          <template v-slot:[`item.projectName`]="{ item }">
            <v-text-field
              :rules="[(v) => !!v || 'Field is required', duplicateProjects(contract.item)]"
              v-if="editingProjectItem && editingProjectItem.id == item.id"
              v-model="editingProjectItem.projectName"
              label="Project Name"
            ></v-text-field>
            <span v-else :class="{ inactive: item.inactive }">{{ item.projectName }}</span>
          </template>

          <!-- Directorate -->
          <template v-slot:[`item.directorate`]="{ item }">
            <v-text-field
              v-if="editingProjectItem && editingProjectItem.id == item.id"
              v-model="editingProjectItem.directorate"
              label="Directorate"
            ></v-text-field>
            <span v-else :class="{ inactive: item.inactive }">{{ item.directorate }}</span>
          </template>

          <!-- PoP Start Date Slot -->
          <template v-slot:[`item.popStartDate`]="{ item }">
            <v-menu
              name="popStartDate"
              v-if="editingProjectItem && editingProjectItem.id == item.id"
              ref="popStartDateMenu"
              :close-on-content-click="false"
              v-model="popStartDateMenu"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  :value="format(editingProjectItem.popStartDate, null, 'MM/DD/YYYY')"
                  :rules="[...getDateOptionalRules(), startDateRules()]"
                  hint="MM/DD/YYYY format"
                  v-mask="'##/##/####'"
                  label="PoP Start Date"
                  persistent-hint
                  @blur="editingProjectItem.popStartDate = format($event.target.value, 'MM/DD/YYYY', 'YYYY-MM-DD')"
                  @input="popStartDateMenu = false"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="editingProjectItem.popStartDate"
                no-title
                @input="popStartDateMenu = false"
              ></v-date-picker>
            </v-menu>
            <!-- </v-form> -->
            <span v-else :class="{ inactive: item.inactive }">{{
              format(item.popStartDate, 'YYYY-MM-DD', 'MM/DD/YYYY')
            }}</span>
          </template>

          <!-- PoP End Date Slot -->
          <template v-slot:[`item.popEndDate`]="{ item }">
            <v-menu
              name="popEndDate"
              v-if="editingProjectItem && editingProjectItem.id == item.id"
              ref="popEndDateMenu"
              :close-on-content-click="false"
              v-model="popEndDateMenu"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  :value="format(editingProjectItem.popEndDate, null, 'MM/DD/YYYY')"
                  :rules="[...getDateOptionalRules(), endDateRules()]"
                  hint="MM/DD/YYYY format"
                  v-mask="'##/##/####'"
                  persistent-hint
                  label="PoP End Date"
                  @blur="editingProjectItem.popEndDate = format($event.target.value, 'MM/DD/YYYY', 'YYYY-MM-DD')"
                  @input="popEndDateMenu = false"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="editingProjectItem.popEndDate"
                no-title
                @input="popEndDateMenu = false"
              ></v-date-picker>
            </v-menu>
            <span v-else :class="{ inactive: item.inactive }">{{
              format(item.popEndDate, 'YYYY-MM-DD', 'MM/DD/YYYY')
            }}</span>
          </template>

          <!-- Project Description Slot -->
          <template v-slot:[`item.description`]="{ item }">
            <v-textarea
              v-if="editingProjectItem && editingProjectItem.id == item.id"
              v-model="editingProjectItem.description"
              name="description"
              auto-grow
              label="Description"
              rows="1"
              @click.stop
            ></v-textarea>
            <span v-else :class="{ inactive: item.inactive }">{{ item.description }}</span>
          </template>

          <!-- Project Active Employees Slot -->
          <template v-slot:[`item.projectActiveEmployees`]="{ item }">
            <span
              v-for="(emp, i) in item.projectActiveEmployees"
              :key="emp.employeeNumber"
              :class="{ inactive: item.inactive }"
            >
              <a :href="`/employee/${emp.employeeNumber}`">{{ emp.firstName }} {{ emp.lastName }}</a>
              <span v-if="i != item.projectActiveEmployees.length - 1">, </span>
            </span>
          </template>

          <!-- Actions -->
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

import { format, isAfter, isBefore } from '@/shared/dateUtils';
import { getDateOptionalRules } from '@/shared/validationUtils';
import { mask } from 'vue-the-mask';

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

  this.setProjectActiveEmployees();
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

function setProjectActiveEmployees() {
  _.forEach(this.contract.item.projects, (project) => {
    let employeesList = [];
    _.forEach(this.$store.getters.employees, (employee) => {
      if (employee.contracts) {
        let contractObj = employee.contracts.find((c) => c.contractId == this.contract.item.id);
        if (contractObj) {
          if (employee.contracts.some((c) => c.projects.some((p) => p.projectId == project.id && !p.endDate))) {
            employeesList.push(employee);
          }
        }
      }
    });
    project['projectActiveEmployees'] = employeesList;
  });
}

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
    format,
    getDateOptionalRules,
    getEmployeeContractRelationships,
    getProject,
    isDeletingOrUpdatingStatus,
    setProjectActiveEmployees
  },
  directives: { mask },
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
      startDateRules: () => {
        return this.editingProjectItem.popStartDate && this.editingProjectItem.popEndDate
          ? isBefore(this.editingProjectItem.popStartDate, this.editingProjectItem.popEndDate) ||
              'Start date must be before the end date'
          : true;
      },
      endDateRules: () => {
        return this.editingProjectItem.popStartDate && this.editingProjectItem.popEndDate
          ? isAfter(this.editingProjectItem.popEndDate, this.editingProjectItem.popStartDate) ||
              'Start date must be before the end date'
          : true;
      },
      projectLoading: false,
      relationships: [],
      deleteProjectItem: null,
      editingProjectItem: null,
      popStartDateMenu: false,
      popEndDateMenu: false,
      projectStatusItem: null,
      toggleProjectDeleteModal: false,
      toggleProjectStatusModal: false,
      toggleProjectEmployeesModal: false,
      toggleWarningModal: false,
      contractEmployeesAssigned: null,
      projectEmployeesAsseigned: null,
      projectHeaders: [
        {
          text: '',
          value: 'spacer'
          // align: 'center',
          // width: '10%'
        },
        {
          text: 'Project',
          value: 'projectName'
          // align: 'center',
          // width: '10%'
        },
        {
          text: 'Directorate',
          value: 'directorate'
          // align: 'center',
          // width: '10%'
        },
        {
          text: 'PoP-Start Date',
          value: 'popStartDate'
          // align: 'center',
          // width: '10%'
        },
        {
          text: 'PoP-End Date',
          value: 'popEndDate'
          // align: 'center',
          // width: '10%'
        },
        {
          text: 'Description',
          value: 'description'
          // align: 'left',
          // width: '25%'
        },
        {
          text: 'Active Employees',
          value: 'projectActiveEmployees'
          // align: 'left',
          // width: '22%'
        },
        {
          value: 'actions',
          sortable: false,
          align: 'right'
          // width: '13%'
        }
      ]
    };
  },

  props: ['contract', 'isEditingContractItem', 'isContractDeletingOrUpdatingStatus', 'colspan', 'search']
};
</script>
<style lang="scss">
@import 'src/assets/styles/styles';
.inactive {
  color: $case-red;
}

.highlight-project-row {
  background-color: rgb(255, 255, 255) !important;
}
</style>

<style scoped></style>
