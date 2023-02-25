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
          show-select
          single-select
        >
          <!-- Just a spacer -->
          <template v-if="!editingProjectItem" v-slot:[`item.spacer`]="{ item }">
            <span :class="{ inactive: item.inactive }">{{ item.spacer }}</span>
          </template>
          <template v-slot:[`item.data-table-select`]="{ item }">
            <v-checkbox
              :input-value="item.checkBox"
              primary
              class="ma-0"
              hide-details
              @click.stop="toggleProjectCheckBox(item)"
            >
            </v-checkbox>
          </template>
          <template v-slot:[`item.projectName`]="{ item }">
            <v-text-field
              :rules="[(v) => !!v || 'Field is required', duplicateProjects(contract.item)]"
              v-if="editingProjectItem && editingProjectItem.id == item.id"
              v-model="editingProjectItem.projectName"
              label="Project Name"
            ></v-text-field>
            <span v-else :class="{ inactive: item.status == contractStatuses.INACTIVE }">{{ item.projectName }}</span>
          </template>

          <!-- Directorate -->
          <template v-slot:[`item.directorate`]="{ item }">
            <v-text-field
              v-if="editingProjectItem && editingProjectItem.id == item.id"
              v-model="editingProjectItem.directorate"
              label="Directorate"
            ></v-text-field>
            <span v-else :class="{ inactive: item.status == contractStatuses.INACTIVE }">{{ item.directorate }}</span>
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
            <span v-else :class="{ inactive: item.status == contractStatuses.INACTIVE }">{{
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
            <span v-else :class="{ inactive: item.status == contractStatuses.INACTIVE }">{{
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
            <span v-else :class="{ inactive: item.status == contractStatuses.INACTIVE }">{{ item.description }}</span>
          </template>

          <!-- Project Active Employees Slot -->
          <template v-slot:[`item.projectActiveEmployees`]="{ item }">
            <span
              v-for="(emp, i) in item.projectActiveEmployees"
              :key="emp.employeeNumber"
              :class="{ inactive: item.status == contractStatuses.INACTIVE }"
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
import ProjectsEmployeesAssignedModal from '../modals/ProjectsEmployeesAssignedModal.vue';

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

function toggleProjectCheckBox(projectItem) {
  window.EventBus.$emit('toggle-project-checkBox', { contract: this.contract, project: projectItem });
}

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
    format,
    getDateOptionalRules,
    getProject,
    setProjectActiveEmployees,
    toggleProjectCheckBox
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
      editingProjectItem: null,
      popStartDateMenu: false,
      popEndDateMenu: false,
      toggleProjectEmployeesModal: false,
      contractEmployeesAssigned: null,
      projectEmployeesAsseigned: null,
      contractStatuses: api.CONTRACT_STATUSES,
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
