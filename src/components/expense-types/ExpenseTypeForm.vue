<template>
  <v-card class="mt-3" hover>
    <!-- Form Header -->
    <v-card-title class="d-flex align-center header_style">
      <h3 v-if="model.id">Edit Expense Type</h3>
      <h3 v-else>Create New Expense Type</h3>
    </v-card-title>

    <v-container fluid>
      <v-form ref="expenseTypeForm" v-model="valid" @submit.prevent="valid ? (submitForm = true) : _" lazy-validation>
        <!-- Budget Name -->
        <v-text-field
          variant="underlined"
          v-model="editedExpenseType.budgetName"
          id="budgetName"
          :rules="getRequiredRules()"
          label="Budget Name"
          data-vv-name="Budget Name"
          class="type_form_padding"
        ></v-text-field>

        <!-- Categories -->
        <v-combobox
          variant="underlined"
          v-model="categories"
          hint="Maximum of 10 categories"
          label="Categories (optional)"
          multiple
          append-icon
          chips
          :search.sync="categoryInput"
        >
        </v-combobox>

        <!-- Budget Amount -->
        <v-text-field
          variant="underlined"
          prefix="$"
          v-model="budgetFormatted"
          id="budgetAmount"
          :rules="budgetRules"
          label="Budget"
          data-vv-name="Budget"
          @update:focused="editedExpenseType.budget = parseBudget(budgetFormatted)"
          @update:model-value="formatBudget(budgetFormatted)"
        ></v-text-field>

        <!-- Employee Access -->
        <div class="form-text">
          Employee Access
          <v-avatar @click="toFAQ()" class="mb-4" size="small">
            <v-tooltip activator="parent" location="top">Click for FAQ</v-tooltip>
            <v-icon icon="mdi-information" color="#3f51b5" size="small" />
          </v-avatar>
        </div>
        <v-row no-gutters>
          <v-col cols="6" lg="3">
            <v-checkbox
              :color="caseRed"
              label="Full-time"
              value="FullTime"
              v-model="editedExpenseType.accessibleBy"
              :rules="checkBoxValid"
            ></v-checkbox>
          </v-col>
          <v-col cols="6" lg="3">
            <v-checkbox
              :color="caseRed"
              label="Part-time"
              value="PartTime"
              v-model="editedExpenseType.accessibleBy"
              :rules="checkBoxValid"
            ></v-checkbox>
          </v-col>
          <v-col cols="6" lg="3">
            <v-checkbox
              :color="caseRed"
              label="Intern"
              value="Intern"
              v-model="editedExpenseType.accessibleBy"
              :rules="checkBoxValid"
            ></v-checkbox>
          </v-col>
          <v-col cols="6" lg="3">
            <v-checkbox
              :color="caseRed"
              label="Custom"
              value="Custom"
              v-model="editedExpenseType.accessibleBy"
              :rules="checkBoxValid"
            ></v-checkbox>
          </v-col>
        </v-row>
        <p id="error" v-if="checkBoxRule">At least one checkbox must be checked</p>

        <!-- Custom Access: Employee List -->
        <v-autocomplete
          variant="underlined"
          v-if="editedExpenseType.accessibleBy && editedExpenseType.accessibleBy.includes('Custom')"
          v-model="customAccess"
          :items="activeEmployees"
          :customFilter="customFilter"
          no-data-text="No Employees Available"
          item-props.color="gray"
          multiple
          :rules="customAccessRules"
          chips
          clearable
          closable-chips
          class="mt-0 pt-0"
          :search.sync="searchString"
          @update:model-value="searchString = ''"
          item-title="text"
          item-value="value"
        >
          <template v-slot:label>
            <span v-if="customAccess.length == 0" class="text-grey text-caption">No custom employee access</span>
            <span v-else class="text-grey text-caption"
              >{{ customAccess.length }} employee(s) have custom access to this expense type</span
            >
          </template>
        </v-autocomplete>

        <!-- Budget Tags -->
        <div class="form-text">
          Tag Budgets (optional)
          <!-- <v-btn @click="toFAQ()" class="mb-4" x-small icon><v-icon icon="mdi-info" color="#3f51b5" /></v-btn> -->
        </div>
        <v-container>
          <v-row v-for="(tag, index) in editedExpenseType.tagBudgets" :key="index">
            <v-col class="d-flex flex-row justify-center align-center" cols="2">
              <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    :disabled="isLast(index, editedExpenseType.tagBudgets)"
                    v-bind="props"
                    @click="moveTagBudgetDown(index)"
                    size="x-small"
                    class="mr-1"
                    ><v-icon icon="mdi-arrow-down-thin"
                  /></v-btn>
                </template>
                <span>Move Tag Budget Priority Down One</span>
              </v-tooltip>
              <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                  <v-btn :disabled="isFirst(index)" size="x-small" @click="moveTagBudgetUp(index)" v-bind="props"
                    ><v-icon icon="mdi-arrow-up-thin"
                  /></v-btn>
                </template>
                <span>Move Tag Budget Priority Up One</span>
              </v-tooltip>
            </v-col>
            <v-col cols="6">
              <v-autocomplete
                variant="underlined"
                v-model="tag.tags"
                item-title="tagName"
                :rules="getRequiredRules()"
                item-value="id"
                multiple
                :items="tagOptions(tag.tags)"
              >
                <template v-slot:selection="{ item }">
                  <v-chip size="small" v-bind="props" closable @click.stop @click:close="remove(item.raw, index)">
                    <v-icon icon="mdi-tag" class="mr-1" />
                    {{ item.raw.tagName }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col cols="3">
              <v-text-field variant="underlined" v-model="tag.budget" prefix="$" :rules="tagBudgetRules" label="Amount"
            /></v-col>
            <v-col cols="1" class="d-flex justify-center align-center">
              <v-btn size="small" @click="removeTagBudget(index)"><v-icon icon="mdi-trash-can" /></v-btn>
            </v-col>
          </v-row>
          <v-row class="d-flex justify-center align-center">
            <v-btn elevation="2" @click="addTagBudget()"><v-icon icon="mdi-plus" />Tag Budget</v-btn></v-row
          >
        </v-container>

        <!-- Flags -->
        <v-row>
          <v-col cols="6">
            <!-- Overdraft Flag -->
            <v-checkbox
              :color="caseRed"
              label="Overdraft Flag"
              :disabled="!!model.id && model.odFlag"
              v-model="editedExpenseType.odFlag"
              persistent-hint
              :hint="odFlagHint()"
            ></v-checkbox>
            <!-- Recurring Flag -->
            <v-checkbox :color="caseRed" label="Recurring Flag" v-model="editedExpenseType.recurringFlag"></v-checkbox>
          </v-col>
          <v-col cols="6">
            <!-- Receipt Required Flag -->
            <v-checkbox
              :color="caseRed"
              label="Receipt Required"
              id="receiptRequired"
              v-model="editedExpenseType.requiredFlag"
              @update:model-value="toggleRequireReceipt()"
            ></v-checkbox>
            <!-- Inactive Flag -->
            <v-checkbox :color="caseRed" label="Mark as Inactive" v-model="editedExpenseType.isInactive"></v-checkbox>
          </v-col>
        </v-row>

        <!-- Start Date -->
        <v-text-field
          v-if="!editedExpenseType.recurringFlag"
          variant="underlined"
          v-model="startDateFormatted"
          id="startDate"
          :rules="[...getDateRules(), ...startDateRules]"
          label="Start Date"
          hint="MM/DD/YYYY format"
          v-mask="'##/##/####'"
          persistent-hint
          prepend-icon="mdi-calendar"
          @blur="editedExpenseType.startDate = format(startDateFormatted, 'MM/DD/YYYY', 'YYYY-MM-DD')"
          @click:prepend="showStartMenu = true"
          @keypress="showStartMenu = false"
        >
          <v-menu
            activator="parent"
            v-model="showStartMenu"
            :rules="getRequiredRules()"
            :close-on-content-click="false"
            location="start center"
          >
            <v-date-picker
              v-model="editedExpenseType.startDate"
              @update:model-value="showStartMenu = false"
              :max="editedExpenseType.endDate"
              show-adjacent-months
              hide-actions
              keyboard-icon=""
              color="#bc3825"
              title="Start Date"
            ></v-date-picker>
          </v-menu>
        </v-text-field>

        <!-- End Date -->
        <v-text-field
          v-if="!editedExpenseType.recurringFlag"
          variant="underlined"
          v-model="endDateFormatted"
          id="endDate"
          :rules="[...getDateRules(), ...endDateRules]"
          label="End Date"
          hint="MM/DD/YYYY format"
          v-mask="'##/##/####'"
          persistent-hint
          prepend-icon="mdi-calendar"
          @blur="editedExpenseType.endDate = format(endDateFormatted, 'MM/DD/YYYY', 'YYYY-MM-DD')"
          @update:model-value="showEndMenu = false"
          v-bind="props"
        >
          <v-menu
            activator="parent"
            v-model="showEndMenu"
            :rules="getRequiredRules()"
            :close-on-content-click="false"
            location="start center"
          >
            <v-date-picker
              v-model="editedExpenseType.endDate"
              @update:model-value="showEndMenu = false"
              :min="editedExpenseType.startDate"
              show-adjacent-months
              hide-actions
              keyboard-icon=""
              color="#bc3825"
              title="End Date"
            ></v-date-picker>
          </v-menu>
        </v-text-field>

        <!-- Description -->
        <v-textarea
          variant="underlined"
          v-model="editedExpenseType.description"
          id="description"
          :rules="getRequiredRules()"
          label="Description "
          data-vv-name="Description "
          rows="3"
        ></v-textarea>

        <!-- Campfires Autocomplete -->
        <v-autocomplete
          variant="underlined"
          :items="campfires"
          v-model="editedExpenseType.campfire"
          item-title="name"
          item-value="url"
          label="Basecamp Campfire (optional)"
          clearable
        ></v-autocomplete>

        <!-- Switches -->
        <!-- Pro-rated expense -->
        <v-switch
          :color="caseRed"
          v-model="editedExpenseType.proRated"
          label="Should this expense be pro-rated?"
        ></v-switch>
        <!-- Require Recipient -->
        <v-switch
          :color="caseRed"
          v-model="editedExpenseType.hasRecipient"
          label="Does this expense type have a recipient?"
        ></v-switch>
        <!-- Always Show on Feed -->
        <v-switch
          :color="caseRed"
          v-model="editedExpenseType.alwaysOnFeed"
          @update:model-value="toggleShowAllCategories()"
          label="Have this expense type show on the company feed?"
        ></v-switch>
        <!-- Require URL -->
        <v-switch
          :color="caseRed"
          v-model="editedExpenseType.requireURL"
          @update:model-value="toggleRequireURL()"
          label="Require a url for this expense?"
        ></v-switch>

        <!-- Categrories Specific Questions -->
        <v-container class="pb-0 mb-0">
          <v-row v-if="editedExpenseType.categories && editedExpenseType.categories.length > 0">
            <v-col cols="3">Category</v-col>
            <v-col cols="3">Show on Feed?</v-col>
            <v-col cols="3">Require Url?</v-col>
            <v-col cols="3">Require Receipt?</v-col>
          </v-row>
          <v-row v-for="(category, index) in editedExpenseType.categories" :key="index" class="d-flex align-center">
            <v-col cols="3">{{ category.name }}</v-col>
            <v-col cols="3">
              <v-checkbox
                :color="caseRed"
                v-if="!submitting"
                light
                v-model="category.showOnFeed"
                @click.stop="checkSelection()"
              ></v-checkbox>
            </v-col>
            <v-col cols="3">
              <v-checkbox
                :color="caseRed"
                v-if="!submitting"
                light
                v-model="category.requireURL"
                @click.stop="checkRequireURL()"
              ></v-checkbox>
            </v-col>
            <v-col cols="3">
              <v-checkbox
                :color="caseRed"
                v-if="!submitting"
                light
                v-model="category.requireReceipt"
                @click.stop="checkRequireReceipt()"
              ></v-checkbox>
            </v-col>
          </v-row>
        </v-container>

        <!-- Buttons -->
        <!-- Cancel Button -->
        <v-btn color="white " @click="clearForm" class="ma-2" elevation="2">
          <v-icon icon="mdi-close-circle" class="mr-1" />Cancel
        </v-btn>
        <!-- Submit Button -->
        <v-btn variant="outlined" type="submit" class="ma-2" color="success" id="submitButton" :loading="submitting">
          <v-icon icon="mdi-content-save" class="mr-1" />Submit
        </v-btn>
        <!-- End Buttons -->
      </v-form>
      <general-confirmation-modal
        title="Are you sure you want to submit?"
        type="type"
        :toggleModal="submitForm"
      ></general-confirmation-modal>
    </v-container>
  </v-card>
</template>

<script>
import api from '@/shared/api.js';
import GeneralConfirmationModal from '@/components/modals/GeneralConfirmationModal.vue';
import _ from 'lodash';
import { getDateRules, getRequiredRules } from '@/shared/validationUtils.js';
import { generateUUID, isEmpty } from '@/utils/utils';
import { format } from '@/shared/dateUtils';
import { updateStoreExpenseTypes } from '@/utils/storeUtils';
import { mask } from 'vue-the-mask';
import { isValid, isSameOrAfter, isSameOrBefore } from '../../shared/dateUtils';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Set required receipt for expense type if all category required receipt checkboxes are enabled. If there are no categories, make sure the main toggle is false.
 */
function checkRequireReceipt() {
  if (_.isEmpty(this.editedExpenseType.categories)) {
    this.editedExpenseType.requireURL = false;
  } else {
    // check if any categories do not require a receipt
    let somethingIsFalse = _.find(this.editedExpenseType.categories, (category) => {
      return !category.requireReceipt;
    });

    // update require receipt for expense type
    if (somethingIsFalse) {
      this.editedExpenseType.requiredFlag = false;
    } else {
      this.editedExpenseType.requiredFlag = true;
    }
  }
} // checkRequireReceipt

/**
 * Set required url for expense type if all category required url checkboxes are enabled. If there are no categories, make sure the main toggle is false.
 */
function checkRequireURL() {
  if (_.isEmpty(this.editedExpenseType.categories)) {
    this.editedExpenseType.requireURL = false;
  } else {
    // check if any categories do not require a url
    let somethingIsFalse = _.find(this.editedExpenseType.categories, (category) => {
      return !category.requireURL;
    });

    // update require url for expense type
    if (somethingIsFalse) {
      this.editedExpenseType.requireURL = false;
    } else {
      this.editedExpenseType.requireURL = true;
    }
  }
} // checkRequireURL

/**
 * Set always on feed for expense type if all category show on feed checkboxes are enabled. If there are no categories, make sure the main toggle is false.
 */
function checkSelection() {
  if (_.isEmpty(this.editedExpenseType.categories)) {
    this.editedExpenseType.requireURL = false;
  } else {
    // check if any categories are hidden on feed
    let somethingIsFalse = _.find(this.editedExpenseType.categories, (category) => {
      return !category.showOnFeed;
    });

    // update always on feed for expense type
    if (somethingIsFalse) {
      this.editedExpenseType.alwaysOnFeed = false;
    } else {
      this.editedExpenseType.alwaysOnFeed = true;
    }
  }
} // checkSelection

/**
 * Clears the form and sets all fields to a default state.
 */
function clearForm() {
  if (this.$refs.expenseTypeForm) {
    this.$refs.expenseTypeForm.reset();
  }
  this.emitter.emit('finished-editing-expense-type'); //notify parent no longer editing an expense type
  this.startDateFormatted = null;
  this.endDateFormatted = null;
  this.customAccess = [];
  this.editedExpenseType.id = null;
  this.editedExpenseType.accessibleBy = ['FullTime'];
} // clearForm

/**
 * Custom filter for employee autocomplete options.
 *
 * @param item - employee
 * @param queryText - the text used to filter the names
 * @return string - filtered employee
 */
function customFilter(_, queryText, item) {
  item = item.raw;
  const query = queryText ? queryText : '';
  const nickNameFullName = item.nickname ? `${item.nickname} ${item.lastName}` : '';
  const firstNameFullName = `${item.firstName} ${item.lastName}`;

  const queryContainsNickName = nickNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase()) >= 0;
  const queryContainsFirstName =
    firstNameFullName.toString().toLowerCase().indexOf(query.toString().toLowerCase()) >= 0;

  return queryContainsNickName || queryContainsFirstName;
} // customFilter

