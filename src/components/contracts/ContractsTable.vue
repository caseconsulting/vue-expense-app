<template>
  <div>
    <v-container fluid class="pa-0 pa-md-2">
      <v-row class="d-flex justify-space-between">
        <v-col cols="12" md="3">
          <v-text-field
            id="contractsSearch"
            v-model="search"
            label="Search Table Contents"
            auto-select-first
            append-inner-icon="mdi-magnify"
            variant="underlined"
            clearable
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="5" class="d-flex justify-center">
          <ContractFilter />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center justify-end">
          <v-btn
            color="#bc3825"
            :loading="isDeleting"
            size="small"
            class="text-white"
            :disabled="!contractsCheckBoxes.some((c) => c.all || c.indeterminate) || contractLoading"
            @click="clickedDelete()"
          >
            Delete
          </v-btn>
          <v-btn
            class="ml-1 font-weight-medium"
            :loading="isActivating"
            size="small"
            :disabled="!contractsCheckBoxes.some((c) => c.all || c.indeterminate) || contractLoading"
            @click="clickedUpdateStatus(contractStatuses.ACTIVE)"
          >
            Activate
          </v-btn>
          <v-btn
            class="ml-1"
            :loading="isDeactivating"
            size="small"
            :disabled="!contractsCheckBoxes.some((c) => c.all || c.indeterminate) || contractLoading"
            @click="clickedUpdateStatus(contractStatuses.UNSTAFFED)"
          >
            Unstaffed
          </v-btn>
          <v-btn
            class="ml-1"
            :loading="isClosing"
            size="small"
            :disabled="!contractsCheckBoxes.some((c) => c.all || c.indeterminate) || contractLoading"
            @click="clickedUpdateStatus(contractStatuses.CLOSED)"
          >
            Close
          </v-btn>
        </v-col>
      </v-row>
      <!-- START CONTRACTS DATA TABLE -->
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-data-table
          :headers="_filter(contractHeaders, (h) => expandOrgs || (!expandOrgs && !h.expandableOrg))"
          :items="storeContracts"
          items-per-page="-1"
          :search="search"
          :expanded="expanded"
          :row-props="rowProps"
          :cellProps="(item) => cellProps(item, contractHeaders)"
          :custom-filter="contractFilter"
          class="contracts-table text-body-2"
          density="compact"
          fixed-header
          fixed-footer
          hover
          show-select
        >
          <!-- Header CheckBox Slot -->
          <template v-slot:[`header.data-table-select`]>
            <!-- Intentionally empty to hide header checkbox -->
          </template>

          <!-- CheckBox Slot -->
          <template v-slot:[`item.data-table-select`]="{ item }">
            <v-checkbox
              :model-value="item.all"
              :indeterminate="item.indeterminate"
              primary
              hide-details
              @click.stop="toggleContractCheckBox(item)"
            >
            </v-checkbox>
          </template>

          <template v-slot:[`header.directorate`]="{ column }">
            <tr>
              <td>
                <span class="mr-2 cursor-pointer">{{ column.title }}</span>
                <v-icon
                  @click="expandOrgs = !expandOrgs"
                  :icon="expandOrgs ? 'mdi-chevron-left' : 'mdi-chevron-right'"
                  v-tooltip="expandOrgs ? 'Hide orgs' : 'Show orgs'"
                ></v-icon>
              </td>
            </tr>
          </template>

          <template
            v-for="header in _filter(contractHeaders, (h) => !h.disableEdit)"
            v-slot:[`item.${header.key}`]="{ item }"
          >
            <contracts-edit-item
              v-if="
                editItem?.item?.id === item.id && editItem?.header?.key === header.key && editItem?.type === 'contract'
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
              type="contract"
              @click="handleItemClick(item, header)"
              class="d-flex align-center w-100 h-100 font-weight-bold"
            ></contracts-info-item>
          </template>

          <!-- Expanded Row Slot -->
          <template v-slot:expanded-row="{ columns, item }">
            <expanded-contract-table-row
              class="overflow-y-hidden"
              :contract="{ item }"
              :colspan="columns.length"
              :isContractDeletingOrUpdatingStatus="isDeletingOrUpdatingStatus()"
              :rowProps="rowProps"
              :cellProps="cellProps"
              :editItem="editItem"
              :expandOrgs="expandOrgs"
            />
          </template>

          <!-- Contract head counts -->
          <template v-slot:[`item.activeEmployees`]="{ item }">
            <span class="smaller-text description pointer d-flex align-center w-100 h-100 font-weight-bold">
              {{ contractHeadcounts[item.id] || '0' }}
              {{ contractHeadcounts[item.id] === 1 ? 'Employee' : 'Employees' }}
            </span>
          </template>

          <!-- Actions Slot -->
          <template v-slot:[`item.actions`]="{ item }">
            <div>
              <div v-if="!isDeletingOrUpdatingStatus(item)">
                <!-- Add Project -->
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      :disabled="contractLoading"
                      @click.stop="
                        () => {
                          addProjectUnderContract = item;
                          toggleProjectForm = !toggleProjectForm;
                        }
                      "
                      density="comfortable"
                      icon
                      variant="text"
                      v-bind="props"
                    >
                      <v-icon class="case-gray" icon="mdi-file-document-plus" />
                    </v-btn>
                  </template>
                  <span>Add Project</span>
                </v-tooltip>

                <!-- Contract Settings -->
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      :disabled="contractLoading"
                      @click.stop="
                        () => {
                          toggleContractSettingsModal = true;
                          clickedContract = item;
                        }
                      "
                      density="comfortable"
                      icon
                      variant="text"
                      v-bind="props"
                    >
                      <v-icon class="case-gray" icon="mdi-cog"></v-icon> </v-btn
                  ></template>
                  <span>Contract Settings</span>
                </v-tooltip>

                <!-- Employees Assigned -->
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      :disabled="contractLoading"
                      @click.stop="
                        () => {
                          toggleContractEmployeesModal = true;
                          clickedContract = item;
                        }
                      "
                      icon
                      density="comfortable"
                      variant="text"
                      v-bind="props"
                    >
                      <v-icon class="case-gray" icon="mdi-account-group"></v-icon> </v-btn
                  ></template>
                  <span>View Employees Assigned to Contract</span>
                </v-tooltip>
              </div>
              <div v-else><v-progress-circular color="#bc3825" indeterminate /></div>
            </div>
          </template>
        </v-data-table>
      </v-form>
    </v-container>
    <contract-employees-assigned-modal :contract="clickedContract" :toggleModal="toggleContractEmployeesModal" />
    <contract-settings-modal
      :contract="clickedContract"
      :toggleModal="toggleContractSettingsModal"
    ></contract-settings-modal>
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
<script setup>
import _findIndex from 'lodash/findIndex';
import _filter from 'lodash/filter';
import _cloneDeep from 'lodash/cloneDeep';
import _merge from 'lodash/merge';
import _forEach from 'lodash/forEach';
import _some from 'lodash/some';
import _map from 'lodash/map';
import api from '@/shared/api';
import { updateStoreEmployees } from '@/utils/storeUtils';
import { asyncForEach, isMobile } from '@/utils/utils';
import { getProject, getProjectCurrentEmployees } from '@/shared/contractUtils';
import { contractFilter } from '@/shared/filterUtils';

