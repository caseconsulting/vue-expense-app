<template>
  <v-container class="pa-0 ma-0">
    <v-btn v-if="useDropDown && (isAdmin || isUser) && !editing" variant="text" icon="" density="comfortable">
      <v-icon icon="mdi-chevron-down" size="large">mdi-file-arrow-up-down</v-icon>
      <v-menu activator="parent" location="bottom" origin="start top">
        <v-list>
          <v-list-item class="px-2">
            <v-btn
              color="#bc3825"
              class="text-black"
              @click="toggleResumeParser = !toggleResumeParser"
              variant="text"
              density="comfortable"
              prepend-icon="mdi-file-upload"
            >
              Upload Resume
            </v-btn>
          </v-list-item>
          <v-list-item class="px-2">
            <v-btn
              class="text-black"
              color="#bc3825"
              :disabled="model.resumeUpdated == null"
              :loading="deleteLoading"
              @click="toggleDeleteModal = !toggleDeleteModal"
              variant="text"
              density="comfortable"
              prepend-icon="mdi-file-remove"
            >
              Delete Resume
            </v-btn>
          </v-list-item>
          <v-list-item class="px-2">
            <v-btn
              class="text-black"
              color="#bc3825"
              :disabled="model.resumeUpdated == null"
              @click="downloadResume()"
              variant="text"
              density="comfortable"
              prepend-icon="mdi-file-download"
            >
              <p class="ma-0 pa-0">
                {{ model.resumeUpdated != null ? 'Download ' : 'No resume available' }}
              </p>
              <p class="ma-0 pl-1 font-weight-thin">
                {{ model.resumeUpdated != null ? `Uploaded ${format(model.resumeUpdated, null, dateFormat)}` : '' }}
              </p>
            </v-btn>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-btn>
    <v-row v-else-if="(isAdmin || isUser) && !editing">
      <v-col align="right" class="px-2 py-0 ma-0">
        <div class="d-inline">
          <v-btn
            color="#bc3825"
            class="text-white"
            @click="toggleResumeParser = !toggleResumeParser"
            variant="text"
            density="comfortable"
            icon=""
          >
            <v-tooltip activator="parent" location="top">
              <p class="ma-0 pa-0">Upload Resume</p>
            </v-tooltip>
            <v-icon icon="mdi-file-upload"></v-icon>
          </v-btn>
        </div>
        <div class="d-inline">
          <v-btn
            class="text-white mx-1 fit-content"
            color="#bc3825"
            :disabled="model.resumeUpdated == null"
            :loading="deleteLoading"
            @click="toggleDeleteModal = !toggleDeleteModal"
            variant="text"
            density="comfortable"
            icon=""
          >
            <v-icon icon="mdi-file-remove"></v-icon>
          </v-btn>
          <v-tooltip activator="parent" location="top">
            <p class="ma-0 pa-0">Delete Resume</p>
          </v-tooltip>
        </div>
        <div class="d-inline">
          <v-btn
            class="text-white"
            color="#bc3825"
            :disabled="model.resumeUpdated == null"
            @click="downloadResume()"
            variant="text"
            density="comfortable"
            icon=""
          >
            <v-tooltip activator="parent" location="top">
              <p class="ma-0 pa-0">
                {{ model.resumeUpdated != null ? 'Download Resume' : 'No resume available' }}
              </p>
              <p class="ma-0 pa-0">
                {{ model.resumeUpdated != null ? `Uploaded ${format(model.resumeUpdated, null, dateFormat)}` : '' }}
              </p>
            </v-tooltip>
            <v-icon icon="mdi-file-download"></v-icon>
          </v-btn>
          <v-tooltip activator="parent" location="top" v-if="model.resumeUpdated == null">Download Resume</v-tooltip>
        </div>
      </v-col>
    </v-row>
    <upload-resume v-if="!loading && !editing" v-model="toggleResumeParser" :employee="model" />
    <delete-modal :toggle-delete-modal="toggleDeleteModal" type="resume" />
  </v-container>
</template>

<script setup>
import api from '@/shared/api.js';
import { format, getTodaysDate, FORMATTED_ISOFORMAT } from '@/shared/dateUtils';
import { inject, onBeforeUnmount, onMounted, ref, computed } from 'vue';
import DeleteModal from '@/components/modals/DeleteModal';
import UploadResume from '@/components/employee-beta/modals/UploadResume.vue';
import { useDisplay } from 'vuetify';
import { useDisplayError, useDisplaySuccess } from '../../shared/StatusSnackbar.vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|
const dateFormat = FORMATTED_ISOFORMAT;
const display = useDisplay();

defineProps(['editing', 'loading']);
const model = defineModel();
const emitter = inject('emitter');

const isAdmin = inject('isAdmin');
const isUser = inject('isUser');

const deleteLoading = ref(false);
const toggleResumeParser = ref(false);
const toggleDeleteModal = ref(false);

/**
 * computed boolean to decide whether or not to use dropdown.
 *
 * @return boolean - returns true for small screens
 */
const useDropDown = computed(() => {
  switch (display.name.value) {
    case 'xs':
      return true;
    default:
      return false;
  }
}); // useDropDown

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

onMounted(() => {
  emitter.on('confirm-delete-resume', async () => {
    await deleteResume();
  });
  emitter.on('canceled-delete-resume', () => {
    toggleDeleteModal.value = false;
  });
  emitter.on('resume', async (result) => {
    await resumeReceived(result.newEmployeeForm, result.totalChanges);
  });
  emitter.on('uploaded', async (message) => {
    if (message) useDisplaySuccess('Successfully uploaded resume', 3000);
    model.value.resumeUpdated = getTodaysDate();
    await api.updateAttributes(api.EMPLOYEES, model.value.id, { resumeUpdated: model.value.resumeUpdated });
  });
});

onBeforeUnmount(() => {
  emitter.off('confirm-delete-resume');
  emitter.off('canceled-delete-resume');
  emitter.off('resume');
  emitter.off('uploaded');
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Deletes the resume
 */
async function deleteResume() {
  deleteLoading.value = true;
  let deleteResult = await api.deleteResume(model.value.id);
  let updateEmpRes = await api.updateItem(api.EMPLOYEES, { ...model.value, resumeUpdated: null });
  if (!(deleteResult instanceof Error) || !(updateEmpRes instanceof Error)) {
    model.value.resumeUpdated = null;
    useDisplaySuccess('Successfully deleted resume', 3000);
  } else {
    useDisplayError('Failure to delete resume', 3000);
  }
  deleteLoading.value = false;
} // deleteResume

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
    useDisplaySuccess(`Added ${changes} change(s) to profile!`, 3000);
  }
  if (newEmployeeForm) {
    model.value = newEmployeeForm;
    model.value['resumeUpdated'] = getTodaysDate();
    await api.updateItem(api.EMPLOYEES, model.value);
  }
} // resumeReceived
</script>
