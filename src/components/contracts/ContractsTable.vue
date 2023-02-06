<template>
  <div>
    <v-card class="mt-3">
      <v-container fluid>
        <v-row class="flex justify-spacebetween ma-1">
          <v-col cols="6" xl="6" lg="6" md="6" class="my-0 pb-0">
            <v-text-field
              id="contractsSearch"
              v-model="search"
              label="Search Table Contents"
              auto-select-first
              append-icon="search"
              clearable
            ></v-text-field>
          </v-col>
          <v-col cols="6" xl="6" lg="6" md="6" class="my-0 pb-0">
            <v-checkbox v-model="showInactive" label="Show Inactive Contracts/Projects"></v-checkbox>
          </v-col>
        </v-row>
        <!-- START CONTRACTS DATA TABLE -->
        <v-form ref="form" lazy-validation>
          <v-data-table
            v-if="!$store.getters.contracts"
            :loading="!$store.getters.contracts"
            :headers="contractHeaders"
            :items-per-page="-1"
          ></v-data-table>
          <v-data-table
            v-else
            @click:row="clickedRow"
            :loading="loading"
            :expanded.sync="expanded"
            :headers="contractHeaders"
            :items="storeContracts"
            :items-per-page="-1"
            :item-class="contractRowClass"
            :search="search"
          >
            <!-- Contract Name Slot -->
            <template v-slot:[`item.contractName`]="{ item }">
              <v-text-field
                name="contractName"
                v-if="editingItem && editingItem.id == item.id"
                v-model="editingItem.contractName"
                prepend-icon="mdi-script-outline"
                :rules="[(v) => !!v || 'Field is required', duplicateContractPrimeCombo()]"
                required
              ></v-text-field>
              <!-- </v-form> -->
              <span v-else :class="{ inactive: item.inactive }">{{ item.contractName }}</span>
            </template>
            <!-- Prime Name Slot -->
            <template v-slot:[`item.primeName`]="{ item }">
              <v-text-field
                name="primeName"
                v-if="editingItem && editingItem.id == item.id"
                v-model="editingItem.primeName"
                prepend-icon="mdi-office-building-outline"
                :rules="[(v) => !!v || 'Field is required', duplicateContractPrimeCombo()]"
                required
              ></v-text-field>
              <!-- </v-form> -->
              <span v-else :class="{ inactive: item.inactive }">{{ item.primeName }}</span>
            </template>
            <!-- Cost Type Slot -->
            <template v-slot:[`item.costType`]="{ item }">
              <v-text-field
                name="costType"
                v-if="editingItem && editingItem.id == item.id"
                v-model="editingItem.costType"
                prepend-icon="mdi-currency-usd"
              ></v-text-field>
              <!-- </v-form> -->
              <span v-else :class="{ inactive: item.inactive }">{{ item.costType }}</span>
            </template>
            <!-- PoP Start Date Slot -->
            <template v-slot:[`item.popStartDate`]="{ item }">
              <v-menu
                name="popStartDate"
                v-if="editingItem && editingItem.id == item.id"
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
                    :value="format(editingItem.popStartDate, null, 'MM/DD/YYYY')"
                    :rules="[...getDateOptionalRules(), startDateRules()]"
                    hint="MM/DD/YYYY format"
                    v-mask="'##/##/####'"
                    persistent-hint
                    prepend-icon="event"
                    @blur="editingItem.popStartDate = format($event.target.value, 'MM/DD/YYYY', 'YYYY-MM-DD')"
                    @input="popStartDateMenu = false"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="editingItem.popStartDate"
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
                v-if="editingItem && editingItem.id == item.id"
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
                    :value="format(editingItem.popEndDate, null, 'MM/DD/YYYY')"
                    :rules="[...getDateOptionalRules(), endDateRules()]"
                    hint="MM/DD/YYYY format"
                    v-mask="'##/##/####'"
                    persistent-hint
                    prepend-icon="event"
                    @blur="editingItem.popEndDate = format($event.target.value, 'MM/DD/YYYY', 'YYYY-MM-DD')"
                    @input="popEndDateMenu = false"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="editingItem.popEndDate"
                  no-title
                  @input="popEndDateMenu = false"
                ></v-date-picker>
              </v-menu>
              <span v-else :class="{ inactive: item.inactive }">{{
                format(item.popEndDate, 'YYYY-MM-DD', 'MM/DD/YYYY')
              }}</span>
            </template>
            <!-- Contract Description Slot -->
            <template v-slot:[`item.description`]="{ item }">
              <v-textarea
                v-if="editingItem && editingItem.id == item.id"
                v-model="editingItem.description"
                name="description"
                auto-grow
                prepend-icon="mdi-text"
                label="Description"
                rows="1"
                @click.stop
              ></v-textarea>
              <span v-else>{{ item.description }}</span>
            </template>

            <!-- Expanded Row Slot -->
            <template v-slot:expanded-item="contract">
              <td :colspan="contractHeaders.length" class="pa-0">
                <v-container fluid class="grey-background">
                  <!-- START EXPANDED PROJECTS DATA TABLE-->
                  <v-data-table
                    :headers="projectHeaders"
                    :items="contract.item.projects"
                    hide-default-footer
                    :item-class="projectRowClass"
                  >
                    <template v-slot:[`item.projectName`]="{ item }">
                      <v-text-field
                        :rules="[(v) => !!v || 'Field is required', duplicateProjects(contract.item)]"
                        v-if="editingItem && editingItem.id == item.id"
                        v-model="editingItem.projectName"
                        prepend-icon="mdi-briefcase-outline"
                      ></v-text-field>
                      <span v-else :class="{ inactive: item.inactive }">{{ item.projectName }}</span>
                    </template>
                    <template v-slot:[`item.actions`]="{ item }">
                      <div v-if="editingItem && editingItem.id == item.id">
                        <div v-if="!contractLoading">
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
                              <v-btn
                                icon
                                text
                                @click.stop="
                                  () => {
                                    editingItem = null;
                                  }
                                "
                                v-on="on"
                              >
                                <v-icon class="case-gray">cancel</v-icon>
                              </v-btn>
                            </template>
                            <span>Cancel</span>
                          </v-tooltip>
                        </div>
                        <div v-else><v-progress-circular color="#bc3825" indeterminate /></div>
                      </div>
                      <div v-else>
                        <!-- Employees Assigned -->
                        <v-tooltip top>
                          <template v-slot:activator="{ on }">
                            <v-btn
                              :disabled="
                                editingItem != null ||
                                (contractLoading &&
                                  contractProjectStatusItem &&
                                  contractProjectStatusItem.id === item.id)
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
                                editingItem != null ||
                                (contractLoading &&
                                  contractProjectStatusItem &&
                                  contractProjectStatusItem.id === item.id)
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
                              :disabled="editingItem != null"
                              :loading="
                                contractLoading && contractProjectStatusItem && contractProjectStatusItem.id === item.id
                              "
                              v-on="on"
                              @click.stop="
                                toggleContractProjectStatusModal = true;
                                contractProjectStatusItem = cloneDeep(item);
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
                                editingItem != null ||
                                (contractLoading &&
                                  contractProjectStatusItem &&
                                  contractProjectStatusItem.id === item.id)
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
                    </template>
                  </v-data-table>
                  <!-- END EXPANDED PROJECTS DATA TABLE-->
                </v-container>
              </td>
            </template>

            <!-- Actions Slot -->
            <template v-slot:[`item.actions`]="{ item }">
              <!-- IS EDITING ROW -->
              <div v-if="editingItem && editingItem.id == item.id">
                <div v-if="!contractLoading">
                  <!-- Save Contract -->
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn @click.stop="updateContractPrime()" icon text v-on="on">
                        <v-icon class="case-gray">save</v-icon>
                      </v-btn>
                    </template>
                    <span>Save</span>
                  </v-tooltip>

                  <!-- Cancel Contract -->
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        icon
                        text
                        @click.stop="
                          () => {
                            editingItem = null;
                          }
                        "
                        v-on="on"
                      >
                        <v-icon class="case-gray">cancel</v-icon>
                      </v-btn>
                    </template>
                    <span>Cancel</span>
                  </v-tooltip>
                </div>
                <div v-else><v-progress-circular color="#bc3825" indeterminate /></div>
              </div>

              <!-- IS NOT EDITING ROW -->
              <div v-else>
                <!-- Add Project -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      :disabled="
                        editingItem != null ||
                        (contractLoading && contractStatusItem && contractStatusItem.id === item.id)
                      "
                      @click.stop="
                        () => {
                          addProjectUnderContract = item;
                          toggleProjectForm = !toggleProjectForm;
                        }
                      "
                      icon
                      text
                      v-on="on"
                    >
                      <v-icon class="case-gray">mdi-file-document-plus</v-icon>
                    </v-btn>
                  </template>
                  <span>Add Project</span>
                </v-tooltip>

                <!-- Edit Contract -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      icon
                      text
                      :disabled="
                        editingItem != null ||
                        (contractLoading && contractStatusItem && contractStatusItem.id === item.id)
                      "
                      v-on="on"
                      @click.stop="clickedEdit(item)"
                    >
                      <v-icon class="case-gray">edit</v-icon>
                    </v-btn>
                  </template>
                  <span>Edit</span>
                </v-tooltip>

                <!-- Deactivate Contract -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      icon
                      text
                      :disabled="editingItem != null"
                      :loading="contractLoading && contractStatusItem && contractStatusItem.id === item.id"
                      v-on="on"
                      @click.stop="
                        toggleContractStatusModal = true;
                        contractStatusItem = cloneDeep(item);
                      "
                    >
                      <v-icon class="case-gray"
                        >mdi-file-document-{{ item.inactive ? 'check' : 'remove-outline' }}</v-icon
                      >
                    </v-btn>
                  </template>
                  <span>{{ item.inactive ? 'Activate' : 'Deactivate' }} Contract</span>
                </v-tooltip>

                <!-- Delete Contract -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      :disabled="
                        editingItem != null ||
                        (contractLoading && contractStatusItem && contractStatusItem.id === item.id)
                      "
                      @click.stop="clickedDeleteContractPrime(item)"
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
            </template>
          </v-data-table>
        </v-form>
      </v-container>
    </v-card>
    <projects-employees-assigned-modal
      :toggleModal="toggleProjectEmployeesModal"
      :contract="contractEmployeesAssigned"
      :project="projectEmployeesAsseigned"
    />
    <delete-modal :toggleDeleteModal="toggleContractDeleteModal" :type="'contract'"></delete-modal>
    <delete-modal :toggleDeleteModal="toggleProjectDeleteModal" :type="'project'"></delete-modal>
    <contract-project-delete-warning
      :toggleModal="toggleWarningModal"
      :relationships="relationships"
    ></contract-project-delete-warning>
    <general-confirmation-modal
      :title="`Are you sure you want to make this contract ${
        contractStatusItem && contractStatusItem.inactive ? 'active' : 'inactive'
      }?`"
      type="contract-status"
      :toggleModal="toggleContractStatusModal"
    ></general-confirmation-modal>
    <general-confirmation-modal
      :title="`Are you sure you want to make this project ${
        contractProjectStatusItem && contractProjectStatusItem.inactive ? 'active' : 'inactive'
      }?`"
      type="contract-project-status"
      :toggleModal="toggleContractProjectStatusModal"
    ></general-confirmation-modal>
    <project-form :toggleProjectForm="toggleProjectForm" :contract="addProjectUnderContract" />
  </div>
</template>
<script>
import _ from 'lodash';
import api from '@/shared/api';
import DeleteModal from '../modals/DeleteModal.vue';
import ContractProjectDeleteWarning from '../modals/ContractProjectDeleteWarning.vue';
import ProjectForm from './ProjectForm.vue';
import { updateStoreContracts, updateStoreEmployees } from '@/utils/storeUtils';
import { format, isAfter, isBefore } from '@/shared/dateUtils';
import { getDateOptionalRules } from '@/shared/validationUtils';
import { mask } from 'vue-the-mask';
import ProjectsEmployeesAssignedModal from '../modals/ProjectsEmployeesAssignedModal.vue';
import GeneralConfirmationModal from '@/components/modals/GeneralConfirmationModal.vue';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * created life cycle hook
 */
async function created() {
  window.EventBus.$on('confirm-delete-contract', async () => {
    await this.deleteContractPrime(this.deleteItem.id);
    this.deleteItem = null;
  });
  window.EventBus.$on('canceled-delete-contract', () => {
    this.deleteItem = null;
  });
  window.EventBus.$on('confirm-delete-project', async () => {
    await this.deleteProject(this.deleteItem.contract, this.deleteItem.project.id);
    this.deleteItem = null;
  });
  window.EventBus.$on('canceled-delete-project', () => {
    this.deleteItem = null;
  });
  window.EventBus.$on('confirmed-contract-project-status', async () => {
    this.contractLoading = true;
    let contracts = this.$store.getters.contracts;
    let contractIdx = _.findIndex(contracts, (c) =>
      _.find(c.projects, (p) => p.id === this.contractProjectStatusItem.id)
    );
    let projectIdx = _.findIndex(contracts[contractIdx].projects, (p) => p.id === this.contractProjectStatusItem.id);
    await api.updateItem(api.CONTRACTS, contracts[contractIdx]);
    contracts[contractIdx].projects[projectIdx]['inactive'] = !contracts[contractIdx].projects[projectIdx]['inactive'];
    this.displaySuccess(
      `Contract is now ${contracts[contractIdx].projects[projectIdx]['inactive'] ? 'inactive' : 'active'}!`
    );
    this.$store.dispatch('setContracts', { contracts });
    this.contractProjectStatusItem = null;
    this.toggleContractProjectStatusModal = false;
    this.contractLoading = false;
  });
  window.EventBus.$on('canceled-contract-project-status', () => {
    this.toggleContractProjectStatusModal = false;
  });
  window.EventBus.$on('confirmed-contract-status', async () => {
    this.contractLoading = true;
    let contracts = this.$store.getters.contracts;
    let contractIdx = _.findIndex(contracts, (c) => this.contractStatusItem.id === c.id);
    // if contract is becoming inactive, deactivate all of its projects
    let projects = !contracts[contractIdx]['inactive']
      ? _.map(contracts[contractIdx].projects, (p) => {
          return { ...p, inactive: true };
        })
      : contracts[contractIdx].projects;
    await api.updateItem(api.CONTRACTS, {
      ...contracts[contractIdx],
      inactive: !contracts[contractIdx]['inactive'],
      projects
    });
    contracts[contractIdx]['inactive'] = !contracts[contractIdx]['inactive'];
    contracts[contractIdx].projects = projects;
    this.displaySuccess(`Contract is now ${contracts[contractIdx]['inactive'] ? 'inactive' : 'active'}!`);
    this.$store.dispatch('setContracts', { contracts });
    this.contractStatusItem = null;
    this.toggleContractStatusModal = false;
    this.contractLoading = false;
  });
  window.EventBus.$on('canceled-contract-status', () => {
    this.toggleContractStatusModal = false;
  });
  window.EventBus.$on('canceled-project-form', () => {
    this.toggleProjectForm = false;
  });
  window.EventBus.$on('closed-project-employees-assigned-modal', () => {
    this.toggleProjectEmployeesModal = false;
  });
} // created

/**
 * beforeDestroy lifecycle hook - close event listeners
 */
function beforeDestroy() {
  window.EventBus.$off('confirm-delete-contract');
  window.EventBus.$off('canceled-delete-contract');
  window.EventBus.$off('confirm-delete-project');
  window.EventBus.$off('canceled-delete-project');
  window.EventBus.$off('confirmed-contract-project-status');
  window.EventBus.$off('canceled-contract-project-status');
  window.EventBus.$off('confirmed-contract-status');
  window.EventBus.$off('canceled-contract-status');
  window.EventBus.$off('canceled-project-form');
  window.EventBus.$off('closed-project-employees-assigned-modal');
} // beforeDestroy

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Handler for clicked contract row in data table
 * @param contractObj contract object that is clicked
 */
function clickedRow(contractObj) {
  if (_.isEmpty(this.expanded) || this.expanded[0].id != contractObj.id) {
    this.expanded = [];
    this.expanded.push(contractObj);
  } else {
    this.expanded = [];
  }
} // clickedRow

/**
 * Updates contract object in inline row edit
 */
async function updateContractPrime() {
  let valid = this.$refs.form.validate();
  if (!valid) return;
  try {
    this.contractLoading = true;
    let response = await api.updateItem(api.CONTRACTS, this.editingItem);
    if (response.name === 'AxiosError') {
      throw new Error(response.response.data.message);
    }
    let contracts = _.cloneDeep(this.$store.getters.contracts);
    let itemIndex = contracts.findIndex((item) => item.id == this.editingItem.id);
    contracts[itemIndex] = this.editingItem;
    this.$store.dispatch('setContracts', { contracts });
    this.contractLoading = false;
    this.displaySuccess('Item was successfully saved!');
  } catch (err) {
    this.contractLoading = false;
    this.displayError(err);
  }
  this.editingItem = null;
} // updateContractPrime

/**
 * Updates project in inline row edit (expandable row)
 *
 * @param contract contract object that project is under
 */
async function updateProject(contract) {
  let valid = this.$refs.form.validate();
  if (!valid) return;
  try {
    this.contractLoading = true;
    let contractObj = _.cloneDeep(contract);
    let projectIndex = contractObj.projects.findIndex((item) => item.id == this.editingItem.id);
    contractObj.projects[projectIndex] = this.editingItem;
    let response = await api.updateItem(api.CONTRACTS, contractObj);
    if (response.name === 'AxiosError') {
      throw new Error(response.response.data.message);
    }
    let contracts = _.cloneDeep(this.$store.getters.contracts);
    let contractIndex = contracts.findIndex((c) => c.id == contractObj.id);
    contracts[contractIndex] = contractObj;
    this.$store.dispatch('setContracts', { contracts });
    this.contractLoading = false;
    this.displaySuccess('Item was successfully saved!');
  } catch (err) {
    this.contractLoading = false;
    this.displayError(err);
  }
  this.editingItem = null;
} // updateProject

/**
 * Deletes contract object given contract ID
 *
 * @param contractID contract ID to delete
 */
async function deleteContractPrime(contractID) {
  try {
    await api.deleteItem(api.CONTRACTS, contractID);
    let contracts = _.cloneDeep(this.$store.getters.contracts);
    let itemIndex = contracts.findIndex((item) => item.id == contractID);
    contracts.splice(itemIndex, 1);
    this.$store.dispatch('setContracts', { contracts });
    this.displaySuccess('Item was successfully deleted!');
  } catch (err) {
    this.displayError(err);
  }
} // deleteContractPrime

/**
 * Deletes project given project ID
 *
 * @param contract contract that project is under
 * @param projectID id of project to delete
 */
async function deleteProject(contract, projectID) {
  try {
    let contractObj = _.cloneDeep(contract);
    let projectIndex = contractObj.projects.findIndex((item) => item.id == projectID);
    contractObj.projects.splice(projectIndex, 1);
    await api.updateItem(api.CONTRACTS, contractObj);
    let contracts = _.cloneDeep(this.$store.getters.contracts);
    let contractIndex = contracts.findIndex((c) => c.id == contract.id);
    contracts[contractIndex] = contractObj;
    this.$store.dispatch('setContracts', { contracts: contracts });
    this.displaySuccess('Item was successfully deleted!');
  } catch (err) {
    this.displayError(err);
  }
} // deleteProject

/**
 * Click edit handler
 *
 * @param item item that is being edited
 */
function clickedEdit(item) {
  this.editingItem = _.cloneDeep(item);
} // clickedEdit

/**
 * Handler for click delete contract button
 *
 * @param contract contract that is being deleted
 */
async function clickedDeleteContractPrime(contract) {
  let relationships = await this.getEmployeeContractRelationships(contract);
  if (relationships.length != 0) {
    this.toggleWarningModal = !this.toggleWarningModal;
    this.relationships = relationships;
  } else {
    this.deleteItem = contract;
    this.toggleContractDeleteModal = !this.toggleContractDeleteModal;
  }
} // clickedDeleteContractPrime

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
    this.deleteItem = { contract: contract, project: project };
    this.toggleProjectDeleteModal = !this.toggleProjectDeleteModal;
  }
} // clickedDeleteProject

/**
 * Clones a passed item.
 *
 * @param item - The item to clone
 * @return The cloned item
 */
function cloneDeep(item) {
  return _.cloneDeep(item);
} // cloneDeep

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
 * Adds grey highlight to contract row when expanded, editing or deleting
 *
 * @param item Item in contracts v-data-table row
 */
function contractRowClass(item) {
  if (
    (this.expanded.length > 0 && item.id == this.expanded[0].id) ||
    (this.editingItem && item.id == this.editingItem.id) ||
    (this.deleteItem && this.deleteItem.id && this.deleteItem.id == item.id)
  ) {
    return 'highlight-row';
  }
  return '';
} // contractRowClass

/**
 * Adds grey highlight to project row when editing or deleting
 *
 * @param item Item in projects v-data-table row
 */
function projectRowClass(item) {
  if (
    (this.editingItem && this.editingItem.id == item.id) ||
    (this.deleteItem && this.deleteItem.project && this.deleteItem.project.id == item.id)
  ) {
    return 'highlight-row';
  }
  return '';
} // projectRowClass

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  beforeDestroy,
  created,
  components: {
    DeleteModal,
    ContractProjectDeleteWarning,
    GeneralConfirmationModal,
    ProjectForm,
    ProjectsEmployeesAssignedModal
  },
  computed: {
    storeContracts() {
      return this.showInactive
        ? this.$store.getters.contracts
        : this.$store.getters.contracts
            .filter((c) => !c.inactive)
            .map((c) => {
              return { ...c, projects: c.projects.filter((p) => !p.inactive) };
            });
    }
  },
  methods: {
    projectRowClass,
    contractRowClass,
    getProject,
    updateStoreEmployees,
    getEmployeeContractRelationships,
    clickedDeleteContractPrime,
    clickedDeleteProject,
    cloneDeep,
    deleteProject,
    deleteContractPrime,
    displaySuccess,
    displayError,
    format,
    clickedRow,
    clickedEdit,
    updateStoreContracts,
    updateContractPrime,
    getDateOptionalRules,
    updateProject
  },
  data() {
    return {
      duplicateProjects: (contractOfProject) => {
        if (contractOfProject) {
          let contract = _.find(this.$store.getters.contracts, (c) => {
            return c.id == contractOfProject.id;
          });
          let found = _.some(contract.projects, (p) => {
            if (p.id == this.editingItem.id) return false;
            return p.projectName === this.editingItem.projectName;
          });
          return !found || 'Duplicate project names';
        }
      },
      duplicateContractPrimeCombo: () => {
        let found = _.some(this.$store.getters.contracts, (c) => {
          if (c.id == this.editingItem.id) return false;
          return c.contractName === this.editingItem.contractName && c.primeName === this.editingItem.primeName;
        });
        return !found || 'Duplicate contract and prime combination';
      },
      startDateRules: () => {
        return this.editingItem.popStartDate && this.editingItem.popEndDate
          ? isBefore(this.editingItem.popStartDate, this.editingItem.popEndDate) ||
              'Start date must be before the end date'
          : true;
      },
      endDateRules: () => {
        return this.editingItem.popStartDate && this.editingItem.popEndDate
          ? isAfter(this.editingItem.popEndDate, this.editingItem.popStartDate) ||
              'Start date must be before the end date'
          : true;
      },
      contractEmployeesAssigned: null,
      projectEmployeesAsseigned: null,
      contractStatusItem: null,
      contractProjectStatusItem: null,
      contractValid: true,
      addProjectUnderContract: null,
      toggleProjectForm: false,
      relationships: [],
      deleteItem: null,
      toggleProjectEmployeesModal: false,
      toggleWarningModal: false,
      toggleContractDeleteModal: false,
      toggleContractStatusModal: false,
      toggleContractProjectStatusModal: false,
      toggleProjectDeleteModal: false,
      popStartDateFormatted: null,
      popEndDateFormatted: null,
      popStartDateMenu: false,
      popEndDateMenu: false,
      contractLoading: false,
      editingItem: null,
      loading: false,
      expanded: [],
      search: null,
      showInactive: false,
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
      ],
      contractHeaders: [
        {
          text: 'Contract',
          value: 'contractName',
          align: 'center',
          width: '12%'
        },
        {
          text: 'Prime',
          value: 'primeName',
          align: 'center',
          width: '12%'
        },
        {
          text: 'Cost Type',
          value: 'costType',
          align: 'center',
          width: '12%'
        },
        {
          text: 'PoP-Start Date',
          value: 'popStartDate',
          align: 'center',
          width: '12%'
        },
        {
          text: 'PoP-End Date',
          value: 'popEndDate',
          align: 'center',
          width: '12%'
        },
        {
          text: 'Description',
          value: 'description',
          align: 'left',
          width: '29%'
        },
        {
          value: 'actions',
          sortable: false,
          width: '15%'
        }
      ]
    };
  },
  directives: { mask }
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
