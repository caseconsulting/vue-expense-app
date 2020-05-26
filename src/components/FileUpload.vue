<template>
  <div>
    <v-layout>
      <v-flex xs12 class="text-xs-center text-sm-center text-md-center text-lg-center">
        <!-- Receipt Size Error -->
        <v-alert :value="fileTooBig" type="error">
          The file you selected is {{ megabytes }} MBs which exceeds the maximum file size of 6MB.
        </v-alert>

        <!-- Receipt Text Field -->
        <v-text-field
          :rules="passedRules"
          label="Select Receipt"
          @click="pickFile"
          v-model="fileName"
          prepend-icon="attach_file"
        ></v-text-field>

        <!-- Receipt Input -->
        <input type="file" style="display: none;" ref="receipt" :accept="acceptedFileTypes" @change="onFilePicked" />
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Check if file is too large. Returns true if the file is 6 megabytes or larger, otherwise return false.
 *
 * @return boolean - file is too large
 */
function fileTooBig() {
  let sizeLimit = 6;

  return this.megabytes > sizeLimit;
} // fileTooBig

/**
 * Converts file size from bytes to megabytes.
 *
 * @return Number - file size in megabytes
 */
function megabytes() {
  return this.fileSize / 1000000;
} // megabytes

function acceptedFileTypes() {
  return [
    'application/msword',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.doc',
    '.docx',
    'image/*',
    '.pdf',
    '.xml'
  ].join(',');
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
function onFilePicked(e) {
  const files = e.target.files;
  if (files[0] != null) {
    // file exists
    this.fileName = files[0].name;
    this.fileSize = files[0].size;
    this.fileType = files[0].type;
    if (this.fileName.lastIndexOf('.') <= 0 || this.fileTooBig) {
      // end if file name is missing or file is too large
      return;
    }
    const fr = new FileReader();
    fr.readAsDataURL(files[0]);
    fr.addEventListener('load', () => {
      this.previewURL = fr.result;
      this.fileBlob = files[0]; // file that can be sent to s3
      this.$emit('fileSelected', this.fileBlob);
    });
  } else {
    // file does not exist
    this.fileName = '';
    this.fileBlob = '';
    this.previewURL = '';
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
    fileBlob: '',
    fileName: '',
    fileSize: 0,
    fileType: '',
    previewURL: '',
    title: 'receipt upload'
  }),
  methods: {
    onFilePicked,
    pickFile
  },
  props: ['passedRules'] // file text field rules
};
</script>