/**
 * Formats the budget on the form for a nicer display.
 */
function formatBudget() {
  this.editedExpenseType.budget = this.parseBudget(this.budgetFormatted);
  if (Number(this.editedExpenseType.budget)) {
    this.budgetFormatted = Number(this.editedExpenseType.budget).toLocaleString().toString();
  }
} // formatBudget

/**
 * Checks if custom access of employees have acess to an expense type at a percentage rate. Returns true if 'CUSTOM'
 * is selected, otherwise returns false.
 *
 * @return boolean - custom employees have access
 */
function isCustomSelected() {
  return this.editedExpenseType.accessibleBy && this.editedExpenseType.accessibleBy.includes('Custom');
} // isCustomSelected

/**
 * overdraft flag hint
 *
 * @return string - the string flag hint
 */
function odFlagHint() {
  if (!!this.model.id && this.model.odFlag) {
    return 'Cannot be undone';
  } else if (this.editedExpenseType.odFlag) {
    return 'Cannot be undone once submitted';
  } else {
    return '';
  }
} // odFlagHint

/**
 * Parses the budget to get rid of commas.
 *
 * @param budget - the budget to parse
 * @return String - The budget without formatting
 */
function parseBudget(budget) {
  if (budget && !_.isEmpty(budget)) {
    return budget.replace(/[,\s]/g, '');
  } else {
    return budget;
  }
} // parseBudget

