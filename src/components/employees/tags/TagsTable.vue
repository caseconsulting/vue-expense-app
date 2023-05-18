<template>
  <div>
    <v-row class="mb-4">
      <v-col cols="6">
        <v-btn :disabled="creatingTag" @click="creatingTag = true">Create Tag <v-icon right>mdi-tag</v-icon></v-btn>
      </v-col>
      <v-col cols="6">
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
    <v-data-table
      :headers="headers"
      :items="tags"
      :search="search"
      item-key="id"
      :loading="loading"
      mobile-breakpoint="800"
    >
      <!-- Tag Name Slot -->
      <template v-slot:[`item.tagName`]="{ item }">
        <v-text-field
          v-if="editedTag && item.id === editedTag.id"
          v-model="editedTag.tagName"
          :hide-details="true"
          dense
          single-line
          :autofocus="true"
        ></v-text-field>
        <span v-else>{{ item.tagName }}</span>
      </template>

      <!-- Employees Slot -->
      <template v-slot:[`item.employees`]="{ item }">
        <v-autocomplete
          v-if="editedTag && item.id === editedTag.id"
          v-model="editedTag.employees"
          :items="filteredEmployees"
          :filter="customFilter"
          multiple
          chips
          small-chips
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
              <v-btn text icon @click="saveEditedTag()" v-on="on">
                <v-icon>save</v-icon>
              </v-btn>
            </template>
            <span>Save</span>
          </v-tooltip>
          <!-- Cancel Edited Tag -->
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn text icon @click="cancelEdit()" v-on="on">
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
              <v-btn :disabled="!!editedTag" text icon @click="editTag(item)" v-on="on">
                <v-icon>edit</v-icon>
              </v-btn>
            </template>
            <span>Edit</span>
          </v-tooltip>
          <!-- Delete Tag -->
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn :disabled="!!editedTag" text icon @click="deleteTag(item)" v-on="on">
                <v-icon>delete</v-icon>
              </v-btn>
            </template>
            <span>Delete</span>
          </v-tooltip>
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import _ from 'lodash';
import { generateUUID } from '@/utils/utils';
import { nicknameAndLastName } from '@/shared/employeeUtils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Created lifecycle hook
 */
function created() {
  this.tags = [
    {
      id: 'wlrtkmwrlkm',
      tagName: 'Fire Team',
      employees: ['6f55856c-5e35-4fca-9381-adbf99b4994e', 'e7ca4fb6-9983-4b0d-8961-d4257505787c']
    },
    {
      id: 'sdgwrgwrg',
      tagName: 'Developer',
      employees: ['6f55856c-5e35-4fca-9381-adbf99b4994e']
    }
  ];
  this.loading = false;
} // created

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
 *
 */
function createTag() {
  // TODO
  this.editedTag.id = generateUUID();
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
 *
 * @param tag Object - The tag to delete
 */
function deleteTag(tag) {
  let tagIndex = this.tags.findIndex((t) => t.id === tag.id);
  this.tags.splice(tagIndex, 1);
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
function saveEditedTag() {
  if (_.isEmpty(this.editedTag.id)) {
    // Create new tag
    this.createTag();
  } else {
    // Save existing tag
    let tagIndex = this.tags.findIndex((t) => t.id === this.editedTag.id);
    this.tags[tagIndex] = _.cloneDeep(this.editedTag);
    this.tags = _.cloneDeep(this.tags);
    this.editedTag = null;
  }
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
  created,
  computed: {
    filteredEmployees
  },
  data() {
    return {
      creatingTag: false,
      editedTag: null,
      headers: [
        {
          text: 'Tag Name',
          value: 'tagName',
          width: '40%'
        },
        {
          text: 'Employees',
          value: 'employees',
          width: '40%'
        },
        {
          text: 'Actions',
          value: 'actions',
          sortable: false,
          align: 'center',
          width: '20%'
        }
      ],
      loading: true,
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
  watch: {
    creatingTag: watchCreatingTag
  }
};
</script>
