<template>
  <!-- Download CSV Button -->
  <v-card>
    <!-- Modal Title -->
    <v-card-title class="d-flex align-center text-h5 header_style">
      <span>Sync Unanet Accrual Data</span>
      <v-spacer></v-spacer>
      <v-btn variant="text" icon="mdi-close" @click="close" />
    </v-card-title>

    <!-- Modal Content -->
    <v-card-text class="d-flex justify-center">
      <v-col>
        <v-row>
          <h3>1. Download PTO report from Unanet</h3>
        </v-row>
        <v-row class="mt-6 ml-6">
          <v-btn :href="PTODownloadLink" target="_blank" append-icon="mdi-open-in-new" color="primary" variant="tonal">
            OPEN UNANET
          </v-btn>
        </v-row>
        <v-row class="mt-12">
          <h3>2. Submit the file here</h3>
        </v-row>
        <v-row class="mt-6">
          <v-file-input :accept="['text/csv']" v-model="file" label="CSV Upload" color="primary" />
        </v-row>
        <v-row class="mt-8">
          <h3>3. Upload the file to the backend</h3>
        </v-row>
        <v-row class="mt-6 ml-6">
          <v-btn color="primary" variant="tonal" @click="upload()" append-icon="mdi-upload" :disabled="!file">
            Submit
          </v-btn>
          <p :class="`my-2 ml-6 text-${statusClass}`">{{ statusText }}</p>
        </v-row>
      </v-col>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, inject, computed } from 'vue';
import api from '@/shared/api.js';
const emitter = inject('emitter');
const file = ref(null);
const status = ref(null);
const PTODownloadLink = ref(
  'https://consultwithcase-sand.unanet.biz/consultwithcase-sand/action/reports/people/detail/schedule/report?runFrom=S_14'
);

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

async function upload() {
  status.value = undefined;
  let resp = await api.uploadUnanetBalances(file.value);
  status.value = !!resp.originalname;
}

const statusText = computed(() => {
  if (status.value === undefined) return 'Uploading file, please wait...';
  if (status.value === true) return 'Upload successful!';
  if (status.value === false) return 'Upload failed, please refresh page and try again';
  return '';
});

const statusClass = computed(() => {
  if (status.value === true) return 'success font-weight-bold';
  if (status.value === false) return 'error font-weight-bold';
  return '';
});

/**
 * Emits to close modal
 */
function close() {
  emitter.emit(`close-unanet-pto-download`);
}
</script>
