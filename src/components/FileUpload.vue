<template>
  <div>
  			<v-container fluid>
  				<v-flex xs12 class="text-xs-center text-sm-center text-md-center text-lg-center">
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
export default {
  data: () => ({
    title: 'Image Upload',
    dialog: false,
    fileName: '',
    previewURL: '',
    fileBlob: '',
    fileExts: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', 'image/*'].join(',')
  }),

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
          this.fileBlob = files[0]; // file that can be sent to s3
          console.log(this.fileBlob);
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
