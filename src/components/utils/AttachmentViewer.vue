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
            <v-row class="position-relative">
              <!-- <img
                
                :src="files?.[selectedFile]?.data"
                class="image-main"
                ref="mainImage"
              /> -->
              <embed
                v-if="files?.[selectedFile]?.type === 'pdf'"
                :src="files?.[selectedFile]?.data"
                class="image-main"
                type="application/pdf"
                width="100%"
                height="500px"
              />
              <img v-else :src="files?.[selectedFile]?.data" class="image-main" ref="mainImage" />
            </v-row>

            <!-- Other images thumbnail -->
            <v-row class="mt-6">
              <div v-for="i in files.length" :key="i" :class="'d-inline-block image-parent ' + selectedParent(i - 1)">
                <p class="font-weight-bold pdf-thumbnail" v-if="files[i - 1].type === 'pdf'" @click="selectFile(i - 1)">
                  PDF
                </p>
                <img
                  v-else
                  :src="files[i - 1].data"
                  :class="'image-thumbnail' + selectedClass(i - 1)"
                  @click="selectFile(i - 1)"
                />
              </div>
            </v-row>
          </v-col>
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
    <v-dialog v-model="popupBlocked" persistent max-width="350">
      <v-card>
        <v-card-text class="pb-0">
          <h5 class="text-h5">Download not working?</h5>
          <p class="text-body-1 pt-1">Please ensure that popups are allowed in your browser, then try again.</p>
        </v-card-text>
        <v-card-actions>
          <v-btn color="green-darken-1" variant="text" @click="popupBlocked = false"> OK </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
const popupBlocked = ref(false);
let downloadAllCounter = { all: 0 }; // check if the user is spamming a download button, indicating that it isn't working

// refs to HTML elements the template
const mainImage = ref(null);

/**
 * Basically onMounted for dialogs
 */
watch(
  () => model.value,
  async () => {
    if (!model.value) return;
    if (files.value.length === 0) await getAllFiles();
    for (let i in files.value) downloadAllCounter[i] = 0;
  }
);

/**
 * Gets all the files for viewing/downloading. This could be updated to support more types of downloads,
 * if this is used somewhere other than seeing expense receipts.
 */
async function getAllFiles() {
  // get all the signed URLs for attachments
  let signedURLs;
  signedURLs = await api.getAttachment(props.expense.employeeId, props.expense.id);
  // get the data from each signed URL
  for (let i = 0; i < signedURLs.length; i++) {
    // fetch from AWS
    let resp = await axios.get(signedURLs[i], { responseType: 'blob' });
    // get type to know what to do with it, and set it in the data (default is useless)
    let type = new URL(resp.config.url).pathname.split('.')[1].toLowerCase();
    let newType = (type === 'pdf' ? 'application/' : 'image/') + type;
    let data = resp.data.slice(0, resp.data.size, newType);
    // add to the files
    files.value.push({
      data: URL.createObjectURL(data),
      type
    });
    // hides utils in PDF viewer
    if (type === 'pdf') files.value[i].data += '#toolbar=0&navpanes=0&scrollbar=0';
  }
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
 * Downloads the given file, or all files if no file is provided
 *
 * @param index index of file in files array to download. if undefined, all will be downloaded
 */
function download(index) {
  downloadAllCounter[index ?? 'all']++;
  if (downloadAllCounter[index ?? 'all'] % 3 === 0) popupBlocked.value = true;

  // build and auto-click link to download file
  let list = index ? files.value[index] : files.value;
  let link;
  for (let file of list) {
    // create link
    link = document.createElement('a');
    link.setAttribute('href', file.data);
    link.setAttribute('download', `Receipt Download - ${props.expense.employeeName}`);
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
  height: 85vh;
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
.pdf-thumbnail {
  width: 100px;
  height: 100px;
  text-align: center;
  padding-top: calc(104px / 2 - 1em);
  border: 2px solid transparent;
  border-radius: 3px;
  cursor: pointer;
  color: white;
  background-color: #e1efff;
  text-shadow:
    -1px -1px 0 #111,
    1px -1px 0 #111,
    -1px 1px 0 #111,
    1px 1px 0 #111;
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
