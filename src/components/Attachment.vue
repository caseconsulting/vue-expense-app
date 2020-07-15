<template>
  <!-- Admin Dashboard -->
  <div v-if="this.mode === 'adminExpenseInfo'">
    <v-layout>
      <v-flex xs4>
        <!-- admin dashboard has attachment -->
        <v-btn
          v-if="!isEmpty(this.expense.receipt)"
          :disabled="midAction"
          icon
          color="primary"
          @click="openDownloadTab"
        >
          <icon name="cloud-download-alt" style="color: #004c54;" scale="2"></icon>
        </v-btn>
      </v-flex>
    </v-layout>
  </div>
  <!-- End Admin Dashboard -->

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
import { API_CONFIG } from '../shared/api-variables';

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 *  NOTE: UNUSED?
 *
 * @return
 */
function link() {
  const API_HOSTNAME = API_CONFIG.apiHostname;
  const API_PORT = API_CONFIG.apiPort;
  const endLink = `attachment/${this.expense.employeeId}/${this.expense.id}`;

  if (API_HOSTNAME === 'localhost') return `http://${API_HOSTNAME}:${API_PORT}/${endLink}`;
  else return `https://${API_HOSTNAME}/${endLink}`;
} // link

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Checks if a value is empty. Returns true if the value is null or a single character space String.
 *
 * @param value - value to check
 * @return boolean - value is empty
 */
function isEmpty(value) {
  return value == null || value === ' ' || value === '';
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
  computed: {
    link
  },
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
