<template>
  <div class="text-sm-center text-md-center text-lg-center">
    <!-- Receipt Input -->
    <v-file-input
      v-model="inputFiles"
      :rules="[...passedRules, ...fileSizeRule()]"
      :label="label"
      :accept="acceptedFileTypes"
      :disabled="disabled"
      multiple
      variant="underlined"
    ></v-file-input>
  </div>
</template>

<script setup>
import { computed, inject, ref, watch } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['passedRules', 'receipt', 'customLabel', 'customFileTypes', 'disabled']); // file text field rules
const emitter = inject('emitter');

const fileSizeLimit = ref(3);
const previewURL = ref('');
const inputFiles = ref([]);
const label = ref('Select Receipt (3.0 MB limit)');

// set label
if (props.customLabel) {
  label.value = props.customLabel;
}

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Whether the file is too large
 */
const fileTooBig = computed(() => megabytes.value > fileSizeLimit.value);

/**
 * File size in megabytes
 */
const megabytes = computed(() => {
  if (inputFiles.value) {
    let size = 0;
    for (let i = 0; i < inputFiles.value.length; i++) {
      if (inputFiles.value[i] / 1000000 > fileSizeLimit.value) {
        size = inputFiles.value[i] / 1000000;
        return size;
      }
    }
    return size;
  } else {
    return 0;
  }
});

/**
 * Computed array of the accepted file types
 *
 * @return array - the accepted file types
 */
const acceptedFileTypes = computed(() => {
  if (props.customFileTypes) {
    return props.customFileTypes.join(',');
  } else {
    return [
      'application/msword',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.doc',
      'image/gif', //.gif
      'image/jpeg', //.jpeg
      'image/png', //.png
      'image/bmp', //.bmp
      '.pdf'
    ].join(',');
  }
});

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

watch(
  inputFiles,
  () => {
    receiptChange();
  },
  { deep: true }
);

watch(
  () => props.receipt,
  () => {
    if (props.receipt == null) {
      inputFiles.value = [];
    }
  }
);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Validates the file size with the file size limit.
 */
function fileSizeRule() {
  return [
    () =>
      !fileTooBig.value ||
      `One of the selected files (${megabytes.value.toFixed(2)} MB) exceeds the size limit of ${fileSizeLimit.value.toFixed(1)} MB`
  ];
} // fileSizeRule

/**
 * Set file data.
 */
function receiptChange() {
  if (inputFiles.value) {
    // file exists
    for (let i = 0; i < inputFiles.value.length; i++) {
      if (inputFiles.value[i].name.lastIndexOf('.') <= 0 || fileTooBig.value) {
        // end if file name is missing or file is too large
        return;
      }
    }
    const fr = new FileReader();
    fr.readAsDataURL(inputFiles.value[0]);
    fr.addEventListener('load', () => {
      previewURL.value = fr.result;
      emitter.emit('fileSelected', inputFiles.value);
    });
  } else {
    // file does not exist
    previewURL.value = '';
    emitter.emit('fileSelected', null);
  }
} // receiptChanged
</script>
