<template>
  <div>
    <v-dialog v-model="model">
      <!-- Download CSV Button -->
      <v-card class="viewer-card">
        <!-- Modal Title -->
        <v-card-title class="d-flex align-center header_style">Attachment Viewer</v-card-title>

        <!-- Modal Content -->
        <v-card-text>
          <!-- TODO: Currently viewing image -->
          <div>
            <!-- TODO: Download button -->
          </div>

          <!-- TODO: Other images -->
          <div></div>
        </v-card-text>

        <!-- buttons -->
        <v-card-actions>
          <!-- Download all button -->
          <v-btn color="primary" variant="outlined" prepend-icon="mdi-download" @click="download()">Download All</v-btn>

          <!-- Close button -->
          <v-btn @click="close()">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Popup if user blocks multi-receipt download -->
    <!-- <v-dialog v-model="popupBlocked" persistent max-width="350">
      <v-card>
        <v-card-text class="pb-0">
          <h5 class="text-h5">Download failed.</h5>
          <p class="text-body-1 pt-1">
            Only 1 out of {{ files.length }} attachments could be downloaded. Please enable popups in your browser to
            download all attachments.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-btn color="green-darken-1" variant="text" @click="popupBlocked = false"> OK </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog> -->
  </div>
</template>

<script setup>
import { defineModel, onMounted, ref } from 'vue';
import api from '@/shared/api';
import axios from 'axios';

const props = defineProps(['expense']);
const model = defineModel();

const files = ref([]);
const popupBlocked = ref(true);

onMounted(() => {
  getAllFiles();
});

/**
 * Gets all the files for viewing/downloading. This could be updated to support more types of downloads,
 * if this is used somewhere other than seeing expense receipts.
 */
async function getAllFiles() {
  let signedURLs = await api.getAttachment(props.expense.employeeId, props.expense.id);

  let options;
  for (let url of signedURLs) {
    options = {
      method: 'GET',
      url,
      headers: { 'Access-Control-Allow-Origin': '*' }
    };
    files.value.push({
      blob: await axios(options)
    });
  }

  console.log(files.value);
}

/**
 * TODO: download the given file, or all files if no file is provided
 */
function download(filenames) {
  // build and auto-click link to download file
  let blob, url, link;
  for (let file of filenames) {
    // create blob of data to download
    blob = new Blob([file], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    url = URL.createObjectURL(blob);
    // create link
    link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    // put link in document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function close() {
  model.value = false;
}
</script>

<style scoped>
.viewer-card {
  width: 75%;
  height: 80vh;
  margin: 0 auto;
}
</style>
