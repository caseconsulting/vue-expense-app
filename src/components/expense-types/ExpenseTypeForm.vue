<template>
  <v-card class="mt-3" hover>
    <v-card-title class="d-flex align-center header_style">
      <h3 v-if="model.id">Edit Expense Type</h3>
      <h3 v-else>Create New Expense Type</h3>
    </v-card-title>

    <v-container fluid>
      <v-form ref="expenseTypeForm" v-model="valid" @submit.prevent="valid ? (submitForm = true) : _" lazy-validation>
        <details-form v-model="editedExpenseType">
          <v-textarea
            variant="underlined"
            v-model="editedExpenseType.description"
            id="description"
            :rules="getRequiredRules()"
            label="Description "
            data-vv-name="Description "
            rows="3"
          ></v-textarea>
        </details-form>
        <budget-amount v-model="editedExpenseType"></budget-amount>
        <employee-access v-model="editedExpenseType"></employee-access>
        <duration v-model="editedExpenseType"></duration>
        <integrations v-model="editedExpenseType"></integrations>
        <flags v-model="editedExpenseType">
          <v-col cols="auto" class="slim">
            <checkbox label="Pro-Rated" v-model="editedExpenseType.proRated"> </checkbox>
          </v-col>
          <v-col cols="auto" class="slim">
            <checkbox label="Overdraft Budget" v-model="editedExpenseType.odFlag"> </checkbox>
          </v-col>
          <v-col cols="auto" class="slim">
            <checkbox label="Has Recipient" v-model="editedExpenseType.hasRecipient"> </checkbox>
          </v-col>
        </flags>
        <emails v-model="editedExpenseType"></emails>
        <v-row>
          <v-col cols="12">
            <strong>Categories</strong>
            <help type="expenseTypes"></help>
          </v-col>
          <v-col class="slim">
            <categories :expenseType="editedExpenseType" :condensed="true"></categories>
          </v-col>
        </v-row>

        <!-- Buttons -->
        <!-- Cancel Button -->
        <v-row>
          <v-col>
            <v-btn color="white " @click="clearForm" class="ma-2" elevation="2">
              <v-icon icon="mdi-close-circle" class="mr-1" />Cancel
            </v-btn>
            <!-- Submit Button -->
            <v-btn
              variant="outlined"
              type="submit"
              class="ma-2"
              color="success"
              id="submitButton"
              :loading="submitting"
            >
              <v-icon icon="mdi-content-save" class="mr-1" />Submit
            </v-btn>
          </v-col>
        </v-row>
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

<script setup>
import BudgetAmount from '@/components/expense-types/forms/BudgetAmount.vue';
import Categories from '@/components/expense-types/Categories.vue';
import Checkbox from '@/components/shared/edit-fields/Checkbox.vue';
import DetailsForm from '@/components/expense-types/forms/Details.vue';
import Duration from '@/components/expense-types/forms/Duration.vue';
import Emails from '@/components/expense-types/forms/Emails.vue';
import EmployeeAccess from '@/components/expense-types/forms/EmployeeAccess.vue';
import Flags from '@/components/expense-types/forms/Flags.vue';
import Help from '@/components/shared/buttons/Help.vue';
import Integrations from '@/components/expense-types/forms/Integrations.vue';
import api from '@/shared/api.js';
import { getRequiredRules } from '@/shared/validationUtils';
import GeneralConfirmationModal from '@/components/modals/GeneralConfirmationModal.vue';
import _cloneDeep from 'lodash/cloneDeep';
import _union from 'lodash/union';
import { generateUUID, isEmpty } from '@/utils/utils';
import { format } from '@/shared/dateUtils';
import { updateStoreExpenseTypes } from '@/utils/storeUtils';
import { onMounted, onBeforeUnmount, ref, inject, watch, nextTick } from 'vue';
import { ExpenseType } from '@/models/expense-types/expenseType.js';

// |--------------------------------------------------|
// |                                                  |
// |                     SETUP                        |
// |                                                  |
// |--------------------------------------------------|

const categories = ref([]); // list of expense type categories
const emitter = inject('emitter');
const endDateFormatted = ref(null); // formatted end date
const expenseTypeForm = ref(null); // filled in from the template
const props = defineProps(['model']); // expense type to be created/updated
const editedExpenseType = ref(_cloneDeep(props.model)); // used to store edits made to an expense type or when creating new expense type
const startDateFormatted = ref(null); // formateed start date
const submitting = ref(false); // submitting form
const submitForm = ref(false); // triggers subit form modal when changed
const valid = ref(false); // form is valid

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Gets and sets all employees.
 */
onMounted(async () => {
  emitter.on('confirmed-type', async () => {
    submitForm.value = false;
    await submit();
    await updateStoreExpenseTypes();
  });
  emitter.on('canceled-type', () => {
    submitting.value = false;
    submitForm.value = false;
  });

  editedExpenseType.value = new ExpenseType(props.model);

  clearForm();
});

/**
 * beforeUnmount lifecycle hook
 */
