<template>
  <div>
    <v-dialog v-model="activate" persistent max-width="500">
      <v-card>
        <v-card-title class="headline">Switch Role</v-card-title>
        <v-card-actions>
          <v-autocomplete v-model="roleSelected" :items="roles" clearable @click:clear="roleSelected = null">
          </v-autocomplete>
          <v-spacer></v-spacer>
          <v-btn @click="switchRole()">Ok</v-btn>
          <v-btn @click.native="$emit('close')">Cancel</v-btn>
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
}

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

async function switchRole() {
  this.$nextTick(async function () {
    if (this.roleSelected != this.roleOriginial) {
      try {
        let user = await api.getUser();
        user.employeeRole = this.roleSelected.toLowerCase();
        await api.updateItem(api.EMPLOYEES, user); // update user employee role

        let employeeRole = await this.setRole();

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
  this.$emit('close');
}

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
      roles: ['Admin', 'User', 'Manager']
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
