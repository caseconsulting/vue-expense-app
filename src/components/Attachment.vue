<template>
  <!-- Admin Dashboard -->
  <div v-if="this.mode === 'adminExpenseInfo'">
    <v-layout>
      <v-flex xs4>
        <!-- admin dashboard has attachment -->
        <v-btn v-if="!isEmpty(this.expense.receipt)" text icon color="primary" @click="openDownloadTab">
          <icon name="cloud-download-alt" style="color: #004C54;" scale="2"></icon>
        </v-btn>
      </v-flex>
    </v-layout>
  </div>

  <!-- Expenses -->
  <div v-else>
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-btn :disabled="!expense.receipt || expense.receipt.trim() <= 0" text icon @click="openDownloadTab" v-on="on">
          <v-icon style="color: #606060">
            cloud_download
          </v-icon>
        </v-btn>
      </template>
      <span>Download Attachment</span>
    </v-tooltip>
  </div>
</template>

<script>
import { API_CONFIG } from '../shared/api-variables';
import api from '../shared/api';

// COMPUTED
function link() {
  const API_HOSTNAME = API_CONFIG.apiHostname;
  const API_PORT = API_CONFIG.apiPort;
  const endLink = `attachment/${this.expense.employeeId}/${this.expense.id}`;

  if (API_HOSTNAME === 'localhost') return `http://${API_HOSTNAME}:${API_PORT}/${endLink}`;
  else return `https://${API_HOSTNAME}/${endLink}`;
}

// METHODS
async function openDownloadTab() {
  let signedURL = await api.getAttachment(this.expense.employeeId, this.expense.id);
  console.log(signedURL);
  window.open(signedURL, '_blank');
}

function isEmpty(item) {
  return !item || item.trim().length <= 0;
}

export default {
  methods: {
    openDownloadTab,
    isEmpty
  },
  props: ['expense', 'mode'],
  computed: {
    link
  }
};
</script>
