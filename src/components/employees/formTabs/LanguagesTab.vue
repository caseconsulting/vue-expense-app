<template>
  <div>
    <!-- Loop Languages -->
    <div
      v-for="(languages, index) in editedLanguages"
      class="pt-3 pb-1 px-5"
      v-bind:class="{ errorBox: isDuplicate(languages.name) }"
      :key="'language: ' + index"
      style="border: 1px solid grey"
    >
      <!--Duplicate chip if language name is already entered by user-->
      <v-row v-if="isDuplicate(languages.name)" justify="end">
        <v-chip class="ma-2" color="error" text-color="white"> Duplicate </v-chip>
      </v-row>

      <!-- Name of Language Field -->

      <v-combobox
        ref="formFields"
        style="padding-right: 20px; padding-left: 10px"
        v-model="languages.name"
        :rules="requiredRules"
        :items="languagesList"
        label="Language"
        data-vv-name="Language"
        class="pb-5"
      >
      </v-combobox>

      <!-- Language Proficiency -->
      <v-autocomplete
        ref="formFields"
        style="padding-right: 20px; padding-left: 10px"
        :items="proficiencyTypes"
        v-model="languages.proficiency"
        :rules="requiredRules"
        item-text="text"
        label="Level of proficiency"
      ></v-autocomplete>

      <v-row align="center" class="py-3" justify="center">
        <!-- Button to Delete Language -->
        <v-col cols="2" class="mb-3" align="center">
          <v-tooltip bottom slot="append-outer">
            <template v-slot:activator="{ on }">
              <v-btn text icon v-on="on" @click="deleteLanguage(index)"
                ><v-icon style="color: grey">delete</v-icon></v-btn
              >
            </template>
            <span>Delete BI Date</span>
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
  this.editedLanguages.push({
    name: '',
    proficiency: ''
  });
}

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
 * @returns an array of language names that a user has entered multiple times
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
 * @param lang String - the name of the language
 * @returns boolean - true if the language was already entered by user (duplicate) false otherwise
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
  let hasErrors = false;
  let errorCount = 0;
  if (_.isArray(this.$refs.formFields)) {
    // more than one TYPE of vuetify component used
    _.forEach(this.$refs.formFields, (field) => {
      if (!field.validate()) {
        errorCount++;
      }
    });
    if (errorCount > 0) {
      hasErrors = true;
    }
  } else if (this.$refs.formFields) {
    // single vuetify component
    hasErrors = !this.$refs.formFields.validate();
  }
  //checks to see if there are duplicate entries with the same name
  if (this.duplicateLangEntries().length > 0) {
    hasErrors = true;
    //emit error status with a custom message
    window.EventBus.$emit(
      'languagesStatus',
      [hasErrors, errorCount++],
      'Languages MUST be UNIQUE. Please remove any duplicates'
    );
    // emit error status
  } else {
    window.EventBus.$emit('languagesStatus', [hasErrors, errorCount]); // emit error status
  }
  window.EventBus.$emit('doneValidating', 'languages', this.editedLanguages); // emit done validating
} // validateFields

export default {
  components: {},
  created,
  methods: {
    addLanguage,
    deleteLanguage,
    duplicateLangEntries,
    isDuplicate,
    isEmpty,
    populateDropDowns,
    validateFields
  },
  props: ['model', 'validating'],
  watch: {
    validating: function (val) {
      if (val) {
        // parent component triggers validation
        this.validateFields();
      }
    }
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
        (v) => !isEmpty(v) || 'This field is required. You must enter information or delete the field if possible'
      ] // rules for a required field
    };
  }
};
</script>
<style>
.errorBox {
  color: red !important;
  border: 2px solid red !important;
}
</style>
