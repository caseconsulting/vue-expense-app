<template>
  <div>
    <v-card class="mt-3">
      <v-container fluid>
        <!-- START CONTRACTS DATA TABLE -->
        <v-data-table
          @click:row="clickedRow"
          :loading="loading"
          :expanded.sync="expanded"
          :headers="contractHeaders"
          :items="$store.getters.contracts"
        >
          <!-- Contract Name Slot -->
          <template v-slot:[`item.contractName`]="{ item }">
            <v-text-field
              v-if="editingItem && editingItem.id == item.id"
              v-model="editingItem.contractName"
            ></v-text-field>
            <span v-else>{{ item.contractName }}</span>
          </template>
          <!-- Prime Name Slot -->
          <template v-slot:[`item.primeName`]="{ item }">
            <v-text-field
              v-if="editingItem && editingItem.id == item.id"
              v-model="editingItem.primeName"
            ></v-text-field>
            <span v-else>{{ item.primeName }}</span>
          </template>
          <!-- Cost Type Slot -->
          <template v-slot:[`item.costType`]="{ item }">
            <v-text-field v-if="editingItem && editingItem.id == item.id" v-model="editingItem.costType"></v-text-field>
            <span v-else>{{ item.costType }}</span>
          </template>
          <!-- PoP Start Date Slot -->
          <template v-slot:[`item.popStartDate`]="{ item }">
            <v-menu
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
                  v-model="popStartDateFormatted"
                  :rules="getDateRules()"
                  hint="MM/DD/YYYY format"
                  persistent-hint
                  prepend-icon="event"
                  @blur="editingItem.popStartDate = format(popStartDateFormatted, 'MM/DD/YYYY', 'YYYY-MM-DD')"
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
            <span v-else>{{ format(item.popStartDate, 'YYYY-MM-DD', 'MM/DD/YYYY') }}</span>
          </template>
          <!-- PoP End Date Slot -->
          <template v-slot:[`item.popEndDate`]="{ item }">
            <v-menu
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
                  v-model="popEndDateFormatted"
                  :rules="getDateRules()"
                  hint="MM/DD/YYYY format"
                  persistent-hint
                  prepend-icon="event"
                  @blur="editingItem.popEndDate = format(popEndDateFormatted, 'MM/DD/YYYY', 'YYYY-MM-DD')"
                  @input="popEndDateMenu = false"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker v-model="editingItem.popEndDate" no-title @input="popEndDateMenu = false"></v-date-picker>
            </v-menu>
            <span v-else>{{ format(item.popEndDate, 'YYYY-MM-DD', 'MM/DD/YYYY') }}</span>
          </template>

          <!-- Expanded Row Slot -->
          <template v-slot:expanded-item="contract">
            <td :colspan="contractHeaders.length" class="pa-0">
              <v-container fluid class="grey-background">
                <!-- START EXPANDED PROJECTS DATA TABLE-->
                <v-data-table :headers="projectHeaders" :items="contract.item.projects" hide-default-footer>
                  <template v-slot:[`item.projectName`]="{ item }">
                    <v-text-field
                      v-if="editingItem && editingItem.id == item.id"
                      v-model="editingItem.projectName"
                    ></v-text-field>
                    <span v-else>{{ item.projectName }}</span>
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
                      <!-- Edit Project -->
                      <v-tooltip top>
                        <template v-slot:activator="{ on }">
                          <v-btn :disabled="editingItem != null" icon text @click.stop="clickedEdit(item)" v-on="on">
                            <v-icon class="case-gray">edit</v-icon>
                          </v-btn>
                        </template>
                        <span>Edit</span>
                      </v-tooltip>

                      <!-- Delete Project -->
                      <v-tooltip top>
                        <template v-slot:activator="{ on }">
                          <v-btn
                            :disabled="editingItem != null"
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
                  <v-btn :disabled="editingItem != null" icon text v-on="on">
                    <v-icon class="case-gray">mdi-file-document-plus</v-icon>
                  </v-btn>
                </template>
                <span>Add Project</span>
              </v-tooltip>

              <!-- Edit Contract -->
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn icon text :disabled="editingItem != null" v-on="on" @click.stop="clickedEdit(item)">
                    <v-icon class="case-gray">edit</v-icon>
                  </v-btn>
                </template>
                <span>Edit</span>
              </v-tooltip>

              <!-- Delete Contract -->
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn
                    :disabled="editingItem != null"
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
      </v-container>
    </v-card>
    <delete-modal :toggleDeleteModal="toggleContractDeleteModal" :type="'contract'"></delete-modal>
    <delete-modal :toggleDeleteModal="toggleProjectDeleteModal" :type="'project'"></delete-modal>
    <contract-project-delete-warning
      :toggleModal="toggleWarningModal"
      :relationships="relationships"
    ></contract-project-delete-warning>
  </div>
</template>
<script>
import _ from 'lodash';
import { updateStoreContracts } from '@/utils/storeUtils';
import { getDateRules } from '@/shared/validationUtils.js';
import { format } from '../../shared/dateUtils';
import api from '../../shared/api';
import DeleteModal from '../modals/DeleteModal.vue';
import ContractProjectDeleteWarning from '../modals/ContractProjectDeleteWarning.vue';
import { updateStoreEmployees } from '../../utils/storeUtils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * created life cycle hook
 */
