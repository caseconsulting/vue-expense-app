<template>
  <v-row>
      <v-checkbox
        class="d-inline-block pr-2"
        v-model="flags.locked"
        label="Locked"
        v-tooltip="{text: 'Locks group for everyone except admins', location: 'top', offset: -10 }"
      />
      <v-checkbox
        class="d-inline-block pr-2"
        v-model="flags.showOnMemberProfile"
        label="Show on member profile"
        v-tooltip="{text: `Show members who their ${groupName.toLowerCase()} is`, location: 'top', offset: -10 }"
      />
      <v-checkbox
        class="d-inline-block pr-2"
        v-model="flags.contractLink"
        label="Contract link"
        v-tooltip="{text: 'Make this group editable in contract settings', location: 'top', offset: -10 }"
      />
      <v-checkbox
        class="d-inline-block pr-2"
        v-model="flags.projectLink"
        label="Project link"
        v-tooltip="{ text: 'Make this group editable in project settings', location: 'top', offset: -10 }"
      />
  </v-row>
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

const flags = defineModel();
const props = defineProps(['groupName']);
</script>
