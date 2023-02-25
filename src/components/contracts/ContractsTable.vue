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
          <v-col cols="6" xl="6" lg="6" md="6" class="my-0 pb-0 d-flex">
            <v-checkbox v-model="showInactive" label="Show Inactive Contracts/Projects"></v-checkbox>
            <div class="d-flex justify-center align-center pl-5 flex-wrap">
              <v-btn
                color="#bc3825"
                :loading="isDeleting"
                class="white--text"
                :disabled="!this.contractsCheckBoxes.some((c) => c.all || c.indeterminate) || contractLoading"
                @click="clickedDelete()"
                >Delete<v-icon right dark>delete</v-icon></v-btn
              >
              <v-btn
                class="ml-4 font-weight-medium"
                :loading="isActivating"
                :disabled="!this.contractsCheckBoxes.some((c) => c.all || c.indeterminate) || contractLoading"
                @click="updateStatus(contractStatuses.ACTIVE)"
                >Activate</v-btn
              >
              <v-btn
                class="ml-4"
                :loading="isDeactivating"
                :disabled="!this.contractsCheckBoxes.some((c) => c.all || c.indeterminate) || contractLoading"
                @click="updateStatus(contractStatuses.INACTIVE)"
                >Deactivate</v-btn
              >
              <v-btn
                class="ml-4"
                :loading="isClosing"
                :disabled="!this.contractsCheckBoxes.some((c) => c.all || c.indeterminate) || contractLoading"
                @click="updateStatus(contractStatuses.CLOSED)"
                >Close</v-btn
              >
            </div>
          </v-col>
        </v-row>
        <!-- START CONTRACTS DATA TABLE -->
        <v-form ref="form" lazy-validation>
          <v-data-table
            @click:row="clickedRow"
            :expanded.sync="expanded"
            :headers="contractHeaders"
            :items="storeContracts"
            :items-per-page="-1"
            :item-class="contractRowClass"
            :search="search"
            class="contracts-table"
            show-select
          >
            <!-- Header CheckBox Slot -->
            <template v-slot:[`header.data-table-select`]>
              <!-- Intentionally empty to hide header checkbox -->
            </template>
            <!-- CheckBox Slot -->
            <template v-slot:[`item.data-table-select`]="{ item }">
              <div class="checkBox-container fill-height fill-width align-center">
                <div :class="`${item.status}-status status-indicator`"></div>
                <v-checkbox
                  :input-value="item.all"
                  :indeterminate="item.indeterminate"
                  primary
                  class="ma-0 pl-3"
                  hide-details
                  @click.stop="toggleContractCheckBox(item)"
                >
                </v-checkbox>
              </div>
            </template>
            <!-- Prime Name Slot -->
            <template v-slot:[`item.primeName`]="{ item }">
              <v-text-field
                name="primeName"
                v-if="editingItem && editingItem.id == item.id"
                v-model="editingItem.primeName"
                label="Prime Name"
                :rules="[(v) => !!v || 'Field is required', duplicateContractPrimeCombo()]"
                required
              ></v-text-field>
              <span v-else :class="{ inactive: item.status == contractStatuses.INACTIVE, 'font-weight-bold': true }">{{
                item.primeName
              }}</span>
            </template>

            <!-- Contract Name Slot -->
            <template v-slot:[`item.contractName`]="{ item }">
              <v-text-field
                name="contractName"
                v-if="editingItem && editingItem.id == item.id"
                v-model="editingItem.contractName"
                label="Contract Name"
                :rules="[(v) => !!v || 'Field is required', duplicateContractPrimeCombo()]"
                required
              ></v-text-field>
              <!-- </v-form> -->
              <span v-else :class="{ inactive: item.status == contractStatuses.INACTIVE, 'font-weight-bold': true }">{{
                item.contractName
              }}</span>
            </template>

            <!-- Directorate Slot -->
            <template v-slot:[`item.directorate`]="{ item }">
              <v-text-field
                name="directorate"
                v-if="editingItem && editingItem.id == item.id"
                v-model="editingItem.directorate"
                label="Directorate"
              ></v-text-field>
              <span v-else :class="{ inactive: item.status == contractStatuses.INACTIVE, 'font-weight-bold': true }">{{
                item.directorate
              }}</span>
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
                    label="PoP Start Date"
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
              <span v-else :class="{ inactive: item.status == contractStatuses.INACTIVE, 'font-weight-bold': true }">{{
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
                    label="PoP End Date"
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
              <span v-else :class="{ inactive: item.status == contractStatuses.INACTIVE, 'font-weight-bold': true }">{{
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
                label="Description"
                rows="1"
                @click.stop
              ></v-textarea>
              <span v-else :class="{ inactive: item.status == contractStatuses.INACTIVE, 'font-weight-bold': true }">{{
                item.description
              }}</span>
            </template>

            <!-- Expanded Row Slot -->
            <template v-slot:expanded-item="{ headers, item }">
              <expanded-contract-table-row
                :contract="{ item }"
                :colspan="headers.length"
                :isEditingContractItem="editingItem != null"
                :isContractDeletingOrUpdatingStatus="isDeletingOrUpdatingStatus()"
                :search="search"
              />
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
                <div v-if="!isDeletingOrUpdatingStatus(item)">
                  <!-- Add Project -->
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        :disabled="editingItem != null || isEditingProjectItem || contractLoading"
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

                  <!-- Employees Assigned -->
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        :disabled="editingItem != null || isEditingProjectItem || contractLoading"
                        @click.stop="
                          () => {
                            toggleContractEmployeesModal = true;
                            contractEmployeesAssigned = item;
                          }
                        "
                        icon
                        text
                        v-on="on"
                      >
                        <v-icon class="case-gray">group</v-icon>
                      </v-btn></template
                    >
                    <span>View Employees Assigned to Contract</span>
                  </v-tooltip>

                  <!-- Edit Contract -->
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        icon
                        text
                        :disabled="editingItem != null || isEditingProjectItem || contractLoading"
                        v-on="on"
                        @click.stop="clickedEdit(item)"
                      >
                        <v-icon class="case-gray">edit</v-icon>
                      </v-btn>
                    </template>
                    <span>Edit</span>
                  </v-tooltip>
                </div>
                <div v-else><v-progress-circular color="#bc3825" indeterminate /></div>
              </div>
            </template>
          </v-data-table>
        </v-form>
      </v-container>
    </v-card>
    <contract-employees-assigned-modal
      :contract="contractEmployeesAssigned"
      :toggleModal="toggleContractEmployeesModal"
    />
    <delete-modal :toggleDeleteModal="toggleContractDeleteModal" :type="'contract'"></delete-modal>
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
import GeneralConfirmationModal from '@/components/modals/GeneralConfirmationModal.vue';
import ContractEmployeesAssignedModal from '../modals/ContractEmployeesAssignedModal.vue';
import ExpandedContractTableRow from './ExpandedContractTableRow.vue';
import { asyncForEach } from '../../utils/utils';

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
    await this.deleteItems(this.deletingItems);
    this.deletingItems = null;
  });
  window.EventBus.$on('canceled-delete-contract', () => {
    this.deletingItems = null;
  });
  window.EventBus.$on('canceled-project-form', () => {
    this.toggleProjectForm = false;
  });
  window.EventBus.$on('closed-contract-employees-assigned-modal', () => {
    this.toggleContractEmployeesModal = false;
  });
  window.EventBus.$on('is-editing-project-item', (value) => {
    this.isEditingProjectItem = value;
  });
  window.EventBus.$on('toggle-project-checkBox', ({ contract, project }) => {
    this.toggleProjectCheckBox(contract, project);
  });
  this.resetAllCheckBoxes();
  this.expanded = _.cloneDeep(this.storeContracts);
} // created

/**
 * beforeDestroy lifecycle hook - close event listeners
 */
function beforeDestroy() {
  window.EventBus.$off('confirm-delete-contract');
  window.EventBus.$off('canceled-delete-contract');
  window.EventBus.$off('confirmed-contract-status');
  window.EventBus.$off('canceled-contract-status');
  window.EventBus.$off('canceled-project-form');
  window.EventBus.$off('closed-project-employees-assigned-modal');
  window.EventBus.$off('is-editing-project-item');
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
  let i = this.expanded.findIndex((c) => c.id == contractObj.id);
  if (i == -1) {
    // item is not expanded
    this.expanded.push(contractObj);
  } else {
    // item is expanded
    this.expanded.splice(i, 1);
  }
} // clickedRow

/**
 * Updates contract object in inline row edit
 */
async function updateContractPrime() {
  let valid = this.$refs.form.validate();
  if (!valid) return;
  this.contractLoading = true;
  try {
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
    this.displayError(err);
  }
  this.contractLoading = false;
  this.editingItem = null;
} // updateContractPrime

/**
 * Delete items
 * @param items contract and project items to delete
 */
async function deleteItems(items) {
  this.isDeleting = true;
  try {
    let contracts = _.cloneDeep(this.$store.getters.contracts);
    let deleteContractPromises = [];
    let deleteProjectPromises = [];
    items.contracts.forEach((c) => {
      deleteContractPromises.push(api.deleteItem(api.CONTRACTS, c.id));
    });
    if (deleteContractPromises.length) await Promise.all(deleteContractPromises);

    items.projects.forEach((p) => {
      let index = p.contractOfProject.projects.findIndex((item) => item.id == p.project.id);
      p.contractOfProject.projects.splice(index, 1);
      deleteProjectPromises.push(api.updateItem(api.CONTRACTS, p.contractOfProject));
    });

    if (deleteProjectPromises.length) await Promise.all(deleteProjectPromises);

    items.contracts.forEach((c) => {
      let contractIndex = contracts.findIndex((item) => item.id == c.id);
      contracts.splice(contractIndex, 1);
      this.contractsCheckBoxes.splice(contractIndex, 1);
    });
    items.projects.forEach((p) => {
      let contractIndex = contracts.findIndex((c) => c.id == p.contractOfProject.id);
      let projectIndex = contracts[contractIndex].projects.findIndex((item) => item.id == p.project.id);
      this.contractsCheckBoxes[contractIndex].projectsCheckBoxes.splice(projectIndex, 1);
      contracts[contractIndex].projects.splice(projectIndex, 1);
    });
    this.$store.dispatch('setContracts', { contracts });
    this.displaySuccess('Successfully deleted item(s)!');
  } catch (err) {
    this.displayError(err);
  }
  this.isDeleting = false;
  this.resetAllCheckBoxes();
} // deleteItems

/**
 * Click edit handler
 *
 * @param item item that is being edited
 */
function clickedEdit(item) {
  this.editingItem = _.cloneDeep(item);
} // clickedEdit

/**
 * Handler for click delete button event
 */
async function clickedDelete() {
  let relationships = [];
  let selectedItems = this.getSelectedItems();
  await asyncForEach(selectedItems.contracts, async (c) => {
    relationships = [...relationships, ...(await this.getEmployeeContractRelationships(c))];
  });
  await asyncForEach(selectedItems.projects, async (p) => {
    relationships = [
      ...relationships,
      ...(await this.getEmployeeContractRelationships(p.contractOfProject, p.project))
    ];
  });

  if (relationships.length != 0) {
    this.toggleWarningModal = !this.toggleWarningModal;
    this.relationships = relationships;
  } else {
    // this.deleteItem = contract;
    this.deletingItems = selectedItems;
    this.toggleContractDeleteModal = !this.toggleContractDeleteModal;
  }
} // clickedDelete

/**
 * Updates the status of the selected items based on the given status.
 *
 * @param status status to update selected items to
 */
async function updateStatus(status) {
  this.contractLoading = true;
  if (status == api.CONTRACT_STATUSES.ACTIVE) {
    this.isActivating = true;
  } else if (status == api.CONTRACT_STATUSES.INACTIVE) {
    this.isDeactivating = true;
  } else {
    this.isClosing = true;
  }
  try {
    let updatePromises = [];
    let contracts = _.cloneDeep(this.$store.getters.contracts);
    let selectedItems = this.getSelectedItems();

    selectedItems.contracts.forEach((c) => {
      let contractIndex = contracts.findIndex((item) => item.id == c.id);
      contracts[contractIndex].status = status;
      contracts[contractIndex].projects.forEach((p) => {
        p.status = status;
      });
      updatePromises.push(api.updateItem(api.CONTRACTS, contracts[contractIndex]));
    });

    selectedItems.projects.forEach((p) => {
      let contractIndex = contracts.findIndex((item) => item.id == p.contractOfProject.id);
      let projectIndex = contracts[contractIndex].projects.findIndex((item) => item.id == p.id);
      contracts[contractIndex].projects[projectIndex].status = status;
      updatePromises.push(api.updateItem(api.CONTRACTS, contracts[contractIndex]));
    });

    this.$store.dispatch('setContracts', { contracts });
    this.displaySuccess(`Successfully marked item(s) as ${status}`);
  } catch (err) {
    this.displayError(err);
  }
  this.contractLoading = false;
  this.isActivating = false;
  this.isDeactivating = false;
  this.isClosing = false;
  this.resetAllCheckBoxes();
} // updateStatus

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
    return 'highlight-contract-row';
  }
  return 'highlight-contract-row';
} // contractRowClass

