<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-row class="mb-4">
      <v-col cols="6">
        <!-- Create Tag -->
        <v-btn :disabled="creatingTag" @click="creatingTag = true">Create Tag <v-icon right>mdi-tag</v-icon></v-btn>
      </v-col>
      <v-col cols="6">
        <!-- Table Search Field -->
        <v-text-field
          id="tagSearch"
          v-model="search"
          append-icon="search"
          label="Search"
          class="ma-0 pa-0"
          single-line
          hide-details
        ></v-text-field>
      </v-col>
    </v-row>
    <v-data-table v-if="loading" :headers="headers" :items="[]" loading></v-data-table>
    <v-data-table
      v-else
      :headers="headers"
      :items="tags"
      :search="search"
      :custom-filter="tableFilter"
      item-key="id"
      mobile-breakpoint="800"
    >
      <!-- Tag Name Slot -->
      <template v-slot:[`item.tagName`]="{ item }">
        <v-text-field
          v-if="editedTag && item.id === editedTag.id"
          v-model="editedTag.tagName"
          :rules="[(v) => !!v || 'Field is required', duplicateTagName()]"
          :disabled="tagLoading"
          label="Tag Name*"
          single-line
          autofocus
        ></v-text-field>
        <span v-else>{{ item.tagName }} ({{ item.employees.length }})</span>
      </template>

      <!-- Employees Slot -->
      <template v-slot:[`item.employees`]="{ item }">
        <v-autocomplete
          v-if="editedTag && item.id === editedTag.id"
          v-model="editedTag.employees"
          :disabled="tagLoading"
          :items="filteredEmployees"
          :filter="customFilter"
          multiple
          chips
          clearable
          small-chips
          deletable-chips
          :search-input.sync="employeeSearch"
          @change="employeeSearch = ''"
          label="Employees (optional)"
          item-text="employeeName"
          item-value="id"
        ></v-autocomplete>
        <span v-else v-for="(emp, i) in getTagEmployees(item.employees)" :key="i">
          <a @click="$router.push(`/employee/${emp.employeeNumber}`)">{{ nicknameAndLastName(emp) }}</a>
          <span v-if="i != item.employees.length - 1">, </span>
        </span>
      </template>

      <!-- Action Items Slot -->
      <template v-slot:[`item.actions`]="{ item }">
        <div v-if="editedTag && item.id === editedTag.id">
          <!-- Save Edited Tag -->
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn :disabled="tagLoading" :loading="tagLoading" text icon @click="saveEditedTag" v-on="on">
                <v-icon>save</v-icon>
              </v-btn>
            </template>
            <span>Save</span>
          </v-tooltip>
          <!-- Cancel Edited Tag -->
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn :disabled="tagLoading" text icon @click="cancelEdit" v-on="on">
                <v-icon>cancel</v-icon>
              </v-btn>
            </template>
            <span>Cancel</span>
          </v-tooltip>
        </div>
        <div v-else>
          <!-- Edit Tag -->
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn :disabled="!!editedTag || tagLoading" text icon @click="editTag(item)" v-on="on">
                <v-icon>edit</v-icon>
              </v-btn>
            </template>
            <span>Edit</span>
          </v-tooltip>
          <!-- Delete Tag -->
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn
                :loading="tagLoading && !!deletedTag && deletedTag.id === item.id"
                :disabled="!!editedTag || tagLoading"
                text
                icon
                @click="deletedTag = item"
                v-on="on"
              >
                <v-icon>delete</v-icon>
              </v-btn>
            </template>
            <span>Delete</span>
          </v-tooltip>
        </div>
      </template>
    </v-data-table>
    <!-- Confirmation Modals -->
    <delete-modal :toggleDeleteModal="!!deletedTag" type="tag"></delete-modal>
  </v-form>
</template>

<script>
import _ from 'lodash';
import api from '@/shared/api';
import { generateUUID } from '@/utils/utils';
import { firstAndLastName, fullName, nicknameAndLastName } from '@/shared/employeeUtils';
import { getRequiredRules } from '@/shared/validationUtils';
import { updateStoreExpenseTypes, updateStoreTags } from '@/utils/storeUtils';

