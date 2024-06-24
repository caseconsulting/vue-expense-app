<template>
  <div class="text-sm-center text-md-center text-lg-center">
    <!-- Receipt Input -->
    <v-file-input
      v-model="inputFile"
      :rules="[...passedRules, ...fileSizeRule()]"
      :label="label"
      :accept="acceptedFileTypes"
      :disabled="disabled"
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
const inputFile = ref([]);
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
const megabytes = computed(() => (inputFile.value && inputFile.value[0] ? inputFile.value[0].size / 1000000 : 0));

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
      'image/*',
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
  inputFile,
  () => {
    receiptChange();
  },
  { deep: true }
);

watch(
  () => props.receipt,
  () => {
    if (props.receipt == null) {
      inputFile.value[0] = null;
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
      `The selected file (${megabytes.value.toFixed(2)} MB) exceeds the size limit of ${fileSizeLimit.value.toFixed(1)} MB`
  ];
} // fileSizeRule

/**
 * Set file data.
 */
function receiptChange() {
  if (inputFile.value && inputFile.value[0]) {
    // file exists
    if (inputFile.value[0].name.lastIndexOf('.') <= 0 || fileTooBig.value) {
      // end if file name is missing or file is too large
      return;
    }
    const fr = new FileReader();
    fr.readAsDataURL(inputFile.value[0]);
    fr.addEventListener('load', () => {
      previewURL.value = fr.result;
      emitter.emit('fileSelected', inputFile.value[0]);
    });
  } else {
    // file does not exist
    previewURL.value = '';
    emitter.emit('fileSelected', null);
  }
} // receiptChanged
</script>
