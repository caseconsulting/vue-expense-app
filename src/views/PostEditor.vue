<template>
  <v-container>
    <!-- Cancel Button -->
    <v-btn to="/blog" color="white" class="ma-2"> <icon class="mr-1" name="ban"></icon>Cancel </v-btn>

    <!-- Submit Button -->
    <v-btn outlined @click="checkSubmit" color="success" class="ma-2">
      <icon class="mr-1" name="save"></icon>Submit</v-btn
    >
    <v-form ref="form" v-model="valid" lazy-validation
      ><v-text-field v-model="model.title" :rules="requiredRules" label="Blog Post Title"></v-text-field
    ></v-form>
    <div cols="12">
      <ckeditor :editor="editor" v-model="editorData" :config="editorConfig" @ready="onEditorReady"></ckeditor>
    </div>
    <!-- Cancel Button -->
    <v-btn to="/blog" color="white" class="ma-2"> <icon class="mr-1" name="ban"></icon>Cancel </v-btn>

    <!-- Submit Button -->
    <v-btn outlined @click="checkSubmit" color="success" class="ma-2">
      <icon class="mr-1" name="save"></icon>Submit</v-btn
    >
  </v-container>
</template>
<script>
import CKEditor from '@ckeditor/ckeditor5-vue';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import { v4 as uuid } from 'uuid';
import api from '@/shared/api.js';
import moment from 'moment-timezone';
const IsoFormat = 'YYYY-MM-DD';
import { isEmpty } from '@/utils/utils';

//some of these plugins are currently unused
import Base64UploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/base64uploadadapter';
import EssentialsPlugin from '@ckeditor/ckeditor5-essentials/src/essentials';
import BoldPlugin from '@ckeditor/ckeditor5-basic-styles/src/bold';
import ItalicPlugin from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Font from '@ckeditor/ckeditor5-font/src/font';

async function created() {
  this.user = await api.getUser();
  console.log(this.user);
}

async function checkSubmit() {
  //check to see if there is any data
  if (!isEmpty(this.editorData) && this.$refs.form.validate()) {
    console.log(this.editorData);
    //TODO: first send data through moderation.
    //begin creating the object
    let newUUID = uuid();
    this.$set(this.model, 'id', newUUID);
    this.$set(this.model, 'authorId', this.user.id);
    let newDate = moment().format(IsoFormat);
    this.$set(this.model, 'createDate', newDate);
    this.$set(this.model, 'fileName', 'test.md');
    this.$set(this.model, 'tags', []);

    let blogPost = await api.createItem(api.BLOG, this.model);

    if (blogPost.id) {
      //some success message popup
      console.log('submitted');
      let metaData = await createMetaData(this.model);
      //generate md file and upload it to s3
      let file = new Blob([metaData, this.editorData], { type: 'text/markdown' });
      console.log(file);
      let fileSubmit = await api.createBlogFile(blogPost, file);
      console.log(fileSubmit);
      this.clearForm();
    } else {
      //failure message
      console.log('issue');
      this.model.id = null;
      console.log(blogPost.response.data.message);
    }
  } else {
    //nothing to submit
    console.log('nothing in the box');
  }
}

async function createMetaData(model) {
  let metaData = '---';
  metaData += `\ntitle: ${model.title}`;
  let employee = await api.getItem(api.EMPOLYEES, model.authorId);
  metaData += `\nauthor: ${employee.firstName} ${employee.lastName}`;
  metaData += `\ndate: ${model.createDate}`;
  metaData += `\ntags: ${model.tags}`;
  metaData += '\nlayout: BlogPost\n---\n';
  //TODO: description? image?
  return metaData;
}
function onEditorReady(editor) {
  console.log('Editor is ready.', { editor });
}

function clearForm() {
  this.$set(this.model, 'id', '');
  this.$refs.form.reset();
  this.$set(this.model, 'authorId', '');
  this.$set(this.model, 'createDate', '');
  this.$set(this.model, 'fileName', '');
  this.$set(this.model, 'tags', []);
  this.editorData = '';
}
export default {
  name: 'app',
  components: {
    // Use the <ckeditor> component in this view.
    ckeditor: CKEditor.component
  },
  created,
  data() {
    return {
      editor: ClassicEditor,
      editorData: '',
      editorConfig: {
        plugins: [
          Image,
          ImageCaption,
          ImageResize,
          ImageStyle,
          ImageToolbar,
          ImageUpload,
          EssentialsPlugin,
          BoldPlugin,
          ItalicPlugin,
          LinkPlugin,
          ParagraphPlugin,
          Base64UploadAdapter,
          Heading,
          Link,
          List,
          Paragraph,
          Alignment,
          BlockQuote,
          MediaEmbed,
          Underline,
          Font
        ],
        toolbar: {
          items: [
            'heading',
            'paragrah',
            'alignment',
            '|',
            'bold',
            'italic',
            'underline',
            '|',
            'fontSize',
            'fontFamily',
            'fontColor',
            '|',
            'bulletedList',
            'numberedList',
            'blockQuote',
            '|',
            'link',
            'imageUpload',
            'mediaEmbed'
          ]
        },
        heading: {
          options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
          ]
        },
        image: {
          styles: ['alignLeft', 'alignCenter', 'alignRight'],
          resizeOptions: [
            {
              name: 'imageResize:original',
              label: 'Original',
              value: null
            },
            {
              name: 'imageResize:50',
              label: '50%',
              value: '50'
            },
            {
              name: 'imageResize:75',
              label: '75%',
              value: '75'
            }
          ],
          toolbar: [
            'imageStyle:alignLeft',
            'imageStyle:alignCenter',
            'imageStyle:alignRight',
            '|',
            'imageResize',
            '|',
            'imageTextAlternative'
          ]
        },
        placeholder: 'Create a New Blog Post'
      },
      user: null,
      requiredRules: [(v) => !isEmpty(v) || 'Required field'], // rules for required fields
      model: {
        id: '',
        title: '',
        authorId: '',
        createDate: '',
        fileName: '',
        tags: []
      },
      valid: false
    };
  },
  methods: {
    checkSubmit,
    clearForm,
    onEditorReady
  }
};
</script>

<style>
.ck-editor__editable_inline {
  min-height: 500px;
}
</style>
