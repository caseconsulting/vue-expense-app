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
            item-key="postId"
            class="elevation-1"
          >
            <!-- Rows in datatable -->
            <template v-slot:item="{ item }">
              <tr :class="{ selectFocus: isFocus(item) }" @click="clickedRow(item)">
                <!-- Employee Information -->
                <td>{{ item.title }}</td>
                <td>{{ item.employeeName }}</td>
                <td>{{ item.createDate | dateFormat }}</td>

                <!-- Action Icons -->
                <td class="datatable_btn layout" v-if="userIsBlogger()" @click="clickedRow(item)">
                  <!-- Edit Button -->
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn :disabled="isEditing() || midAction" text icon @click="onSelect(item)" v-on="on">
                        <v-icon style="color: #606060;">
                          edit
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>Edit</span>
                  </v-tooltip>
                </td>
                <!-- End Action Icons -->
              </tr>
            </template>
            <!-- End rows in datatable -->

            <!-- Expanded slot in datatable -->
            <template v-slot:expanded-item="{ headers, item }">
              <td :colspan="headers.length" class="pa-0">
                <v-card text>
                  <v-card-text>
                    <div class="expandedInfo" v-if="!isDisplayData(item)">
                      <p>No additional data</p>
                    </div>
                    <div class="expandedInfo" v-else>
                      <p>{{ item.text }}</p>
                    </div>
                  </v-card-text>
                </v-card>
              </td>
            </template>
            <!-- End expanded slot in datatable -->

            <!-- Alert for no search results -->
            <v-alert slot="no-results" :value="true" color="error" icon="warning">
              Your search for "{{ search }}" found no results.
            </v-alert>
            <!-- End alert for no search results -->
          </v-data-table>
          <!-- End employee datatable -->
          <br />
        </v-container>
      </v-card>
    </v-col>
  </v-row>
</template>
<script>
import _ from 'lodash';
import moment from 'moment';
async function created() {
  this.constructAutoComplete(this.pendingPosts);
}

/**
 * add text to expanded row when clicked.
 *
 * @param value - employee to add
 */
function clickedRow(value) {
  if (_.isEmpty(this.expanded) || this.expanded[0].postId != value.postId) {
    // expand the selected employee if the selected employee not already expanded
    this.expanded = [];
    this.expanded.push(value);
  } else {
    // collapse the employee if the selected employee is already expanded
    this.expanded = [];
  }
} // clickedRow

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
 * Checks if a value is empty. Returns true if the value is null or a single character space String.
 *
 * @param value - value to check
 * @return boolean - value is empty
 */
function isEmpty(value) {
  return value == null || value === ' ' || value === '';
} // isEmpty

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
/**
 * Checks to see if the user is an admin. Returns true if the user's role is an admin, otherwise returns false.
 */
function userIsBlogger() {
  //TODO: make this thing
  return true;
} // userIsBlogger

export default {
  props: ['posts', 'model'],
  created,
  methods: {
    clickedRow,
    constructAutoComplete,
    isDisplayData,
    isEditing,
    isEmpty,
    isFocus,
    userIsBlogger,
    onSelect
  },
  data() {
    return {
      employees: [],
      headers: [
        {
          text: 'Title',
          value: 'title',
          align: 'center'
        },
        {
          text: 'Employee',
          value: 'employeeName',
          align: 'center'
        },
        {
          text: 'Date',
          value: 'createDate',
          align: 'center'
        }
      ], // datatable headers
      sortBy: 'employeeName', // sort datatable items
      sortDesc: false, // sort datatable items
      expanded: [], //expanded blog post
      itemsPerPage: -1,
      search: '', // query text for datatable search field
      loading: false,
      midAction: false
    };
  },
  filters: {
    // formats a date by month, day, year (e.g. Aug 18th, 2020)
    dateFormat: (value) => {
      if (!isEmpty(value)) {
        let date = moment(new Date(value)).format('MMM Do, YYYY');
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
    }
  }
};
</script>
