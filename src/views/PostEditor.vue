<template>
  <v-container>
    <!-- Status Alert -->
    <v-snackbar
      v-model="status.statusType"
      :color="status.color"
      :multi-line="true"
      :right="true"
      :timeout="5000"
      :top="true"
      :vertical="true"
    >
      <v-card-title headline color="white">
        <span class="headline">{{ status.statusMessage }}</span>
      </v-card-title>
      <v-btn color="white" text @click="clearStatus">
        Close
      </v-btn>
    </v-snackbar>
    <!-- Cancel Button -->
    <v-btn to="/blog" color="white" class="ma-2"> <icon class="mr-1" name="ban"></icon>Cancel</v-btn>
    <!-- Submit Button -->
    <v-btn outlined @click="confirming = true" color="success" class="ma-2">
      <icon class="mr-1" name="save"></icon>Submit</v-btn
    >
    <v-form ref="form" v-model="valid" lazy-validation>
      <!-- Title -->
      <v-text-field v-model="model.title" :rules="requiredRules" label="Blog Post Title"></v-text-field>
      <!-- Main Picture -->
      <file-upload
        style="padding-top: 0px; padding-bottom: 0px;"
        @fileSelected="setFile"
        :passedRules="mainPictureRules"
        :customFileTypes="customFileTypes"
        :receipt="model.mainPicture"
        customLabel="Select Main Picture"
      ></file-upload>
      <p v-if="editing">Current Main Picture: {{ mainPictureFile.name }}</p>
      <!-- Description -->
      <v-text-field
        v-model="model.description"
        :rules="descriptionRules"
        label="Description"
        data-vv-name="Description"
      ></v-text-field>
      <!-- Tags -->
      <v-combobox
        v-model="model.tags"
        :items="tags"
        label="Tags"
        multiple
        small-chips
        append-icon
        data-vv-name="Tags"
      ></v-combobox>
      <!-- Category -->
      <v-autocomplete
        :items="categories"
        :rules="requiredRules"
        v-model="model.category"
        item-text="text"
        label="Category"
        class="form_padding"
      ></v-autocomplete>
    </v-form>
    <!-- CKEditor -->
    <p v-if="error" class="editorError">Editor must contain data before submission</p>
    <div cols="12">
      <ckeditor :editor="editor" v-model="editorData" :config="editorConfig"></ckeditor>
    </div>
    <!-- Cancel Button -->
    <v-btn to="/blog" color="white" class="ma-2"> <icon class="mr-1" name="ban"></icon>Cancel </v-btn>

    <!-- Submit Button -->
    <v-btn outlined @click="confirming = true" color="success" class="ma-2">
      <icon class="mr-1" name="save"></icon>Submit</v-btn
    >
    <!-- Submission check -->
    <form-submission-confirmation :activate="this.confirming"></form-submission-confirmation>
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
import _ from 'lodash';
import FileUpload from '../components/FileUpload.vue';
import FormSubmissionConfirmation from '../components/modals/FormSubmissionConfirmation';

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

/**
 * Initial setup
 */
async function created() {
  window.EventBus.$on('confirmed', () => {
    this.confirming = false;
    if (!this.hasTriedSubmitting && (this.editorData == null || this.editorData == '')) {
      this.error = true;
    }
    this.hasTriedSubmitting = true;
    this.checkSubmit();
  });

  window.EventBus.$on('canceled', () => {
    this.confirming = false;
  });

  this.user = await api.getUser();

  this.posts = await api.getItems(api.BLOG);
  // if editing
  if (this.$route.params.id != 0) {
    console.log('hmmmmm');
    this.model = _.find(this.posts, (post) => {
      return post.id == this.$route.params.id;
    });

    if (!this.model) {
      this.model = _.find(this.posts, (post) => {
        return post.blogNumber == this.$route.params.id;
      });
    }

    let blogFile = await api.getBlogFile(this.model.authorId, this.model.id);
    let pictureObj = await api.getPictureFile(this.model.authorId, this.model.id, this.model.mainPicture);
    this.mainPictureFile = pictureObj.file;
    this.mainPictureFile.name = this.model.mainPicture;

    blogFile = removeMetaData(blogFile);
    this.$set(this.model, 'mainPicture', pictureObj.file.name);

    this.editorData = blogFile;
    this.editing = true;
  }
  this.tags = _.flatten(
    _.map(this.posts, (post) => {
      return post.tags;
    })
  );
} //created

