<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="310">
      <v-card>
        <v-card-title class="text-h5">Switch Role</v-card-title>
        <v-card-subtitle v-if="roleOriginal" class="mb-0 pb-0"
          >Current Role: {{ roleOriginal.charAt(0).toUpperCase() + roleOriginal.slice(1) }}
        </v-card-subtitle>
        <v-card-actions class="my-0 py-0">
          <v-radio-group v-model="roleSelected" mandatory>
            <v-radio
              v-for="role in roles"
              :key="role"
              :id="role.toLowerCase() + 'Selector'"
              :label="`${role}`"
              :value="`${role}`"
            ></v-radio>
          </v-radio-group>
        </v-card-actions>
        <v-card-actions>
          <v-btn class="ma-2" id="confirmSwitch" @click="switchRole(false)">
            <v-tooltip activator="parent" location="top">Switch role and redirect to default page</v-tooltip>
            Switch
          </v-btn>
          <v-btn class="ma-2" @click="emitter.emit('close')"> Cancel </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import api from '@/shared/api.js';
import { getRole, setRole } from '@/utils/auth';
import { ref, onBeforeMount, inject, nextTick, watch } from 'vue';
import { useStore } from 'vuex';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const activate = ref(false); // dialog activator
const emitter = inject('emitter');
const props = defineProps(['toggleSwitchRole']);
const roleOriginal = ref('');
const roleSelected = ref('');
const roles = ref(['Admin', 'User', 'Manager', 'Intern']);
const store = useStore();

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * created lifecycle hook
 */
onBeforeMount(() => {
  roleOriginal.value = getRole();
  if (roleOriginal.value) {
    roleSelected.value = roleOriginal.value.charAt(0).toUpperCase() + roleOriginal.value.slice(1);
  }
}); // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * switches the user role in the app
 */
async function switchRole() {
  nextTick(async function () {
    if (roleSelected.value.toLowerCase() != roleOriginal.value) {
      try {
        let user = store.getters.user;
        user.employeeRole = roleSelected.value.toLowerCase();
        await api.updateItem(api.EMPLOYEES, user); // update user employee role

        let employeeRole = await setRole(user.employeeRole);
        if (employeeRole === 'admin') {
          // user's role is admin
          window.location.href = '/reimbursements';
        } else {
          // user's role is not admin
          window.location.href = '/';
        }
      } catch (error) {
        console.log(error);
      }
    }
  });
  emitter.emit('close');
} // switchRole

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for toggleSwitchRole
 */
watch(
  () => props.toggleSwitchRole,
  () => {
    activate.value = props.toggleSwitchRole;
  }
); // watchToggleSwitchRole
</script>
