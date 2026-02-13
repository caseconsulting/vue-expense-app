<template>
  <div>
    <v-card>
      <v-card-title class="d-flex align-center header_style">Access Control</v-card-title>
      <v-container>
        <v-row>
          <v-col cols="2" class="pl-0 border-e-sm">
            <div class="d-flex align-center justify-center w-100">
              <h3 class="my-0 ml-0">Roles</h3>
              <v-spacer />
              <v-btn icon="mdi-plus-circle" variant="plain" size="small" @click="addRole()" />
            </div>
            <v-list nav density="compact" class="pr-0 w-100">
              <v-list-item
                v-for="(role, i) in roles"
                :key="i"
                :title="role.name"
                @click="editRoleIndex = i"
                class="overflow-auto"
                >
                <template #append>
                  <v-icon v-if="isAdmin(role)" icon="mdi-lock" color="black" size="small" />
                </template>
              </v-list-item>
            </v-list>
          </v-col>
          <v-col v-if="loading" cols="10"> <v-progress-linear class="my-12" indeterminate /> </v-col>
          <v-col v-else cols="10" class="pr-0">
            <div v-if="!editRole">
              Select a role to edit, or press
              <v-icon icon="mdi-plus-circle" size="x-small" class="text-gray mb-1" @click="addRole()" />
              to make a new one.
            </div>
            <div v-else>
              <v-row>
                <v-col cols="13" :class="isAdmin(editRole) ? 'cursor-not-allowed' : ''">
                  <v-text-field
                    v-model="editRole.name"
                    variant="outlined"
                    class="h1"
                    id="roleName"
                    :disabled="isAdmin(editRole)"
                  />
                </v-col>
              </v-row>
              <div class="users">
                <div class="d-flex align-center justify-start">
                  <h2>Assignments</h2>
                  <v-btn icon="mdi-plus-circle" class="ml-2" variant="plain" size="small" @click="addAssignment(editRole)" />
                </div>
                <Assignments v-model="editRole.assignments" :is-admin="editRole.name === 'Admin'" :projects="projects" :key="editRoleIndex" />
              </div>
              <div class="flags">
                <h2>Flags</h2>
                <RoleFlags v-model="editRole.flags" :role-name="editRole.name" class="ml-1" :key="editRoleIndex" />
              </div>
              <div class="permissions">
                <h2>Permissions</h2>
                <Permissions v-if="editRole.name !== 'Admin'" :key="editRoleIndex" />
                <div v-else class="ml-2"><p>Admins always has full access to the Portal and all its data.</p></div>
              </div>
              <div class="actions">
                <v-btn
                  variant="outlined"
                  color="green-darken-1"
                  class="ml-2"
                  append-icon="mdi-content-save"
                  @click="saveCurrentRole()"
                  :disabled="saving"
                >
                  {{ saveText }}
                </v-btn>
                <v-btn
                  :variant="userIsSure ? 'tonal' : 'outlined'"
                  class="ml-2 delete-button"
                  :append-icon="userIsSure ? '' : 'mdi-delete'"
                  :disabled="isAdmin(editRole)"
                  @click="deleteCurrentRole()"
                  :color="userIsSure ? 'red-darken-1' : undefined"
                >
                  {{ deleteText }}
                </v-btn>
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
import { inject, ref, watch, computed, onBeforeMount, onUnmounted, nextTick } from 'vue';
import { useStore } from 'vuex';
import { useDisplaySuccess, useDisplayError } from '@/components/shared/StatusSnackbar.vue';
import Assignments from '@/components/access-control/Assignments.vue';
import RoleFlags from '@/components/access-control/RoleFlags.vue';
import Permissions from '@/components/access-control/Permissions.vue';
// JS/utility imports
import { updateStoreContracts, updateStoreEmployees, updateStoreTags } from '@/utils/storeUtils';
import { generateUUID, deepClone, indexBy } from '@/utils/utils';
import { now, difference } from '@/shared/dateUtils';
import api from '@/shared/api';
// Store and stuff
const emitter = inject('emitter');
const store = useStore();
// Utils
function aOrAn(word) { return 'aeiouAEIOU'.split('').includes(word.charAt(0)) ? 'an' : 'a' }

// UI
const loading = ref(false);

const roles = ref([]);
const editRoleIndex = ref(0); // index in array
const editRole = computed(() => roles.value?.[editRoleIndex.value]);
const emptyRole = { id: null, created: null, name: 'New Role', flags: {}, assignments: [] };
const emptyAssignment = { id: null, name: 'New Assignment', users: {}, assignments: {} };
const projects = ref([]);

