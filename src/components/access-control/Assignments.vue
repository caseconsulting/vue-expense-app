<template>
  <v-col>
    <v-row dense>
      <v-col cols="2" class="pb-0"><p class="mb-0"><strong>Assignment Name</strong></p></v-col>
      <v-col cols="4" class="pb-0"><p class="mb-0"><strong>Responsible Party</strong></p></v-col>
      <v-col cols="4" class="pb-0"><p class="mb-0"><strong>Responsible For</strong></p></v-col>
      <v-col cols="2" class="pb-0"></v-col>
    </v-row>
    <v-row v-for="(assignment, i) in assignments" :key="assignment.id" dense>
      <v-col cols="2" class="pt-0">
        <v-text-field
          v-model="assignment.name"
          variant="underlined"
          class="assignmentNames"
        />
      </v-col>
      <v-col cols="4" class="pt-0">
        <MultiAutocomplete
          v-model="usersModel[i]"
          :items="usersOptions"
          label="Employees or Tags"
          @update:model-value="divergeUsers(i)"
        />
      </v-col>
      <v-col cols="4" class="pt-0">
        <p v-if="isAdmin" class="adminEmpAccess">
          Admins have access to all employees
        </p>
        <MultiAutocomplete
          v-else
          v-model="membersModel[i]"
          :items="membersOptions"
          label="Employees, Tags, Contracts, or Projects"
          @update:model-value="divergeMembers(i)"
        />
      </v-col>
      <v-col cols="2" class="pt-0">
        <v-btn
          variant="text"
          icon="mdi-delete"
          :disabled="assignments.length == 1"
          @click="removeAssignment(i)"
          v-tooltip="`Delete '${assignment.name}'`"
        />
      </v-col>
    </v-row>
  </v-col>
</template>

<script setup>
// Vue & Component imports
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import MultiAutocomplete from '@/components/access-control/MultiAutocomplete.vue';
// JS/utility imports
import { updateStoreContracts, updateStoreEmployees, updateStoreTags } from '@/utils/storeUtils';
import { deepClone, indexBy } from '@/utils/utils';
// Store and stuff
const store = useStore();
let indexes = {};

const assignments = defineModel();
const props = defineProps(['projects', 'isAdmin']);

const usersModel = ref([]);
const membersModel = ref([]);

const usersOptions = ref([]);
const membersOptions = ref([]);

/**
 * Deletes an assignment from local array
 */
function removeAssignment(index) {
  if(assignments.value.length > 1)
    assignments.value.splice(index, 1);
}

/**
 * Diverge: take an array of different types and split them
 *          into an object by type
 */
function divergeUsers(index) {
  // create blank obj if not exists, then hand of to diverge()
  assignments.value[index].users ??= {};
  diverge(assignments.value[index].users, usersModel.value[index]);
}
function divergeMembers(index) {
  // create blank obj if not exists, then hand of to diverge()
  assignments.value[index].members ??= {};
  diverge(assignments.value[index].members, membersModel.value[index]);
}
function diverge(into, from) {
  // create arrays to put items in
  into.employees = [];
  into.tags = [];
  into.contracts = [];
  into.projects = [];

  // look up ID in index and put it in the proper array
  for (let id of from) {
    if (indexes.employees[id]) into.employees.push(id);
    else if (indexes.tags[id]) into.tags.push(id);
    else if (indexes.contracts[id]) into.contracts.push(id);
    else if (indexes.projects[id]) into.projects.push(id);
    else throw new Error('Could not tell type of id ' + id);
  }
}

/**
 * Converge: take an object split up into different types
 *           and combine them all into one mega array
 */
function converge(into, index, from) {
  if (into?.[index] === undefined || !from) return;
  into[index] = deepClone([
    ...(from.employees ?? []),
    ...(from.tags ?? []),
    ...(from.contracts ?? []),
    ...(from.projects ?? []),
  ]);
}

onMounted(async () => {
  // update portal data
  await Promise.all([
    store.getters.employees ? '' : updateStoreEmployees(),
    store.getters.tags ? '' : updateStoreTags(),
    store.getters.contracts ? '' : updateStoreContracts(),
  ]);

  // options for user dropdown
  usersOptions.value = [
    ...store.getters.tags,
    ...store.getters.employees
  ];
  // options for members dropdown
  membersOptions.value = [
    ...store.getters.tags,
    ...store.getters.contracts,
    ...store.getters.employees,
    ...(props.projects || [])
  ];

  // indexes for O(1) search later
  indexes = {
    employees: indexBy(store.getters.employees, 'id'),
    tags: indexBy(store.getters.tags, 'id'),
    contracts: indexBy(store.getters.contracts, 'id'),
    projects: indexBy((props.projects || []), 'id')
  }

  // converge items into dropdowns from diverged array
  for (let i in assignments.value) {
    usersModel.value[i] ??= [];
    membersModel.value[i] ??= [];
    converge(usersModel.value, i, assignments.value[i].users);
    converge(membersModel.value, i, assignments.value[i].members);
  }
});
</script>

<style scoped>
.adminEmpAccess {
  margin-top: 1.5em;
  margin-left: 1.5em;
  color: #0006;
  font-style: italic;
}
</style>
