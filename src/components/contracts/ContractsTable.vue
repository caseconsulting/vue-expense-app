<template>
  <div>
    <v-card class="mt-3">
      <v-container fluid class="pa-0 pa-md-4">
        <v-row class="d-flex justify-space-between ma-1">
          <v-col cols="12" md="4" class="my-0 pb-0">
            <v-text-field
              id="contractsSearch"
              v-model="search"
              label="Search Table Contents"
              auto-select-first
              append-icon="search"
              variant="underlined"
              clearable
            ></v-text-field>
          </v-col>
          <!-- Active Filter -->
          <ContractFilter class="ml-3 ml-md-0" />
          <!-- End Active Filter -->

          <v-col cols="12" class="d-flex justify-center justify-md-end align-center flex-wrap pa-0 pt-2 pa-md-2">
            <v-btn
              color="#bc3825"
              :loading="isDeleting"
              :size="isMobile ? 'small' : 'default'"
              class="text-white"
              :disabled="!this.contractsCheckBoxes.some((c) => c.all || c.indeterminate) || contractLoading"
              @click="clickedDelete()"
              >Delete
            </v-btn>
            <v-btn
              class="ml-1 ml-md-4 font-weight-medium"
              :loading="isActivating"
              :size="isMobile ? 'small' : 'default'"
              :disabled="!this.contractsCheckBoxes.some((c) => c.all || c.indeterminate) || contractLoading"
              @click="clickedUpdateStatus(contractStatuses.ACTIVE)"
              >Activate</v-btn
            >
            <v-btn
              class="ml-1 ml-md-4"
              :loading="isDeactivating"
              :size="isMobile ? 'small' : 'default'"
              :disabled="!this.contractsCheckBoxes.some((c) => c.all || c.indeterminate) || contractLoading"
              @click="clickedUpdateStatus(contractStatuses.UNSTAFFED)"
              >Unstaffed</v-btn
            >
            <v-btn
              class="ml-1 ml-md-4"
              :loading="isClosing"
              :size="isMobile ? 'small' : 'default'"
              :disabled="!this.contractsCheckBoxes.some((c) => c.all || c.indeterminate) || contractLoading"
              @click="clickedUpdateStatus(contractStatuses.CLOSED)"
              >Close</v-btn
            >
          </v-col>
        </v-row>
        <!-- START CONTRACTS DATA TABLE -->
        <v-form ref="form" lazy-validation>
          <v-data-table
            :headers="contractHeaders"
            :items="storeContracts"
            :items-per-page="-1"
            :search="search"
            :expanded="expanded"
            color="purple"
            class="contracts-table text-body-2"
            density="compact"
            hover
            show-select
            expand-on-click
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
                  :model-value="item.all"
                  :indeterminate="item.indeterminate"
                  primary
                  class="ma-0 pl-4"
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
                variant="underlined"
                :rules="[(v) => !!v || 'Field is required', duplicateContractPrimeCombo()]"
                required
                @click.stop
              ></v-text-field>
              <span v-else :class="{ 'font-weight-bold': true }">{{ item.primeName }}</span>
            </template>

            <!-- Contract Name Slot -->
            <template v-slot:[`item.contractName`]="{ item }">
              <v-text-field
                name="contractName"
                v-if="editingItem && editingItem.id == item.id"
                v-model="editingItem.contractName"
                label="Contract Name"
                variant="underlined"
                :rules="[(v) => !!v || 'Field is required', duplicateContractPrimeCombo()]"
                required
                @click.stop
              ></v-text-field>
              <!-- </v-form> -->
              <span v-else :class="{ 'font-weight-bold': true }">{{ item.contractName }}</span>
            </template>

            <!-- Directorate Slot -->
            <template v-slot:[`item.directorate`]="{ item }">
              <v-text-field
                name="directorate"
                v-if="editingItem && editingItem.id == item.id"
                v-model="editingItem.directorate"
                label="Directorate"
                variant="underlined"
                @click.stop
              ></v-text-field>
              <span v-else :class="{ 'font-weight-bold': true }">{{ item.directorate }}</span>
            </template>

            <!-- PoP Start Date Slot -->
            <template v-slot:[`item.popStartDate`]="{ item }">
              <v-text-field
                v-if="editingItem && editingItem.id == item.id"
                v-model="editingItem.popStartDate"
                label="PoP Start Date"
                variant="underlined"
                @click.stop
              ></v-text-field>
              <!-- </v-form> -->
              <span v-else :class="{ 'font-weight-bold': true }">{{ item.popStartDate }}</span>
            </template>

            <!-- PoP End Date Slot -->
            <template v-slot:[`item.popEndDate`]="{ item }">
              <v-text-field
                v-if="editingItem && editingItem.id == item.id"
                v-model="editingItem.popEndDate"
                label="PoP End Date"
                variant="underlined"
                @click.stop
              ></v-text-field>
              <span v-else :class="{ 'font-weight-bold': true }">{{ item.popEndDate }}</span>
            </template>

            <!-- Contract Description Slot -->
            <template v-slot:[`item.description`]="{ item }">
              <v-textarea
                v-if="editingItem && editingItem.id == item.id"
                v-model="editingItem.description"
                name="description"
                auto-grow
                label="Description"
                variant="underlined"
                class="smaller-text description"
                @click.stop
              ></v-textarea>
              <span v-else class="smaller-text" :class="{ 'font-weight-bold': true }">{{ item.description }}</span>
            </template>

            <!-- Expanded Row Slot -->
            <template v-slot:expanded-row="{ columns, item }">
              <expanded-contract-table-row
                class="overflow-y-hidden"
                :contract="{ item }"
                :colspan="columns.length"
                :isEditingContractItem="editingItem != null"
                :isContractDeletingOrUpdatingStatus="isDeletingOrUpdatingStatus()"
              />
            </template>

            <!-- Actions Slot -->
            <template v-slot:[`item.actions`]="{ item }">
              <!-- IS EDITING ROW -->
              <div v-if="editingItem && editingItem.id == item.id">
                <div v-if="!contractLoading">
                  <!-- Save Contract -->
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn @click.stop="updateContractPrime()" icon variant="text" v-bind="props">
                        <v-icon class="case-gray" icon="mdi-content-save" />
                      </v-btn>
                    </template>
                    <span>Save</span>
                  </v-tooltip>

                  <!-- Cancel Contract -->
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        icon
                        variant="text"
                        @click.stop="
                          () => {
                            editingItem = null;
                          }
                        "
                        v-bind="props"
                      >
                        <v-icon class="case-gray" icon="mdi-close-circle" />
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
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        :disabled="editingItem != null || isEditingProjectItem || contractLoading"
                        @click.stop="
                          () => {
                            addProjectUnderContract = item;
                            toggleProjectForm = !toggleProjectForm;
                          }
                        "
                        icon
                        variant="text"
                        v-bind="props"
                      >
                        <v-icon class="case-gray" icon="mdi-file-document-plus" />
                      </v-btn>
                    </template>
                    <span>Add Project</span>
                  </v-tooltip>

                  <!-- Employees Assigned -->
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        :disabled="editingItem != null || isEditingProjectItem || contractLoading"
                        @click.stop="
                          () => {
                            toggleContractEmployeesModal = true;
                            contractEmployeesAssigned = item;
                          }
                        "
                        icon
                        variant="text"
                        v-props="props"
                      >
                        <v-icon class="case-gray" icon="mdi-account-group"></v-icon> </v-btn
                    ></template>
                    <span>View Employees Assigned to Contract</span>
                  </v-tooltip>

                  <!-- Edit Contract -->
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        icon
                        variant="text"
                        :disabled="editingItem != null || isEditingProjectItem || contractLoading"
                        v-bind="props"
                        @click.stop="clickedEdit(item)"
                      >
                        <v-icon class="case-gray" icon="mdi-pencil" />
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
    <contract-project-validate-delete-update-status-modal
      :toggleModal="toggleValidateModal"
      :relationships="relationships"
      :message="validateMessage"
      :title="titleMessage"
    ></contract-project-validate-delete-update-status-modal>
    <general-confirmation-modal
      :title="`Are you sure you want to mark selected item(s) as ${statusItemClicked}?`"
      type="contract-status"
      :toggleModal="toggleContractStatusModal"
    ></general-confirmation-modal>
    <project-form :toggleProjectForm="toggleProjectForm" :contract="addProjectUnderContract" />
  </div>
