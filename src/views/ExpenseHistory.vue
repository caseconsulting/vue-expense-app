<template>
  <div>
    <div>
      <!-- contains table -->
      <v-card id="table">
        <v-card-title class="beta_header_style">
          <h2>Expense History</h2>
        </v-card-title>
        <v-container>
          <v-sparkline :labels="labels" :model-value="value" line-width="1" padding="16" autodraw></v-sparkline>
        </v-container>
      </v-card>
    </div>
    <div>
      <v-card>
        <v-card-title class="beta_header_style">Expense at {{ labels[0] }}</v-card-title>
        <v-data-table :headers="headers" :items="displayAudits" :loading="loading.audits" multi-sort>
          <template #loading>
            <v-skeleton-loader type="table-row" />
          </template>
        </v-data-table>
      </v-card>
    </div>
  </div>
</template>

<script setup>
// import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { onBeforeMount, reactive, ref, watch } from 'vue';
// import { useStore } from 'vuex';
// import DatePicker from '../components/shared/DatePicker.vue';
// import api from '../shared/api';
// import { getEmployeeByID } from '../shared/employeeUtils';
import { NotificationReason } from '../shared/models/audits/notifications';
// import { updateStoreEmployees } from '../utils/storeUtils';
// const store = useStore();

/**
 * A row in the data table that represents a notification audit
 * @typedef {Notification & { name: string, date: string }} NotificationRow
 */

// *✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫*
// ❃                                                 ❃
// ❇                      STATE                      ❇
// ❉                                                 ❉
// *✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫*

// Filters in the control panel. these filters are reactive, but by default only filter the currently loaded data.
// To load more data, the user must click the search button, which queries the database based on these filters.
const filters = reactive({
  search: '',
  auditType: 'Notification',
  startDate: null,
  endDate: null,
  notifType: 'None'
});

/**
 * Currently loaded audits
 * @type {import('vue').Ref<NotificationRow[]>}
 */
const loadedAudits = ref([]);

// *✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫*
// ❃                                                 ❃
// ❇                    CONSTANTS                    ❇
// ❉                                                 ❉
// *✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫*

let labels = ref(['created', '3/15/25', '4/28/25', '5/30/25', 'reimbursed']); //dummy data for the graph
let value = ref([200, 675, 410, 390, 310]);

// *✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫*
// ❃                                                 ❃
// ❇                     DISPLAY                     ❇
// ❉                                                 ❉
// *✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫*

/**
 * Sublist of loaded audits, filtered by the table search filter
 * @type {NotificationRow[]}
 * */
const displayAudits = ref(loadedAudits.value);

// display skeletons for components when loading
const loading = reactive({
  audits: true,
  graph: true
});

const headers = ref([
  { title: 'Date', key: 'date' },
  { title: 'Employee', key: 'name' },
  { title: 'Expense Type', key: 'reason' },
  { title: 'Status', key: 'status' }
]);

// *✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫*
// ❃                                                 ❃
// ❇                     METHODS                     ❇
// ❉                                                 ❉
// *✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫*

/**
 * Maps the displayed notification string to the enum value and vice versa
 * @param {string} val
 * @returns {string?} The converted value. 'None' converts to null
 */
function notifTypeMap(val) {
  switch (val) {
    case 'None':
      return null;
    case 'Expense Rejection':
      return NotificationReason.EXPENSE_REJECTION;
    case 'Expense Revisal':
      return NotificationReason.EXPENSE_REVISAL_REQUEST;
    case 'Timesheet (weekly)':
      return NotificationReason.WEEKLY_TIME_REMINDER;
    case 'Timesheet (monthly)':
      return NotificationReason.MONTHLY_TIME_REMINDER;
    case 'Training Hours':
      return NotificationReason.TRAINING_HOUR_EXCHANGE;
    case 'High Five':
      return NotificationReason.HIGH_FIVE;

    case NotificationReason.EXPENSE_REJECTION:
      return 'Expense Rejection';
    case NotificationReason.EXPENSE_REVISAL_REQUEST:
      return 'Expense Revisal';
    case NotificationReason.WEEKLY_TIME_REMINDER:
      return 'Timesheet (weekly)';
    case NotificationReason.MONTHLY_TIME_REMINDER:
      return 'Timesheet (monthly)';
    case NotificationReason.TRAINING_HOUR_EXCHANGE:
      return 'Training Hours';
    case NotificationReason.HIGH_FIVE:
      return 'High Five';
  }
}