/**
 * route to FAQ
 */
function toFAQ() {
  let faq = this.$router.resolve({ path: '/help/expenseTypes' });
  window.open(faq.href, '_blank');
} // toFAQ

/**
 * Removes a category from the list of expense type categories.
 *
 * @param category - category to remove
 */
function removeCategory(category) {
  this.editedExpenseType.categories.splice(
    this.editedExpenseType.categories.map((cat) => cat.name).indexOf(category),
    1
  );
  this.editedExpenseType.categories = [...this.editedExpenseType.categories];
  this.categories.splice(this.categories.indexOf(category), 1);
  this.categories = [...this.categories];

  //recompute the receipt, show on feed, and url select all buttons
  this.checkRequireURL();
  this.checkRequireReceipt();
  this.checkSelection();
} // removeCategory

/**
 * Submits an expense type.
 */
async function submit() {
  this.submitting = true; // set loading status to true
  this.emitter.emit('startAction');

  // set accessibleBy based on access radio
  if (this.isCustomSelected()) {
    this.editedExpenseType.accessibleBy = _.union(this.editedExpenseType.accessibleBy, this.customAccess); // merge unique vals
  }

  // convert budget input into a floating point number
  this.editedExpenseType.budget = parseFloat(this.editedExpenseType.budget);

  if (this.editedExpenseType.odFlag == null) {
    // set overdraft flag to false if checkbox is null
    this.editedExpenseType.odFlag = false;
  }

  if (this.editedExpenseType.recurringFlag == null) {
    // set recurring flag to false if checkbox is null
    this.editedExpenseType.recurringFlag = false;
  }

  if (this.editedExpenseType.requiredFlag == null) {
    // set receipt required flag to false if checkbox is null
    this.editedExpenseType.requiredFlag = false;
  }

  if (this.editedExpenseType.isInactive == null) {
    // set is inactive flag to false if checkbox is null
    this.editedExpenseType.isInactive = false;
  }

  if (this.editedExpenseType.proRated == null) {
    this.editedExpenseType.proRated = false;
  }

  // format dates
  if (this.editedExpenseType.startDate) {
    this.editedExpenseType.startDate = format(this.editedExpenseType.startDate, null, 'YYYY-MM-DD');
  }
  if (this.editedExpenseType.endDate) {
    this.editedExpenseType.endDate = format(this.editedExpenseType.endDate, null, 'YYYY-MM-DD');
  }

  if (this.$refs.expenseTypeForm && this.$refs.expenseTypeForm.validate()) {
    for (var i = 0; i < this.editedExpenseType.categories.length; i++) {
      this.editedExpenseType.categories[i] = JSON.stringify(this.editedExpenseType.categories[i]);
    }
    // form is validated
    if (this.editedExpenseType.recurringFlag) {
      // clear start and end date fields if expense type is recurring
      this.editedExpenseType['startDate'] = null;
      this.editedExpenseType['endDate'] = null;
    }

    if (this.editedExpenseType.id) {
      // editing an expense type
      let newExpenseType = await api.updateItem(api.EXPENSE_TYPES, this.editedExpenseType);

      if (newExpenseType.id) {
        // successfully updates expense type
        this.emitter.emit('update');
        this.clearForm();
      } else {
        // emit error if fails to update expense type
        this.emitter.emit('error', JSON.stringify(newExpenseType.response.data.message));
      }
    } else {
      // creating a new expense type
      let newUUID = generateUUID();
      this.editedExpenseType['id'] = newUUID;
      let newExpenseType = await api.createItem(api.EXPENSE_TYPES, this.editedExpenseType);

      if (newExpenseType.id) {
        // successfully creates an expense type
        this.editedExpenseType['id'] = newExpenseType.id;
        this.emitter.emit('add');
        this.clearForm();
      } else {
        // emit error if fails to create an expense type
        this.emitter.emit('error', JSON.stringify(newExpenseType.response.data.message));
        this.editedExpenseType['id'] = '';
      }
    }
  }

  this.submitting = false; // set loading status to false
  this.emitter.emit('endAction');
} // submit

