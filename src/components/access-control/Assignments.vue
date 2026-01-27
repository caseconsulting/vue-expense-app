<template>
  <v-col>
    <v-row dense>
      <v-col cols="2" class="pb-0"><p class="mb-0"><strong>Name</strong></p></v-col>
      <v-col cols="4" class="pb-0"><p class="mb-0"><strong>Users</strong></p></v-col>
      <v-col cols="4" class="pb-0"><p class="mb-0"><strong>Members</strong></p></v-col>
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
        <v-autocomplete
          label="Employees and tags"
          :items="employeesAndTags"
          :item-title="getTitle"
          item-value="id"
          variant="underlined"
          multiple
          chips
          closable-chips
          clear-on-select
          auto-select-first
          v-model="usersModel[i]"
          @update:model-value="divergeUsers(i)"
        >
          <template #chip="{ props, item }">
            <v-chip v-bind="props" class="ml-0 pl-1 mr-0 pr-2 cursor-pointer" label>
              <template #prepend>
                <v-icon :icon="getIcon(item)" size="small" class="mr-2" />
              </template>
              <template #close>
                <v-icon icon="mdi-close" size="small" />
              </template>
            </v-chip>
          </template>
        </v-autocomplete>
      </v-col>
      <v-col cols="4" class="pt-0">
        <v-autocomplete
          label="Employees, tags, contracts, and projects"
          :items="employeesTagsContractsProjects"
          :item-title="getTitle"
          item-value="id"
          variant="underlined"
          multiple
          chips
          closable-chips
          clear-on-select
          auto-select-first
          v-model="membersModel[i]"
          @update:model-value="divergeMembers(i)"
        >
          <template #chip="{ props, item }">
            <v-chip v-bind="props" label>
              <template #prepend>
                <v-icon :icon="getIcon(item)" size="small" class="mr-2" />
              </template>
              <template #close>
                <v-icon icon="mdi-close" size="small" />
              </template>
            </v-chip>
          </template>
        </v-autocomplete>
      </v-col>
      <v-col cols="2" class="pt-0">
        <v-btn
          variant="icon"
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
import { inject, ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
// JS/utility imports
import { updateStoreContracts, updateStoreEmployees, updateStoreTags } from '@/utils/storeUtils';
import { generateUUID, indexBy, deepClone } from '@/utils/utils';
import api from '@/shared/api';
// Store and stuff
const emitter = inject('emitter');
const store = useStore();

const assignments = defineModel();
const props = defineProps(['indexes']);

const usersModel = ref([]);
const membersModel = ref([]);

const employeesAndTags = ref([]);
const employeesTagsContractsProjects = ref([]);

function isTag(item) {
  return !!item.tagName;
}
function isEmployee(item) {
  return !!item.employeeNumber;
}
function isContract(item) {
  return !!item.contractName;
}
function isProject(item) {
  return !!item.projectName;
}

function getTitle(rawItem) {
  let item = rawItem.raw ?? rawItem;
  let text;
  if (isTag(item)) text = item.tagName;
  if (isEmployee(item)) text = `${item.nickname || item.firstName} ${item.lastName}`;
  if (isContract(item)) text = item.contractName;
  if (isProject(item)) text = item.projectName;
  return text;
}

function getIcon(rawItem) {
  let item = rawItem.raw ?? rawItem;
  if (isTag(item)) return 'mdi-tag';
  if (isEmployee(item)) return 'mdi-account';
  if (isContract(item)) return 'mdi-file-document-multiple';
  if (isProject(item)) return 'mdi-file-document-outline';
}

function removeAssignment(index) {
  if(assignments.value.length > 1)
    assignments.value.splice(index, 1);
}

function divergeUsers(index) {
  assignments.value[index].users ??= {};
  diverge(assignments.value[index].users, usersModel.value[index]);
}
function divergeMembers(index) {
  assignments.value[index].members ??= {};
  diverge(assignments.value[index].members, membersModel.value[index]);
}
function diverge(into, from) {
  into.employees = [];
  into.tags = [];
  into.contracts = [];
  into.projects = [];

  let target;
  for (let id of from) {
    if (props.indexes.employees[id]) into.employees.push(id);
    else if (props.indexes.tags[id]) into.tags.push(id);
    else if (props.indexes.contracts[id]) into.contracts.push(id);
    else if (props.indexes.projects[id]) into.projects.push(id);
    else throw new Error('Could not tell type of id' + id);
    // target.push(id);
  }
}
function converge(into, index, from) {
  if (into?.[index] === undefined || !from) return;
  into[index] = deepClone([
    ...(from.employees ?? []),
    ...(from.tags ?? []),
    ...(from.contracts ?? []),
    ...(from.projects ?? []),
  ]);
}

function getType(item) {
  if (isEmployee(item)) return 'Employee';
  else if (isTag(item)) return 'Tag';
  else if (isContract(item)) return 'Contract';
  else if (isProject(item)) return 'Project';
}

onMounted(async () => {
  // update portal data
  await Promise.all([
    store.getters.employees ? '' : updateStoreEmployees(),
    store.getters.tags ? '' : updateStoreTags(),
    store.getters.contracts ? '' : updateStoreContracts(),
  ]);

  employeesAndTags.value = [
    ...store.getters.tags,
    ...store.getters.employees
  ];
  employeesTagsContractsProjects.value = [
    ...store.getters.tags,
    ...store.getters.contracts,
    ...store.getters.employees,
    // TODO: projects
  ];

  for (let i in assignments.value) {
    usersModel.value[i] ??= [];
    membersModel.value[i] ??= [];
    converge(usersModel.value, i, assignments.value[i].users);
    converge(membersModel.value, i, assignments.value[i].members);
  }
});
</script>
