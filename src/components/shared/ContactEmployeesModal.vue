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
        <v-row>
          <v-col cols="5" class="d-flex justify-center">
            <v-btn @click="emailEmployees()" color="light-blue lighten-2"
              >Group Email
              <v-icon right>email</v-icon>
            </v-btn>
          </v-col>
          <v-col cols="2" class="d-flex justify-center align-center"> OR </v-col>
          <v-col cols="5" class="d-flex justify-center">
            <v-btn @click="pingEmployees()" class="basecamp">
              Basecamp Ping
              <v-icon large>$basecamp</v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <!-- Modal Divider -->
        <v-row class="my-1">
          <v-col cols="5" class="px-0">
            <hr class="light-blue lighten-1" />
          </v-col>
          <v-col cols="2" class="px-0">
            <hr class="middle" />
          </v-col>
          <v-col cols="5" class="px-0">
            <hr class="basecamp" />
          </v-col>
        </v-row>
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
        <div>
          <v-btn @click="copyEmailList()" small text color="grey darken-1">
            Copy to Clipboard
            <v-icon v-if="copied" right>mdi-check</v-icon>
            <v-icon v-else right>mdi-content-copy</v-icon>
          </v-btn>
        </div>
      </v-card-text>
      <!-- Action Button -->
      <v-card-actions>
        <v-spacer></v-spacer>
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
import api from '@/shared/api';
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
  let list = '';
  _.forEach(this.employees, (e) => {
    if (e.employeeNumber < 90000) {
      // do not include fake employee emails
      list += e.email ? `${e.email},` : '';
    }
  });
  await navigator.clipboard.writeText(list);
  this.copied = true;
} // copyEmailList

/**
 * Generate the list of emails and separate by comma for the mail service.
 */
function emailEmployees() {
  let list = 'mailto:';
  _.forEach(this.employees, (e) => {
    if (e.employeeNumber < 90000) {
      // do not include fake employee emails
      list += e.email ? `${e.email},` : '';
    }
  });
  window.open(list, '_blank');
} // emailEmployees

/**
 * Generate the Basecamp URL of a circle with all employees to ping.
 */
async function pingEmployees() {
  let emails = _.map(this.employees, (e) => e.email);
  let data = { emails };
  let url = await api.getBasecampCircle(data);
  if (url) {
    url = url.replace('api', '');
    window.open(url, '_blank');
  }
} // pingEmployees

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
      employeeSearch: ''
    };
  },
  methods: {
    copyEmailList,
    customFilter,
    emailEmployees,
    emit,
    pingEmployees
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
