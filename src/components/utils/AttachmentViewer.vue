<template>
  <div>
    <v-dialog v-model="model">
      <!-- Download CSV Button -->
      <v-card class="viewer-card">
        <!-- Modal Title -->
        <v-card-title class="d-flex align-center header_style">Attachment Viewer</v-card-title>

        <!-- Modal Content -->
        <v-card-text>
          <v-col>
            <!-- Currently viewing image -->
            <v-row>
              <img :src="files?.[selectedFile]?.image" class="image-main" />
            </v-row>

            <!-- TODO: Other images thumbnail -->
            <v-row class="mt-6">
              <div v-for="i in files.length" :key="i" :class="'d-inline-block image-parent ' + selectedParent(i - 1)">
                <img
                  :src="files[i - 1].image"
                  :class="'image-thumbnail' + selectedClass(i - 1)"
                  @click="selectFile(i - 1)"
                />
              </div>
            </v-row>
          </v-col>
        </v-card-text>

        <!-- buttons -->
        <v-card-actions>
          <!-- Download current button -->
          <v-btn color="primary" variant="outlined" prepend-icon="mdi-download" @click="download()">
            Download Current
          </v-btn>

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
import { watch, ref } from 'vue';
import api from '@/shared/api';
import axios from 'axios';

const props = defineProps(['expense']);
const model = defineModel();

const files = ref([]);
const selectedFile = ref(0);
// const popupBlocked = ref(true);

/**
 * Basically onMounted for dialogs
 */
watch(
  () => model.value,
  async () => {
    if (!model.value) return;
    await getAllFiles();
  }
);

/**
 * Gets all the files for viewing/downloading. This could be updated to support more types of downloads,
 * if this is used somewhere other than seeing expense receipts.
 */
async function getAllFiles() {
  // let signedURLs;
  // console.log(props.expense.employeeId, props.expense.id);
  // signedURLs = await api.getAttachment(props.expense.employeeId, props.expense.id);
  // window.open(signedURLs[0], '_blank');

  let signedURLs;
  signedURLs = await api.getAttachment(props.expense.employeeId, props.expense.id);
  for (let i = 0; i < signedURLs.length; i++) {
    let resp = await axios.get(signedURLs[i], { responseType: 'blob' });
    files.value.push({
      image: URL.createObjectURL(resp.data)
    });
  }
  console.log(files.value);

  // let options;
  // for (let url of signedURLs) {

  // }

  // console.log(files.value);
}

/**
 * Selects a file to display
 *
 * @param index index in files var
 */
function selectFile(index) {
  selectedFile.value = index;
}

/**
 * Returns a special class if the given index is the same as file being viewed
 *
 * @param index index to check
 */
function selectedClass(index) {
  return selectedFile.value === index ? ' image-selected' : '';
}
/**
 * Returns a special class if the given index is the same as file being viewed
 *
 * @param index index to check
 */
function selectedParent(index) {
  let classes = [];
  if (selectedFile.value === index) classes.push('image-parent-selected'); // selected box
  if (files.value.length !== index - 1) classes.push('mr-4'); // margin on middle images
  if (index === 0) classes.push('ml-auto'); // left side centering
  if (index === files.value.length - 1) classes.push('mr-auto'); // right side centering
  return classes.join(' ');
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
  width: 75vw;
  height: 80vh;
  margin: 0 auto;
}

.image-main {
  width: 100%;
  height: 50vh;
  object-fit: contain;
}

.image-thumbnail {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border: 2px solid transparent;
  border-radius: 3px;
  cursor: pointer;
}
.image-selected {
  border-color: white;
}
.image-parent {
  width: 104px;
  height: 104px;
  border: 2px solid transparent;
  border-radius: 5px;
}
.image-parent-selected {
  border-color: rgb(25 103 192);
}
</style>
