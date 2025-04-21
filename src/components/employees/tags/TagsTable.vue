<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-row class="mb-4">
      <v-col cols="6" class="pt-4">
        <!-- Create Tag -->
        <v-btn :disabled="creatingTag" @click="creatingTag = true" :size="isMobile ? 'small' : 'default'"
          >Create Tag <v-icon end>mdi-tag</v-icon></v-btn
        >
      </v-col>
      <v-col cols="6" class="pa-0 pa-md-2">
        <!-- Table Search Field -->
        <v-text-field
          variant="underlined"
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
          variant="underlined"
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
          auto-select-first
          v-model="editedTag.employees"
          :disabled="tagLoading"
          :items="filteredEmployees"
          :custom-filter="employeeFilter"
          multiple
          variant="underlined"
          chips
          clearable
          closable-chips
          :search="employeeSearch"
          @update:search="updateSearch"
          @update:model-value="employeeSearch = ''"
          label="Employees (optional)"
          item-title="employeeName"
          item-value="id"
        >
        </v-autocomplete>
        <span v-else v-for="(emp, i) in getTagEmployees(item.employees)" :key="i">
          <a @click="$router.push(`/employee/${emp.employeeNumber}`)">{{ nicknameAndLastName(emp) }}</a>
          <span v-if="i != item.employees.length - 1">, </span>
        </span>
      </template>

      <!-- Action Items Slot -->
      <template v-slot:[`item.actions`]="{ item }">
        <div v-if="editedTag && item.id === editedTag.id">
          <!-- Save Edited Tag -->
          <span>
            <v-tooltip activator="parent" text="Save" location="top"></v-tooltip>
            <v-btn :disabled="tagLoading || !valid" :loading="tagLoading" variant="text" icon @click="saveEditedTag">
              <v-icon>mdi-content-save</v-icon>
            </v-btn>
          </span>
          <!-- Cancel Edited Tag -->
          <span>
            <v-tooltip activator="parent" text="Cancel" location="top"></v-tooltip>
            <v-btn :disabled="tagLoading" variant="text" icon @click="cancelEdit">
              <v-icon>mdi-cancel</v-icon>
            </v-btn>
          </span>
        </div>
        <div v-else>
          <!-- Edit Tag -->
          <span>
            <v-tooltip activator="parent" text="Edit" location="top" />
            <v-btn :disabled="!!editedTag || tagLoading" variant="text" icon @click="editTag(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </span>
          <!-- Delete Tag -->
          <span>
            <v-tooltip activator="parent" text="Delete" location="top" />
            <v-btn
              :loading="tagLoading && !!deletedTag && deletedTag.id === item.id"
              :disabled="!!editedTag || tagLoading"
              variant="text"
              icon
              @click="deletedTag = item"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </span>
        </div>
      </template>
    </v-data-table>
    <!-- Confirmation Modals -->
    <delete-modal :toggleDeleteModal="!!deletedTag" type="tag"></delete-modal>
  </v-form>
</template>

<script>
import _cloneDeep from 'lodash/cloneDeep';
import _find from 'lodash/find';
import _map from 'lodash/map';
import _isEmpty from 'lodash/isEmpty';
import _forEach from 'lodash/forEach';
import _filter from 'lodash/filter';
import api from '@/shared/api';
import { generateUUID, isMobile } from '@/utils/utils';
import { firstAndLastName, fullName, nicknameAndLastName } from '@/shared/employeeUtils';
import { getRequiredRules } from '@/shared/validationUtils';
import { updateStoreExpenseTypes, updateStoreTags } from '@/utils/storeUtils';
import { employeeFilter } from '@/shared/filterUtils';

import DeleteModal from '@/components/modals/DeleteModal.vue';
import { AxiosError } from 'axios';
import { useDisplayError, useDisplaySuccess } from '@/components/shared/StatusSnackbar.vue';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Created lifecycle hook
 */
async function created() {
  !this.$store.getters.tags ? await updateStoreTags() : _cloneDeep;
  this.tags = _cloneDeep(this.$store.getters.tags);
  this.tags = cleanUpTags(this.tags, this.$store.getters.employees);
  this.$store.dispatch('setTags', { tags: this.tags });
  this.loading = false;
} // created

/**
 * Mounted lifecycle hook
 */
async function mounted() {
  this.emitter.on('canceled-delete-tag', () => (this.deletedTag = null));
  this.emitter.on('confirm-delete-tag', async () => {
    await this.deleteTag();
  });
} // mounted

