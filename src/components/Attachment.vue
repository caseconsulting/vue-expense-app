<template>
  <!-- Reimbursements -->
  <div v-if="this.mode === 'adminExpenseInfo'">
    <!-- admin dashboard has attachment -->
    <v-btn v-if="!isEmpty(this.expense.receipt)" :disabled="midAction" icon color="primary" @click="openDownloadTab">
      <icon name="cloud-download-alt" scale="2"></icon>
    </v-btn>
  </div>
  <!-- End Reimbursements -->

  <!-- Expenses -->
  <div v-else>
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-btn :disabled="isEmpty(expense.receipt) || midAction" text icon @click="openDownloadTab" v-on="on">
          <v-icon class="case-gray"> cloud_download </v-icon>
        </v-btn>
      </template>
      <span>Download Attachment</span>
    </v-tooltip>
  </div>
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
