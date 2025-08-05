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
          <h3>1. Get PTO report from daily Unanet email</h3>
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
          <p :class="`my-2 ml-6 text-${statusClass} font-weight-bold`">{{ statusText }}</p>
        </v-row>
      </v-col>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, inject, computed } from 'vue';
import api from '@/shared/api.js';
import { AxiosError } from 'axios';
const emitter = inject('emitter');
const file = ref(null);
const status = ref(null);
// const PTODownloadLink = ref(
//   'https://consultwithcase-sand.unanet.biz/consultwithcase-sand/action/reports/people/detail/accrual/search'
// );

// |--------------------------------------------------|
// |                                                  |
// |                      METHODS                     |
// |                                                  |
// |--------------------------------------------------|

async function upload() {
  status.value = undefined;
  const resp = await api.uploadUnanetBalances(file.value);

  if (resp instanceof AxiosError) {
    const info = resp.response.data;

    switch (info.error) {
      // arbitrary error names from the backend, specify others here for custom messages
      case 'missing columns':
        // contains missing column names in the metadata
        status.value = `File is missing required columns: ${info.meta.join(', ')}`;
        break;

      // default to backend error message
      default:
        status.value = info.message;
    }
  } else {
    status.value = true;
  }
}

const statusText = computed(() => {
  if (typeof status.value == 'string') return status.value;

  switch (status.value) {
    case undefined:
      return 'Uploading file, please wait...';
    case true:
      return 'Upload successful!';
    case false:
      return 'Upload failed, please refresh page and try again';
    default:
      return '';
  }
});

const statusClass = computed(() => {
  if (typeof status.value == 'string') return 'error';
  if (status.value === true) return 'success';
  if (status.value === false) return 'error';
  return '';
});

/**
 * Emits to close modal
 */
function close() {
  emitter.emit(`close-unanet-pto-download`);
}
</script>
