<template>
  <div class="text-sm-center text-md-center text-lg-center">
    <!-- Receipt Input -->
    <v-file-input
      v-model="inputFile"
      :rules="[...passedRules, ...fileSizeRule()]"
      :label="label"
      :accept="acceptedFileTypes"
      :disabled="disabled"
    ></v-file-input>
  </div>
</template>

<script>
// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * created lifecycle hook - set label
 */
function created() {
  if (this.customLabel) {
    this.label = this.customLabel;
  }
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Check if file is too large. Returns true if the file exceeds the limit, otherwise return false.
 *
 * @return boolean - file is too large
 */
function fileTooBig() {
  return this.megabytes > this.fileSizeLimit;
} // fileTooBig

/**
 * Converts file size from bytes to megabytes.
 *
 * @return Number - file size in megabytes
 */
function megabytes() {
  return this.inputFile ? this.inputFile.size / 1000000 : 0;
} // megabytes

/**
 * Computed array of the accepted file types
 *
 * @return array - the accepted file types
 */
function acceptedFileTypes() {
  if (this.customFileTypes) {
    return this.customFileTypes.join(',');
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
} // acceptedFileTypes

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
      !this.fileTooBig ||
      `The selected file (${this.megabytes.toFixed(2)} MB) exceeds the size limit of ${this.fileSizeLimit.toFixed(
        1
      )} MB`
  ];
} // fileSizeRule

/**
 * Set file data.
 */
function receiptChange() {
  if (this.inputFile) {
    // file exists
    if (this.inputFile.name.lastIndexOf('.') <= 0 || this.fileTooBig) {
      // end if file name is missing or file is too large
      return;
    }
    const fr = new FileReader();
    fr.readAsDataURL(this.inputFile);
    fr.addEventListener('load', () => {
      this.previewURL = fr.result;
      this.emitter.emit('fileSelected', this.inputFile);
    });
  } else {
    // file does not exist
    this.previewURL = '';
    this.emitter.emit('fileSelected', null);
  }
} // receiptChanged

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for inputFile
 */
function watchInputFile() {
  this.receiptChange();
} // watchInputFile

/**
 * watcher for receiptFile
 */
function watchReceipt() {
  if (this.receipt == null) {
    this.inputFile = null;
  }
} // watchReceipt

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  computed: {
    acceptedFileTypes,
    fileTooBig,
    megabytes
  },
  data() {
    return {
      dialog: false,
      fileSizeLimit: 3,
      previewURL: '',
      title: 'receipt upload',
      inputFile: null,
      label: 'Select Receipt (3.0 MB limit)'
    };
  },
  created,
  methods: {
    fileSizeRule,
    receiptChange
  },
  watch: {
    inputFile: watchInputFile,
    receipt: watchReceipt
  },
  props: ['passedRules', 'receipt', 'customLabel', 'customFileTypes', 'disabled'] // file text field rules
};
</script>