/**
 * Sets all category show on feed to true if expense type always show on feed is enabled. Sets all category show on
 * feed to false otherwise.
 */
function toggleShowAllCategories() {
  if (!this.submitting) {
    let alwaysOF = this.editedExpenseType.alwaysOnFeed;

    _.forEach(this.editedExpenseType.categories, (category) => {
      category.showOnFeed = alwaysOF;
    });
  }
} // toggleShowAllCategories

/**
 * Sets all category require url to true if expense type require url is enabled. Sets all to false otherwise.
 */
function toggleRequireURL() {
  if (!this.submitting) {
    let requireURL = this.editedExpenseType.requireURL;

    _.forEach(this.editedExpenseType.categories, (category) => {
      category.requireURL = requireURL;
    });
  }
} // toggleRequireURL

/**
 * Sets all category require url to true if expense type require url is enabled. Sets all to false otherwise.
 */
function toggleRequireReceipt() {
  if (!this.submitting) {
    let requireReceipt = this.editedExpenseType.requiredFlag;

    _.forEach(this.editedExpenseType.categories, (category) => {
      category.requireReceipt = requireReceipt;
    });
  }
} // toggleRequireReceipt

/**
 * Creates empty tag budget field in tagBudgets list
 */
function addTagBudget() {
  this.editedExpenseType.tagBudgets.push({});
} // addTagBudgets

