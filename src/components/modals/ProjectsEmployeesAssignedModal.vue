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
                  >There are no employees currently working on {{ project.projectName }}.</span
                >
                <ul v-else>
                  <li v-for="e in currentEmployees" :key="e.id">
                    <a :href="`/employee/${e.employeeNumber}`">{{ e.firstName + ' ' + e.lastName }}</a>
                  </li>
                </ul>
              </v-card-text></v-card
            >
          </v-tab-item>
          <v-tab-item>
            <v-card v-if="tab == 1">
              <v-card-text>
                <span v-if="pastEmployees.length == 0"
                  >There are no employees who have worked on {{ project.projectName }} in the past.</span
                >
                <ul v-else>
                  <li v-for="e in pastEmployees" :key="e.id">
                    <a :href="`/employee/${e.employeeNumber}`">{{ e.firstName + ' ' + e.lastName }}</a>
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
              emit('closed-project-employees-assigned-modal');
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
 * Gets current employees assigned to project.
 */
function getCurrentEmployeesAssignedToProject() {
  this.currentEmployees = this.$store.getters.employees.filter((e) => {
    if (
      e.contracts &&
      e.contracts.some(
        (c) =>
          c.contractId == this.contract.id && c.projects.some((p) => p.projectId == this.project.id && p.presentDate)
      )
    ) {
      return true;
    }
    return false;
  });
} // getCurrentEmployeesAssignedToProject

/**
 * Gets past employees who were assigned to project.
 */
function getPastEmployeesAssignedToProject() {
  this.pastEmployees = this.$store.getters.employees.filter((e) => {
    if (
      e.contracts &&
      e.contracts.some(
        (c) =>
          c.contractId == this.contract.id && c.projects.some((p) => p.projectId == this.project.id && !p.presentDate)
      )
    ) {
      return true;
    }
    return false;
  });
} // getPastEmployeesAssignedToProject

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
 * Watcher for watchProject. Get current and past employees for project.
 */
function watchProject() {
  if (this.project) {
    this.getCurrentEmployeesAssignedToProject();
    this.getPastEmployeesAssignedToProject();
  }
} // watchProject

/**
 * Watcher for the activate variable. Resets active tab to current
 * when closed.
 */
function watchActivate() {
  if (!this.activate) {
    this.tab = 0;
  }
} // watchActivate

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  data() {
    return {
      activate: false,
      tab: null,
      tabs: ['Current', 'Past'],
      pastEmployees: [],
      currentEmployees: []
    };
  },
  methods: {
    emit,
    getCurrentEmployeesAssignedToProject,
    getPastEmployeesAssignedToProject,
    updateStoreContracts,
    updateStoreEmployees
  },
  watch: {
    activate: watchActivate,
    toggleModal: watchEmployeesAssignedModal,
    project: watchProject
  },
  props: ['toggleModal', 'contract', 'project']
};
</script>
