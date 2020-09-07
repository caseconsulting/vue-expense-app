<template>
  <v-container>
    <!-- Return button -->
    <v-btn class="mb-5" to="/blog"> Return to Blog Page</v-btn>
    <div class="w3-display-container">
      <!-- title -->
      <h1 class="blogTitle">{{ this.metaData.title }}</h1>
      <!-- main image -->
      <img class="mainImage" :src="model.mainPicture" />
    </div>
    <div class="content">
      <p class="meta" style="font-size: 15px; padding-top: 5px;">
        <br />
        <!-- category -->
        <span>{{ this.model.category }}</span>
        <br />By
        <!-- author -->
        <span style="color: tomato;">{{ this.metaData.author }}</span>
        ◆
        <!-- date -->
        {{ this.metaData.date }}
      </p>
      <!-- blog content -->
      <p><span class="ck-content" v-html="this.textContent"></span></p>
      <br />
      <br />
      <!-- tags -->
      <div row class="tagsScroll">
        <span v-for="(tag, index) in model.tags" :key="index"># {{ tag }}</span>
      </div>
    </div>
  </v-container>
</template>

<script>
import _ from 'lodash';
import api from '@/shared/api.js';

/**
 * Inital setup
 */
async function created() {
  //get blog post and file
  this.posts = await api.getItems(api.BLOG);
  let blogPost = _.find(this.posts, (post) => {
    return post.blogNumber == this.$route.params.id;
  });
  this.model = blogPost;
  let fileContent = await api.getBlogFile(this.model.authorId, this.model.id);
  let pictureObject = await api.getPictureFile(this.model.authorId, this.model.id, this.model.mainPicture);
  this.model.mainPicture = `data:${pictureObject.file.ContentType};base64,` + pictureObject.data;
  let metaData = this.extractMetaData(fileContent);
  _.forEach(metaData, (metaDatum) => {
    let data = metaDatum.split(': ');
    let key = data[0].toLowerCase();
    let value = data[1];
    this.metaData[key] = value;
  });
  if (this.metaData.tags && this.metaData.tags != '') {
    this.metaData.tags = this.metaData.tags.split(',');
  }
  this.textContent = this.extractTextContent(fileContent);
} // created

/**
 * Remove text content and return an array of metadata
 *
 * @param fileContent - all blog file content
 * @return - returns metaDAta array
 */
function extractMetaData(fileContent) {
  let firstIndex = fileContent.indexOf('---');
  let secondIndex = fileContent.indexOf('---', 2);

  let metaData = fileContent.substring(firstIndex + 3, secondIndex);
  let imageIndex = metaData.indexOf('\ntitle:');
  this.imageData = metaData.substring(0, imageIndex);
  metaData = metaData.substring(imageIndex);
  let splitData = metaData.split('\n');
  return splitData;
} // extractMetaData

/**
 * Remove metaData and return blog Content
 *
 * @param fileContent - all blog file content
 * @return - returns blog content
 */
function extractTextContent(fileContent) {
  let firstIndex = fileContent.indexOf('---');
  let secondIndex = fileContent.indexOf('---', 2);
  if (firstIndex == -1 || secondIndex == -1) {
    return fileContent;
  } else {
    return fileContent.substring(secondIndex + 3);
  }
} // extractTextContent

export default {
  data() {
    return {
      model: {
        id: '',
        blogNumber: 0,
        title: '',
        mainPicture: null,
        authorId: '',
        category: '',
        createDate: '',
        lastModifiedDate: '',
        fileName: '',
        tags: []
      },
      metaData: {},
      posts: null,
      textContent: '',
      imageData: ''
    };
  },
  methods: {
    extractMetaData,
    extractTextContent
  },
  created
};
</script>
<style lang="stylus">
.filterUnderline {
  border-bottom: 3px solid #e74c3c;
}

.home {
  padding-top: 20px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  max-width: 435px !important;
}