/**
 * Removes specified tag budget from list of tag budgets
 *
 * @param index index of tag budget to remove
 */
function removeTagBudget(index) {
  this.editedExpenseType.tagBudgets.splice(index, 1);
} // removeTagBudget

/**
 * Removes given chip from tag autocomplete input.
 *
 * @param data chip data to remove
 * @param index autocomplete input index
 */
function remove(data, index) {
  let indx = this.editedExpenseType.tagBudgets[index].tags.findIndex((t) => t == data.id);
  this.editedExpenseType.tagBudgets[index].tags.splice(indx, 1);
} // remove

/**
 * Gets tag options for the v-autocomplete dropdown completes. Makes sure that tag name cannot be used more than once.
 * @param selectedItems tag IDs already selected
 */
function tagOptions(selectedItems) {
  let selectedTags = [];
  if (this.editedExpenseType.tagBudgets.length > 0) {
    this.editedExpenseType.tagBudgets.forEach((t) => {
      if (t.tags) {
        t.tags.forEach((id) => {
          selectedTags.push(id);
        });
      }
    });
  }
  if (selectedItems && selectedItems.length > 0) {
    selectedTags = selectedTags.filter((st) => !selectedItems.includes(st));
  }
  return this.tags.filter((t) => !selectedTags.includes(t.id));
} // tagOptions