/**
 * Returns true if given contract is being deleted or its status is being updated,
 * if no parameter is specified returns true if there is a contract that is being deleted
 * or its status is being updated.
 *
 * @param contractItem contract item in data table row
 * @returns true if contract is being deleted or its status is being updated
 */
function isDeletingOrUpdatingStatus(contractItem = null) {
  return contractItem
    ? this.contractLoading &&
        ((this.contractStatusItem && this.contractStatusItem.id == contractItem.id) ||
          (this.deleteItem && this.deleteItem.id == contractItem.id))
    : this.contractLoading && (this.contractStatusItem || this.deleteItem);
} // isDeletingOrUpdatingStatus

/**
 * Resets (unchecks) all contracts and projects (boxes) in the contracts table.
 */
function resetAllCheckBoxes() {
  let uncheckedBox = { all: false, indeterminate: false };
  for (let i = 0; i < this.$store.getters.contracts.length; i++) {
    this.contractsCheckBoxes[i] = _.cloneDeep(uncheckedBox);
    this.contractsCheckBoxes[i].contractId = this.$store.getters.contracts[i].id;
    this.contractsCheckBoxes[i].projectsCheckBoxes = this.$store.getters.contracts[i].projects.map((p) => ({
      projectId: p.id,
      checkBox: false
    }));
  }
} // resetCheckAllBoxes

