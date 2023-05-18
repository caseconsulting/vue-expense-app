<template>
  <div>
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
    <v-data-table v-else :headers="headers" :items="tags" :search="search" item-key="id" mobile-breakpoint="800">
      <!-- Tag Name Slot -->
      <template v-slot:[`item.tagName`]="{ item }">
        <v-text-field
          v-if="editedTag && item.id === editedTag.id"
          v-model="editedTag.tagName"
          :disabled="tagLoading"
          :hide-details="true"
          dense
          single-line
          autofocus
        ></v-text-field>
        <span v-else>{{ item.tagName }}</span>
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
          small-chips
          deletable-chips
          :search-input.sync="employeeSearch"
          @change="employeeSearch = ''"
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
  </div>
</template>

<script>
import _ from 'lodash';
import api from '@/shared/api';
import { generateUUID } from '@/utils/utils';
import { nicknameAndLastName } from '@/shared/employeeUtils';

import DeleteModal from '@/components/modals/DeleteModal.vue';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Created lifecycle hook
 */
async function created() {
  this.tags = await api.getItems(api.TAGS);
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
  this.tagLoading = true;
  let tag = _.cloneDeep(this.deletedTag);
  await api.deleteItem(api.TAGS, tag.id);
  let tagIndex = this.tags.findIndex((t) => t.id === tag.id);
  this.tags.splice(tagIndex, 1);
  this.deletedTag = null;
  this.tagLoading = false;
} // deleteTag

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
    this.editedTag = null;
  }
  this.tagLoading = false;
} // saveEditedTag

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
      search: null
    };
  },
  methods: {
    cancelEdit,
    createTag,
    customFilter,
    deleteTag,
    editTag,
    emit,
    getTagEmployees,
    nicknameAndLastName,
    saveEditedTag
  },
  mounted,
  watch: {
    creatingTag: watchCreatingTag
  }
};
</script>
