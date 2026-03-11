<template>
  <div>
    <div class="d-flex align-center justify-center">
      <h3 class="my-0 ml-0">Roles</h3>
      <v-spacer />
      <v-btn icon="mdi-plus-circle" variant="plain" size="small" @click="addRole()" />
    </div>
    <v-list nav density="compact" class="pr-0">
      <v-list-item
        v-for="(role, i) in props.roles"
        :key="i"
        :title="role.name"
        @click="selectRole(i)"
        class="overflow-auto"
        >
        <template #append>
          <v-icon v-if="props.isLocked(role)" icon="mdi-lock" color="black" size="small" />
        </template>
      </v-list-item>
    </v-list>
  </div>
</template>

<script setup>
// Vue & Component imports
import { inject } from 'vue';
// Store and stuff
const emitter = inject('emitter');

const props = defineProps(['roles', 'isLocked']);

function addRole() {
  emitter.emit('add-role');
}

function selectRole(index) {
  emitter.emit('select-role', { index });
}

</script>
