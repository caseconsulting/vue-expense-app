<template>
  <v-layout>
    <v-flex xs4>
      <v-btn v-if="this.expense.receipt" flat icon color="primary" @click="openDownloadTab" >
        <icon name="cloud-download-alt" scale="2"></icon>
      </v-btn>
      <v-btn v-else disabled flat icon color="primary" @click="openDownloadTab" >
        <icon name="cloud-download-alt" scale="2"></icon>
      </v-btn>
    </v-flex>
  </v-layout>
</template>
<script>
import { API_CONFIG } from '../shared/api-variables';
import api from '../shared/api';
var xhr = new XMLHttpRequest();
// COMPUTED
function link() {
  const API_HOSTNAME = API_CONFIG.apiHostname;
  const API_PORT = API_CONFIG.apiPort;
  const endLink = `attachment/${this.expense.userId}/${this.expense.id}`;

  if (API_HOSTNAME === 'localhost') return `http://${API_HOSTNAME}:${API_PORT}/${endLink}`;
  else return `https://${API_HOSTNAME}/${endLink}`;
}

// METHODS
async function openDownloadTab() {
  let signedURL = await api.getAttachment(this.expense.userId, this.expense.id);
  console.log(signedURL);
  window.open(signedURL, '_blank');
}
export default {
  methods: {
    openDownloadTab
  },
  props: ['expense'],
  computed: {
    link
  }
};
</script>
