<template>
  <div>
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
      <v-btn
        size="small"
        :disabled="isEmpty(expense.receipt) || midAction"
        variant="text"
        icon
        @click="openDownloadTab()"
      >
        <v-tooltip activator="parent" location="top">Download Attachment</v-tooltip>
        <v-icon size="x-large" class="case-gray" icon="mdi-cloud-download" />
      </v-btn>
    </span>
    <!-- End Expenses -->

    <!-- Popup if user blocks multi-receipt download -->
    <v-dialog v-model="popupBlocked" persistent max-width="350">
      <v-card>
        <v-card-text class="pb-0">
          <h5 class="text-h5">Download failed.</h5>
          <p class="text-body-1 pt-1">
            Only 1 out of {{ expense.receipt.length }} receipts could be downloaded. Please enable popups in your
            browser to download all receipts.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-btn color="green-darken-1" variant="text" @click="popupBlocked = false"> OK </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import api from '@/shared/api';
import { isEmpty } from '@/utils/utils';
import { ref } from 'vue';

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
const popupBlocked = ref(false);

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
  let newWindow;
  for (let i = 0; i < signedURLs.length; i++) {
    newWindow = window.open(signedURLs[i], '_blank');
    if (!newWindow) popupBlocked.value = true;
  }
} // openDownloadTab
</script>
