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
                    <router-link
                      :to="`/employee/${e.employeeNumber}`"
                      target="_blank"
                      class="pointer text-decoration-none"
                      :class="e.workStatus == 0 ? 'inactive' : 'active'"
                    >
                      {{ nicknameAndLastName(e) }}
                    </router-link>
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
                    <router-link
                      :to="`/employee/${e.employeeNumber}`"
                      target="_blank"
                      :class="e.workStatus == 0 ? 'inactive' : 'active'"
                      class="pointer text-decoration-none"
                      >{{ nicknameAndLastName(e) }}
                    </router-link>
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
          >
            Close
          </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { updateStoreContracts, updateStoreEmployees } from '@/utils/storeUtils';
import { nicknameAndLastName } from '@/shared/employeeUtils';
import { getProjectCurrentEmployees, getProjectPastEmployees } from '@/shared/contractUtils';
import { onBeforeMount, ref, inject, watch } from 'vue';
import { useStore } from 'vuex';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const activate = ref(false);
const currentEmployees = ref([]);
const emitter = inject('emitter');
const pastEmployees = ref([]);
const props = defineProps(['toggleModal', 'contract', 'project']);
const store = useStore();
const tab = ref(null);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Created lifecyle hook
 */
onBeforeMount(() => {
  if (!store.getters.employees) updateStoreEmployees();
  if (!store.getters.contracts) updateStoreContracts();
}); // created

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

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Watcher for modal toggle
 */
watch(
  () => props.toggleModal,
  () => {
    if (props.toggleModal) activate.value = true;
  }
); // watchEmployeesAssignedModal

/**
 * Watcher for watchProject. Get current and past employees for project.
 */
watch(
  () => props.project,
  () => {
    if (props.project) {
      currentEmployees.value = getProjectCurrentEmployees(props.contract, props.project, store.getters.employees);
      pastEmployees.value = getProjectPastEmployees(props.contract, props.project, store.getters.employees);
    }
  }
); // watchProject

/**
 * Watcher for the activate variable. Resets active tab to current
 * when closed.
 */
watch(activate, () => {
  if (!activate.value) {
    tab.value = 0;
  }
}); // watchActivate
</script>

<style scoped>
.active {
  color: #0000ee;
}
.inactive {
  color: red !important;
}
</style>