onBeforeUnmount(() => {
  emitter.off('confirmed-type');
  emitter.off('canceled-type');
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Clears the form and sets all fields to a default state.
 */
function clearForm() {
  emitter.emit('clear-expense-type-form'); // notify child components to clear their forms
  if (expenseTypeForm.value) {
    expenseTypeForm.value.reset();
  }
  emitter.emit('finished-editing-expense-type'); //notify parent no longer editing an expense type
  editedExpenseType.value.id = null;
  editedExpenseType.value.accessibleBy = ['FullTime'];
}

/**
 * Checks if custom access of employees have acess to an expense type at a percentage rate. Returns true if 'CUSTOM'
 * is selected, otherwise returns false.
 *
 * @return boolean - custom employees have access
 */
function isCustomSelected() {
  return editedExpenseType.value.accessibleBy && editedExpenseType.value.accessibleBy.includes('Custom');
}

/**
 * Parses the budget to get rid of commas.
 *
 * @param budget - the budget to parse
 * @return String - The budget without formatting
 */
function parseNumber(budget) {
  if (budget && !isEmpty(budget)) {
    return budget.replace(/[,\s]/g, '');
  } else {
    return budget;
  }
}

/**
 * Submits an expense type.
 */
async function submit() {
  submitting.value = true; // set loading status to true
  emitter.emit('startAction');

  // set accessibleBy based on access radio
  if (isCustomSelected()) {
    editedExpenseType.value.accessibleBy = _union(editedExpenseType.value.accessibleBy, customAccess.value); // merge unique vals
  }

  // convert budget input into a floating point number
  editedExpenseType.value.budget = parseFloat(editedExpenseType.value.budget);

  // format dates
  if (editedExpenseType.value.startDate) {
    editedExpenseType.value.startDate = format(editedExpenseType.value.startDate, null, 'YYYY-MM-DD');
  }
  if (editedExpenseType.value.endDate) {
    editedExpenseType.value.endDate = format(editedExpenseType.value.endDate, null, 'YYYY-MM-DD');
  }

  if (expenseTypeForm.value && (await expenseTypeForm.value.validate()).valid) {
    for (var i = 0; i < editedExpenseType.value.categories.length; i++) {
      editedExpenseType.value.categories[i] = JSON.stringify(editedExpenseType.value.categories[i]);
    }
    // form is validated
    if (editedExpenseType.value.recurringFlag) {
      // clear start and end date fields if expense type is recurring
      editedExpenseType.value['startDate'] = null;
      editedExpenseType.value['endDate'] = null;
    }

    if (editedExpenseType.value.id) {
      // editing an expense type
      let newExpenseType = await api.updateItem(api.EXPENSE_TYPES, editedExpenseType.value);

      if (newExpenseType.id) {
        // successfully updates expense type
        emitter.emit('update');
        clearForm();
      } else {
        // emit error if fails to update expense type
        emitter.emit('error', JSON.stringify(newExpenseType.response.data.message));
      }
    } else {
      // creating a new expense type
      let newUUID = generateUUID();
      editedExpenseType.value['id'] = newUUID;
      let newExpenseType = await api.createItem(api.EXPENSE_TYPES, editedExpenseType.value);

      if (newExpenseType.id) {
        // successfully creates an expense type
        editedExpenseType.value['id'] = newExpenseType.id;
        emitter.emit('add');
        clearForm();
      } else {
        // emit error if fails to create an expense type
        emitter.emit('error', JSON.stringify(newExpenseType.response.data.message));
        editedExpenseType.value['id'] = '';
      }
    }
  }

  submitting.value = false; // set loading status to false
  emitter.emit('endAction');
}

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for model.id - sets the model as the editedExpenseType and check if it is editing
 */
watch(
  () => props.model.id,
  () => {
    editedExpenseType.value = new ExpenseType(props.model); //set editedExpense to new value of model

    // set array used for custom access chip-selector to previously saved data but without the access strings
    // This code sucks
    if (editedExpenseType.value.accessibleBy.includes('Custom')) {
      let index = 1;
      if (editedExpenseType.value.accessibleBy.includes('FullTime')) {
        index++;
      }
      if (editedExpenseType.value.accessibleBy.includes('PartTime')) {
        index++;
      }
      if (editedExpenseType.value.accessibleBy.includes('Intern')) {
        index++;
      }
      // set only the ids of people with custom access (don't include the access type)
      customAccess.value = editedExpenseType.value.accessibleBy.splice(
        index,
        editedExpenseType.value.accessibleBy.length
      );
    }

    //when model id is not empty then must be editing an expense
    if (!isEmpty(props.model.id)) {
      emitter.emit('editing-expense-type'); //notify parent that expense is being edited
    }
    if (editedExpenseType.value.id != null) {
      //map categories
      categories.value = editedExpenseType.value.categories.map((category) => {
        return category.name;
      });
    }
    startDateFormatted.value = format(editedExpenseType.value.startDate, null, 'MM/DD/YYYY');
    endDateFormatted.value = format(editedExpenseType.value.endDate, null, 'MM/DD/YYYY');
    editedExpenseType.value.budget = props.model.budget;
  }
);

/**
 * watcher for categories - limits categories and updates checkboxes
 *
 * @param val - categories list
 */
watch(categories, (val) => {
  // limit categories to less than 10
  if (val.length > 10) {
    nextTick(() => categories.value.pop());
    nextTick(() => editedExpenseType.value.categories.pop());
  }

  // update categories checkboxes
  if (val.length > editedExpenseType.value.categories.length) {
    // category was added
    let c = editedExpenseType.value.categories.map((category) => {
      return category.name;
    });

    let index = val.findIndex((x) => {
      return !c.includes(x);
    });

    editedExpenseType.value.categories.push({
      name: val[index],
      showOnFeed: editedExpenseType.value.showOnFeed,
      requireURL: editedExpenseType.value.requireURL,
      requireReceipt: editedExpenseType.value.requireReceipt
    });
  } else if (val.length < editedExpenseType.value.categories.length) {
    // category was removed
    editedExpenseType.value.categories = editedExpenseType.value.categories.filter((category) => {
      return val.includes(category.name);
    });
  }
});
</script>