import DeleteModal from '../modals/DeleteModal.vue';
import ContractFilter from './ContractFilter.vue';
import ContractsEditItem from './ContractsEditItem.vue';
import ContractsInfoItem from './ContractsInfoItem.vue';
import ContractSettingsModal from '../modals/ContractSettingsModal.vue';
import ContractProjectValidateDeleteUpdateStatusModal from '../modals/ContractProjectValidateDeleteUpdateStatusModal.vue';
import ProjectForm from './ProjectForm.vue';
import GeneralConfirmationModal from '@/components/modals/GeneralConfirmationModal.vue';
import ContractEmployeesAssignedModal from '../modals/ContractEmployeesAssignedModal.vue';
import ExpandedContractTableRow from './ExpandedContractTableRow.vue';

import { ref, inject, onBeforeMount, onBeforeUnmount, computed, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { useStore } from 'vuex';
import { useDisplayError, useDisplaySuccess } from '@/components/shared/StatusSnackbar.vue';
import { updateStoreContracts } from '../../utils/storeUtils';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const store = useStore();
const emitter = inject('emitter');
const { lgAndDown } = useDisplay();
const duplicateContractPrimeComboFromPrime = ref((v) => {
  let item = editItem.value.item;
  let found = _some(store.getters.contracts, (c) => {
    if (c.id == item.id) return false;
    return c.contractName === item.contractName && c.primeName === v;
  });
  return !found || 'Duplicate contract and prime combination';
});
const duplicateContractPrimeComboFromContract = ref((v) => {
  let item = editItem.value.item;
  let found = _some(store.getters.contracts, (c) => {
    if (c.id == item.id) return false;
    return c.contractName === v && c.primeName === item.primeName;
  });
  return !found || 'Duplicate contract and prime combination';
});
const contractStatuses = ref(api.CONTRACT_STATUSES);
const clickedContract = ref(null);
const contractStatusItem = ref(null);
const expandOrgs = ref(false);
const addProjectUnderContract = ref(null);
const toggleProjectForm = ref(false);
const relationships = ref([]);
const deleteItem = ref(null);
const deletingItems = ref(null);
const expanded = ref([]);
const toggleContractEmployeesModal = ref(false);
const toggleValidateModal = ref(false);
const toggleContractSettingsModal = ref(false);
const toggleContractDeleteModal = ref(false);
const toggleContractStatusModal = ref(false);
const contractLoading = ref(false);
const editItem = ref(null);
const filter = ref([api.CONTRACT_STATUSES.ACTIVE]);
const search = ref(null);
const statusItemClicked = ref(null);
const valid = ref(true);
const validateMessage = ref('');
const titleMessage = ref('');
const contractsCheckBoxes = ref([]);
const isDeleting = ref(false);
const isActivating = ref(false);
const isDeactivating = ref(false);
const isClosing = ref(false);
const contractHeaders = ref([
  {
    title: 'Prime',
    key: 'primeName',
    align: 'start',
    customWidth: 'small',
    rules: [(v) => !!v || 'Field is required', duplicateContractPrimeComboFromPrime.value]
  },
  {
    title: 'Contract',
    key: 'contractName',
    align: 'start',
    customWidth: 'small',
    rules: [(v) => !!v || 'Field is required', duplicateContractPrimeComboFromContract.value]
  },
  {
    title: 'Directorate',
    key: 'directorate',
    align: 'start',
    sortable: false,
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
    type: 'combobox',
    disableEdit: true
  },
  {
    title: 'Work Type',
    key: 'workType',
    align: 'start',
    customWidth: 'x-small',
    disableEdit: true
  },
  {
    title: 'PoP-Start Date',
    key: 'popStartDate',
    align: 'start',
    customWidth: lgAndDown.value ? 'x-small' : 'medium'
  },
  {
    title: 'PoP-End Date',
    key: 'popEndDate',
    align: 'start',
    customWidth: lgAndDown.value ? 'x-small' : 'medium'
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
    key: 'activeEmployees',
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
const contractHeadcounts = ref({});
const form = ref(null);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * created life cycle hook
 */
onBeforeMount(async () => {
  emitter.on('confirm-delete-contract', async () => {
    await deleteItems(deletingItems.value);
    deletingItems.value = null;
    toggleContractDeleteModal.value = false;
  });
  emitter.on('canceled-delete-contract', () => {
    deletingItems.value = null;
    toggleContractDeleteModal.value = false;
  });
  emitter.on('change-contracts-edit-item', (item) => {
    editItem.value = item;
  });
  emitter.on('confirmed-contract-status', () => {
    updateStatus(statusItemClicked.value);
    toggleContractStatusModal.value = false;
  });
  emitter.on('canceled-contract-status', () => {
    toggleContractStatusModal.value = false;
  });
  emitter.on('contract-project-validate-error-acknowledged', () => {
    toggleValidateModal.value = false;
  });
  emitter.on('canceled-project-form', () => {
    toggleProjectForm.value = false;
  });
  emitter.on('saved-contract-item', async ({ key, item, promise }) => {
    let saveStatus = { key, status: 'saving' };
    item.saveStatuses ? item.saveStatuses.unshift(saveStatus) : (item.saveStatuses = [saveStatus]);
    editItem.value = null;
    let resp = await promise;
    if (resp.message) {
      saveStatus.status = 'fail';
      useDisplayError(resp?.response?.data?.message || resp?.message);
    } else {
      saveStatus.status = 'success';
    }
    item.saveStatuses = [...item.saveStatuses]; // refreshes the cellProps
    setTimeout(() => {
      item.saveStatuses.pop();
      if (item.saveStatuses?.length === 0) delete item.saveStatuses;
    }, 1500);
  });
  emitter.on('submitted-project-form', () => {
    toggleProjectForm.value = false;
  });
  emitter.on('closed-contract-employees-assigned-modal', () => {
    toggleContractEmployeesModal.value = false;
  });
  emitter.on('closed-contract-settings-modal', () => {
    toggleContractSettingsModal.value = false;
  });
  emitter.on('filter', (theFilter) => {
    filter.value = theFilter;
  });
  emitter.on('toggle-project-checkBox', ({ contract, project }) => {
    toggleProjectCheckBox(contract, project);
  });
  resetAllCheckBoxes();
  expanded.value = _map(store.getters.contracts, 'id'); // expands all contracts in table
  await getContractEmployeesHeadcount(); // get headcounts for each contract
}); // onBeforeMount

/**
 * beforeUnmount lifecycle hook - close event listeners
 */
onBeforeUnmount(() => {
  emitter.off('confirm-delete-contract');
  emitter.off('canceled-delete-contract');
  emitter.off('change-contracts-edit-item');
  emitter.off('confirmed-contract-status');
  emitter.off('canceled-contract-status');
  emitter.off('canceled-project-form');
  emitter.off('saved-contract-item');
  emitter.off('submitted-project-form');
  emitter.off('closed-project-employees-assigned-modal');
  emitter.off('closed-contract-settings-modal');
  emitter.off('contract-project-validate-error-acknowledged');
  emitter.off('filter');
  emitter.off('toggle-project-checkbox');
}); // beforeUnmount

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Sets the item to be edited.
 *
 * @param item - The row item clicked
 * @param header - The header of the cell that was clicked
 */
function handleItemClick(item, header) {
  if (!header.disableEdit) {
    let headerIndex = _findIndex(contractHeaders.value, (h) => header.key === h.key);
    editItem.value = { item, header, type: 'contract', headerIndex };
  }
} // handleItemClick

/**
 * Delete items
 * @param items contract and project items to delete
 */
async function deleteItems(items) {
  isDeleting.value = true;
  try {
    let contracts = _cloneDeep(store.getters.contracts);
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
      contractsCheckBoxes.value.splice(contractIndex, 1);
    });
    items.projects.forEach((p) => {
      let contractIndex = contracts.findIndex((c) => c.id == p.contractOfProject.id);
      let projectIndex = contracts[contractIndex].projects.findIndex((item) => item.id == p.project.id);
      contractsCheckBoxes.value[contractIndex].projectsCheckBoxes.splice(projectIndex, 1);
      contracts[contractIndex].projects.splice(projectIndex, 1);
    });
    store.dispatch('setContracts', { contracts });
    useDisplaySuccess('Successfully deleted item(s)!');
  } catch (err) {
    useDisplayError(err);
  }
  isDeleting.value = false;
  resetAllCheckBoxes();
} // deleteItems

/**
 * Handler for clicked update status buttons (Deactivate, Activate, Close)
 */
async function clickedUpdateStatus(status) {
  relationships.value = [];
  let theRelationships = [];
  let selectedItems = getSelectedItems();
  if (status === contractStatuses.value.ACTIVE) {
    toggleContractStatusModal.value = true;
    statusItemClicked.value = status;
    return;
  }
  await asyncForEach(selectedItems.contracts, async (c) => {
    theRelationships.push([...relationships.value, ...(await getActiveEmployeeContractRelationships(c))]);
  });
  await asyncForEach(selectedItems.projects, async (p) => {
    theRelationships.push([
      ...relationships.value,
      ...(await getActiveEmployeeContractRelationships(p.contractOfProject, p.project))
    ]);
  });

  theRelationships = theRelationships.flat();

  if (theRelationships.length != 0) {
    titleMessage.value = `Cannot mark item(s) as ${status}`;
    validateMessage.value = `Please remove the following relationships before marking selected item(s) as ${status}.`;
    toggleValidateModal.value = !toggleValidateModal.value;
    relationships.value = theRelationships;
  } else {
    toggleContractStatusModal.value = true;
    statusItemClicked.value = status;
  }
} // clickedUpdateStatus

/**
 * Handler for click delete button event
 */
async function clickedDelete() {
  relationships.value = [];
  let theRelationships = [];
  let selectedItems = getSelectedItems();
  await asyncForEach(selectedItems.contracts, async (c) => {
    theRelationships.push([...relationships.value, ...(await getEmployeeContractRelationships(c))]);
  });

  await asyncForEach(selectedItems.projects, async (p) => {
    theRelationships.push([
      ...relationships.value,
      ...(await getEmployeeContractRelationships(p.contractOfProject, p.project))
    ]);
  });

  theRelationships = theRelationships.flat();

  if (theRelationships.length != 0) {
    titleMessage.value = 'Cannot delete item(s)';
    validateMessage.value = 'Please remove the following relationships before deleting selected item(s).';
    toggleValidateModal.value = true;
    relationships.value = theRelationships;
  } else {
    deletingItems.value = selectedItems;
    toggleContractDeleteModal.value = true;
  }
} // clickedDelete

/**
 * Fills in the contractHeadcounts variable.
 */
async function getContractEmployeesHeadcount() {
  if (!store.getters.employees) await updateStoreEmployees();
  if (!store.getters.contracts) await updateStoreContracts();
  for (let contract of store.getters.contracts) {
    let contractEmployees = new Set();
    let projectEmployees;
    for (let project of contract.projects) {
      projectEmployees = getProjectCurrentEmployees(contract, project, store.getters.employees);
      for (let e of projectEmployees) {
        contractEmployees.add(e.id);
      }
    }
    contractHeadcounts.value[contract.id] = contractEmployees.size;
  }
}

/**
 * Updates the status of the selected items based on the given status.
 *
 * @param status status to update selected items to
 */
async function updateStatus(status) {
  contractLoading.value = true;
  if (status == api.CONTRACT_STATUSES.ACTIVE) {
    isActivating.value = true;
  } else if (status == api.CONTRACT_STATUSES.UNSTAFFED) {
    isDeactivating.value = true;
  } else {
    isClosing.value = true;
  }
  try {
    let updatePromises = [];
    let contracts = _cloneDeep(store.getters.contracts);
    let selectedItems = getSelectedItems();

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

    store.dispatch('setContracts', { contracts });
    useDisplaySuccess(`Successfully marked item(s) as ${status}`);
  } catch (err) {
    useDisplayError(err);
  }
  contractLoading.value = false;
  isActivating.value = false;
  isDeactivating.value = false;
  isClosing.value = false;
  resetAllCheckBoxes();
} // updateStatus

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
  if (!store.getters.employees) {
    await updateStoreEmployees();
  }
  let employees = store.getters.employees;
  let theRelationships = [];
  employees.forEach((e) => {
    if (e.contracts && e.workStatus > 0) {
      let contractObj = e.contracts.find((c) => c.contractId == contract.id);
      if (contractObj) {
        if (project) {
          let employeeAssignedToProject = e.contracts.some((c) =>
            c.projects.some((p) => p.projectId == project.id && p.presentDate)
          );
          if (employeeAssignedToProject) {
            let index = theRelationships.findIndex((r) => r.project.id == project.id);
            if (index < 0) {
              theRelationships.push({
                contract: contract.contractName,
                prime: contract.primeName,
                project: project,
                employees: [e]
              });
            } else {
              theRelationships[index].employees.push(e);
            }
          }
        } else {
          contractObj.projects.forEach((p) => {
            if (p.presentDate) {
              let index = theRelationships.findIndex((r) => r.project.id == p.projectId);
              if (index < 0) {
                theRelationships.push({
                  contract: contract.contractName,
                  prime: contract.primeName,
                  project: getProject(contract.id, p.projectId, store.getters.contracts),
                  employees: [e]
                });
              } else {
                theRelationships[index].employees.push(e);
              }
            }
          });
        }
      }
    }
  });
  return theRelationships;
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
  if (!store.getters.employees) {
    await updateStoreEmployees();
  }
  let employees = store.getters.employees;
  let theRelationships = [];
  employees.forEach((e) => {
    if (e.contracts) {
      let contractObj = e.contracts.find((c) => c.contractId == contract.id);
      if (contractObj) {
        if (project) {
          let employeeAssignedToProject = e.contracts.some((c) => c.projects.some((p) => p.projectId == project.id));
          if (employeeAssignedToProject) {
            let index = theRelationships.findIndex((r) => r.project.id == project.id);
            if (index < 0) {
              theRelationships.push({
                contract: contract.contractName,
                prime: contract.primeName,
                project: project,
                employees: [e]
              });
            } else {
              theRelationships[index].employees.push(e);
            }
          }
        } else {
          contractObj.projects.forEach((p) => {
            let index = theRelationships.findIndex((r) => r.project.id == p.projectId);
            if (index < 0) {
              theRelationships.push({
                contract: contract.contractName,
                prime: contract.primeName,
                project: getProject(contract.id, p.projectId, store.getters.contracts),
                employees: [e]
              });
            } else {
              theRelationships[index].employees.push(e);
            }
          });
        }
      }
    }
  });
  return theRelationships;
} // getEmployeeContractRelationships

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
    ? contractLoading.value &&
        ((contractStatusItem.value && contractStatusItem.value.id == contractItem.id) ||
          (deleteItem.value && deleteItem.value.id == contractItem.id))
    : contractLoading.value && (contractStatusItem.value || deleteItem.value);
} // isDeletingOrUpdatingStatus

