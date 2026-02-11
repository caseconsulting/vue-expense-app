<template>
  <div>
    <p>Coming soon...</p>
    <p>For who: select by individual employee, tag, contract, or project</p>
    <p>On what: Permissions come in as requested, starting with whatever admins/managers have access to</p>
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

const props = defineProps(['assignments']);

</script>