/**
 * Gets tag object given id
 * @param id id of tag to find
 */
function getTagByID(id) {
  return this.tags.find((t) => t.id === id);
} // getTagByID

/**
 * Checks if index in element is first in array
 *
 * @param index index of element
 */
function isFirst(index) {
  return index == 0;
} // isFirst

/**
 * Checks if index of elment is last in array
 * @param index index of element
 * @param arr array
 */
function isLast(index, arr) {
  return index == arr.length - 1;
} // isLast

/**
 * Moves tag budget up one in priority
 * @param index index of tag budget to move
 */
function moveTagBudgetUp(index) {
  let temp = this.editedExpenseType.tagBudgets[index - 1];
  this.editedExpenseType.tagBudgets[index - 1] = this.editedExpenseType.tagBudgets[index];
  this.editedExpenseType.tagBudgets[index] = temp;
} // moveTagBudgetUp

/**
 * Moves tag budget down one in priority
 * @param index index of tag budget to move
 */
function moveTagBudgetDown(index) {
  let temp = this.editedExpenseType.tagBudgets[index + 1];
  this.editedExpenseType.tagBudgets[index + 1] = this.editedExpenseType.tagBudgets[index];
  this.editedExpenseType.tagBudgets[index] = temp;
} // moveTagBudgetDown

// |--------------------------------------------------|
// |                                                  |
// |                    COMPUTED                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * boolean for checkBox appearance
 *
 * @return boolean - whether checkbox appears
 */
