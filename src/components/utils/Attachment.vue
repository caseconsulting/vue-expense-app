<template>
  <!-- Reimbursements -->
  <span v-if="this.mode === 'adminExpenseInfo'">
    <!-- admin dashboard has attachment -->
    <v-btn
      v-if="!isEmpty(this.expense.receipt)"
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

<script>
import api from '@/shared/api';
import { isEmpty } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Opens a new windows tab displaying the signed url of the expense selected.
 */
async function openDownloadTab() {
  let signedURL = await api.getAttachment(this.expense.employeeId, this.expense.id);
  window.open(signedURL, '_blank');
} // openDownloadTab

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  methods: {
    isEmpty,
    openDownloadTab
  },
  props: [
    'expense', // attachment expense
    'mode', // attachment use
    'midAction' //whether or not to disable button
  ]
};
</script>