/**
 * Resets (unchecks) all contracts and projects (boxes) in the contracts table.
 */
function resetAllCheckBoxes() {
  let uncheckedBox = { all: false, indeterminate: false };
  for (let i = 0; i < store.getters.contracts.length; i++) {
    contractsCheckBoxes.value[i] = _cloneDeep(uncheckedBox);
    contractsCheckBoxes.value[i].contractId = store.getters.contracts[i].id;
    contractsCheckBoxes.value[i].projectsCheckBoxes = store.getters.contracts[i].projects.map((p) => ({
      projectId: p.id,
      checkBox: false
    }));
  }
} // resetCheckAllBoxes

/**
 * Sets the props for a cell in the data table.
 *
 * @param column - The cell header
 * @returns Object - The cell class
 */
function cellProps({ item, column }, headers) {
  let editColumn = headers[editItem.value?.headerIndex];
  let classes = `${column.key === editColumn?.key ? `cell-width-x-large` : `cell-width-${column.customWidth}`}`;
  let idx = _findIndex(item.saveStatuses, (s) => s.key === column.key);
  if (idx > -1) classes += ` item-${item.saveStatuses[idx].status}`;
  return {
    class: classes
  };
} // cellProps

/**
 * Sets the props for a row in the data table.
 *
 * @param item - The row item
 * @returns Object - The row class
 */
