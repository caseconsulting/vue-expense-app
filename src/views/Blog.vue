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
      <v-col>
        <pending-post-table :pendingPosts="pendingPosts" :model="model"></pending-post-table>
        <post-table :posts="posts"></post-table>
      </v-col>
      <v-col>
        <post-editor></post-editor>
      </v-col>
    </v-row>
    <v-row>
      <v-btn @click="rekognition()">Rekognition</v-btn>
    </v-row>
    <v-row>
      <v-btn @click="comprehend()">comprehend</v-btn>
    </v-row>
  </v-container>
</template>
<script>
import api from '@/shared/api.js';
//import moment from 'moment';
import PendingPostTable from '../components/PendingPostTable.vue';
import PostTable from '../components/PostTable.vue';
import PostEditor from '../components/PostEditor.vue';

async function created() {
  this.posts = [
    {
      postId: '1',
      title: 'ahhhhhhhh',
      text: 'stuff',
      employeeName: 'Pablo',
      employeeId: '1',
      createDate: '12/02/2019'
    },
    {
      postId: '2',
      title: 'nooooooo',
      text: 'stuff',
      employeeName: 'Helen',
      employeeId: '2',
      createDate: '1/23/2019'
    },
    {
      postId: '3',
      title: 'whyyyyy',
      text: 'stuff',
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
      text: 'stuff',
      employeeName: 'Zertash',
      employeeId: '5',
      createDate: '10/02/2019'
    },
    {
      postId: '6',
      title: ':(',
      employeeName: 'Charles',
      employeeId: '6',
      createDate: '2/02/2019'
    }
  ];
  this.model.id = '4';
}
async function rekognition() {
  let result = await api.getModerationLabel();
  console.log(result);
}
async function comprehend() {
  let text = await api.getKeyPhrases();
  console.log(text);
}
//import _ from 'lodash';
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
      model: {}
    };
  },
  methods: {
    rekognition,
    comprehend
  }
};
</script>
