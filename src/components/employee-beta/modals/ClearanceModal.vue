<template>
  <base-info-modal title="Clearances">
    <v-card-text>
      <!-- Employee has clearances -->
      <div v-if="!isEmpty(model.clearances)">
        <clearance-list :list="model.clearances"></clearance-list>
      </div>
      <!-- Employee does not have clearances -->
      <p v-else class="mt-6 ml-6">No Clearance Information</p>
    </v-card-text>
  </base-info-modal>
</template>

<script setup>
import { isEmpty } from '@/utils/utils';
import BaseInfoModal from './BaseInfoModal.vue';
import ClearanceList from '../lists/ClearanceList.vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

defineProps(['model']);
</script>
