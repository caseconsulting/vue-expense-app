<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="310">
      <v-card>
        <v-card-title class="text-h5">Switch Role</v-card-title>
        <v-card-subtitle v-if="roleOriginial" class="mb-0 pb-0"
          >Current Role: {{ roleOriginial.charAt(0).toUpperCase() + roleOriginial.slice(1) }}
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

<script>
import api from '@/shared/api.js';
import { getRole, setRole } from '@/utils/auth';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * created lifecycle hook
 */
function created() {
  this.roleOriginial = this.getRole();
  if (this.roleOriginial) {
    this.roleSelected = this.roleOriginial.charAt(0).toUpperCase() + this.roleOriginial.slice(1);
  }
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * switches the user role in the app
 */
async function switchRole() {
  this.$nextTick(async function () {
    if (this.roleSelected.toLowerCase() != this.roleOriginial) {
      try {
        let user = this.$store.getters.user;
        user.employeeRole = this.roleSelected.toLowerCase();
        await api.updateItem(api.EMPLOYEES, user); // update user employee role

        let employeeRole = await this.setRole(user.employeeRole);
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
  this.emitter.emit('close');
} // switchRole

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for toggleSwitchRole
 */
function watchToggleSwitchRole() {
  this.activate = this.toggleSwitchRole;
} // watchToggleSwitchRole

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  data() {
    return {
      activate: false, // dialog activator
      roleOriginial: '',
      roleSelected: '',
      roles: ['Admin', 'User', 'Manager', 'Intern']
    };
  },
  created,
  methods: {
    switchRole,
    getRole,
    setRole
  },
  props: ['toggleSwitchRole'], // dialog activator
  watch: {
    toggleSwitchRole: watchToggleSwitchRole
  }
};
</script>
