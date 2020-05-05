<template>
  <div>
    <v-layout>
      <v-flex xs12 class="text-xs-center text-sm-center text-md-center text-lg-center">
        <v-alert :value="fileTooBig" type="error">
          The file you selected is {{ megabytes }} MBs which exceeds the maximum file size of 6MB.
        </v-alert>
        <v-text-field
          :rules="passedRules"
          label="Select Receipt"
          @click="pickFile"
          v-model="fileName"
          prepend-icon="attach_file"
        ></v-text-field>
        <input type="file" style="display: none;" ref="receipt" :accept="acceptedFileTypes" @change="onFilePicked" />
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
//COMPUTED
function fileTooBig() {
  return this.megabytes > 6;
}

function megabytes() {
  return this.fileSize / 1000000;
}

function acceptedFileTypes() {
  return [
    '.pdf',
    '.doc',
    '.docx',
    'image/*',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    '.xml',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ].join(',');
}

export default {
  data: () => ({
    title: 'receipt upload',
    dialog: false,
    fileSize: 0,
    fileName: '',
    previewURL: '',
    fileBlob: '',
    fileType: ''
  }),
  computed: {
    fileTooBig,
    megabytes,
    acceptedFileTypes
  },
  props: ['passedRules'],

  methods: {
    pickFile() {
      this.$refs.receipt.click();
    },

    onFilePicked(e) {
      const files = e.target.files;
      if (files[0] !== undefined) {
        this.fileName = files[0].name;
        this.fileSize = files[0].size;
        this.fileType = files[0].type;
        //this stops a memory error with really large files
        if (this.fileName.lastIndexOf('.') <= 0 || this.fileTooBig) {
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
        this.fileName = '';
        this.fileBlob = '';
        this.previewURL = '';
      }
    }
  }
};
</script>
