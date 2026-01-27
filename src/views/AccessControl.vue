<template>
  <div>
    <v-card>
      <v-card-title class="d-flex align-center header_style">Access Control</v-card-title>
      <v-container>
        <v-row>
          <v-col cols="2" class="pl-0 border-e-sm">
            <div class="d-flex align-center justify-center">
              <h3 class="my-0 ml-0">Groups</h3>
              <v-spacer />
              <v-btn icon="mdi-plus-circle" variant="plain" size="small" @click="addGroup()" />
            </div>
            <v-list nav density="compact" class="pr-0">
              <v-list-item
                v-for="(group, i) in groups"
                :key="i"
                :title="group.name"
                @click="editGroupIndex = i"
                class="overflow-auto"
                >
                <template #append>
                  <v-icon v-if="isLocked(group)" icon="mdi-lock" color="black" size="small" />
                </template>
              </v-list-item>
            </v-list>
          </v-col>
          <v-col cols="10" class="pr-0">
            <div v-if="!editGroup">
              Select a group to edit, or press
              <v-icon icon="mdi-plus-circle" size="x-small" class="text-gray mb-1" @click="addGroup()" />
              to make a new one.
            </div>
            <div v-else>
              <v-row>
                <v-col cols="10">
                  <v-text-field
                    v-model="editGroup.name"
                    variant="outlined"
                    class="h1"
                    id="groupName"
                    :disabled="isLocked(editGroup, 'name')"
                  />
                </v-col>
                <v-col cols="2">
                  <v-btn
                    variant="icon"
                    icon="mdi-delete"
                    class="mt-1"
                    :disabled="isLocked(editGroup, 'delete')"
                    @click="deleteCurrentGroup()"
                    v-tooltip="`Delete '${editGroup.name}'`"
                  />
                  <v-btn
                    variant="icon"
                    icon="mdi-content-save"
                    class="mt-1"
                    @click="saveCurrentGroup()"
                    v-tooltip="'Save'"
                  />
                </v-col>
              </v-row>
              <div class="users">
                <div class="d-flex align-center justify-start">
                  <h2>Assignments</h2>
                  <v-btn icon="mdi-plus-circle" class="ml-2" variant="plain" size="small" @click="addAssignment(editGroup)" />
                </div>
                <Assignments v-model="editGroup.assignments" :indexes="indexes" :key="editGroupIndex" />
              </div>
              <div class="flags">
                <h2>Flags</h2>
                <GroupFlags v-model="editGroup.flags" :group-name="editGroup.name" class="ml-1" :key="editGroupIndex" />
              </div>
              <div class="permissions">
                <h2>Permissions</h2>
                <Permissions v-if="editGroup.name !== 'Admin'" :key="editGroupIndex" />
                <div v-else class="ml-2"><p>The Admin group always has full access to the Portal.</p></div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </div>
</template>

<script setup>
// Vue & Component imports
import { inject, ref, computed, onBeforeMount, onUnmounted, nextTick } from 'vue';
import { useStore } from 'vuex';
import Assignments from '@/components/access-control/Assignments.vue';
import GroupFlags from '@/components/access-control/GroupFlags.vue';
import Permissions from '@/components/access-control/Permissions.vue';
// JS/utility imports
import { updateStoreContracts, updateStoreEmployees, updateStoreTags, updateStoreAccessGroups } from '@/utils/storeUtils';
import { generateUUID, deepClone, indexBy } from '@/utils/utils';
import api from '@/shared/api';
// Store and stuff
const emitter = inject('emitter');
const store = useStore();
// Utils
const indexes = ref({});
const random = (array) => array[Math.floor(Math.random() * array.length)];

/**
 * -----------------------------------------
 * |                                       |
 * |                 Groups                |
 * |                                       |
 * -----------------------------------------
 */
const groups = ref([]);
const groupsWithAssignments = ref([]);
const editGroupIndex = ref(0); // index in array
const editGroup = computed(() => groups.value?.[editGroupIndex.value]);
const emptyGroup = { id: null, name: 'New Group', flags: {}, assignments: [] };
const emptyAssignment = { id: null, name: 'New Assignment', users: {}, assignments: {} }

/**
 * Gets groups data
 */
async function buildGroups() {
  groups.value = await api.getItems(api.ACCESS_GROUPS);
  for (let group of groups.value)
    for (let k of Object.keys(emptyGroup))
      group[k] ??= emptyGroup[k];
}

/**
 * Adds a new group to the list of groups
 */
async function addGroup() {
  groups.value.push({ ...deepClone(emptyGroup), id: generateUUID() });
  editGroupIndex.value = groups.value.length - 1;
  addAssignment(groups.value[editGroupIndex.value]);
  await nextTick(); // let group be created
  let el = document.getElementById('groupName');
  el.focus();
  el.setSelectionRange(0, emptyGroup.name.length);
}

/**
 * Adds a new assignment to the given group
 */
async function addAssignment(group) {
  group.assignments ??= [];
  group.assignments.push({ ...deepClone(emptyAssignment), id: generateUUID() });
  await nextTick(); // let assignment be created
  let el = document.getElementsByClassName('assignmentNames');
  el = el[el.length - 1];
  el = el.querySelector('div > div > div > input');
  el.focus();
  el.setSelectionRange(0, emptyAssignment.name.length);
}

/**
 * Deletes the current group
 */
async function deleteCurrentGroup() {
  if (!groups.value.length !== 1 && !isLocked(editGroup.value, 'delete'))
    groups.value.splice(editGroupIndex.value--, 1); // post decrement
}

async function saveCurrentGroup() {
  await api.createItem(api.ACCESS_GROUPS, editGroup.value);
}

/**
 * Whether or not a group is locked
 */
function isLocked(group, type = 'any') {
  if (!group.flags) return false;
  return group.flags.locked;
}

/**
 * -----------------------------------------
 * |                                       |
 * |               Lifecycle               |
 * |                                       |
 * -----------------------------------------
 */
onBeforeMount(async () => {
  // update portal data
  await Promise.all([
    store.getters.employees ? '' : updateStoreEmployees(),
    store.getters.tags ? '' : updateStoreTags(),
    store.getters.contracts ? '' : updateStoreContracts(),
  ]);
  let projects = [];
  for (let c of store.getters.contracts) projects.push(...c.projects);

  indexes.value = {
    employees: indexBy(store.getters.employees, 'id'),
    tags: indexBy(store.getters.tags, 'id'),
    contracts: indexBy(store.getters.contracts, 'id'),
    projects: indexBy(projects, 'id')
  }

  await buildGroups();
});

onUnmounted(() => {
  emitter.off('save-edit-item');
});
</script>

<style scoped>
/* Custom input style */
:deep(.h1.v-input), :deep(.h1>div>div.v-field) { font-size: 2rem; font-weight: 700; color: black !important; opacity: 1; }
:deep(.h1.v-input), :deep(.h1>div>div.v-field) input { padding: 0 0.7rem; }

/* Body input */
.users, .flags, .permissions { padding-left: 1em; margin-top: 1em; }
</style>
