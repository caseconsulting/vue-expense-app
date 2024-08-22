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
        :rules="[...getRequiredRules(), ...duplicateRules, ...noEnglishRules]"
        :items="languagesList"
        label="Language"
        variant="underlined"
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
        item-title="text"
        label="Level of proficiency"
        variant="underlined"
        clearable
      ></v-autocomplete>

      <v-row align="center" class="py-3" justify="center">
        <!-- Button to Delete Language -->
        <v-col cols="2" class="mb-3" align="center">
          <v-btn variant="text" icon @click="deleteLanguage(index)">
            <v-tooltip activator="parent" location="bottom">Delete Language</v-tooltip>
            <v-icon class="case-gray">mdi-delete</v-icon></v-btn
          >
        </v-col>
      </v-row>
      <!-- End Loop Languages -->
    </div>
    <!-- Button to Add A Language -->
    <div class="pt-4" align="center">
      <v-btn @click="addLanguage()" elevation="2">
        <v-icon class="pr-1">mdi-plus</v-icon>
        Foreign Language
      </v-btn>
    </div>
  </div>
</template>

<script>
import _isArray from 'lodash/isArray';
import _map from 'lodash/map';
import _forEach from 'lodash/forEach';
import _compact from 'lodash/compact';
import _cloneDeep from 'lodash/cloneDeep';
import { getRequiredRules } from '@/shared/validationUtils.js';
import { isEmpty } from '@/utils/utils';
import { asyncForEach } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits to parent the component was created and get data.
 */
async function created() {
  this.emitter.emit('created', 'languages');
  this.employees = this.$store.getters.employees; // get all employees
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
    name: null,
    proficiency: null
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
  if (duplicates && _isArray(duplicates) && duplicates.length > 0) {
    return duplicates.includes(lang);
  }
  return false;
} // isDuplicate

/**
 * Gets information that other employees have filled out.
 */
function populateDropDowns() {
  let employeesLanguage = _map(this.employees, (employee) => employee.languages); //extract languages
  employeesLanguage = _compact(employeesLanguage); //remove falsey values
  // loop employees
  _forEach(employeesLanguage, (languages) => {
    // loop languages
    _forEach(languages, (languages) => {
      this.languageDropDown.push(languages.name); // add language name
    });
  });
  this.languageDropDown = Array.from(new Set(this.languageDropDown));
} // populateDropDowns

/**
 * Validate all input fields are valid. Emit to parent the error status.
 */
async function validateFields() {
  let errorCount = 0;
  //ensures that refs are put in an array so we can reuse forEach loop
  let components = !_isArray(this.$refs.formFields) ? [this.$refs.formFields] : this.$refs.formFields;
  await asyncForEach(components, async (field) => {
    if (field && (await field.validate()).length > 0) {
      errorCount++;
    }
  });
  this.emitter.emit('languagesStatus', errorCount);
  this.emitter.emit('doneValidating', { tab: 'languages', data: this.editedLanguages }); // emit done validating
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
      editedLanguages: _cloneDeep(this.model), //stores edited languages info
      languagesList: [
        'Afrikaans',
        'Arabic',
        'Bengali',
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
        'Basic - most basic words that everyone uses',
        'Personal - words you know depending on your day-to-day activities (experiences, work, country, friends)',
        'Native-like - ability to use the language like a native speaker',
        'Literacy - fluency and broad vocabulary associated with high levels of education'
      ], // job title options
      noEnglishRules: [
        (v) => (!this.isEmpty(v) && v.toLowerCase() !== 'english') || 'English is not a foreign language'
      ],
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
