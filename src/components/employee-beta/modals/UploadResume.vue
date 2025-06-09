<template>
  <v-dialog v-model="activate" persistent max-width="1000" @click:outside="confirmBackingOut = !loading">
    <v-card>
      <v-card-title class="header_style d-flex justify-space-between align-center">
        <p style="margin: 0"><strong>Upload Resume</strong></p>
        <v-btn icon="" variant="text" @click="confirmBackingOut = !loading">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pa-3">
        <!-- File upload -->
        <v-form ref="submitForm" class="ma-3">
          <v-container fluid class="mx-0">
            <v-row>
              <v-col class="text-center">
                <h1>Add Your Resume Here</h1>
              </v-col>
            </v-row>
            <v-row class="d-flex align-center justify-center">
              <v-col cols="9" xl="8" lg="8" md="8" sm="8" class="pr-0">
                <v-file-input
                  :rules="fileRules"
                  :accept="acceptedFileTypes"
                  variant="underlined"
                  v-model="file"
                  label="Resume"
                ></v-file-input>
              </v-col>
              <v-col cols="2" xl="2" lg="2" md="2" sm="2" class="text-center mr-4">
                <v-btn @click="submit()" color="green" variant="outlined" :disabled="!validFile || loading"
                  >Upload</v-btn
                >
              </v-col>
            </v-row>
          </v-container>
        </v-form>
        <!-- Loading bar -->
        <div v-if="loading">
          <v-progress-linear color="#bc3825" indeterminate></v-progress-linear>
        </div>
        <div class="ma-3">
          <div v-if="!loading && uploadError">
            <p align="center" class="error-text">Failed to upload, please try again.</p>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <!-- Cancel Confirmation Modal -->
    <cancel-confirmation :toggleSubmissionConfirmation="confirmBackingOut" type="parser"> </cancel-confirmation>
  </v-dialog>
</template>

<script setup>
import { generateUUID, isEmpty } from '@/utils/utils';
import { inject, ref, onBeforeUnmount, watch } from 'vue';
import api from '@/shared/api.js';
import CancelConfirmation from '@/components/modals/CancelConfirmation.vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');
const props = defineProps({
  employee: {
    type: Object,
    required: true
  }
});

const activate = defineModel();
const acceptedFileTypes = ['application/pdf', 'image/png', 'image/jpeg'];
const confirmBackingOut = ref(false);
const file = ref(null);
const loading = ref(false);
const fileRules = [
  (v) => {
    let newFile = v?.[0] || v;
    return isValid(newFile) || 'File required (.pdf, .png or .jpeg)';
  }
];
const submitForm = ref(null);
const validFile = ref(false);
const uploadError = ref(false);

emitter.on('backout-canceled-parser', () => {
  confirmBackingOut.value = false;
});
emitter.on('backout-confirmed-parser', () => {
  confirmBackingOut.value = false;
  clearForm();
});

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

onBeforeUnmount(() => {
  emitter.off('backout-canceled-parser');
  emitter.off('backout-confirmed-parser');
}); //onBeforeUnmount

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Clears the form
 */
function clearForm() {
  file.value = null;
  loading.value = false;
  validFile.value = false;
  uploadError.value = false;
  confirmBackingOut.value = false;
  activate.value = false;
} // clearForm

function isValid(_file) {
  return !isEmpty(_file) && ['application/pdf', 'image/png', 'image/jpeg'].includes(_file.type);
} // isValid

/**
 * When the checkbox is not selected on the resume modal, it uploads the resume and closes the window upon
 * successful completion
 *
 * @param eId - the employee Id
 */
async function uploadResume(eId) {
  try {
    loading.value = true;
    let result = await api.uploadResume(eId, file.value?.[0] || file.value); //uploads resume to s3
    if (result.response) {
      throw new Error(result.response.data);
    }
    // Create an audit of the success
    await api.createItem(api.AUDIT, {
      id: generateUUID(),
      type: 'resume',
      tags: ['upload', 'success'],
      employeeId: props.employee.id,
      description: `${props.employee.firstName} ${props.employee.lastName} successfully uploaded a resume.`,
      timeToLive: 60
    });
    loading.value = false;

    //confirmation upload pop-up in employee.vue
    emitter.emit('uploaded', true);
    clearForm();
    activate.value = false;
  } catch (err) {
    // Create an audit of the timeout
    await api.createItem(api.AUDIT, {
      id: generateUUID(),
      type: 'resume',
      tags: ['upload', 'failure'],
      employeeId: props.employee.id,
      description: `${props.employee.firstName} ${props.employee.lastName} failed on resume upload.`,
      timeToLive: 60
    });
    loading.value = false;
    uploadError.value = true;
  }
} //onlyUploadResume

/**
 * Submit new resume
 */
async function submit() {
  await uploadResume(props.employee.id);
}

// |--------------------------------------------------|
// |                                                  |
// |                    WATCHERS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for file
 */
watch(file, async (newFile) => {
  validFile.value = isValid(newFile);
}); // watchFile
</script>

<style>
.error-text {
  color: red;
}
</style>