function rowProps({ item }) {
  return { class: `${item.status}-status` };
} // rowProps

/**
 * Toggles the contract item check box and all the project item boxes
 *
 * @param contractItem contract item to check
 */
function toggleContractCheckBox(contractItem) {
  let index = contractsCheckBoxes.value.findIndex((c) => c.contractId == contractItem.id);
  let contractCheckBox = contractsCheckBoxes.value[index];
  if (determineCheckBox(contractCheckBox).all) {
    setAllProjectsCheckBox(contractItem, false);
  } else {
    setAllProjectsCheckBox(contractItem, true);
  }
  contractCheckBox = contractsCheckBoxes.value[index];
  let updatedCheckBox = determineCheckBox(contractCheckBox);
  contractCheckBox.all = updatedCheckBox.all;
  contractCheckBox.indeterminate = updatedCheckBox.indeterminate;
  contractsCheckBoxes.value[index] = contractCheckBox;
} // toggleContractCheckBox

/**
 * Toggles the project item checkbox
 *
 * @param contract contract of selected project item
 * @param projectItem project item
 */
function toggleProjectCheckBox(contract, projectItem) {
  contractsCheckBoxes.value
    .find((cb) => cb.contractId == contract.item.id)
    .projectsCheckBoxes.forEach((pb) => {
      if (pb.projectId == projectItem.id) {
        pb.checkBox = !pb.checkBox;
      }
    });
  let index = contractsCheckBoxes.value.findIndex((c) => c.contractId == contract.item.id);
  let contractCheckBox = contractsCheckBoxes.value[index];
  let updatedCheckBox = determineCheckBox(contractCheckBox);
  contractCheckBox.all = updatedCheckBox.all;
  contractCheckBox.indeterminate = updatedCheckBox.indeterminate;
  contractsCheckBoxes.value[index] = contractCheckBox;
} // toggleProjectCheckBox

