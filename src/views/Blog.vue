<template>
  <v-container>
    <!-- Alert snackbar -->
    <!-- <v-snackbar
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
    </v-snackbar>-->
    <!-- title -->
    <v-row>
      <v-flex>Some title thing</v-flex>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-btn class="mb-5" to="/postEditor/0"> Create a New Blog Post<v-icon class="pl-2">person_add</v-icon> </v-btn>
        <post-table :posts="posts" v-on:edit="onSelect"></post-table>
      </v-col>
      <!-- <v-col cols="12" md="6" lg="6">
        <post-editor :blogPost="blogPost"></post-editor>
      </v-col> -->
    </v-row>
    <v-row>
      <v-file-input
        style="width: 50px;"
        v-model="inputFile"
        label="Select image to rekognize"
        :accept="acceptedFileTypes"
      ></v-file-input>
    </v-row>
    <v-row>
      <v-btn @click="rekognition()">Rekognition</v-btn>
    </v-row>
    <v-row class="paddingTop">
      <v-textarea filled label="Enter text to comprehend" v-model="inputText"></v-textarea>
    </v-row>
    <v-row>
      <v-btn @click="comprehend()">comprehend</v-btn>
    </v-row>
  </v-container>
</template>
<script>
import api from '@/shared/api.js';
//import moment from 'moment';
import PostTable from '@/components/PostTable.vue';
// import PostEditor from '@/components/PostEditor.vue';
import _ from 'lodash';
import { getRole } from '@/utils/auth';

function acceptedFileTypes() {
  return ['jpg', 'png'].join(',');
} // acceptedFileTypes

/**
 * Checks if the employee is a user. Returns true if the employee is a user, otherwise returns false.
 *
 * @return boolean - employee is a user
 */
function isUser() {
  return this.employeeRole === 'user';
} // isUser

/**
 * Checks if the employee is an admin. Returns true if the employee is an admin, otherwise returns false.
 *
 * @return boolean - employee is an admin
 */
function isAdmin() {
  return this.employeeRole === 'admin';
} // isAdmin

async function created() {
  this.posts = await api.getItems(api.BLOG);
  console.log(this.posts);
  this.employeeRole = getRole();
  if (isAdmin) {
    //get all employee's data and match posts to it.
    //TODO: add title as field in blogPosts
    this.employees = await api.getItems(api.EMPLOYEES);
    this.posts = _.map(this.posts, (post) => {
      let employee = _.find(this.employees, (employee) => {
        return post.authorId == employee.id;
      });
      post.employeeName = `${employee.firstName} ${employee.lastName}`;
      post.title = 'testTitle';
      return post;
    });
  } else {
    //get only this user's data
    this.userInfo = await api.getUser();
    this.posts = _.map(this.posts, (post) => {
      if (post.id != this.userInfo.id) {
        return null;
      }
      post.employeeName = `${this.userInfo.firstName} ${this.userInfo.lastName}`;
      post.title = 'testTitle';
      return post;
    });
    this.posts = _.compact(this.posts);
  }
}

/**
 * Store the attributes of a selected blog post.
 *
 * @param item - expense selected
 */
function onSelect(item) {
  this.blogPost = _.cloneDeep(item.text);
} // onSelect

async function uploadToS3() {
  await api.uploadBlogAttachment(this.inputFile);
}

async function rekognition() {
  await this.uploadToS3();
  let result = await api.getModerationLabel(this.inputFile.name);
  console.log(result);
}

async function comprehend() {
  let arr = this.splitInputText();
  for (let i = 0; i < arr.length; i++) {
    let result = await api.getKeyPhrases({ inputText: arr[i] });
    console.log(result);
  }
}

function splitInputText() {
  let strArr = [];
  if (this.inputText.length > 5000) {
    let currOffset = 0;
    while (currOffset < this.inputText.length) {
      let start = currOffset;
      currOffset += 5000 % this.inputText.length;
      strArr.push(this.inputText.substring(start, currOffset));
    }
    return strArr;
  } else {
    return [this.inputText];
  }
}
export default {
  components: {
    PostTable
    // PostEditor
  },
  created,
  data() {
    return {
      pendingPosts: [],
      posts: [],
      model: {},
      blogPost: '',
      inputFile: null,
      inputText: null,
      employees: null,
      userInfo: null
    };
  },
  methods: {
    acceptedFileTypes,
    comprehend,
    rekognition,
    splitInputText,
    uploadToS3,
    onSelect,
    isUser,
    isAdmin
  }
};
</script>
<style lang="scss">
.paddingTop {
  padding-top: 20px;
}
</style>
