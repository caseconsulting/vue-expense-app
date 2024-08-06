<template>
  <base-info-modal title="All Education">
    <v-card-text>
      <education-list v-if="!isEmpty(totalList)" :list="totalList"></education-list>
      <p v-else>No Education Information</p>
    </v-card-text>
  </base-info-modal>
</template>

<script setup>
import { computed } from 'vue';
import { isEmpty } from '@/utils/utils';
import EducationList from '../lists/EducationList.vue';
import BaseInfoModal from '@/components/employee-beta/modals/BaseInfoModal.vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['model']);

// |--------------------------------------------------|
// |                                                  |
// |                    COMPUTED                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data for the list.
 */
const totalList = computed(() => {
  if (!isEmpty(props.model.education)) {
    return props.model.education; // gets all education
  }
  return [];
});
</script>
