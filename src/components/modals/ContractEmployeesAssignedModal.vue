<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="450">
      <v-card>
        <v-tabs v-model="tab" color="#bc3825" fixed-tabs>
          <v-tabs-slider color="#bc3825"></v-tabs-slider> <v-tab v-for="tab in tabs" :key="tab">{{ tab }}</v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
          <v-tab-item>
            <v-card v-if="tab == 0">
              <v-card-text>
                <span v-if="currentEmployees.length == 0"
                  >There are no employees currently assigned to {{ contract.contractName }}.</span
                >
                <ul v-else>
                  <li v-for="e in currentEmployees" :key="e.id">
                    <a :href="`/employee/${e.employee.employeeNumber}`">{{
                      e.employee.firstName + ' ' + e.employee.lastName
                    }}</a
                    ><span>
                      (assigned project{{ e.currentProjects.length > 1 ? 's' : '' }}:
                      {{ e.currentProjects.map((p) => p.projectName).join(', ') }})</span
                    >
                  </li>
                </ul>
              </v-card-text></v-card
            >
          </v-tab-item>
          <v-tab-item>
            <v-card v-if="tab == 1">
              <v-card-text>
                <span v-if="pastEmployees.length == 0"
                  >There are no employees who have been assigned to {{ contract.contractName }} in the past.</span
                >
                <ul v-else>
                  <li v-for="e in pastEmployees" :key="e.id">
                    <a :href="`/employee/${e.employee.employeeNumber}`">{{
                      e.employee.firstName + ' ' + e.employee.lastName
                    }}</a>
                    <span>
                      (last assigned project{{ e.lastProjects.length > 1 ? 's' : '' }}:
                      {{ e.lastProjects.map((p) => p.projectName).join(', ') }})</span
                    >
                  </li>
                </ul>
              </v-card-text></v-card
            >
          </v-tab-item>
        </v-tabs-items>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            @click.native="
              emit('closed-contract-employees-assigned-modal');
              activate = false;
            "
            >Close</v-btn
          >
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import { updateStoreContracts, updateStoreEmployees } from '@/utils/storeUtils';
import dateUtils from '../../shared/dateUtils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Created lifecyle hook
 */
function created() {
  if (!this.$store.getters.employees) this.updateStoreEmployees();
  if (!this.$store.getters.contracts) this.updateStoreContracts();
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits a message and data if it exists.
 *
 * @param msg - Message to emit
 */
function emit(msg) {
  window.EventBus.$emit(msg);
} // emit

/**
 * Calculates list of employees currently assigned to given contract.
 */
function getCurrentEmployeesAssignedToContract() {
  this.currentEmployees = [];
  this.$store.getters.employees.forEach((e) => {
    let contract = e.contracts ? e.contracts.find((c) => c.contractId == this.contract.id) : null;
    if (e.contracts && contract && contract.projects.some((p) => !p.endDate)) {
      let currentProjects = contract.projects.filter((p) => !p.endDate);
      this.currentEmployees.push({
        employee: e,
        currentProjects: currentProjects.map((p) => this.getProject(this.contract.id, p.projectId))
      });
    }
  });
} // getCurrentEmployeesAssignedToContract

/**
 * Calculates list of employees previously assigned to given contract.
 */
function getPastEmployeesAssignedToContract() {
  this.pastEmployees = [];
  this.$store.getters.employees.forEach((e) => {
    let contract = e.contracts ? e.contracts.find((c) => c.contractId == this.contract.id) : null;
    if (e.contracts && contract) {
      if (!contract.projects.some((ep) => !ep.endDate)) {
        contract.projects.sort((a, b) => {
          dateUtils.isAfter(a.endDate, b.endDate) ? 1 : dateUtils.isAfter(b.endDate, a.endDate) ? -1 : 0;
        });
        let latestProjects = contract.projects.filter(
          (p) => p.endDate == contract.projects[contract.projects.length - 1].endDate
        );

        this.pastEmployees.push({
          employee: e,
          lastProjects: latestProjects.map((p) => this.getProject(this.contract.id, p.projectId))
        });
      }
    }
  });
} // getPastEmployeesAssignedToContract

/**
 * Gets project based on conractId and projecId
 *
 * @param contractId id of contract
 * @param projectId id of project
 */
function getProject(contractId, projectId) {
  return this.$store.getters.contracts.find((c) => c.id == contractId).projects.find((p) => p.id == projectId);
} // getProject

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Watcher for modal toggle
 */
function watchEmployeesAssignedModal() {
  if (this.toggleModal) this.activate = true;
} // watchEmployeesAssignedModal

/**
 * Watcher for contract
 */
function watchContract() {
  if (this.contract) {
    this.getCurrentEmployeesAssignedToContract();
    this.getPastEmployeesAssignedToContract();
  }
} // watchContract

/**
 * Watcher for activate
 */
function watchActivate() {
  if (!this.activate) {
    this.tab = 0;
  }
} // watchActivate

export default {
  created,
  data() {
    return {
      tab: null,
      activate: false,
      currentEmployees: [],
      pastEmployees: [],
      tabs: ['Current', 'Past']
    };
  },
  methods: {
    emit,
    getCurrentEmployeesAssignedToContract,
    getPastEmployeesAssignedToContract,
    getProject,
    updateStoreContracts,
    updateStoreEmployees
  },
  watch: {
    activate: watchActivate,
    toggleModal: watchEmployeesAssignedModal,
    contract: watchContract
  },
  props: ['toggleModal', 'contract']
};
</script>
