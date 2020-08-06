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
      <v-col cols="12" md="6" lg="6">
        <pending-post-table :pendingPosts="pendingPosts" :model="model"></pending-post-table>
        <post-table :posts="posts" v-on:edit="onSelect"></post-table>
      </v-col>
      <v-col cols="12" md="6" lg="6">
        <post-editor :blogPost="blogPost"></post-editor>
      </v-col>
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
import PendingPostTable from '@/components/PendingPostTable.vue';
import PostTable from '@/components/PostTable.vue';
import PostEditor from '@/components/PostEditor.vue';
import _ from 'lodash';

function acceptedFileTypes() {
  return ['jpg', 'png'].join(',');
} // acceptedFileTypes

async function created() {
  this.posts = [
    {
      postId: '1',
      title: 'ahhhhhhhh',
      text: 'i dont know, whats another word for stuff',
      employeeName: 'Pablo',
      employeeId: '1',
      createDate: '12/02/2019'
    },
    {
      postId: '2',
      title: 'nooooooo',
      text: 'other?',
      employeeName: 'Helen',
      employeeId: '2',
      createDate: '1/23/2019'
    },
    {
      postId: '3',
      title: 'whyyyyy',
      text: 'items',
      employeeName: 'Diego',
      employeeId: '3',
      createDate: '4/02/2019'
    },
    {
      postId: '4',
      title: 'pleeeeasee',
      text: 'stuff',
      employeeName: 'Rachel',
      employeeId: '4',
      createDate: '3/02/2019'
    },
    {
      postId: '5',
      title: 'wooooork',
      text: 'things',
      employeeName: 'Zertash',
      employeeId: '5',
      createDate: '10/02/2019'
    },
    {
      postId: '6',
      title: ':(',
      text: 'uhhhh',
      employeeName: 'Charles',
      employeeId: '6',
      createDate: '2/02/2019'
    }
  ];
  this.model.id = '4';
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
    PendingPostTable,
    PostTable,
    PostEditor
  },
  created,
  data() {
    return {
      pendingPosts: [],
      posts: [],
      model: {},
      blogPost: '',
      inputFile: null,
      inputText: null
    };
  },
  methods: {
    acceptedFileTypes,
    comprehend,
    rekognition,
    splitInputText,
    uploadToS3,
    onSelect
  }
};
</script>
<style lang="scss">
.paddingTop {
  padding-top: 20px;
}
</style>
