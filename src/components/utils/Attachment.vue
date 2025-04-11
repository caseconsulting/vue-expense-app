<template>
  <div>
    <v-btn
      size="small"
      :disabled="isEmpty(expense.receipt) || midAction"
      variant="text"
      icon
      @click="openAttachmentViewer()"
    >
      <v-tooltip activator="parent" location="top">
        View/Download {{ expense.receipt?.length > 1 ? 'Receipts' : 'Receipt' }}
      </v-tooltip>
      <v-icon size="x-large" class="case-gray" :icon="getIcon" />
    </v-btn>

    <!-- Modal to view images -->
    <attachment-viewer v-model="showViewerModal" :expense="expense" />
  </div>
</template>

<script setup>
import { isEmpty } from '@/utils/utils';
import { ref, computed } from 'vue';
import AttachmentViewer from './AttachmentViewer.vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps([
  'expense', // attachment expense
  'icon', // user-defined icon
  'iconMulti', // user-defined icon when multiple downloads available
  'midAction' //whether or not to disable button
]);
const showViewerModal = ref(false);

const getIcon = computed(() => {
  if (props.expense.receipt?.length > 1) return props.iconMulti ?? 'mdi-image-multiple';
  else return props.icon ?? 'mdi-image';
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Opens the attachment viewer with the current information
 */
function openAttachmentViewer() {
  showViewerModal.value = true;
}
</script>