</template>
<script>
import _ from 'lodash';
import api from '@/shared/api';
import { updateStoreContracts, updateStoreEmployees } from '@/utils/storeUtils';
import { asyncForEach, isMobile } from '@/utils/utils';
import { getProject } from '@/shared/contractUtils';

import DeleteModal from '../modals/DeleteModal.vue';
import ContractFilter from './ContractFilter.vue';
import ContractProjectValidateDeleteUpdateStatusModal from '../modals/ContractProjectValidateDeleteUpdateStatusModal.vue';
import ProjectForm from './ProjectForm.vue';
import GeneralConfirmationModal from '@/components/modals/GeneralConfirmationModal.vue';
import ContractEmployeesAssignedModal from '../modals/ContractEmployeesAssignedModal.vue';
import ExpandedContractTableRow from './ExpandedContractTableRow.vue';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * created life cycle hook
 */
async function created() {
  this.emitter.on('confirm-delete-contract', async () => {
    await this.deleteItems(this.deletingItems);
    this.deletingItems = null;
  });
  this.emitter.on('canceled-delete-contract', () => {
    this.deletingItems = null;
  });
  this.emitter.on('confirmed-contract-status', () => {
    this.updateStatus(this.statusItemClicked);
    this.toggleContractStatusModal = false;
  });
  this.emitter.on('canceled-contract-status', () => {
    this.toggleContractStatusModal = false;
  });
  this.emitter.on('canceled-project-form', () => {
    this.toggleProjectForm = false;
  });
  this.emitter.on('closed-contract-employees-assigned-modal', () => {
    this.toggleContractEmployeesModal = false;
  });
  this.emitter.on('filter', (filter) => {
    this.filter = filter;
  });
  this.emitter.on('is-editing-project-item', (value) => {
    this.isEditingProjectItem = value;
  });
  this.emitter.on('toggle-project-checkBox', ({ contract, project }) => {
    this.toggleProjectCheckBox(contract, project);
  });
  this.resetAllCheckBoxes();
  this.expanded = _.map(this.$store.getters.contracts, 'id'); // expands all contracts in table
} // created

