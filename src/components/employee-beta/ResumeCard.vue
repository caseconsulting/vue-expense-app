<template>
  <v-container>
    <!-- Status Notification -->
    <v-snackbar
      v-model="uploadStatus.enabled"
      :color="uploadStatus.color"
      :multi-line="true"
      :timeout="3000"
      :vertical="true"
      location="top right"
    >
      <v-card-text color="white">
        <span class="text-h6 font-weight-medium">{{ uploadStatus.statusMessage }}</span>
      </v-card-text>
      <v-btn color="white" variant="text" @click="clearStatus()"> Close </v-btn>
    </v-snackbar>
    <v-row>
      <v-col v-if="(isAdmin || isUser) && !editing" align="right" class="px-0 pr-3 ma-0">
        <v-btn
          :size="isMobile() ? 'x-small' : 'default'"
          color="#bc3825"
          class="text-white"
          @click="toggleResumeParser = !toggleResumeParser"
          prepend-icon="mdi-upload"
        >
          <b>Upload Resume</b>
        </v-btn>
        <v-btn
          class="text-white mx-1"
          color="#bc3825"
          :size="isMobile() ? 'x-small' : 'default'"
          :disabled="model.resumeUpdated == null"
          :loading="deleteLoading"
          @click="toggleDeleteModal = !toggleDeleteModal"
          prepend-icon="mdi-delete"
        >
          <b>Delete Resume</b>
        </v-btn>
        <v-btn
          class="text-white"
          color="#bc3825"
          :size="isMobile() ? 'x-small' : 'default'"
          :disabled="model.resumeUpdated == null"
          @click="downloadResume()"
          prepend-icon="mdi-file-download"
        >
          <v-tooltip activator="parent" location="top">
            <p class="ma-0 pa-0">
              {{ model.resumeUpdated != null ? 'Download Resume' : 'No resume available' }}
            </p>
            <p class="ma-0 pa-0">
              {{ model.resumeUpdated != null ? `Uploaded ${format(model.resumeUpdated, null, dateFormat)}` : '' }}
            </p>
          </v-tooltip>
          <b>Download Resume</b>
        </v-btn>
      </v-col>
    </v-row>
    <resume-parser
      v-if="!loading && !editing"
      :toggle-resume-parser="toggleResumeParser"
      :key="model"
      :employee="model"
    />
    <delete-modal :toggle-delete-modal="toggleDeleteModal" type="resume" />
  </v-container>
</template>

<script setup>
import _ from 'lodash';
import api from '@/shared/api.js';
import { isMobile } from '@/utils/utils';
import { format, getTodaysDate, FORMATTED_ISOFORMAT } from '@/shared/dateUtils';
import { inject, onBeforeUnmount, onMounted, ref } from 'vue';
import DeleteModal from '@/components/modals/DeleteModal';
import ResumeParser from '@/components/modals/ResumeParser.vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|
const dateFormat = FORMATTED_ISOFORMAT;

defineProps(['editing', 'loading']);
const model = defineModel();
const emitter = inject('emitter');

const isAdmin = inject('isAdmin');
const isUser = inject('isUser');

const deleteLoading = ref(false);
const toggleResumeParser = ref(false);
const toggleDeleteModal = ref(false);
const uploadStatus = ref({
  enabled: false,
  statusType: '',
  statusMessage: '',
  color: ''
});

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

onMounted(() => {
  emitter.on('confirm-delete-resume', async () => {
    await deleteResume();
  });
  emitter.on('resume', async (result) => {
    await resumeReceived(result.newEmployeeForm, result.totalChanges);
  });
  emitter.on('uploaded', async (message) => {
    if (message) displayMessage('SUCCESS', 'Successfully uploaded resume', 'green');
    model.value.resumeUpdated = getTodaysDate();
    model.value = _.cloneDeep(model.value); // force vue to reload the object
    await api.updateItem(api.EMPLOYEES, model.value);
  });
});

onBeforeUnmount(() => {
  emitter.off('confirm-delete-resume');
  emitter.off('resume');
  emitter.off('uploaded');
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Clears the status message of the uploadStatus
 */
function clearStatus() {
  uploadStatus.value['enabled'] = false;
  uploadStatus.value['statusType'] = undefined;
  uploadStatus.value['statusMessage'] = null;
  uploadStatus.value['color'] = null;
} // clearStatus

/**
 * Deletes the resume
 */
async function deleteResume() {
  deleteLoading.value = true;
  let deleteResult = await api.deleteResume(model.value.id);
  let updateEmpRes = await api.updateItem(api.EMPLOYEES, { ...model.value, resumeUpdated: null });
  if (!(deleteResult instanceof Error) || !(updateEmpRes instanceof Error)) {
    model.value.resumeUpdated = null;
    displayMessage('SUCCESS', 'Successfully deleted resume', 'green');
  } else {
    displayMessage('ERROR', 'Failure to delete resume', 'red');
  }
  deleteLoading.value = false;
} // deleteResume

/**
 * Displays the message
 *
 * @param {string} type - the type of message
 * @param {string} msg - the message to display
 * @param {string} color - the color of the banner
 */
function displayMessage(type, msg, color) {
  uploadStatus.value['enabled'] = true;
  uploadStatus.value['statusType'] = type;
  uploadStatus.value['statusMessage'] = msg;
  uploadStatus.value['color'] = color;
} // displayMessage

/**
 * Downloads the resume of the employee
 */
async function downloadResume() {
  let res = await api.getResume(model.value.id);
  window.open(res.data, '_blank');
} // downloadResume

/**
 * Event called when a resume is submitted
 *
 * @param newEmployeeForm is the new employee model after parsing the resume
 * @param changes - number of changes that were made
 */
async function resumeReceived(newEmployeeForm, changes) {
  if (changes && changes > 0) {
    displayMessage('SUCCESS', `Added ${changes} change(s) to profile!`, 'green');
  }
  if (newEmployeeForm) {
    model.value = newEmployeeForm;
    model.value['resumeUpdated'] = getTodaysDate();
    await api.updateItem(api.EMPLOYEES, model.value);
  }
} // resumeReceived
</script>