/**
 * Toggles the contract item check box and all the project item boxes
 *
 * @param contractItem contract item to check
 */
function toggleContractCheckBox(contractItem) {
  let index = this.contractsCheckBoxes.findIndex((c) => c.contractId == contractItem.id);
  let contractCheckBox = this.contractsCheckBoxes[index];
  if (this.determineCheckBox(contractCheckBox).all) {
    this.setAllProjectsCheckBox(contractItem, false);
  } else {
    this.setAllProjectsCheckBox(contractItem, true);
  }
  contractCheckBox = this.contractsCheckBoxes[index];
  let updatedCheckBox = this.determineCheckBox(contractCheckBox);
  contractCheckBox.all = updatedCheckBox.all;
  contractCheckBox.indeterminate = updatedCheckBox.indeterminate;
  this.$set(this.contractsCheckBoxes, index, contractCheckBox);
} // toggleContractCheckBox

/**
 * Toggles the project item checkbox
 *
 * @param contract contract of selected project item
 * @param projectItem project item
 */
function toggleProjectCheckBox(contract, projectItem) {
  this.contractsCheckBoxes
    .find((cb) => cb.contractId == contract.item.id)
    .projectsCheckBoxes.forEach((pb) => {
      if (pb.projectId == projectItem.id) {
        pb.checkBox = !pb.checkBox;
      }
    });
  let index = this.contractsCheckBoxes.findIndex((c) => c.contractId == contract.item.id);
  let contractCheckBox = this.contractsCheckBoxes[index];
  let updatedCheckBox = this.determineCheckBox(contractCheckBox);
  contractCheckBox.all = updatedCheckBox.all;
  contractCheckBox.indeterminate = updatedCheckBox.indeterminate;
  this.$set(this.contractsCheckBoxes, index, contractCheckBox);
} // toggleProjectCheckBox

