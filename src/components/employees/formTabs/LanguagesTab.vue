<template>
  <div>
    <!-- Loop Languages -->
    <div
      v-for="(languages, index) in editedLanguages"
      class="gray-border ma-0 pt-3 pb-1 px-5"
      :key="'language: ' + index"
    >
      <!-- Name of Language Field -->

      <v-combobox
        ref="formFields"
        v-model="languages.name"
        :rules="getRequiredRules()"
        :items="languagesList"
        label="Language"
        data-vv-name="Language"
        class="pb-5"
        clearable
      >
      </v-combobox>

      <!-- Language Proficiency -->
      <v-autocomplete
        ref="formFields"
        :items="proficiencyTypes"
        v-model="languages.proficiency"
        :rules="getRequiredRules()"
        item-text="text"
        label="Level of proficiency"
        clearable
      ></v-autocomplete>

      <v-row align="center" class="py-3" justify="center">
        <!-- Button to Delete Language -->
        <v-col cols="2" class="mb-3" align="center">
          <v-tooltip bottom slot="append-outer">
            <template v-slot:activator="{ on }">
              <v-btn text icon v-on="on" @click="deleteLanguage(index)"
                ><v-icon class="case-gray">delete</v-icon></v-btn
              >
            </template>
            <span>Delete Language</span>
          </v-tooltip>
        </v-col>
      </v-row>
      <!-- End Loop Languages -->
    </div>
    <!-- Button to Add A Language -->
    <div class="pt-4" align="center">
      <v-btn @click="addLanguage()" elevation="2"><v-icon class="pr-1">add</v-icon>Language</v-btn>
    </div>
  </div>
</template>

<script>
import api from '@/shared/api.js';
import _ from 'lodash';
import { getRequiredRules } from '@/shared/validationUtils.js';
import { isEmpty } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data.
 */
async function created() {
  window.EventBus.$emit('created', 'languages');
  this.employees = await api.getItems(api.EMPLOYEES); // get all employees
  this.populateDropDowns();
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Add a Language.
 */
function addLanguage() {
  if (!this.editedLanguages) this.editedLanguages = [];
  this.editedLanguages.push({
    name: '',
    proficiency: ''
  });
} // addLanguage

/**
 * Deletes a Language.
 *
 * @param index - array index of languages to delete
 */
function deleteLanguage(index) {
  this.editedLanguages.splice(index, 1);
} // deleteLanguage

/**
 * Creates an array of all languages that a user has entered multiple times (based on name).
 *
 * @return array  - array of language names that a user has entered multiple times
 */
function duplicateLangEntries() {
  //declares function to count unique name properties of js objects
  const count = (names) =>
    names.reduce((acc, it) => {
      acc[it.name] = acc[it.name] + 1 || 1;
      return acc;
    }, {});

  //returns an array of objects that had a count of over 1
  const duplicates = (dict) => Object.keys(dict).filter((a) => dict[a] > 1);

  return this.editedLanguages ? duplicates(count(this.editedLanguages)) : [];
} // duplicateLangEntries

/**
 * Checks to see if a language is a duplicate of one that is already entered by a user.
 *
 * @param lang - the string name of the language
 * @return boolean - true if the language was already entered by user (duplicate) false otherwise
 */
function isDuplicate(lang) {
  let duplicates = this.duplicateLangEntries();

  //checks to see if the language is in duplicates array
  if (duplicates && _.isArray(duplicates) && duplicates.length > 0) {
    return duplicates.includes(lang);
  }
  return false;
} // isDuplicate

/**
 * Gets information that other employees have filled out.
 */
function populateDropDowns() {
  let employeesLanguage = _.map(this.employees, (employee) => employee.languages); //extract languages
  employeesLanguage = _.compact(employeesLanguage); //remove falsey values
  // loop employees
  _.forEach(employeesLanguage, (languages) => {
    // loop languages
    _.forEach(languages, (languages) => {
      this.languageDropDown.push(languages.name); // add language name
    });
  });
} // populateDropDowns

/**
 * Validate all input fields are valid. Emit to parent the error status.
 */
function validateFields() {
  let errorCount = 0;
  //ensures that refs are put in an array so we can reuse forEach loop
  let components = !_.isArray(this.$refs.formFields) ? [this.$refs.formFields] : this.$refs.formFields;
  _.forEach(components, (field) => {
    if (field && !field.validate()) {
      errorCount++;
    }
  });
  window.EventBus.$emit('languagesStatus', errorCount);
  window.EventBus.$emit('doneValidating', 'languages', this.editedLanguages); // emit done validating
} // validateFields

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * watcher for validating - validates fields
 *
 * @param val - val prop that needs to exist before validating
 */
function watchValidating(val) {
  if (val) {
    // parent component triggers validation
    this.validateFields();
  }
} // watchValidating

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  methods: {
    addLanguage,
    deleteLanguage,
    duplicateLangEntries,
    getRequiredRules,
    isDuplicate,
    isEmpty,
    populateDropDowns,
    validateFields
  },
  props: ['model', 'validating'],
  watch: {
    validating: watchValidating
  },
  data() {
    return {
      languageDropDown: [],
      editedLanguages: _.cloneDeep(this.model), //stores edited languages info
      languagesList: [
        'Afrikaans',
        'Arabic',
        'Bengali',
        'Bulgarian',
        'Catalan',
        'Cantonese',
        'Croatian',
        'Czech',
        'Danish',
        'Dutch',
        'Lithuanian',
        'Malay',
        'Malayalam',
        'Panjabi',
        'Tamil',
        'English',
        'Finnish',
        'French',
        'German',
        'Greek',
        'Hebrew',
        'Hindi',
        'Hungarian',
        'Indonesian',
        'Italian',
        'Japanese',
        'Javanese',
        'Korean',
        'Norwegian',
        'Polish',
        'Portuguese',
        'Romanian',
        'Russian',
        'Serbian',
        'Slovak',
        'Slovene',
        'Spanish',
        'Swedish',
        'Telugu',
        'Thai',
        'Turkish',
        'Ukrainian',
        'Vietnamese',
        'Welsh',
        'Sign language',
        'Algerian',
        'Aramaic',
        'Armenian',
        'Berber',
        'Burmese',
        'Bosnian',
        'Brazilian',
        'Bulgarian',
        'Cypriot',
        'Corsica',
        'Creole',
        'Scottish',
        'Egyptian',
        'Esperanto',
        'Estonian',
        'Finn',
        'Flemish',
        'Georgian',
        'Hawaiian',
        'Indonesian',
        'Inuit',
        'Irish',
        'Icelandic',
        'Latin',
        'Mandarin',
        'Nepalese',
        'Sanskrit',
        'Tagalog',
        'Tahitian',
        'Tibetan',
        'Gypsy',
        'Wu'
      ],
      proficiencyTypes: [
        'Basic - Most basic words that everyone uses',
        'Personal - words you know depending on your day-to-day activities (experiences, work, country, friends)',
        'Native-like - ability to use the language like a native speaker',
        'Literacy - fluency and broad vocabulary associated with high levels of education'
      ], // job title options
      requiredRules: [
        (v) => !this.isEmpty(v) || 'This field is required. You must enter information or delete the field if possible'
      ], // rules for a required field
      duplicateRules: [
        (lang) => {
          let duplicates = this.duplicateLangEntries();
          //checks to see if the language is in duplicates array
          return !duplicates.includes(lang) || 'Duplicate field found, please remove duplicate entries';
        }
      ]
    };
  }
};
</script>
<style></style>
