<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="450">
      <v-card>
        <v-tabs v-model="tab" color="#bc3825" fixed-tabs>
          <v-tab value="current">Current</v-tab>
          <v-tab value="past">Past</v-tab>
        </v-tabs>
        <v-window v-model="tab">
          <v-window-item value="current">
            <v-card>
              <v-card-text
                :class="
                  currentEmployees.length != 0 && currentEmployees.some((e) => e.employee.workStatus == 0) ? 'pt-2' : ''
                "
              >
                <p
                  v-if="currentEmployees.length != 0 && currentEmployees.some((e) => e.employee.workStatus == 0)"
                  class="text-center text-caption mb-1"
                >
                  <i>* Names in color red indicate inactive employees</i>
                </p>
                <span v-if="currentEmployees.length == 0"
                  >There are no employees currently assigned to {{ contract.contractName }}.</span
                >
                <ul v-else class="pa-4">
                  <li v-for="e in currentEmployees" :key="e.id">
                    <a
                      @click="router.push(`/employee/${e.employee.employeeNumber}`)"
                      :class="e.employee.workStatus == 0 ? 'inactive' : 'active'"
                      class="pointer"
                      >{{ nicknameAndLastName(e.employee) }}</a
                    ><span>
                      (assigned project{{ e.currentProjects.length > 1 ? 's' : '' }}: {{ getCurrentProject(e) }})</span
                    >
                  </li>
                </ul>
              </v-card-text></v-card
            >
          </v-window-item>
          <v-window-item value="past">
            <v-card>
              <v-card-text
                :class="
                  pastEmployees.length != 0 && pastEmployees.some((e) => e.employee.workStatus == 0) ? 'pt-2' : ''
                "
              >
                <p
                  v-if="pastEmployees.length != 0 && pastEmployees.some((e) => e.employee.workStatus == 0)"
                  class="text-center text-caption mb-1"
                >
                  <i>* Names in color red indicate inactive employees</i>
                </p>

                <span v-if="pastEmployees.length == 0"
                  >There are no active employees who have been assigned to {{ contract.contractName }} in the
                  past.</span
                >
                <ul v-else class="pa-4">
                  <li v-for="e in pastEmployees" :key="e.id">
                    <a
                      @click="router.push(`/employee/${e.employee.employeeNumber}`)"
                      :class="e.employee.workStatus == 0 ? 'inactive' : 'active'"
                      class="pointer"
                      >{{ nicknameAndLastName(e.employee) }}</a
                    >
                    <span>
                      (last assigned project{{ e.lastProjects.length > 1 ? 's' : '' }}: {{ getPastProject(e) }})</span
                    >
                  </li>
                </ul>
              </v-card-text></v-card
            >
          </v-window-item>
        </v-window>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="
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

<script setup>
import { updateStoreContracts, updateStoreEmployees } from '@/utils/storeUtils';
import dateUtils from '../../shared/dateUtils';
import { nicknameAndLastName } from '@/shared/employeeUtils';
import { inject, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['toggleModal', 'contract']);
const store = useStore();
const emitter = inject('emitter');
const router = useRouter();

const tab = ref('0');
const activate = ref(false);
const currentEmployees = ref([]);
const pastEmployees = ref([]);
// const tabs = ref(['Current', 'Past']);

if (!store.getters.employees) updateStoreEmployees();
if (!store.getters.contracts) updateStoreContracts();

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

// Watcher for modal toggle
watch(
  () => props.toggleModal,
  () => {
    if (props.toggleModal) activate.value = true;
  }
);

// Watcher for contract
watch(
  () => props.contract,
  () => {
    if (props.contract) {
      getCurrentEmployeesAssignedToContract();
      getPastEmployeesAssignedToContract();
    }
  }
);

// Watcher for activate
watch(activate, () => {
  if (!activate.value) {
    tab.value = 0;
  }
});

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
  emitter.emit(msg);
} // emit

/**
 * Calculates list of employees currently assigned to given contract.
 */
function getCurrentEmployeesAssignedToContract() {
  currentEmployees.value = [];
  store.getters.employees.forEach((e) => {
    let contract = e.contracts ? e.contracts.find((c) => c.contractId == props.contract.id) : null;
    if (e.contracts && contract && contract.projects.some((p) => !p.endDate && e.workStatus > 0)) {
      let currentProjects = contract.projects.filter((p) => !p.endDate);
      currentEmployees.value.push({
        employee: e,
        currentProjects: currentProjects.map((p) => getProject(props.contract.id, p.projectId))
      });
    }
  });
} // getCurrentEmployeesAssignedToContract

/**
 * Calculates list of employees previously assigned to given contract.
 */
function getPastEmployeesAssignedToContract() {
  pastEmployees.value = [];
  store.getters.employees.forEach((e) => {
    let contract = e.contracts ? e.contracts.find((c) => c.contractId == props.contract.id) : null;
    if (e.contracts && contract && e.workStatus > 0) {
      if (!contract.projects.some((ep) => !ep.endDate)) {
        contract.projects.sort((a, b) => {
          dateUtils.isAfter(a.endDate, b.endDate) ? 1 : dateUtils.isAfter(b.endDate, a.endDate) ? -1 : 0;
        });
        let latestProjects = contract.projects.filter(
          (p) => p.endDate == contract.projects[contract.projects.length - 1].endDate
        );

        pastEmployees.value.push({
          employee: e,
          lastProjects: latestProjects.map((p) => getProject(props.contract.id, p.projectId))
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
  return store.getters.contracts.find((c) => c.id == contractId).projects.find((p) => p.id == projectId);
} // getProject

/**
 * Gets the current project aligned with a given contract
 * @param employee employee that is on the contract
 */
function getCurrentProject(employee) {
  return employee.currentProjects.map((p) => p.projectName).join(', ');
} // getCurrentProject

/**
 * Gets the past project aligned with a given contract
 * @param employee employee that was/is on the contract
 */
function getPastProject(employee) {
  try {
    return employee.lastProjects.map((p) => p.projectName).join(', ');
  } catch (err) {
    console.error(err);
    return 'project no longer exists';
  }
} // getPastProject
</script>

<style scoped>
.active {
  color: #0000ee;
}
.inactive {
  color: red !important;
}
</style>