/**
 * Check validation and then attempt to submit blog
 */
async function checkSubmit() {
  //check to see if there is any data
  console.log('in check submit');
  if (this.$refs.form.validate() && !isEmpty(this.editorData)) {
    console.log('???????????????');
    //begin creating the object
    let blogPost;
    let newDate = moment().format(IsoFormat);
    if (!this.editing) {
      let newUUID = uuid();
      this.$set(this.model, 'id', newUUID);
      this.$set(this.model, 'blogNumber', this.createBlogNumber());
      this.$set(this.model, 'authorId', this.user.id);
      this.$set(this.model, 'createDate', newDate);
      this.$set(this.model, 'lastModifiedDate', newDate);
      this.$set(this.model, 'fileName', `${this.model.blogNumber}.md`);

      blogPost = await api.createItem(api.BLOG, this.model);
    } else {
      this.$set(this.model, 'lastModifiedDate', newDate);

      blogPost = await api.updateItem(api.BLOG, this.model);
    }
    if (blogPost.id) {
      let metaData = await createMetaData(this.model);
      //generate md file and upload it to s3
      let file = new Blob([metaData, this.editorData], { type: 'text/markdown' });
      //upload file
      console.log('submitted post');
      let fileSubmit = await api.createBlogFile(blogPost, file, blogPost.fileName);
      //upload picture
      console.log('before picture');
      let pictureSubmit = await api.createBlogFile(blogPost, this.mainPictureFile, blogPost.mainPicture);
      if (fileSubmit.code) {
        console.log('hmmmmmmmmmm');
        this.displayError('Error submitting blog file');
      } else if (pictureSubmit.code) {
        console.log('hm2');
        this.displayError('Error submitting Main Picture');
      } else {
        console.log('uhhh');
        this.displaySuccess('Successfully submitted blogPost');
        this.clearForm();
      }
    } else {
      this.displayError('Error submitting blog to table');
      this.model.id = null;
    }
  } else {
    //nothing to submit
    this.displayError('Blog could not be submitted');
  }
} // checkSubmit

/**
 * Set and display an error action status in the snackbar.
 *
 * @param model - current blog info
 */
async function createMetaData(model) {
  let metaData = '---';
  metaData += `\nmeta:\n- property: og:image\n content: https://blog.consultwithcase.com/${model.mainPicture}\n`;
  metaData += `\nimage: /${model.mainPicture}`;
  metaData += `\npostImage: /${model.mainPicture}`;
  metaData += `\ntitle: ${model.title}`;
  let employee = await api.getItem(api.EMPLOYEES, model.authorId);
  metaData += `\nauthor: ${employee.firstName} ${employee.lastName}`;
  metaData += `\ndate: ${model.createDate}`;
  metaData += `\ntags: ${model.tags}`;
  metaData += `\ndescription: ${model.description}`;
  metaData += '\nlayout: BlogPost\n---\n\n';

  return metaData;
} // createMetaData

/**
 * Remove metadata header and return blog contents
 *
 * @param post - full contents of the blogFile
 */
function removeMetaData(post) {
  let firstIndex = post.indexOf('---');
  let secondIndex = post.indexOf('---', 2);
  if (firstIndex == -1 || secondIndex == -1) {
    return post;
  } else {
    return post.substring(secondIndex + 3);
  }
} // removeMetaData

/**
 * Clear the current form
 */
function clearForm() {
  this.$set(this.model, 'id', '');
  console.log('xxxxxxx');
  this.$refs.form.reset();
  console.log('yyyyyyy');
  this.$set(this.model, 'blogNumber', 0);
  this.$set(this.model, 'authorId', '');
  this.$set(this.model, 'createDate', '');
  this.$set(this.model, 'lastModifiedDate', '');
  this.$set(this.model, 'fileName', '');
  this.$set(this.model, 'tags', []);
  this.editorData = '';
  console.log(this.model);
  if (this.editing) {
    this.editing = false;
    this.$router.push('/postEditor/0');
  }
  this.hasTriedSubmitting = false;
  console.log(this.model);
} // clearForm