function checkBoxRule() {
  return !(this.editedExpenseType.accessibleBy && this.editedExpenseType.accessibleBy.length > 0);
} // checkBoxRule

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets and sets all employees.
 */
async function created() {
  this.emitter.on('confirmed-type', async () => {
    this.submitForm = false;
    await this.submit();
    await this.updateStoreExpenseTypes();
  });
  this.emitter.on('canceled-type', () => {
    this.submitting = false;
    this.submitForm = false;
  });
  this.tags = this.$store.getters.tags;
  // get all employees
  let employees = this.$store.getters.employees;
  let activeEmployees = [];

  // populate list of active employees
  _.forEach(employees, (employee) => {
    if (employee.workStatus > 0) {
      activeEmployees.push({
        value: employee.id,
        text: `${employee.firstName} ${employee.lastName}`,
        nickname: employee.nickname,
        firstName: employee.firstName,
        lastName: employee.lastName
      });
    }
  });

  activeEmployees = _.sortBy(activeEmployees, ['text']); // sort employees
  this.activeEmployees = activeEmployees;
  this.campfires = this.$store.getters.basecampCampfires;
  this.editedExpenseType = _.cloneDeep(this.model);

  this.clearForm();
} // created

/**
 * beforeDestroy lifecycle hook
 */
function beforeDestroy() {
  this.emitter.off('confirmed-type');
  this.emitter.off('canceled-type');
} //beforeDestroy

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for model.id - sets the model as the editedExpenseType and check if it is editing
 */
function watchModelID() {
  this.editedExpenseType = _.cloneDeep(this.model); //set editedExpense to new value of model

  // set array used for custom access chip-selector to previously saved data but without the access strings
  // This code sucks
  if (this.editedExpenseType.accessibleBy.includes('Custom')) {
    let index = 1;
    if (this.editedExpenseType.accessibleBy.includes('FullTime')) {
      index++;
    }
    if (this.editedExpenseType.accessibleBy.includes('PartTime')) {
      index++;
    }
    if (this.editedExpenseType.accessibleBy.includes('Intern')) {
      index++;
    }
    // set only the ids of people with custom access (don't include the access type)
    this.customAccess = this.editedExpenseType.accessibleBy.splice(index, this.editedExpenseType.accessibleBy.length);
  }

  //when model id is not empty then must be editing an expense
  if (!this.isEmpty(this.model.id)) {
    this.emitter.emit('editing-expense-type'); //notify parent that expense is being edited
  }
  if (this.editedExpenseType.id != null) {
    //map categories
    this.categories = _.map(this.editedExpenseType.categories, (category) => {
      return category.name;
    });
  }
  this.startDateFormatted = this.format(this.editedExpenseType.startDate, null, 'MM/DD/YYYY');
  this.endDateFormatted = this.format(this.editedExpenseType.endDate, null, 'MM/DD/YYYY');
  this.editedExpenseType.budget = this.model.budget;
  this.budgetFormatted = this.editedExpenseType.budget;
  this.formatBudget();
} // watchModelID

/**
 * watcher for categories - limits categories and updates checkboxes
 *
 * @param val - categories list
 */
function watchCategories(val) {
  // limit categories to less than 10
  if (val.length > 10) {
    this.$nextTick(() => this.categories.pop());
    this.$nextTick(() => this.editedExpenseType.categories.pop());
  }

  // update categories checkboxes
  if (val.length > this.editedExpenseType.categories.length) {
    // category was added
    let c = _.map(this.editedExpenseType.categories, (category) => {
      return category.name;
    });

    let index = _.findIndex(val, (x) => {
      return !c.includes(x);
    });

    this.editedExpenseType.categories.push({
      name: val[index],
      showOnFeed: this.editedExpenseType.alwaysOnFeed,
      requireURL: this.editedExpenseType.requireURL,
      requireReceipt: this.editedExpenseType.requiredFlag
    });
  } else if (val.length < this.editedExpenseType.categories.length) {
    // category was removed
    this.editedExpenseType.categories = _.filter(this.editedExpenseType.categories, (category) => {
      return val.includes(category.name);
    });
  }
} // watchCategories

/**
 * watcher for editedExpenseType.endDate - formats date
 */