/**
 * beforeDestroy lifecycle hook - close event listeners
 */
function beforeDestroy() {
  this.emitter.off('confirm-delete-contract');
  this.emitter.off('canceled-delete-contract');
  this.emitter.off('confirmed-contract-status');
  this.emitter.off('canceled-contract-status');
  this.emitter.off('canceled-project-form');
  this.emitter.off('closed-project-employees-assigned-modal');
  this.emitter.off('filter');
  this.emitter.off('is-editing-project-item');
  this.emitter.off('toggle-project-checkbox');
} // beforeDestroy

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

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
 * Handler for clicked update status buttons (Deactivate, Activate, Close)
 */
async function clickedUpdateStatus(status) {
  let relationships = [];
  let selectedItems = this.getSelectedItems();
  if (status === this.contractStatuses.ACTIVE) {
    this.toggleContractStatusModal = true;
    this.statusItemClicked = status;
    return;
  }
  await asyncForEach(selectedItems.contracts, async (c) => {
    relationships = [...relationships, ...(await this.getActiveEmployeeContractRelationships(c))];
  });
  await asyncForEach(selectedItems.projects, async (p) => {
    relationships = [
      ...relationships,
      ...(await this.getActiveEmployeeContractRelationships(p.contractOfProject, p.project))
    ];
  });
  if (relationships.length != 0) {
    this.titleMessage = `Cannot mark item(s) as ${status}`;
    this.validateMessage = `Please remove the following relationships before marking selected item(s) as ${status}.`;
    this.toggleValidateModal = !this.toggleValidateModal;
    this.relationships = relationships;
  } else {
    this.toggleContractStatusModal = true;
    this.statusItemClicked = status;
  }
} // clickedUpdateStatus

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
    this.titleMessage = 'Cannot delete item(s)';
    this.validateMessage = 'Please remove the following relationships before deleting selected item(s).';
    this.toggleValidateModal = !this.toggleValidateModal;
    this.relationships = relationships;
  } else {
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
  } else if (status == api.CONTRACT_STATUSES.UNSTAFFED) {
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
      let projectIndex = contracts[contractIndex].projects.findIndex((item) => item.id == p.project.id);
      contracts[contractIndex].projects[projectIndex].status = status;
      updatePromises.push(api.updateItem(api.CONTRACTS, contracts[contractIndex]));
    });
    await Promise.all(updatePromises);

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
 * Gets relationships between projects and active employees.
 *
 * @param contract contract to find active employees under
 * @param project project to find active employees under
 *
 * @return list of relationships in the following format
 *        [{contract: "", prime: "", project: {...}, employees: [...]}, ...]
 */
async function getActiveEmployeeContractRelationships(contract, project = null) {
  if (!this.$store.getters.employees) {
    await this.updateStoreEmployees();
  }
  let employees = this.$store.getters.employees;
  let relationships = [];
  employees.forEach((e) => {
    if (e.contracts && e.workStatus > 0) {
      let contractObj = e.contracts.find((c) => c.contractId == contract.id);
      if (contractObj) {
        if (project) {
          let employeeAssignedToProject = e.contracts.some((c) =>
            c.projects.some((p) => p.projectId == project.id && p.presentDate)
          );
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
            if (p.presentDate) {
              let index = relationships.findIndex((r) => r.project.id == p.projectId);
              if (index < 0) {
                relationships.push({
                  contract: contract.contractName,
                  prime: contract.primeName,
                  project: this.getProject(contract.id, p.projectId, this.$store.getters.contracts),
                  employees: [e]
                });
              } else {
                relationships[index].employees.push(e);
              }
            }
          });
        }
      }
    }
  });
  return relationships;
} // getActiveEmployeeContractRelationships