/**
 * beforeUnmount lifecycle hook
 */
async function beforeUnmount() {
  this.emitter.off('canceled-delete-tag');
  this.emitter.off('confirm-delete-tag');
} // beforeUnmount

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Removes any inactive employees from the tags
 */
function cleanUpTags(tags, employees) {
  tags.forEach((tag) => {
    tag.employees = tag.employees.filter((e) => {
      return _find(employees, (emp) => e === emp.id && emp.workStatus > 0);
    });
  });
  return tags;
}

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
  this.tags[0] = _cloneDeep(this.editedTag);
  this.$store.dispatch('setTags', { tags: this.tags });
  this.editedTag = null;
  this.creatingTag = false;
} // createTag

/**
 * Deletes a tag.
 */
async function deleteTag() {
  try {
    this.tagLoading = true;
    let tag = _cloneDeep(this.deletedTag);
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
    useDisplaySuccess('Item was successfully deleted!');
  } catch (err) {
    useDisplayError(err);
    this.deletedTag = null;
    this.tagLoading = false;
  }
} // deleteTag

/**
 * Edits a tag.
 *
 * @param tag Object - The tag to edit
 */
function editTag(tag) {
  this.editedTag = _cloneDeep(tag);
} // editTag

/**
 * Gets the full employee objects from a list of employee ids.
 *
 * @param employees Array - The list of employees on a tag
 */
function getTagEmployees(employees) {
  return _map(employees, (e) => {
    return _find(this.$store.getters.employees, (emp) => e === emp.id);
  });
} // getTagEmployees

/**
 * Either creates a tag or saves an edited tag that already exists.
 */
async function saveEditedTag() {
  this.valid = await this.$refs.form.validate();
  this.valid = this.valid.valid;
  if (this.valid) {
    try {
      this.tagLoading = true;
      if (_isEmpty(this.editedTag.id)) {
        // Create new tag
        await this.createTag();
      } else {
        // Save existing tag
        let tagIndex = this.tags.findIndex((t) => t.id === this.editedTag.id);
        this.editedTag = await api.updateItem(api.TAGS, this.editedTag);
        this.tags[tagIndex] = _cloneDeep(this.editedTag);
        this.tags = _cloneDeep(this.tags);
        this.$store.dispatch('setTags', { tags: this.tags });
        this.editedTag = null;
      }
      this.tagLoading = false;
      useDisplaySuccess('Item was successfully saved!');
    } catch (err) {
      useDisplayError(err);
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
  item = item.raw;
  let found = false;
  let lcSearch = search.toLowerCase();
  if (item.tagName.toLowerCase().includes(lcSearch)) return true; // early exit if tag name matches search
  _forEach(item.employees, (id) => {
    let e = _find(this.$store.getters.employees, (emp) => emp.id === id);
    if (this.employeeFilter(null, search, e)) {
      found = true;
    }
  });
  return found;
} // tableFilter

/**
 * Updates the employee search with the autocomplete value.
 *
 * @param value String - The autocompletes value
 */
function updateSearch(value) {
  this.employeeSearch = value;
} // updateSearch

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets the active list of employees.
 */
function filteredEmployees() {
  let employees = _filter(this.$store.getters.employees, (e) => {
    return e.workStatus > 0;
  });
  return _map(employees, (e) => {
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
  beforeUnmount,
  components: {
    DeleteModal
  },
  created,
  computed: {
    isMobile,
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
          title: 'Tag Name',
          key: 'tagName',
          width: '25%'
        },
        {
          title: 'Employees',
          key: 'employees',
          sortable: false,
          width: '60%'
        },
        {
          title: 'Actions',
          key: 'actions',
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
        let arr = _filter(this.tags, (t) => t.tagName === this.editedTag.tagName);
        return arr.length < 2 || 'Duplicate tag name';
      }
    };
  },
  methods: {
    cancelEdit,
    cleanUpTags,
    createTag,
    deleteTag,
    editTag,
    employeeFilter,
    firstAndLastName,
    fullName,
    getRequiredRules,
    getTagEmployees,
    nicknameAndLastName,
    saveEditedTag,
    tableFilter,
    updateSearch
  },
  mounted,
  watch: {
    creatingTag: watchCreatingTag
  }
};
</script>

<style scoped>
a {
  color: #1e79d3;
}
</style>
