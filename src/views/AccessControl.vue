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
                  <v-icon v-if="isAdmin(group)" icon="mdi-lock" color="black" size="small" />
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
                <v-col cols="10" :class="isAdmin(editGroup) ? 'cursor-not-allowed' : ''">
                  <v-text-field
                    v-model="editGroup.name"
                    variant="outlined"
                    class="h1"
                    id="groupName"
                    :disabled="isAdmin(editGroup)"
                  />
                </v-col>
                <v-col cols="2" :class="isAdmin(editGroup) ? 'cursor-not-allowed' : ''">
                  <v-btn
                    variant="icon"
                    icon="mdi-delete"
                    class="mt-1"
                    :disabled="isAdmin(editGroup)"
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
                <Assignments v-model="editGroup.assignments" :is-admin="editGroup.name === 'Admin'" :indexes="indexes" :key="editGroupIndex" />
              </div>
              <div class="flags">
                <h2>Flags</h2>
                <GroupFlags v-model="editGroup.flags" :group-name="editGroup.name" class="ml-1" :key="editGroupIndex" />
              </div>
              <div class="permissions">
                <h2>Permissions</h2>
                <Permissions v-if="editGroup.name !== 'Admin'" :key="editGroupIndex" />
                <div v-else class="ml-2"><p>Admins always has full access to the Portal and all its data.</p></div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </div>
</template>

<script setup>
/**
 * ACCESS CONTROL TODO
 * - [x] Order of groups in menu bar should remain the same
 * - [x] Remove inactive employees from backend return
 * - [x] Fix flags - no 'locked'. Maybe add to permissions
 * - [x] Admin should have full access
 * - [x] Bug: profile not updating immediately
 * - [x] Make deletion save lol
 * - [ ] Saving UX
 * - [ ] Add projects to dropdowns
 * - [ ] Dropdown prefixes ("Employee: xxx", "Project: xxx")
 * - [ ] Clean up, add comments, add logs (backend only)
 */

// Vue & Component imports
import { inject, ref, computed, onBeforeMount, onUnmounted, nextTick } from 'vue';
import { useStore } from 'vuex';
import Assignments from '@/components/access-control/Assignments.vue';
import GroupFlags from '@/components/access-control/GroupFlags.vue';
import Permissions from '@/components/access-control/Permissions.vue';
// JS/utility imports
import { updateStoreContracts, updateStoreEmployees, updateStoreTags, updateStoreAccessGroups } from '@/utils/storeUtils';
import { generateUUID, deepClone, indexBy } from '@/utils/utils';
import { now, difference } from '@/shared/dateUtils';
import api from '@/shared/api';
// Store and stuff
const emitter = inject('emitter');
const store = useStore();
// Utils
const indexes = ref({});

/**
 * -----------------------------------------
 * |                                       |
 * |                 Groups                |
 * |                                       |
 * -----------------------------------------
 */
const groups = ref([]);
const editGroupIndex = ref(0); // index in array
const editGroup = computed(() => groups.value?.[editGroupIndex.value]);
const emptyGroup = { id: null, created: null, name: 'New Group', flags: {}, assignments: [] };
const emptyAssignment = { id: null, name: 'New Assignment', users: {}, assignments: {} }

/**
 * Gets groups data
 */
async function buildGroups() {
  // get groups from db and sort (db doesn't store in same order)
  groups.value = await api.getItems(api.ACCESS_GROUPS);
  groups.value.sort((a, b) => difference(a.created, b.created));
  // fill in group keys if there's anything new
  for (let group of groups.value)
    for (let k of Object.keys(emptyGroup))
      group[k] ??= emptyGroup[k];
}

/**
 * Adds a new group to the list of groups
 */
async function addGroup() {
  groups.value.push({ ...deepClone(emptyGroup), id: generateUUID(), created: now() });
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
  if (!isAdmin(editGroup.value)) {
    let [{ id }] = groups.value.splice(editGroupIndex.value--, 1); // post decrement
    await api.deleteItem(api.ACCESS_GROUPS, id);
  }
}

async function saveCurrentGroup() {
  await api.createItem(api.ACCESS_GROUPS, editGroup.value);
}

/**
 * Whether or not the group is the admin group.
 */
function isAdmin(group) {
  return group.name === 'Admin';
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
