<template>
  <div>
    <!-- Status Alert -->
    <v-snackbar v-model="copied" dark bottom :timeout="3000">
      Copied email list to clipboard
      <template v-slot:action="{ attrs }">
        <v-btn color="red" text @click="copied = false" v-bind="attrs"> Close </v-btn>
      </template>
    </v-snackbar>
    <!-- Modal Card -->
    <v-card>
      <!-- Modal Title -->
      <v-card-title class="headline header_style">Contact Employees</v-card-title>
      <!-- Modal Content -->
      <v-card-text class="mt-4">
        <v-alert v-if="getList().length >= listLimit" dense type="info">
          Email list is too large for the default email client, please use the 'copy to clipboard' button and manually
          paste into the email client
        </v-alert>
        <v-autocomplete
          v-model="employees"
          :items="filteredEmployees"
          :filter="customFilter"
          multiple
          chips
          clearable
          deletable-chips
          :label="employees.length == 1 ? `${employees.length} Employee` : `${employees.length} Employees`"
          :small-chips="employees.length > 10"
          :search-input.sync="employeeSearch"
          @change="employeeSearch = ''"
          item-text="employeeName"
          return-object
        ></v-autocomplete>
      </v-card-text>
      <!-- Action Button -->
      <v-card-actions>
        <v-btn @click="copyEmailList()" small text color="grey darken-1">
          Copy to Clipboard
          <v-icon v-if="copied" right>mdi-check</v-icon>
          <v-icon v-else right>mdi-content-copy</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn @click="emailEmployees()" text color="light-blue" class="mr-1">
          Group Email
          <v-icon right>email</v-icon>
        </v-btn>
        <v-btn
          color="grey darken-3"
          text
          @click.native="
            emit('close-contact-employees-modal');
            activate = false;
          "
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import _ from 'lodash';
import { nicknameAndLastName } from '@/shared/employeeUtils';

/**
 * Mounted life cycle hook
 */
function mounted() {
  this.employees = _.cloneDeep(this.passedEmployees);
  this.employees = _.map(this.employees, (e) => {
    return { ...e, employeeName: nicknameAndLastName(e) };
  });
} // mounted

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

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
 * Copyies the list of employee emails to the user's clipboard.
 */
async function copyEmailList() {
  let list = this.getList();
  await navigator.clipboard.writeText(list);
  this.copied = true;
} // copyEmailList

/**
 * Generate the list of emails and separate by comma for the mail service.
 */
function emailEmployees() {
  let list = this.getList();
  window.open(list, '_blank');
} // emailEmployees

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
 * Gets the formatted list of employee emails for the email client.
 */
function getList() {
  let list = 'mailto:';
  _.forEach(this.employees, (e) => {
    if (e.employeeNumber < 90000) {
      // do not include fake employee emails
      list += e.email ? `${e.email},` : '';
    }
  });
  return list;
} // getList

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
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  computed: {
    filteredEmployees
  },
  data() {
    return {
      activate: false, // dialog activator
      copied: false,
      employees: [],
      employeeSearch: '',
      listLimit: 2000
    };
  },
  methods: {
    copyEmailList,
    customFilter,
    emailEmployees,
    emit,
    getList
  },
  mounted,
  props: ['passedEmployees']
};
</script>

<style scoped>
hr {
  width: 100%;
  height: 3px;
  border: none;
}

.basecamp {
  background-color: rgb(254, 220, 45) !important;
}

.middle {
  background: linear-gradient(to right, #4fc3f7 0%, rgb(254, 220, 45) 100%);
}
</style>