/**
 * Determines the checkbox value of the contract based on the
 * @param contractCheckBox contract check box to determine
 */
function determineCheckBox(contractCheckBox) {
  let checkBox = { all: true, indeterminate: false };

  _forEach(contractCheckBox.projectsCheckBoxes, (project) => {
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
  let index = contractsCheckBoxes.value.findIndex((c) => c.contractId == contractItem.id);
  let contractCheckBox = contractsCheckBoxes.value[index];
  let updatedProjectsCheckBoxes = contractCheckBox.projectsCheckBoxes.map((p) => {
    p.checkBox = value;
    return p;
  });
  contractCheckBox.projectsCheckBoxes = updatedProjectsCheckBoxes;
  contractsCheckBoxes.value[index] = contractCheckBox;
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
  contractsCheckBoxes.value.forEach((c) => {
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
  store.getters.contracts.forEach((c) => {
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

computed(isMobile);

/**
 * Merges the checkBox list and the contracts list
 *
 * @return filtered out unstaffed items
 */
const storeContracts = computed(() => {
  let mergedCheckBoxContractsData = _merge(store.getters.contracts, contractsCheckBoxes.value);
  mergedCheckBoxContractsData.forEach((c) => {
    c.projects = _merge(c.projects, c.projectsCheckBoxes);
  });
  return mergedCheckBoxContractsData
    .filter((c) => filter.value.includes(c.status))
    .map((c) => {
      return { ...c, projects: c.projects.filter((p) => filter.value.includes(p.status)) };
    });
}); // storeContracts

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

watch(
  () => store.getters.contracts,
  () => {
    if (store.getters.contracts.length > contractsCheckBoxes.value.length) {
      let newContract = store.getters.contracts[0];
      let checkBoxObj = {
        all: false,
        indeterminate: false,
        contractId: newContract.id,
        projectsCheckBoxes: [...newContract.projects.map((p) => ({ checkBox: false, projectId: p.id }))]
      };
      contractsCheckBoxes.value = [checkBoxObj, ...contractsCheckBoxes.value];
    }

    store.getters.contracts.forEach((c, index) => {
      if (c.projects.length > contractsCheckBoxes.value[index].projectsCheckBoxes.length) {
        let newProject = c.projects[0];
        let checkBox = contractsCheckBoxes.value[index].all ? true : false;
        contractsCheckBoxes.value[index].projectsCheckBoxes = [
          { checkBox, projectId: newProject.id },
          ...contractsCheckBoxes.value[index].projectsCheckBoxes
        ];
      }
    });
  }
);
</script>

<style lang="scss">
@import 'src/assets/styles/styles';
.cell-width-x-small {
  min-width: 110px !important;
  width: 110px !important;
  max-width: 110px !important;
}

.cell-width-small {
  min-width: 120px !important;
  width: 120px !important;
  max-width: 120px !important;
}

.cell-width-medium {
  min-width: 135px !important;
  width: 135px !important;
  max-width: 135px !important;
}

.cell-width-large {
  min-width: 165px !important;
  width: 165px !important;
  max-width: 165px !important;
}

.cell-width-x-large {
  min-width: 200px !important;
  width: 200px !important;
  max-width: 200px !important;
}

.item-saving {
  font-weight: bold;
  color: darkgray;
}
.item-success {
  font-weight: bold;
  color: green !important;
  transition: color 1s ease-in !important;
  -webkit-transition: color 1s ease-in !important;
}
.item-fail {
  font-weight: bold;
  color: red !important;
  transition: color 1s ease-out !important;
  -webkit-transition: color 1s ease-out !important;
}

.contracts-table {
  max-height: 85vh;
  overflow-x: auto;
}

.closed-status > td:first-of-type {
  border-left: 3px solid #db4437 !important;
}

.unstaffed-status > td:first-of-type {
  border-left: 3px solid #f4b400 !important;
}

.active-status > td:first-of-type {
  border-left: 3px solid #0f9d58 !important;
}

.contracts-table > div > table > tbody > tr > td:first-of-type {
  min-width: 70px !important;
}

.contracts-table > div > table > tbody > tr > td {
  background-color: #f0f0f0;
  padding: 0px 12px 0px 12px !important;
}

.contracts-table > div > table > thead > tr > th {
  padding: 0px 12px 0px 12px !important;
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
  overflow: hidden;
}
</style>