import DeleteModal from '@/components/modals/DeleteModal.vue';
import { AxiosError } from 'axios';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Created lifecycle hook
 */
async function created() {
  !this.$store.getters.tags ? await updateStoreTags() : _;
  this.tags = _.cloneDeep(this.$store.getters.tags);
  this.loading = false;
} // created

/**
 * Mounted lifecycle hook
 */
async function mounted() {
  window.EventBus.$on('canceled-delete-tag', () => (this.deletedTag = null));
  window.EventBus.$on('confirm-delete-tag', async () => {
    await this.deleteTag();
  });
} // mounted

/**
 * beforeDestroy lifecycle hook
 */
async function beforeDestroy() {
  window.EventBus.$off('canceled-delete-tag');
  window.EventBus.$off('confirm-delete-tag');
} // beforeDestroy

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Cancels the process of creating or editing a tag.
 */
function cancelEdit() {
  if (this.creatingTag) {
    this.tags.splice(0, 1);
    this.creatingTag = false;
  }
  this.editedTag = null;
} // cancelEdit

/**
 * Creates a tag.
 */
async function createTag() {
  this.editedTag.id = generateUUID();
  this.editedTag = await api.createItem(api.TAGS, this.editedTag);
  this.tags[0] = _.cloneDeep(this.editedTag);
  this.$store.dispatch('setTags', { tags: this.tags });
  this.editedTag = null;
  this.creatingTag = false;
} // createTag

/**
 * Custom filter for employee autocomplete options.
 *
 * @param item - employee
 * @param queryText - text used for filtering
 * @return string - filtered employee name
 */
function customFilter(item, queryText) {
  const query = queryText ? queryText : '';
  const nickNameFullName = item.nickname ? `${item.nickname} ${item.lastName}` : '';
  const firstNameFullName = `${item.firstName} ${item.lastName}`;

  const queryContainsNickName = nickNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase()) >= 0;
  const queryContainsFirstName =
    firstNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase()) >= 0;

  return queryContainsNickName || queryContainsFirstName;
} // customFilter

/**
 * Deletes a tag.
 */
async function deleteTag() {
  try {
    this.tagLoading = true;
    let tag = _.cloneDeep(this.deletedTag);
    let response = await api.deleteItem(api.TAGS, tag.id);
    await updateStoreExpenseTypes();
    if (response instanceof AxiosError) {
      throw new Error(response.response.data.message);
    }
    let tagIndex = this.tags.findIndex((t) => t.id === tag.id);
    this.tags.splice(tagIndex, 1);
    this.$store.dispatch('setTags', { tags: this.tags });
    this.deletedTag = null;
    this.tagLoading = false;
    this.displaySuccess('Item was successfully deleted!');
  } catch (err) {
    this.displayError(err);
    this.deletedTag = null;
    this.tagLoading = false;
  }
} // deleteTag

/**
 * Displays error snackbar
 *
 * @param err error message to display
 */
function displayError(err) {
  let status = {
    statusType: 'ERROR',
    statusMessage: err,
    color: 'red'
  };

  window.EventBus.$emit('status-alert', status);
} // displayError

/**
 * Displays success message
 * @param msg success message to display
 */
function displaySuccess(msg) {
  let status = {
    statusType: 'SUCCESS',
    statusMessage: msg,
    color: 'green'
  };
  window.EventBus.$emit('status-alert', status);
} // displaySuccess

/**
 * Edits a tag.
 *
 * @param tag Object - The tag to edit
 */
function editTag(tag) {
  this.editedTag = _.cloneDeep(tag);
} // editTag

/**
 * Emits a message and data if it exists.
 *
 * @param msg - Message to emit
 * @param data - Data to emit
 */
function emit(msg, data) {
  if (data) {
    // data exists
    window.EventBus.$emit(msg, data);
  } else {
    // data does not exist
    window.EventBus.$emit(msg);
  }
} // emit

