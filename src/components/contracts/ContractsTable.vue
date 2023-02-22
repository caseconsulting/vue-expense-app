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
            @click:row="clickedRow"
            :expanded.sync="expanded"
            :headers="contractHeaders"
            :items="storeContracts"
            :items-per-page="-1"
            :item-class="contractRowClass"
            :search="search"
            class="contracts-table"
          >
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
              <!-- </v-form> -->
              <span v-else :class="{ inactive: item.inactive }">{{ item.primeName }}</span>
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
              <span v-else :class="{ inactive: item.inactive }">{{ item.contractName }}</span>
            </template>

            <!-- Directorate Slot -->
            <template v-slot:[`item.directorate`]="{ item }">
              <v-text-field
                name="directorate"
                v-if="editingItem && editingItem.id == item.id"
                v-model="editingItem.directorate"
                label="Directorate"
              ></v-text-field>
              <!-- </v-form> -->
              <span v-else :class="{ inactive: item.inactive }">{{ item.directorate }}</span>
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
                label="Description"
                rows="1"
                @click.stop
              ></v-textarea>
              <span v-else :class="{ inactive: item.inactive }">{{ item.description }}</span>
            </template>

            <!-- Expanded Row Slot -->
            <template v-slot:expanded-item="contract">
              <expanded-contract-table-row
                :contract="contract"
                :colspan="contractHeaders.length"
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

                  <!-- Deactivate Contract -->
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        icon
                        text
                        :disabled="editingItem != null || isEditingProjectItem || contractLoading"
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
                        :disabled="editingItem != null || isEditingProjectItem || contractLoading"
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
  window.EventBus.$on('closed-contract-employees-assigned-modal', () => {
    this.toggleContractEmployeesModal = false;
  });
  window.EventBus.$on('is-editing-project-item', (value) => {
    this.isEditingProjectItem = value;
  });

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
 * Deletes contract object given contract ID
 *
 * @param contractID contract ID to delete
 */
async function deleteContractPrime(contractID) {
  try {
    this.contractLoading = true;
    await api.deleteItem(api.CONTRACTS, contractID);
    let contracts = _.cloneDeep(this.$store.getters.contracts);
    let itemIndex = contracts.findIndex((item) => item.id == contractID);
    contracts.splice(itemIndex, 1);
    this.$store.dispatch('setContracts', { contracts });
    this.displaySuccess('Item was successfully deleted!');
    this.contractLoading = false;
  } catch (err) {
    this.displayError(err);
    this.contractLoading = false;
  }
} // deleteContractPrime

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

function watchShowInactive() {
  if (this.showInactive) {
    this.expanded = [...this.expanded, ...this.$store.getters.contracts.filter((c) => c.inactive)];
  } else {
    this.expanded = [...this.expanded.filter((c) => !c.inactive)];
  }
}

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
    contractRowClass,
    getProject,
    updateStoreEmployees,
    getEmployeeContractRelationships,
    clickedDeleteContractPrime,
    cloneDeep,
    deleteContractPrime,
    displaySuccess,
    displayError,
    format,
    clickedRow,
    clickedEdit,
    updateStoreContracts,
    updateContractPrime,
    getDateOptionalRules,
    isDeletingOrUpdatingStatus
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
      contractEmployeesAssigned: null,
      contractStatusItem: null,
      contractValid: true,
      addProjectUnderContract: null,
      toggleProjectForm: false,
      relationships: [],
      deleteItem: null,
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
    showInactive: watchShowInactive
  }
};
</script>

<style lang="scss">
@import 'src/assets/styles/styles';
.inactive {
  color: $case-red;
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
