<template>
  <!-- Reimbursements -->
  <div v-if="this.mode === 'adminExpenseInfo'">
    <!-- admin dashboard has attachment -->
    <v-btn v-if="!isEmpty(this.expense.receipt)" :disabled="midAction" icon color="primary" @click="openDownloadTab">
      <icon name="cloud-download-alt" style="color: #004c54;" scale="2"></icon>
    </v-btn>
  </div>
  <!-- End Reimbursements -->

  <!-- Expenses -->
  <div v-else>
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-btn :disabled="isEmpty(expense.receipt) || midAction" text icon @click="openDownloadTab" v-on="on">
          <v-icon style="color: #606060;">
            cloud_download
          </v-icon>
        </v-btn>
      </template>
      <span>Download Attachment</span>
    </v-tooltip>
  </div>
  <!-- End Expenses -->
</template>

<script>
import api from '../shared/api';
import _ from 'lodash';
// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Checks if a value is empty. Returns true if the value is null or an empty/blank string.
 *
 * @param value - value to check
 * @return boolean - value is empty
 */
function isEmpty(value) {
  return _.isNil(value) || (_.isString(value) && value.trim().length === 0);
} // isEmpty

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
