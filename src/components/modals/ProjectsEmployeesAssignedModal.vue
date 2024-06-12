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
              <v-card-text>
                <p
                  v-if="currentEmployees.length != 0 && currentEmployees.some((e) => e.workStatus == 0)"
                  class="text-center text-caption mb-1"
                >
                  <i>* Names in color red indicate inactive employees</i>
                </p>
                <span v-if="currentEmployees.length == 0"
                  >There are no employees currently working on {{ project.projectName }}.</span
                >
                <ul v-else class="pa-4">
                  <li v-for="e in currentEmployees" :key="e.id">
                    <a
                      @click="$router.push(`/employee/${e.employeeNumber}`)"
                      :class="e.workStatus == 0 ? 'inactive' : 'active'"
                      class="pointer"
                      >{{ nicknameAndLastName(e) }}</a
                    >
                  </li>
                </ul>
              </v-card-text></v-card
            >
          </v-window-item>
          <v-window-item value="past">
            <v-card>
              <v-card-text>
                <p
                  v-if="pastEmployees.length != 0 && pastEmployees.some((e) => e.workStatus == 0)"
                  class="text-center text-caption mb-1"
                >
                  <i>* Names in color red indicate inactive employees</i>
                </p>
                <span v-if="pastEmployees.length == 0"
                  >There are no active employees who have worked on {{ project.projectName }} in the past.</span
                >
                <ul v-else class="pa-4">
                  <li v-for="e in pastEmployees" :key="e.id">
                    <a
                      @click="$router.push(`/employee/${e.employeeNumber}`)"
                      :class="e.workStatus == 0 ? 'inactive' : 'active'"
                      class="pointer"
                      >{{ nicknameAndLastName(e) }}</a
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
import { nicknameAndLastName } from '@/shared/employeeUtils';
import { getProjectCurrentEmployees, getProjectPastEmployees } from '@/shared/contractUtils';

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
  this.emitter.emit(msg);
} // emit

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
    this.currentEmployees = getProjectCurrentEmployees(this.contract, this.project, this.$store.getters.employees);
    this.pastEmployees = getProjectPastEmployees(this.contract, this.project, this.$store.getters.employees);
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
    nicknameAndLastName,
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
<style scoped>
.active {
  color: #0000ee;
}
.inactive {
  color: red !important;
}
</style>