/**
 * Determines the checkbox value of the contract based on the
 * @param contractCheckBox contract check box to determine
 */
function determineCheckBox(contractCheckBox) {
  let checkBox = { all: true, indeterminate: false };

  _.forEach(contractCheckBox.projectsCheckBoxes, (project) => {
    if (!project.checkBox) {
      // at least one project is not selected
      checkBox.all = false;
    }
    if (project.checkBox) {
      // at least one project selected
      checkBox.indeterminate = true;
    }
  });

  if (checkBox.all) {
    // set indeterminate to false if all projects are selected
    checkBox.indeterminate = false;
  }

  return checkBox;
} // determineCheckBox
/**
 * Sets all projects checkbox of a contract to the given value.
 *
 * @param contractItem contract item to set all projects checkbox for
 */
function setAllProjectsCheckBox(contractItem, value) {
  let index = this.contractsCheckBoxes.findIndex((c) => c.contractId == contractItem.id);
  let contractCheckBox = this.contractsCheckBoxes[index];
  let updatedProjectsCheckBoxes = contractCheckBox.projectsCheckBoxes.map((p) => {
    p.checkBox = value;
    return p;
  });
  contractCheckBox.projectsCheckBoxes = updatedProjectsCheckBoxes;
  this.$set(this.contractsCheckBoxes, index, contractCheckBox);
} // setAllProjectsCheckBox