/**
 * Queries the database based on the current filters
 */
async function query() {
  loading.audits = true;

  // convert string audit type to database compatible type
  // let realType;
  // switch (filters.auditType) {
  //   case 'Profile':
  //   case 'Expense':
  //     realType = AuditType.CRUD;
  //     break;
  //   case 'Login':
  //     realType = AuditType.LOGIN;
  //     break;
  //   case 'Notification':
  //     realType = AuditType.NOTIFICATION;
  //     break;
  //   case 'Error':
  //     realType = AuditType.ERROR;
  //     break;
  // }
  loading.audits = false;
}

function filterDisplayAudits() {
  displayAudits.value = loadedAudits.value.filter((/** @type NotificationRow */ audit) => {
    let valid = true;

    // search
    if (filters.search) {
      valid = Object.entries(audit).some(([key, val]) => {
        // ignore dates/numbers/ids that are stringified
        if (key == 'date' || key == 'id' || key == 'receiverId') return false;
        // only check strings
        if (typeof val != 'string') return false;

        // check search string
        if (val.toLowerCase().includes(filters.search.toLowerCase())) return true;
      });
    }

    // dates
    if (filters.startDate) {
      if (!dayjs(filters.startDate).isSameOrBefore(audit.createdAt, 'day')) {
        valid = false;
      }
    }
    if (filters.endDate) {
      if (!dayjs(audit.createdAt).isSameOrBefore(filters.endDate, 'day')) {
        valid = false;
      }
    }

    // notification type / reason
    if (filters.notifType !== 'None') {
      if (audit.reason !== notifTypeMap(filters.notifType)) {
        valid = false;
      }
    }

    return valid;
  });
}

// *✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫*
// ❃                                                 ❃
// ❇                 LIFECYCLE HOOKS                 ❇
// ❉                                                 ❉
// *✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫*

onBeforeMount(async () => {
  query(); // load table data
  loading.graph = false; // TODO: load graph
});

// *✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫*
// ❃                                                 ❃
// ❇                    WATCHERS                     ❇
// ❉                                                 ❉
// *✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫*

// watch for when any of the filters change
watch(filters, filterDisplayAudits, { deep: true });
</script>

<style scoped>
#container {
  display: flex;
  flex-flow: row nowrap;
  place-content: center space-around;
  place-items: flex-start center;
  gap: 16px;
}

#left-side {
  min-width: min(300px, 100%);
  flex-basis: 40%;

  display: flex;
  flex-flow: column nowrap;
  place-content: center;
  place-items: center;
  text-align: center;
  gap: 16px;
}

#right-side {
  flex-grow: 1;
  text-align: center;
}

#control-panel,
#graphs,
#table {
  width: 100%;
  padding: 0px;

  display: flex;
  flex-flow: column nowrap;
  place-content: center space-around;
  place-items: center;
  gap: 8px;
}

#control-panel > *.v-card-title,
#graphs > *.v-card-title,
#table > *.v-card-title {
  width: 100%;
  display: flex;
  place-content: center;
  place-items: center;
  text-align: center;
}

#search-filters {
  width: 100%;
  padding-left: 16px;
  padding-right: 16px;

  display: flex;
  flex-flow: column nowrap;
  place-items: center;
  gap: 8px;
}

#control-panel-settings {
  width: 100%;
  padding: 0px;
  align-self: center;
  justify-self: center;

  display: grid;
  grid-template-columns: repeat(2, minmax(100px, 1fr));
  place-content: center;
  place-items: center;
  gap: 0;
}

#audit-date-filter {
  width: 80%;

  display: flex;
  flex-flow: row nowrap;
  place-content: center;
  place-items: start center;
  gap: 16px;
}
</style>
