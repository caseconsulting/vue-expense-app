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
    <v-btn to="/blog" color="white" class="ma-2"> <icon class="mr-1" name="ban"></icon>Cancel </v-btn>
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
        :mainPicture="model.mainPicture"
        customLabel="Select Main Picture"
      ></file-upload>
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
    <div cols="12">
      <ckeditor :editor="editor" v-model="editorData" :config="editorConfig" @ready="onEditorReady"></ckeditor>
    </div>
    <!-- Cancel Button -->
    <v-btn to="/blog" color="white" class="ma-2"> <icon class="mr-1" name="ban"></icon>Cancel </v-btn>

    <!-- Submit Button -->
    <v-btn outlined @click="checkSubmit" color="success" class="ma-2">
      <icon class="mr-1" name="save"></icon>Submit</v-btn
    >
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

async function created() {
  window.EventBus.$on('confirmed', () => {
    this.confirming = false;
    this.checkSubmit();
  });

  window.EventBus.$on('canceled', () => {
    this.confirming = false;
  });

  this.user = await api.getUser();
  console.log(this.user);
  this.posts = await api.getItems(api.BLOG);
  if (this.$route.params.id != 0) {
    console.log('in here');
    this.model = _.find(this.posts, (post) => {
      return post.id == this.$route.params.id;
    });
    //this is probably not needed later TODO: remove later
    if (!this.model) {
      this.model = _.find(this.posts, (post) => {
        return post.blogNumber == this.$route.params.id;
      });
    }
    console.log('before getting blog');
    let blogFile = await api.getBlogFile(this.model.authorId, this.model.id);
    this.mainPictureFile = await api.getBlogFile(this.model.authorId, this.model.id, this.model.mainPicture);
    blogFile = removeMetaData(blogFile);
    this.editorData = blogFile;
    this.editing = true;
  }
  console.log(this.posts);
  this.tags = _.flatten(
    _.map(this.posts, (post) => {
      return post.tags;
    })
  );
  console.log(this.tags);
}

async function checkSubmit() {
  //check to see if there is any data
  if (this.$refs.form.validate() && !isEmpty(this.editorData)) {
    console.log(this.editorData);
    //TODO: first send data through moderation.
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
      //TODO: some success message popup
      console.log('submitted');
      let metaData = await createMetaData(this.model);
      //generate md file and upload it to s3
      let file = new Blob([metaData, this.editorData], { type: 'text/markdown' });
      console.log(file);
      //upload file
      let fileSubmit = await api.createBlogFile(blogPost, file, blogPost.fileName);
      console.log(fileSubmit);

      //upload picture
      let pictureSubmit = await api.createBlogFile(blogPost, this.mainPictureFile, blogPost.mainPicture);
      console.log(pictureSubmit);
      this.clearForm();
    } else {
      //TODO: failure message
      console.log('issue');
      this.model.id = null;
      console.log(blogPost.response.data.message);
    }
  } else {
    //nothing to submit
    this.displayError('Blog could not be submitted');
    console.log('nothing in the box');
  }
} // checkSubmit

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
  //TODO: description? image?
  return metaData;
}

function onEditorReady(editor) {
  console.log('Editor is ready.', { editor });
}

function removeMetaData(post) {
  let firstIndex = post.indexOf('---');
  let secondIndex = post.indexOf('---', 2);
  if (firstIndex == -1 || secondIndex == -1) {
    return post;
  } else {
    console.log('removing metaData');
    return post.substring(secondIndex + 3);
  }
} // removeMetaData

function clearForm() {
  this.$set(this.model, 'id', '');
  this.$refs.form.reset();
  this.$set(this.model, 'blogNumber', 0);
  this.$set(this.model, 'authorId', '');
  this.$set(this.model, 'createDate', '');
  this.$set(this.model, 'lastModifiedDate', '');
  this.$set(this.model, 'fileName', '');
  this.$set(this.model, 'tags', []);
  this.editorData = '';
  if (this.editing) {
    this.editing = false;
    this.$router.push('/postEditor/0');
  }
} // clearForm

function createBlogNumber() {
  let highestNumber = 0;
  _.forEach(this.posts, (post) => {
    if (post.blogNumber) {
      //if it has a number !!!! this is temporary TODO: remove
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
 * Sets the file.
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
    this.model = null;
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
      descriptionRules: [
        (v) => !isEmpty(v) || 'Description is a required field',
        (v) => (!isEmpty(v) && v.replace(/\s/g, '').length > 0) || 'Description is a required field'
      ], // rules for description
      mainPictureRules: [(v) => !isEmpty(v) || 'mainPicture is required'], // rules for mainPicture
      model: {
        id: '',
        blogNumber: 0,
        title: '',
        mainPicture: '',
        authorId: '',
        description: '',
        createDate: '',
        lastModifiedDate: '',
        fileName: '',
        tags: []
      },
      valid: false,
      tags: [], //TODO: maybe prepopulate blog post tags from original posts
      posts: null,
      editing: false,
      categories: ['Case News', 'Case Cares'],
      mainPictureFile: null,
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      }, // snackbar action status
      confirming: false
    };
  },
  methods: {
    checkSubmit,
    clearForm,
    onEditorReady,
    removeMetaData,
    createBlogNumber,
    setFile,
    clearStatus,
    displayError
  }
};
</script>

<style>
.ck-editor__editable_inline {
  min-height: 500px;
}
</style>