/**
 * Gets lists of selected items in the following structure:
 * { contracts: [...], projects: [{ contractOfProject: {}, project: {} }, ...]}
 *
 * @return lists of selected items
 */
function getSelectedItems() {
  let selectedContractIds = [];
  let selectedProjectIds = [];
  this.contractsCheckBoxes.forEach((c) => {
    if (c.all) {
      selectedContractIds.push(c.contractId);
    } else if (c.indeterminate) {
      c.projectsCheckBoxes.forEach((p) => {
        if (p.checkBox) {
          selectedProjectIds.push(p.projectId);
        }
      });
    }
  });
  let selectedItems = { contracts: [], projects: [] };
  this.$store.getters.contracts.forEach((c) => {
    if (selectedContractIds.includes(c.id)) {
      selectedItems.contracts.push(c);
    } else {
      c.projects.forEach((p) => {
        if (selectedProjectIds.includes(p.id)) {
          selectedItems.projects.push({ contractOfProject: c, project: p });
        }
      });
    }
  });
  return selectedItems;
} // getSelectedItems

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Merges the checkBox list and the contracts list
 *
 * @return filtered out inactive itemsf
 */
function storeContracts() {
  let mergedCheckBoxContractsData = _.merge(this.$store.getters.contracts, this.contractsCheckBoxes);
  mergedCheckBoxContractsData.forEach((c) => {
    c.projects = _.merge(c.projects, c.projectsCheckBoxes);
    delete c.projectsCheckBoxes;
  });
  return this.showInactive
    ? mergedCheckBoxContractsData
    : mergedCheckBoxContractsData
        .filter((c) => c.status != this.contractStatuses.INACTIVE)
        .map((c) => {
          return { ...c, projects: c.projects.filter((p) => p.status != this.contractStatuses.INACTIVE) };
        });
} // storeContracts

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
    ContractEmployeesAssignedModal,
    ExpandedContractTableRow
  },
  computed: {
    storeContracts
  },
  methods: {
    contractRowClass,
    getProject,
    updateStoreEmployees,
    getEmployeeContractRelationships,
    cloneDeep,
    displaySuccess,
    displayError,
    format,
    clickedRow,
    clickedEdit,
    updateStoreContracts,
    updateContractPrime,
    getDateOptionalRules,
    isDeletingOrUpdatingStatus,
    resetAllCheckBoxes,
    determineCheckBox,
    setAllProjectsCheckBox,
    toggleContractCheckBox,
    toggleProjectCheckBox,
    getSelectedItems,
    clickedDelete,
    deleteItems,
    updateStatus
  },
  data() {
    return {
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
      contractStatuses: api.CONTRACT_STATUSES,
      contracts: this.$store.getters.contracts,
      contractEmployeesAssigned: null,
      contractStatusItem: null,
      contractValid: true,
      addProjectUnderContract: null,
      toggleProjectForm: false,
      relationships: [],
      deleteItem: null,
      deletingItems: null,
      toggleContractEmployeesModal: false,
      toggleWarningModal: false,
      toggleContractDeleteModal: false,
      toggleContractStatusModal: false,
      popStartDateMenu: false,
      popEndDateMenu: false,
      contractLoading: false,
      editingItem: null,
      isEditingProjectItem: false,
      loading: false,
      expanded: [],
      search: null,
      showInactive: false,
      contractsCheckBoxes: [],
      isDeleting: false,
      isActivating: false,
      isDeactivating: false,
      isClosing: false,
      contractHeaders: [
        {
          text: 'Prime',
          value: 'primeName',
          align: 'left'
          //width: '12%'
        },
        {
          text: 'Contract',
          value: 'contractName',
          align: 'left'
          //width: '12%'
        },
        {
          text: 'Directorate',
          value: 'directorate',
          align: 'left'
          //width: '12%'
        },
        {
          text: 'PoP-Start Date',
          value: 'popStartDate',
          align: 'left'
          //width: '12%'
        },
        {
          text: 'PoP-End Date',
          value: 'popEndDate',
          align: 'left'
          //width: '12%'
        },
        {
          text: 'Description',
          value: 'description',
          align: 'left'
          //width: '27%'
        },
        {
          text: 'Active Employees',
          value: 'spacer',
          align: 'left'
          // align: 'center',
          // width: '10%'
        },
        {
          value: 'actions',
          sortable: false,
          align: 'right'
          //width: '15%'
        }
      ]
    };
  },
  directives: { mask },
  watch: {
    '$store.getters.contracts': function () {
      if (this.$store.getters.contracts.length > this.contractsCheckBoxes.length) {
        let newContract = this.$store.getters.contracts[0];
        let checkBoxObj = {
          all: false,
          indeterminate: false,
          contractId: newContract.id,
          projectsCheckBoxes: [...newContract.projects.map((p) => ({ checkBox: false, projectId: p.id }))]
        };
        this.contractsCheckBoxes = [checkBoxObj, ...this.contractsCheckBoxes];
      }

      this.$store.getters.contracts.forEach((c, index) => {
        if (c.projects.length > this.contractsCheckBoxes[index].projectsCheckBoxes.length) {
          let newProject = c.projects[0];
          let checkBox = this.contractsCheckBoxes[index].all ? true : false;
          this.contractsCheckBoxes[index].projectsCheckBoxes = [
            { checkBox, projectId: newProject.id },
            ...this.contractsCheckBoxes[index].projectsCheckBoxes
          ];
        }
      });
    }
  }
};
</script>

<style lang="scss">
@import 'src/assets/styles/styles';

.status-indicator {
  position: absolute;
  left: 0;
  height: 100%;
  width: 10px;
}

.text-start {
  padding-left: 0px !important;
}

.checkBox-container {
  position: relative;
  display: flex;
}

.closed-status {
  background-color: #db4437;
}

.inactive-status {
  background-color: #f4b400;
}

.active-status {
  background-color: #0f9d58;
}

.highlight-contract-row {
  background-color: rgb(224, 224, 224) !important;
}
</style>

<style scoped>
@media only screen and (max-width: 1800px) {
  .contracts-table >>> td:nth-of-type(-n + 5) {
    width: 9em;
  }

  .contracts-table >>> td:nth-of-type(6) {
    width: 20em;
  }

  .contracts-table >>> td:last-of-type {
    width: 16em;
  }
}

@media only screen and (min-width: 1800px) {
  .contracts-table >>> td:nth-of-type(-n + 5) {
    width: 12em;
  }

  .contracts-table >>> td:nth-of-type(6) {
    width: 25em;
  }

  .contracts-table >>> td:last-of-type {
    width: 16em;
  }
}
</style>