.post {
  margin-top: 30px;
  border: 1px solid #eee;
  box-shadow: 0 2px 3px #ccc;
  background-color: white;
}

.blogTitle {
  text-align: center;
  font-size: 40px;
  font-family: inherit;
  color: #333;
  padding-top: 30px;
  padding-bottom: 30px;
}

.description {
  font-size: 14px;
  color: #333;
  font-family: inherit;
}

.meta {
  font-size: 12px;
  color: #464646;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.25rem;
}

.tagsScroll {
  display: inline-flex;
  flex-direction: row;
  overflow: auto;
  white-space: nowrap;
}

.tagsScroll::-webkit-scrollbar {
  display: none;
}

.tagsScroll span {
  margin-right: 10px;
  color: #ccc;
  font-size: 14px;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.tagsScroll span:hover {
  color: gray;
  text-decoration: none;
}

.w3-display-container {
  padding-top: 20px;
  padding-left: 20px;
  padding-right: 20px;
  position: relative;
  width: 100%;
}


@media (pointer: fine) {
  .w3-display-hover {
    display: none;
  }

  .w3-display-container:hover .w3-display-hover {
    display: block;
  }

  .w3-display-container:hover {
    display: inline-block;
  }

  .posts :hover {
    box-shadow: 0 2px 5px gray;
  }

  .post :hover {
    box-shadow: none;
    text-decoration: none;
  }
}

.w3-display-topright {
  position: absolute;
  margin-right: 20px;
  margin-top: 6px;
  right: 0;
  top: 0;
}

.w3-display-topright p {
  line-height: 0;
  font-size: 13px;
  color: gray;
}

.tagsHome {
  padding-bottom: 20px;
}

.content {
  width: 80%;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.mainImage {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  max-width: 650px;
}

.postPage {
  margin-top: 80px;
}

.arrow-nav {
  margin-left: auto;
  margin-right: auto;
  width: 90%;
  cursor: pointer;
}

.nav-form .form-group {
  transition: all 0.35s, border-radius 0s;
  width: 0;
  height: 28px;
}

.right .nav-form .form-group {
  float: right;
  padding-right: 40px;
}

.nav-form .form-group p.form-control {
  border: none;
  height: 100%;
  background: transparent;
  box-shadow: none;
  overflow: hidden;
  white-space: nowrap;
  font-size: 14px;
  text-align: right;
  color: black;
  display: none;
}

.nav-form .form-group p.form-control::-webkit-input-placeholder {
  display: none;
}

.nav-form .form-group p.form-control::-moz-placeholder {
  display: none;
}

.right .nav-form .form-group p.form-control {
  text-align: right;
}

.left .nav-form .form-group p.form-control {
  text-align: left;
}

.nav-form .form-group p.form-control:-moz-placeholder {
  display: none;
}

.nav-form .form-group p.form-control:-ms-input-placeholder {
  display: none;
}

.nav-form .form-group:hover,
.nav-form .form-group.hover {
  width: 100%;
}

.right .nav-form .form-group:hover p.form-control,
.right .nav-form .form-group.hover p.form-control {
  display: inline-block;
  padding-right: 0;
}

.left .nav-form .form-group:hover p.form-control,
.left .nav-form .form-group.hover p.form-control {
  display: inline-block;
  padding-left: 40px;
}

.nav-form .form-group span.form-control-feedback {
  position: absolute;
  top: 0;
  display: block;
  color: firebrick;
  font-size: 50px;
}

.right .form-control-feedback {
  right: 16px;
  left: auto;
}

.left .form-control-feedback {
  left: 0;
  right: auto;
}

/*
 * CKEditor 5 (v22.0.0) content styles.
 * Generated on Thu, 27 Aug 2020 12:13:06 GMT.
 * For more information, check out https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/content-styles.html
 */

:root {
  --ck-color-mention-background: hsla(341, 100%, 30%, 0.1);
  --ck-color-mention-text: hsl(341, 100%, 30%);
  --ck-highlight-marker-blue: hsl(201, 97%, 72%);
  --ck-highlight-marker-green: hsl(120, 93%, 68%);
  --ck-highlight-marker-pink: hsl(345, 96%, 73%);
  --ck-highlight-marker-yellow: hsl(60, 97%, 73%);
  --ck-highlight-pen-green: hsl(112, 100%, 27%);
  --ck-highlight-pen-red: hsl(0, 85%, 49%);
  --ck-image-style-spacing: 1.5em;
  --ck-todo-list-checkmark-size: 16px;
}


.ck-content .marker-yellow {
  background-color: var(--ck-highlight-marker-yellow);
}

.ck-content .marker-green {
  background-color: var(--ck-highlight-marker-green);
}

.ck-content .marker-pink {
  background-color: var(--ck-highlight-marker-pink);
}

.ck-content .marker-blue {
  background-color: var(--ck-highlight-marker-blue);
}

.ck-content .pen-red {
  color: var(--ck-highlight-pen-red);
  background-color: transparent;
}

.ck-content .pen-green {
  color: var(--ck-highlight-pen-green);
  background-color: transparent;
}

.ck-content .image-style-side {
  float: right;
  margin-left: var(--ck-image-style-spacing);
  max-width: 50%;
}

.ck-content .image-style-align-left {
  float: left;
  margin-right: var(--ck-image-style-spacing);
}

.ck-content .image-style-align-center {
  margin-left: auto;
  margin-right: auto;
}

.ck-content .image-style-align-right {
  float: right;
  margin-left: var(--ck-image-style-spacing);
}

.ck-content .image {
  display: table;
  clear: both;
  text-align: center;
  margin: 1em auto;
}

.ck-content .image img {
  display: block;
  margin: 0 auto;
  max-width: 100%;
  min-width: 50px;
}

.ck-content .image > figcaption {
  display: table-caption;
  caption-side: bottom;
  word-break: break-word;
  color: hsl(0, 0%, 20%);
  background-color: hsl(0, 0%, 97%);
  padding: 0.6em;
  font-size: 0.75em;
  outline-offset: -1px;
}

.ck-content .image.image_resized {
  max-width: 100%;
  display: block;
  box-sizing: border-box;
}

.ck-content .image.image_resized img {
  width: 100%;
}

.ck-content .image.image_resized > figcaption {
  display: block;
}

.ck-content code {
  background-color: hsla(0, 0%, 78%, 0.3);
  padding: 0.15em;
  border-radius: 2px;
}

.ck-content .text-tiny {
  font-size: 0.7em;
}

.ck-content .text-small {
  font-size: 0.85em;
}

.ck-content .text-big {
  font-size: 1.4em;
}

.ck-content .text-huge {
  font-size: 1.8em;
}

.ck-content blockquote {
  overflow: hidden;
  padding-right: 1.5em;
  padding-left: 1.5em;
  margin-left: 0;
  margin-right: 0;
  font-style: italic;
  border-left: solid 5px hsl(0, 0%, 80%);
}

.ck-content[dir="rtl"] blockquote {
  border-left: 0;
  border-right: solid 5px hsl(0, 0%, 80%);
}

.ck-content .table {
  margin: 1em auto;
  display: table;
}

.ck-content .table table {
  border-collapse: collapse;
  border-spacing: 0;
  width: 100%;
  height: 100%;
  border: 1px double hsl(0, 0%, 70%);
}

.ck-content .table table td,
.ck-content .table table th {
  min-width: 2em;
  padding: 0.4em;
  border: 1px solid hsl(0, 0%, 75%);
}

.ck-content .table table th {
  font-weight: bold;
  background: hsla(0, 0%, 0%, 5%);
}

.ck-content[dir="rtl"] .table th {
  text-align: right;
}

.ck-content[dir="ltr"] .table th {
  text-align: left;
}

.ck-content .page-break {
  position: relative;
  clear: both;
  padding: 5px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ck-content .page-break::after {
  content: '';
  position: absolute;
  border-bottom: 2px dashed hsl(0, 0%, 77%);
  width: 100%;
}

.ck-content .page-break__label {
  position: relative;
  z-index: 1;
  padding: 0.3em 0.6em;
  display: block;
  text-transform: uppercase;
  border: 1px solid hsl(0, 0%, 77%);
  border-radius: 2px;
  font-family: Helvetica, Arial, Tahoma, Verdana, sans-serif;
  font-size: 0.75em;
  font-weight: bold;
  color: hsl(0, 0%, 20%);
  background: hsl(0, 0%, 100%);
  box-shadow: 2px 2px 1px hsla(0, 0%, 0%, 0.15);
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.ck-content .media {
  clear: both;
  margin: 1em 0;
  display: block;
  min-width: 15em;
}

.ck-content .todo-list {
  list-style: none;
}

.ck-content .todo-list li {
  margin-bottom: 5px;
}

.ck-content .todo-list li .todo-list {
  margin-top: 5px;
}

.ck-content .todo-list .todo-list__label > input {
  -webkit-appearance: none;
  display: inline-block;
  position: relative;
  width: var(--ck-todo-list-checkmark-size);
  height: var(--ck-todo-list-checkmark-size);
  vertical-align: middle;
  border: 0;
  left: -25px;
  margin-right: -15px;
  right: 0;
  margin-left: 0;
}

.ck-content .todo-list .todo-list__label > input::before {
  display: block;
  position: absolute;
  box-sizing: border-box;
  content: '';
  width: 100%;
  height: 100%;
  border: 1px solid hsl(0, 0%, 20%);
  border-radius: 2px;
  transition: 250ms ease-in-out box-shadow, 250ms ease-in-out background, 250ms ease-in-out border;
}

.ck-content .todo-list .todo-list__label > input::after {
  display: block;
  position: absolute;
  box-sizing: content-box;
  pointer-events: none;
  content: '';
  left: calc(var(--ck-todo-list-checkmark-size) / 3);
  top: calc(var(--ck-todo-list-checkmark-size) / 5.3);
  width: calc(var(--ck-todo-list-checkmark-size) / 5.3);
  height: calc(var(--ck-todo-list-checkmark-size) / 2.6);
  border-style: solid;
  border-color: transparent;
  border-width: 0 calc(var(--ck-todo-list-checkmark-size) / 8) calc(var(--ck-todo-list-checkmark-size) / 8) 0;
  transform: rotate(45deg);
}

.ck-content .todo-list .todo-list__label > input[checked]::before {
  background: hsl(126, 64%, 41%);
  border-color: hsl(126, 64%, 41%);
}

.ck-content .todo-list .todo-list__label > input[checked]::after {
  border-color: hsl(0, 0%, 100%);
}

.ck-content .todo-list .todo-list__label .todo-list__label__description {
  vertical-align: middle;
}

.ck-content hr {
  margin: 15px 0;
  height: 4px;
  background: hsl(0, 0%, 87%);
  border: 0;
}

.ck-content pre {
  padding: 1em;
  color: hsl(0, 0%, 20.8%);
  background: hsla(0, 0%, 78%, 0.3);
  border: 1px solid hsl(0, 0%, 77%);
  border-radius: 2px;
  text-align: left;
  direction: ltr;
  tab-size: 4;
  white-space: pre-wrap;
  font-style: normal;
  min-width: 200px;
}

.ck-content pre code {
  background: unset;
  padding: 0;
  border-radius: 0;
}

.ck-content .mention {
  background: var(--ck-color-mention-background);
  color: var(--ck-color-mention-text);
}

@media print {
  .ck-content .page-break {
    padding: 0;
  }

  .ck-content .page-break::after {
    display: none;
  }
}
</style>
