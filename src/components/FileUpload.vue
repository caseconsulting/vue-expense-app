<template>
  <div>
  			<v-container fluid>
  				<v-flex xs12 class="text-xs-center text-sm-center text-md-center text-lg-center">
            <!-- <h4 v-show="wrongFileType" class='text-danger align-center'>
      The file you selected is a {{ fileType }} file. Valid file extensions are: {{ fileAccept }}.
    </h4> -->


  
    <v-alert
      :value="fileTooBig"
      type="error"
    >
The file you selected is {{ megabytes }} MBs which exceeds the maximum file size of 6MB.
    </v-alert>
            <!-- previewing images works but not pdfs etc.  -->
  					<!-- <img :src="previewURL" height="150" v-if="previewURL"/> -->
  					<v-text-field label="Select Receipt" @click='pickFile' v-model='fileName' prepend-icon='attach_file'></v-text-field>
  					<input
  						type="file"
  						style="display: none"
  						ref="receipt"
  						accept=fileExts
  						@change="onFilePicked"
  					>
  				</v-flex>
  			</v-container>
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
function wrongFileType() {
  return (
    !_.isEmpty(this.fileName) &&
    (!_.includes(this.fileName, 'image') ||
      !_.includes(this.fileName, 'pdf') ||
      !_.includes(this.fileName, 'excel') ||
      !_.includes(this.fileName, 'msword'))
  );
}

export default {
  data: () => ({
    title: 'Image Upload',
    dialog: false,
    fileSize: 0,
    fileName: '',
    previewURL: '',
    fileBlob: '',
    fileExts: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', 'image/*'].join(',')
  }),
  computed: {
    fileTooBig,
    megabytes,
    wrongFileType
  },

  methods: {
    pickFile() {
      this.$refs.receipt.click();
    },

    onFilePicked(e) {
      const files = e.target.files;
      if (files[0] !== undefined) {
        this.fileName = files[0].name;
        if (this.fileName.lastIndexOf('.') <= 0) {
          return;
        }
        const fr = new FileReader();
        fr.readAsDataURL(files[0]);
        fr.addEventListener('load', () => {
          this.previewURL = fr.result;
          this.fileSize = files[0].size;
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
