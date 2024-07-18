<template>
  <base-info-modal title="All Education">
    <v-card-text>
      <education-list v-if="!isEmpty(totalList)" :list="totalList"></education-list>
      <p v-else>No Education Information</p>
    </v-card-text>
  </base-info-modal>
</template>

<script setup>
import { onBeforeMount, ref } from 'vue';
import { isEmpty } from '@/utils/utils';
import EducationList from '../lists/EducationList.vue';
import BaseInfoModal from '@/components/employee-beta/modals/BaseInfoModal.vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['model']);

const totalList = ref([]);

// |--------------------------------------------------|
// |                                                  |
// |                LIFESTYLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data for the list.
 */
onBeforeMount(() => {
  if (!isEmpty(props.model.education)) {
    totalList.value = props.model.education; // gets all education
  }
}); // created
</script>
