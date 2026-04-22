<template>
  <div>
    <div class="d-flex align-center justify-center">
      <h3 class="my-0 ml-0">Groups</h3>
      <v-spacer />
      <v-btn icon="mdi-plus-circle" variant="plain" size="small" @click="addGroup()" />
    </div>
    <v-list nav density="compact" class="pr-0">
      <v-list-item
        v-for="(group, i) in props.groups"
        :key="i"
        :title="group.name"
        @click="selectGroup(i)"
        class="overflow-auto"
        >
        <template #append>
          <v-icon v-if="props.isLocked(group)" icon="mdi-lock" color="black" size="small" />
        </template>
      </v-list-item>
    </v-list>
  </div>
</template>

<script setup>
// Vue & Component imports
import { inject, ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
// JS/utility imports
import { updateStoreContracts, updateStoreEmployees, updateStoreTags } from '@/utils/storeUtils';
import { generateUUID, indexBy } from '@/utils/utils';
import api from '@/shared/api';
// Store and stuff
const emitter = inject('emitter');
const store = useStore();

const props = defineProps(['groups', 'isLocked']);

function addGroup() {
  emitter.emit('add-group');
}

function selectGroup(index) {
  emitter.emit('select-group', { index });
}

</script>
