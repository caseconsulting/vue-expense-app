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
            @click:row="handleClick"
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
              <td>{{ item.createDate | dateFormat }}</td>
            </template>

            <!-- Action Icons -->
            <!-- Actions -->
            <template v-slot:[`item.actions`]="{ item }">
              <td class="datatable_btn layout" @click="handleClick(item)">
                <!-- Edit Button -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn :disabled="isEditing() || midAction" text icon @click.stop="onSelect(item)" v-on="on">
                      <v-icon style="color: #606060;">edit</v-icon>
                    </v-btn>
                  </template>
                  <span>Edit</span>
                </v-tooltip>
                <!-- Delete Button -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      :disabled="isEditing() || midAction"
                      text
                      icon
                      @click.stop="
                        deleting = true;
                        midAction = true;
                        propBlogPost = item;
                      "
                      v-on="on"
                    >
                      <v-icon style="color: #606060;">
                        delete
                      </v-icon>
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
          <delete-modal :activate="deleting" :type="'expense'"></delete-modal>
        </v-container>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import _ from 'lodash';
import { isEmpty, monthDayYearFormat } from '@/utils/utils';
import DeleteModal from '@/components/modals/DeleteModal.vue';
import moment from 'moment-timezone';
import api from '@/shared/api.js';

async function created() {
  this.constructAutoComplete(this.pendingPosts);
  window.EventBus.$on('canceled-delete-expense', () => {
    this.deleting = false;
    this.midAction = false;
  });
  window.EventBus.$on('confirm-delete-expense', this.deleteBlogPost);
}

/**
 * Constructs the auto complete lists for the employee and expense type filter.
 *
 * @param aggregatedData - expenses data
 */
function constructAutoComplete(aggregatedData) {
  // set employees
  this.employees = _.map(aggregatedData, (data) => {
    if (data && data.employeeName && data.employeeId) {
      return {
        text: data.employeeName,
        value: data.employeeId
      };
    }
  }).filter((data) => {
    return data != null;
  });
} // constructAutoComplete

/**
 * Checks if there is data about a post to display. Returns true if there is data to display
 *
 * @item item - post to check
 * @return boolean - post has data to display
 */
function isDisplayData(item) {
  //TODO: refactor for this component
  //   let valid =
  //     !this.userIsAdmin() &&
  //     this.isEmpty(item.prime) &&
  //     this.isEmpty(item.contract) &&
  //     this.isEmpty(item.jobRole) &&
  //     this.isEmpty(item.github) &&
  //     this.isEmpty(item.twitter);
  //   return valid;
  console.log(item);
  return true;
} // isDisplayData

/**
 * Checks if an employee is being edited.
 *
 * @return boolean - an employee is being edited
 */
function isEditing() {
  //TODO: refactor for this component
  return false;
} // isEditing

/**
 * Checks to see if an employee is expanded in the datatable.
 *
 * @param item - employee to check
 * @return boolean - the employee is expanded
 */
function isFocus(item) {
  let expanded = !_.isEmpty(this.expanded) && item.postId == this.expanded[0].postId;
  return expanded || false;
} // isFocus

function onSelect(item) {
  this.$emit('edit', item);
}

function blogPath(item) {
  return `/postEditor/${item.id}`;
}

function handleClick(item) {
  this.$router.push(blogPath(item));
} //handleClick

async function deleteBlogPost() {
  console.log('deleting');
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
        this.$emit('displayError', `Error Deleting Receipt: ${deletedBlogFile.message}`);
      }
    } else {
      // fails to delete expense
      this.$emit('displayError', 'Error Deleting Expense');
    }
    this.deleting = false;
    this.midAction = false;
  }
}

/**
 * Checks to see if the user is an admin. Returns true if the user's role is an admin, otherwise returns false.
 */
function userIsBlogger() {
  //TODO: make this thing
  return true;
} // userIsBlogger

export default {
  props: ['posts', 'model'],
  components: {
    DeleteModal
  },
  created,
  methods: {
    // clickedRow,
    constructAutoComplete,
    isDisplayData,
    isEditing,
    isEmpty,
    isFocus,
    userIsBlogger,
    onSelect,
    blogPath,
    handleClick,
    deleteBlogPost
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
    // formats a date by month, day, year (e.g. Aug 18th, 2020)
    dateFormat: (value) => {
      if (!isEmpty(value)) {
        let date = moment(value).format('MMM Do, YYYY');
        return date;
      } else {
        return '';
      }
    },
    birthdayFeedResponse: (value) => {
      if (value == true) {
        return 'yes';
      } else {
        return 'no';
      }
    },
    monthDayYearFormat
  }
};
</script>
