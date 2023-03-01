<template>
  <td :colspan="colspan" class="pa-0 ma-0">
    <v-container fluid class="pa-0 ma-0">
      <!-- START EXPANDED PROJECTS DATA TABLE-->
      <v-form ref="projectForm" lazy-validation>
        <v-data-table
          :headers="projectHeaders"
          :items="contract.item.projects"
          :item-class="projectRowClass"
          class="projects-table"
          hide-default-footer
          hide-default-header
          no-data-text="No active projects"
          show-select
          single-select
        >
          <!-- Just a spacer -->
          <template v-if="!editingProjectItem" v-slot:[`item.spacer`]="{ item }">
            <span :class="{ inactive: item.inactive }">{{ item.spacer }}</span>
          </template>

          <!-- Item CheckBox Slot -->
          <template v-slot:[`item.data-table-select`]="{ item }">
            <div class="checkBox-container fill-height fill-width align-center">
              <div :class="`${item.status}-status status-indicator`"></div>
              <v-checkbox
                :input-value="item.checkBox"
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
            ></v-text-field>
            <span v-else>{{ item.projectName }}</span>
          </template>

          <!-- Directorate -->
          <template v-slot:[`item.directorate`]="{ item }">
            <v-text-field
              v-if="editingProjectItem && editingProjectItem.id == item.id"
              v-model="editingProjectItem.directorate"
              label="Directorate"
            ></v-text-field>
            <span v-else>{{ item.directorate }}</span>
          </template>

          <!-- PoP Start Date Slot -->
          <template v-slot:[`item.popStartDate`]="{ item }">
            <v-text-field
              v-if="editingProjectItem && editingProjectItem.id == item.id"
              v-model="editingProjectItem.popStartDate"
              label="PoP Start Date"
            ></v-text-field>
            <span v-else>{{ item.popStartDate }}</span>
          </template>

          <!-- PoP End Date Slot -->
          <template v-slot:[`item.popEndDate`]="{ item }">
            <v-text-field
              v-if="editingProjectItem && editingProjectItem.id == item.id"
              v-model="editingProjectItem.popEndDate"
              label="PoP End Date"
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
              rows="1"
              @click.stop
            ></v-textarea>
            <span v-else>{{ item.description }}</span>
          </template>

          <!-- Project Active Employees Slot -->
          <template v-slot:[`item.projectActiveEmployees`]="{ item }">
            <span
              v-for="(emp, i) in item.projectActiveEmployees"
              :key="emp.employeeNumber"
              :class="{ inactive: item.status == contractStatuses.INACTIVE }"
            >
              <a @click="$router.push(`/employee/${emp.employeeNumber}`)">{{ nicknameAndLastName(emp) }}</a>
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
              <div>
                <!-- Employees Assigned -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
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
                      :disabled="editingProjectItem != null || isEditingContractItem || projectLoading"
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

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * created life cycle hook
 */
function created() {
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
 * Sets the projects active employees in the form of a list.
 */
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
} // setProjectActiveEmployees

/**
 * Toggles project checkBox item
 *
 * @param projectItem projectItem checkbox to toggle
 */
function toggleProjectCheckBox(projectItem) {
  window.EventBus.$emit('toggle-project-checkBox', { contract: this.contract, project: projectItem });
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
    getProject,
    nicknameAndLastName,
    setProjectActiveEmployees,
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
          align: 'right'
        }
      ]
    };
  },

  props: ['contract', 'isEditingContractItem', 'isContractDeletingOrUpdatingStatus', 'colspan']
};
</script>
<style lang="scss">
@import 'src/assets/styles/styles';

.highlight-project-row {
  background-color: rgb(255, 255, 255) !important;
}
</style>

<style scoped></style>