function watchEditedExpenseTypeEndDate() {
  this.endDateFormatted = this.format(this.editedExpenseType.endDate, null, 'MM/DD/YYYY') || this.endDateFormatted;
  //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
  if (this.editedExpenseType.endDate !== null && !this.format(this.editedExpenseType.endDate, null, 'MM/DD/YYYY')) {
    this.editedExpenseType.endDate = null;
  }
} // watchEditedExpenseTypeEndDate

/**
 * watcher for editedExpenseType.startDate - format date
 */
function watchEditedExpenseTypeStartDate() {
  this.startDateFormatted =
    this.format(this.editedExpenseType.startDate, null, 'MM/DD/YYYY') || this.startDateFormatted;
  //fixes v-date-picker error so that if the format of date is incorrect the purchaseDate is set to null
  if (this.editedExpenseType.startDate !== null && !this.format(this.editedExpenseType.startDate, null, 'MM/DD/YYYY')) {
    this.editedExpenseType.startDate = null;
  }
} // watchEditedExpenseTypeStartDate

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    GeneralConfirmationModal
  },
  created,
  beforeDestroy,
  data() {
    return {
      activeEmployees: null, // list of active employees
      budgetFormatted: '',
      budgetRules: [
        (v) => !!v || 'Budget amount is required',
        (v) => parseFloat(v, 10) > 0 || 'Budget must be greater than 0.',
        (v) =>
          /^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?$/.test(v) ||
          'Budget amount must be a number with two decimal digits.'
      ], // rules for an expense type budget
      campfires: [], // basecamp campfires
      categories: [], // list of expense type categories
      categoryInput: null, // category combobox input
      checkBoxValid: [
        () => {
          return !this.checkBoxRule;
        }
      ],
      customAccess: [], // list of employees with custom access
      customAccessRules: [
        () => {
          return this.customAccess.length > 0 || 'Select at least one employee or uncheck the Custom checkbox';
        }
      ],
      startDateRules: [
        (v) => {
          return !this.isEmpty(v) && isValid(v, 'MM/DD/YYYY') && this.editedExpenseType.endDate
            ? isSameOrBefore(v, this.editedExpenseType.endDate) || 'Start date must be at or before end date'
            : true;
        }
      ],
      endDateRules: [
        (v) => {
          return !this.isEmpty(v) && isValid(v, 'MM/DD/YYYY') && this.editedExpenseType.startDate
            ? isSameOrAfter(v, this.editedExpenseType.startDate) || 'End date must be at or after start date'
            : true;
        }
      ],
      endDateFormatted: null, // formatted end date
      editedExpenseType: _.cloneDeep(this.model), //used to store edits made to an expense type or when creating new expense type
      searchString: '',
      showStartMenu: false, // boolean for showing date picker
      showEndMenu: false, // boolean for showing date picker
      startDateFormatted: null, // formatted start date
      submitting: false, // submitting form
      submitForm: false, //triggers submit form modal when changed
      valid: false, // form is valid
      tagBudgetRules: [
        (v) => !!v || 'Budget amount is required',
        (v) => parseFloat(v, 10) >= 0 || 'Budget must either be a positive or zero dollar amount.',
        (v) =>
          /^[+-]?[0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?$/.test(v) ||
          'Budget amount must be a number with two decimal digits.'
      ], // rules for a tag budget,
      tags: []
    };
  },
  directives: { mask },
  methods: {
    addTagBudget,
    checkRequireReceipt,
    checkRequireURL,
    checkSelection,
    clearForm,
    customFilter,
    formatBudget,
    format,
    getDateRules,
    getRequiredRules,
    getTagByID,
    isCustomSelected,
    isEmpty,
    isFirst,
    isLast,
    isSameOrAfter,
    isSameOrBefore,
    isValid,
    moveTagBudgetDown,
    moveTagBudgetUp,
    odFlagHint,
    parseBudget,
    remove,
    removeCategory,
    removeTagBudget,
    submit,
    toFAQ,
    toggleRequireURL,
    toggleRequireReceipt,
    toggleShowAllCategories,
    updateStoreExpenseTypes,
    tagOptions
  },
  props: ['model'], // expense type to be created/updated
  computed: {
    checkBoxRule
  },
  watch: {
    'model.id': watchModelID,
    categories: watchCategories,
    'editedExpenseType.endDate': watchEditedExpenseTypeEndDate,
    'editedExpenseType.startDate': watchEditedExpenseTypeStartDate
  }
};
</script>

<style scoped>
#error {
  color: #ff5252;
  font-size: 12px;
}
</style>