/**
 * Gets role data
 */
async function buildRoles() {
  // get roles from db and sort (db doesn't store in same order)
  roles.value = await api.getItems(api.ACCESS_ROLES);
  roles.value.sort((a, b) => difference(a.created, b.created));
  // fill in role keys if there's anything new
  for (let role of roles.value)
    for (let k of Object.keys(emptyRole))
      role[k] ??= emptyRole[k];
}

/**
 * Adds a new role to the list of roles
 */
async function addRole() {
  // copy into a new role with default assignment
  roles.value.push({ ...deepClone(emptyRole), id: generateUUID(), created: now() });
  editRoleIndex.value = roles.value.length - 1;
  addAssignment(roles.value[editRoleIndex.value]);
  // let role be created, then highlight the role name
  await nextTick();
  let el = document.getElementById('roleName');
  el.focus();
  el.setSelectionRange(0, emptyRole.name.length);
}

/**
 * Adds a new assignment to the given role
 */
async function addAssignment(role) {
  // create default assignment
  role.assignments ??= [];
  role.assignments.push({ ...deepClone(emptyAssignment), id: generateUUID() });
  // let assignment be created, then highlight the assignment name
  await nextTick();
  let el = document.getElementsByClassName('assignmentNames');
  el = el[el.length - 1];
  el = el.querySelector('div > div > div > input');
  el.focus();
  el.setSelectionRange(0, emptyAssignment.name.length);
}

/**
 * Deletes the current role
 */
const deleteText = ref('Delete');
const userIsSure = ref(false);
let deleteTimeout;
async function deleteCurrentRole() {
  // first click: make sure user is sure
  if (!userIsSure.value) {
    deleteText.value = 'Are you sure?';
    userIsSure.value = true;
    // reset if user doesn't confirm
    deleteTimeout = setTimeout(() => {
      deleteText.value = 'Delete';
      userIsSure.value = false;
    }, 7777);
    return;
  }
  if (deleteTimeout) clearTimeout(deleteTimeout);
  // second click: delete and push to db
  if (!isAdmin(editRole.value)) {
    try {
      let [{ id }] = roles.value.splice(editRoleIndex.value--, 1); // post decrement
      await api.deleteItem(api.ACCESS_ROLES, id);
      deleteText.value = 'Delete';
      userIsSure.value = false;
      useDisplaySuccess('Delete success!');
    } catch (e) {
      useDisplayError('Failed to delete Role');
    }
  }
}

/**
 * Saves the current role
 * TODO: patch request instead of whole object
 */
const saveText = ref('Save');
const saving = ref(false);
async function saveCurrentRole() {
  // UI feedback
  saving.value = true;
  // save to db
  try {
    await api.createItem(api.ACCESS_ROLES, editRole.value);
    // reset delete UI vars if needed
    deleteText.value = 'Delete';
    userIsSure.value = false;
    // UI feedback
    saving.value = false;
    saveText.value = ref('Saved!');
    setTimeout(() => {
      saveText.value = 'Save';
    }, 2500);
    useDisplaySuccess('Update success!');
  } catch (e) {
    useDisplayError('Failed to update Role');
  }
}

/**
 * Returns whether or not the role is the admin role.
 */
function isAdmin(role) {
  return role.name === 'Admin';
}

/**
 * Check for changes to the editing role
 */
watch(
  () => [editRoleIndex.value, editRole.value],
  ([newIndex], [oldIndex, oldRole]) => {
    // reset deletion protection
    userIsSure.value = false;
    deleteText.value = 'Delete';
    // first run or changing roles
    if (oldRole === undefined || newIndex !== oldIndex) return;
  },
  { deep: true }
)

/**
 * -----------------------------------------
 * |                                       |
 * |               Lifecycle               |
 * |                                       |
 * -----------------------------------------
 */
onBeforeMount(async () => {
  // feedback for loading
  loading.value = true;

  // update portal data
  await Promise.all([
    store.getters.employees ? '' : updateStoreEmployees(),
    store.getters.tags ? '' : updateStoreTags(),
    store.getters.contracts ? '' : updateStoreContracts(),
  ]);

  // get list of projects
  projects.value = [];
  for (let c of store.getters.contracts) projects.value.push(...(c.projects || []));

  // put roles in UI
  await buildRoles();

  // loading for feedback
  loading.value = false;
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
.actions { padding-left: 1em; margin-top: 2em; }
.delete-button { color: #333; }
.delete-button:hover { color: #D32F2F; }
</style>