/**
 * Gets relationships between projects and employees.
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
                project: this.getProject(contract.id, p.projectId, this.$store.getters.contracts),
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
  this.contractsCheckBoxes[index] = contractCheckBox;
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
  this.contractsCheckBoxes[index] = contractCheckBox;
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
  this.contractsCheckBoxes[index] = contractCheckBox;
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
 * @return filtered out unstaffed items
 */
function storeContracts() {
  let mergedCheckBoxContractsData = _.merge(this.$store.getters.contracts, this.contractsCheckBoxes);
  mergedCheckBoxContractsData.forEach((c) => {
    c.projects = _.merge(c.projects, c.projectsCheckBoxes);
    delete c.projectsCheckBoxes;
  });
  return mergedCheckBoxContractsData
    .filter((c) => this.filter.includes(c.status))
    .map((c) => {
      return { ...c, projects: c.projects.filter((p) => this.filter.includes(p.status)) };
    });
} // storeContracts

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

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
    ContractFilter,
    ContractProjectValidateDeleteUpdateStatusModal,
    GeneralConfirmationModal,
    ProjectForm,
    ContractEmployeesAssignedModal,
    ExpandedContractTableRow
  },
  computed: {
    isMobile,
    storeContracts
  },
  methods: {
    getProject,
    updateStoreEmployees,
    getActiveEmployeeContractRelationships,
    getEmployeeContractRelationships,
    cloneDeep,
    displaySuccess,
    displayError,
    clickedEdit,
    updateStoreContracts,
    updateContractPrime,
    isDeletingOrUpdatingStatus,
    resetAllCheckBoxes,
    determineCheckBox,
    setAllProjectsCheckBox,
    toggleContractCheckBox,
    toggleProjectCheckBox,
    getSelectedItems,
    clickedDelete,
    clickedUpdateStatus,
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
      expanded: [],
      toggleContractEmployeesModal: false,
      toggleValidateModal: false,
      toggleContractDeleteModal: false,
      toggleContractStatusModal: false,
      contractLoading: false,
      editingItem: null,
      isEditingProjectItem: false,
      loading: false,
      filter: [api.CONTRACT_STATUSES.ACTIVE],
      search: null,
      statusItemClicked: null,
      validateMessage: '',
      titleMessage: '',
      contractsCheckBoxes: [],
      isDeleting: false,
      isActivating: false,
      isDeactivating: false,
      isClosing: false,
      legendKey: [
        { status: 'Active', color: '#0f9d58' },
        { status: 'Unstaffed', color: '#f4b400' },
        { status: 'Closed', color: '#db4437' }
      ],
      contractHeaders: [
        {
          title: 'Prime',
          key: 'primeName',
          align: 'start'
        },
        {
          title: 'Contract',
          key: 'contractName',
          align: 'start'
        },
        {
          title: 'Directorate',
          key: 'directorate',
          align: 'start'
        },
        {
          title: 'PoP-Start Date',
          key: 'popStartDate',
          align: 'start'
        },
        {
          title: 'PoP-End Date',
          key: 'popEndDate',
          align: 'start'
        },
        {
          title: 'Description',
          key: 'description',
          align: 'start'
        },
        {
          title: 'Active Employees',
          key: 'spacer',
          align: 'start'
        },
        {
          key: 'actions',
          sortable: false,
          align: 'right'
        }
      ]
    };
  },
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
  width: 5px;
}

.checkBox-container {
  position: relative;
  display: flex;
}

.closed-status {
  background-color: #db4437;
}

.unstaffed-status {
  background-color: #f4b400;
}

.active-status {
  background-color: #0f9d58;
}

.highlight-contract-row {
  background-color: rgb(224, 224, 224) !important;
}

.contracts-table > div > table > tbody > tr > td {
  background: #f0f0f0 !important;
  opacity: 1;
  padding-left: 0px !important;
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

/*
tr.v-data-table__tr--clickable > td {
  background: red !important;
  opacity: 1;
}*/
</style>

<style scoped>
td {
  background-color: red;
}

.contracts-table :deep(td:first-of-type) {
  width: 2%;
}

.contracts-table :deep(td:nth-child(n + 2):nth-child(-n + 6)) {
  width: 10%;
}

.contracts-table :deep(td:nth-of-type(7)) {
  width: 18%;
}

.contracts-table :deep(td:nth-of-type(8)) {
  width: 18%;
}

.contracts-table :deep(td:last-of-type) {
  width: 14%;
}

.contracts-table :deep(td:nth-child(n + 2):nth-child(-n + 6)) {
  width: 9%;
}
</style>