/**
 * Calculate the blog number that is right after the highest blog number
 *
 * @return number - next available blog number
 */
function createBlogNumber() {
  let highestNumber = 0;
  _.forEach(this.posts, (post) => {
    if (post.blogNumber) {
      if (post.blogNumber > highestNumber) {
        highestNumber = post.blogNumber;
      }
    }
  });
  return highestNumber + 1;
} // createBlogNumber

/**
 * Clear the action status that is displayed in the snackbar.
 */
function clearStatus() {
  this.$set(this.status, 'statusType', undefined);
  this.$set(this.status, 'statusMessage', '');
  this.$set(this.status, 'color', '');
} // clearStatus

/**
 * Set and display an error action status in the snackbar.
 *
 * @param err - String error message
 */
function displayError(err) {
  this.$set(this.status, 'statusType', 'ERROR');
  this.$set(this.status, 'statusMessage', err);
  this.$set(this.status, 'color', 'red');
} // displayError

/**
 * Set and display a success action status in the snackbar.
 *
 * @param message - String success message
 */
function displaySuccess(message) {
  this.$set(this.status, 'statusType', 'SUCCESS');
  this.$set(this.status, 'statusMessage', message);
  this.$set(this.status, 'color', 'green');
} // displaySuccess

/**
 * Sets the main picture file.
 *
 * @param file - mainPicture
 */
async function setFile(file) {
  if (file) {
    this.mainPictureFile = file;
    this.$set(this.model, 'mainPicture', file.name);
  } else {
    this.mainPictureFile = null;
    this.$set(this.model, 'mainPicture', null);
  }
} // setFile

export default {
  name: 'app',
  components: {
    // Use the <ckeditor> component in this view.
    ckeditor: CKEditor.component,
    FileUpload,
    FormSubmissionConfirmation
  },
  created,
  data() {
    return {
      editor: ClassicEditor,
      editorData: '',
      /**
       * Below is the config for the CKeditor
       */
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
        ], //plugins used in the editor
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
        }, //plugins used in toolbar
        heading: {
          options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
          ]
        }, //heading drop down in tollbar
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
        }, //image toolbar stuff (appears while editing image)
        placeholder: 'Create a New Blog Post'
      },
      user: null, //current user
      requiredRules: [(v) => !isEmpty(v) || 'Required field'], // rules for required fields
      descriptionRules: [
        (v) => !isEmpty(v) || 'Description is a required field',
        (v) => (!isEmpty(v) && v.replace(/\s/g, '').length > 0) || 'Description is a required field'
      ], // rules for description
      mainPictureRules: [(v) => !isEmpty(v) || this.editing || 'mainPicture is required'], // rules for mainPicture
      model: {
        id: '', //UUID for blog
        blogNumber: 0, //id for blog so we dont have to use huge id for things
        title: '',
        mainPicture: '', //picture that is shown at top of blogPost
        authorId: '', //author's employee UUID
        description: '',
        createDate: '',
        lastModifiedDate: '',
        fileName: '', //name of blog contents file
        tags: [] //hashtags
      },
      valid: false,
      tags: [], //tags from other posts for autocomplete
      posts: null, //all blog posts
      editing: false, //whether we are creating or editing a blog post
      categories: ['Case News', 'Case Cares'],
      mainPictureFile: null, //file for picture
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      }, // snackbar action status
      confirming: false, //activator for form submission dialog
      customFileTypes: [
        'image/gif', //.gif
        'image/jpeg', //.jpeg
        'image/png' //.png
      ],
      error: false,
      hasTriedSubmitting: false
    };
  },
  methods: {
    checkSubmit,
    clearForm,
    removeMetaData,
    createBlogNumber,
    setFile,
    clearStatus,
    displayError,
    displaySuccess
  },
  watch: {
    editorData: function () {
      if (this.hasTriedSubmitting) {
        if (this.editorData == null || this.editorData == '') {
          this.error = true;
        } else {
          this.error = false;
        }
      }
    },
    model: function () {
      console.log('changed');
      console.log(this.model);
    }
  }
};
</script>

<style>
.ck-editor__editable_inline {
  /* Height of editor text box */
  min-height: 500px;
}

.editorError {
  color: #FF5252 !important;
  margin-top: 10px;
}
</style>
