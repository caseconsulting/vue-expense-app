<template>
  <v-row>
    <!-- Status Alert -->
    <v-col cols="12">
      <v-card>
        <v-container fluid>
          <!-- Title -->
          <v-card-title>
            <h2>Blog Posts</h2>
            <v-spacer></v-spacer>
            <v-text-field v-model="search" append-icon="search" label="Search" single-line hide-details></v-text-field>
          </v-card-title>
          <!-- Employee Datatable-->
          <v-data-table
            :headers="headers"
            :items="posts"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
            :expanded.sync="expanded"
            :loading="loading"
            :items-per-page.sync="itemsPerPage"
            :search="search"
            @click:row="handlePreview"
            item-key="id"
            class="elevation-1 text-center"
          >
            <!-- Title  slot -->
            <template v-slot:[`item.title`]="{ item }">
              <td>{{ item.title }}</td>
            </template>

            <!-- Employee  slot -->
            <template v-slot:[`item.employeeName`]="{ item }">
              <td>{{ item.employeeName }}</td>
            </template>

            <!-- Date  slot -->
            <template v-slot:[`item.createDate`]="{ item }">
              <td>{{ monthDayYearFormat(item.createDate) }}</td>
            </template>

            <!-- Action Icons -->
            <!-- Actions -->
            <template v-slot:[`item.actions`]="{ item }">
              <td class="datatable_btn layout" @click="handlePreview(item)">
                <!-- Edit Button -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn :disabled="midAction" text icon @click.stop="handleEdit(item)" v-on="on">
                      <v-icon style="color: #606060">edit</v-icon>
                    </v-btn>
                  </template>
                  <span>Edit</span>
                </v-tooltip>
                <!-- Delete Button -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      :disabled="midAction"
                      text
                      icon
                      @click.stop="
                        deleting = !deleting;
                        midAction = true;
                        propBlogPost = item;
                      "
                      v-on="on"
                    >
                      <v-icon style="color: #606060"> delete </v-icon>
                    </v-btn>
                  </template>
                  <span>Delete</span>
                </v-tooltip>
              </td>
            </template>

            <!-- Alert for no search results -->
            <v-alert slot="no-results" :value="true" color="error" icon="warning"
              >Your search for "{{ search }}" found no results.</v-alert
            >
            <!-- End alert for no search results -->
          </v-data-table>
          <!-- End employee datatable -->
          <br />
          <delete-modal :toggleDeleteModal="deleting" :type="'BlogPost'"></delete-modal>
        </v-container>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
// import _ from 'lodash';
import { isEmpty, monthDayYearFormat } from '@/utils/utils';
import DeleteModal from '@/components/modals/DeleteModal.vue';
import moment from 'moment-timezone';
moment.tz.setDefault('America/New_York');
import api from '@/shared/api.js';

/**
 * initial setup
 */
async function created() {
  window.EventBus.$on('canceled-delete-BlogPost', () => {
    this.midAction = false;
  });
  window.EventBus.$on('confirm-delete-BlogPost', this.deleteBlogPost);
} // created

/**
 * Get path to post editor for edit
 *
 * @param item - selected item from table
 * @return - returns blog path to post editor to edit
 */
function blogPath(item) {
  if (item.blogNumber) {
    return `/postEditor/${item.blogNumber}`; //this is legacy set up
  }
  return `/postEditor/${item.id}`;
} // blogPath

/**
 * Get path to post previewer
 *
 * @param item - selected item from table
 * @return - returns blog path to post preview
 */
function previewPath(item) {
  return `/blogPreview/${item.blogNumber}`;
}

/**
 * redirect to post editor for edit
 *
 * @param item - selected item from table
 */
function handleEdit(item) {
  this.$router.push(blogPath(item));
} //handleEdit

/**
 * redirect to post preview
 *
 * @param item - selected item from table
 */
function handlePreview(item) {
  this.$router.push(previewPath(item));
} // handle preview

/**
 * delete blog post and files
 */
async function deleteBlogPost() {
  if (this.propBlogPost.id) {
    // blogPost is selected
    let deleted = await api.deleteItem(api.BLOG, this.propBlogPost.id);
    if (deleted.id) {
      // successfully deletes blogPost
      this.$emit('successfulDelete');
      // delete attachment from s3 if deleted expense has a receipt
      let deletedBlogFile = await api.deleteBlogFile(deleted);
      if (deletedBlogFile.code) {
        // emit alert if error deleting file
        this.$emit('displayError', `Error Deleting Blog Post: ${deletedBlogFile.message}`);
      }
    } else {
      // fails to delete expense
      this.$emit('displayError', 'Error Deleting Blog Post');
    }
    this.midAction = false;
  }
} // deletedBlogPost

export default {
  props: ['posts', 'model'],
  components: {
    DeleteModal
  },
  created,
  beforeDestroy() {
    window.EventBus.$off('canceled-delete-BlogPost');
    window.EventBus.$off('confirm-delete-BlogPost');
  },
  methods: {
    isEmpty,
    blogPath,
    handleEdit,
    handlePreview,
    deleteBlogPost,
    monthDayYearFormat
  },
  data() {
    return {
      employees: [],
      headers: [
        {
          text: 'Title',
          value: 'title'
        },
        {
          text: 'Employee',
          value: 'employeeName'
        },
        {
          text: 'Date',
          value: 'createDate'
        },
        {
          value: 'actions',
          sortable: false
        }
      ], // datatable headers
      sortBy: 'employeeName', // sort datatable items
      sortDesc: false, // sort datatable items
      expanded: [], //expanded blog post
      itemsPerPage: -1,
      search: '', // query text for datatable search field
      loading: false,
      midAction: false,
      deleting: false,
      propBlogPost: null
    };
  },
  filters: {
    birthdayFeedResponse: (value) => {
      if (value == true) {
        return 'yes';
      } else {
        return 'no';
      }
    }
  }
};
</script>
