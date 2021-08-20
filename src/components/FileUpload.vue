<template>
  <div class="text-xs-center text-sm-center text-md-center text-lg-center">
    <!-- Receipt Size Error -->
    <v-alert :value="fileTooBig" type="error">
      The file you selected is {{ megabytes }} MBs which exceeds the maximum file size of {{ fileSizeLimit }}MB.
    </v-alert>

    <!-- Receipt Input -->
    <v-file-input
      v-model="inputFile"
      :rules="passedRules"
      :label="label"
      :accept="acceptedFileTypes"
      :disabled="disabled"
    ></v-file-input>
  </div>
</template>

<script>
function created() {
  if (this.customLabel) {
    this.label = this.customLabel;
  }
}
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
 * Set file data.
 *
 * @param e - file picked
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
      this.$emit('fileSelected', this.inputFile);
    });
  } else {
    // file does not exist
    this.previewURL = '';
    this.$emit('fileSelected', null);
  }
} // onFilePicked

/**
 * Reference the receipt file panel when text field is clicked.
 */
function pickFile() {
  this.$refs.receipt.click();
} // pickFile

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
  data: () => ({
    dialog: false,
    fileSizeLimit: 5,
    previewURL: '',
    title: 'receipt upload',
    inputFile: null,
    label: 'Select Receipt'
  }),
  created,
  methods: {
    receiptChange,
    pickFile
  },
  watch: {
    inputFile: function () {
      this.receiptChange();
    },
    receipt: function () {
      if (this.receipt == null) {
        this.inputFile = null;
      }
    }
  },
  props: ['passedRules', 'receipt', 'customLabel', 'customFileTypes', 'disabled'] // file text field rules
};
</script>