async function created() {
  this.loading = true;

  this.loading = false;

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
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function clickedRow(contractObj) {
  if (_.isEmpty(this.expanded) || this.expanded[0].id != contractObj.id) {
    this.expanded = [];
    this.expanded.push(contractObj);
  } else {
    this.expanded = [];
  }
}

async function updateContractPrime() {
  try {
    this.contractLoading = true;
    await api.updateItem(api.CONTRACTS, this.editingItem);
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
}

async function updateProject(contract) {
  try {
    this.contractLoading = true;
    let contractObj = _.cloneDeep(contract);
    let projectIndex = contractObj.projects.findIndex((item) => item.id == this.editingItem.id);
    contractObj.projects[projectIndex] = this.editingItem;
    await api.updateItem(api.CONTRACTS, contractObj);
    this.contractLoading = false;
    this.displaySuccess('Item was successfully saved!');
  } catch (err) {
    this.contractLoading = false;
    this.displayError(err);
  }
  this.editingItem = null;
}

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
}

async function deleteProject(contract, projectID) {
  try {
    let contractObj = _.cloneDeep(contract);
    let projectIndex = contractObj.projects.findIndex((item) => item.id == projectID);
    contractObj.projects.splice(projectIndex, 1);
    console.log(await api.updateItem(api.CONTRACTS, contractObj));
    this.displaySuccess('Item was successfully deleted!');
  } catch (err) {
    this.displayError(err);
  }
}

function clickedEdit(item) {
  this.editingItem = _.cloneDeep(item);
}

async function clickedDeleteContractPrime(contract) {
  let relationships = await this.getEmployeeContractRelationships(contract);
  if (relationships.length != 0) {
    this.toggleWarningModal = !this.toggleWarningModal;
    this.relationships = relationships;
  } else {
    this.toggleContractDeleteModal = !this.toggleContractDeleteModal;
  }
}

async function clickedDeleteProject(contract, project) {
  let relationships = await this.getEmployeeContractRelationships(contract, project);
  if (relationships.length != 0) {
    this.toggleWarningModal = !this.toggleWarningModal;
    this.relationships = relationships;
  } else {
    this.toggleProjectDeleteModal = !this.toggleProjectDeleteModal;
  }
}

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
              relationships.push({ project: project, employees: [e] });
            } else {
              relationships[index].employees.push(e);
            }
          }
        } else {
          contractObj.projects.forEach((p) => {
            let index = relationships.findIndex((r) => r.project.projectId == p.projectId);
            if (index < 0) {
              relationships.push({ project: p, employees: [e] });
            } else {
              relationships[index].employees.push(e);
            }
          });
        }
      }
    }
  });
  return relationships;
}

function displayError(err) {
  let status = {
    statusType: 'ERROR',
    statusMessage: err,
    color: 'red'
  };

  window.EventBus.$emit('status-alert', status);
}

function displaySuccess(msg) {
  let status = {
    statusType: 'SUCCESS',
    statusMessage: msg,
    color: 'green'
  };
  window.EventBus.$emit('status-alert', status);
}

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

function watchEditingContractPoPEndDate() {
  if (this.editingItem)
    this.popEndDateFormatted = this.format(this.editingItem.popEndDate, null, 'MM/DD/YYYY') || this.popEndDateFormatted;

  if (
    this.editingItem !== null &&
    this.editingItem.popEndDate !== null &&
    !this.format(this.editingItem.popEndDate, null, 'MM/DD/YYYY')
  ) {
    this.editingItem.popEndDate = null;
  }
}

function watchEditingContractPoPStartDate() {
  if (this.editingItem)
    this.popStartDateFormatted =
      this.format(this.editingItem.popStartDate, null, 'MM/DD/YYYY') || this.popStartDateFormatted;

  if (
    this.editingItem !== null &&
    this.editingItem.popStartDate !== null &&
    !this.format(this.editingItem.popStartDate, null, 'MM/DD/YYYY')
  ) {
    this.editingItem.popStartDate = null;
  }
}

// function showWarning() {
//   // todo
// }

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  // beforeDestroy,
  watch: {
    'editingItem.popEndDate': watchEditingContractPoPEndDate,
    'editingItem.popStartDate': watchEditingContractPoPStartDate
  },
  created,
  components: {
    DeleteModal,
    ContractProjectDeleteWarning
  },
  methods: {
    updateStoreEmployees,
    getEmployeeContractRelationships,
    clickedDeleteContractPrime,
    clickedDeleteProject,
    deleteProject,
    deleteContractPrime,
    displaySuccess,
    displayError,
    format,
    clickedRow,
    clickedEdit,
    updateStoreContracts,
    updateContractPrime,
    getDateRules,
    updateProject
  },
  data() {
    return {
      relationships: [],
      deleteItem: null,
      toggleWarningModal: false,
      toggleContractDeleteModal: false,
      toggleProjectDeleteModal: false,
      popStartDateFormatted: null,
      popEndDateFormatted: null,
      contracts: [],
      popStartDateMenu: false,
      popEndDateMenu: false,
      contractLoading: false,
      editingItem: null,
      loading: false,
      expanded: [],
      projectHeaders: [
        {
          text: 'Project',
          value: 'projectName',
          align: 'center'
        },
        {
          value: 'actions',
          sortable: false
        }
      ],
      contractHeaders: [
        {
          text: 'Contract',
          value: 'contractName',
          align: 'center'
        },
        {
          text: 'Prime',
          value: 'primeName',
          align: 'center'
        },
        {
          text: 'Cost Type',
          value: 'costType',
          align: 'center'
        },
        {
          text: 'PoP-Start Date',
          value: 'popStartDate',
          align: 'center'
        },
        {
          text: 'PoP-End Date',
          value: 'popEndDate',
          align: 'center'
        },
        {
          value: 'actions',
          sortable: false
        }
      ]
    };
  }
};
</script>
