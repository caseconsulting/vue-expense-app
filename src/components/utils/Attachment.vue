<template>
  <!-- Reimbursements -->
  <span v-if="mode === 'adminExpenseInfo'">
    <!-- admin dashboard has attachment -->
    <v-btn
      v-if="!isEmpty(expense.receipt)"
      :disabled="midAction"
      icon
      :color="caseGray"
      @click="openDownloadTab"
      size="small"
    >
      <v-tooltip activator="parent" location="top">Download Attachment</v-tooltip>
      <v-icon size="x-large" class="white-text" icon="mdi-cloud-download" />
    </v-btn>
  </span>
  <!-- End Reimbursements -->

  <!-- Expenses -->
  <span v-else>
    <v-btn size="small" :disabled="isEmpty(expense.receipt) || midAction" variant="text" icon @click="openDownloadTab">
      <v-tooltip activator="parent" location="top">Download Attachment</v-tooltip>
      <v-icon size="x-large" class="case-gray" icon="mdi-cloud-download" />
    </v-btn>
  </span>
  <!-- End Expenses -->
</template>

<script setup>
import api from '@/shared/api';
import { isEmpty } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps([
  'expense', // attachment expense
  'mode', // attachment use
  'midAction' //whether or not to disable button
]);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Opens a new windows tab displaying the signed url of the expense selected.
 */
async function openDownloadTab() {
  let signedURLs;
  signedURLs = await api.getAttachment(props.expense.employeeId, props.expense.id);
  for (let i = 0; i < signedURLs.length; i++) {
    window.open(signedURLs[i], '_blank');
  }
} // openDownloadTab
</script>