/**
 * Gets the full employee objects from a list of employee ids.
 *
 * @param employees Array - The list of employees on a tag
 */
function getTagEmployees(employees) {
  return _.map(employees, (e) => {
    return _.find(this.$store.getters.employees, (emp) => e === emp.id);
  });
} // getTagEmployees

/**
 * Either creates a tag or saves an edited tag that already exists.
 */
async function saveEditedTag() {
  this.valid = this.$refs.form.validate();
  if (this.valid) {
    try {
      this.tagLoading = true;
      if (_.isEmpty(this.editedTag.id)) {
        // Create new tag
        await this.createTag();
      } else {
        // Save existing tag
        let tagIndex = this.tags.findIndex((t) => t.id === this.editedTag.id);
        this.editedTag = await api.updateItem(api.TAGS, this.editedTag);
        this.tags[tagIndex] = _.cloneDeep(this.editedTag);
        this.tags = _.cloneDeep(this.tags);
        this.$store.dispatch('setTags', { tags: this.tags });
        this.editedTag = null;
      }
      this.tagLoading = false;
      this.displaySuccess('Item was successfully saved!');
    } catch (err) {
      this.displayError(err);
    }
  }
} // saveEditedTag

/**
 * Custom filter for searching in the tag table.
 *
 * @param __ - The value
 * @param search - The search value in the search bar
 * @param item - The item in the tag table
 * @returns Boolean - True if the item matches the search criteria
 */
function tableFilter(__, search, item) {
  let found = false;
  let lcSearch = search.toLowerCase();
  if (item.tagName.toLowerCase().includes(lcSearch)) return true; // early exit if tag name matches search
  _.forEach(item.employees, (id) => {
    let e = _.find(this.$store.getters.employees, (emp) => emp.id === id);
    if (
      e &&
      (this.nicknameAndLastName(e).toLowerCase().includes(lcSearch) ||
        this.firstAndLastName(e).toLowerCase().includes(lcSearch) ||
        this.fullName(e).toLowerCase().includes(lcSearch))
    ) {
      found = true;
    }
  });
  return found;
} // tableFilter

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets the active list of employees.
 */
function filteredEmployees() {
  let employees = _.filter(this.$store.getters.employees, (e) => {
    return e.workStatus > 0;
  });
  return _.map(employees, (e) => {
    return {
      ...e,
      employeeName: nicknameAndLastName(e)
    };
  });
} // filterdEmployees

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Watcher for when a tag is to be created.
 */
function watchCreatingTag() {
  if (this.creatingTag) {
    let tag = { id: '', tagName: '', employees: [] };
    this.tags.unshift(tag);
    this.editedTag = tag;
  }
} // watchCreatingTag

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  beforeDestroy,
  components: {
    DeleteModal
  },
  created,
  computed: {
    filteredEmployees
  },
  data() {
    return {
      creatingTag: false,
      deletedTag: null,
      editedTag: null,
      employeeSearch: '',
      headers: [
        {
          text: 'Tag Name',
          value: 'tagName',
          width: '25%'
        },
        {
          text: 'Employees',
          value: 'employees',
          sortable: false,
          width: '60%'
        },
        {
          text: 'Actions',
          value: 'actions',
          sortable: false,
          align: 'center',
          width: '15%'
        }
      ],
      loading: true,
      tagLoading: false,
      tags: null,
      search: null,
      valid: true,
      duplicateTagName: () => {
        let arr = _.filter(this.tags, (t) => t.tagName === this.editedTag.tagName);
        return arr.length < 2 || 'Duplicate tag name';
      }
    };
  },
  methods: {
    cancelEdit,
    createTag,
    customFilter,
    deleteTag,
    displayError,
    displaySuccess,
    editTag,
    emit,
    firstAndLastName,
    fullName,
    getRequiredRules,
    getTagEmployees,
    nicknameAndLastName,
    saveEditedTag,
    tableFilter
  },
  mounted,
  watch: {
    creatingTag: watchCreatingTag
  }
};
</script>
