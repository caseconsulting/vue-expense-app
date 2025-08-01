<template>
  <div>
    <div>
      <!-- contains table -->
      <v-card id="table">
        <v-card-title class="beta_header_style">
          <h2>Expense History</h2>
        </v-card-title>
        <v-container>
          <v-timeline truncate-line="both" align="center" side="end" direction="horizontal">
            <v-timeline-item v-for="data in dummyData" :key="data.id">
              <template v-slot:opposite>
                <h4 class="rotate">{{ data.status }}</h4>
              </template>
              <div>{{ data.date }}</div>
              <template v-slot:icon>
                <v-btn @click="handleClick(data)" density="compact" variant="text" icon="mdi-abacus">
                  <v-tooltip activator="parent" location="right">
                    <span>Click for more info</span>
                  </v-tooltip>
                </v-btn>
              </template>
            </v-timeline-item>
          </v-timeline>
        </v-container>
      </v-card>
    </div>
    <div>
      <v-card>
        <v-card-title class="beta_header_style">Expense at {{ date }}</v-card-title>
        <!-- <v-data-table :headers="headers" :items="displayAudits" :loading="loading.audits" multi-sort>
          <template #loading>
            <v-skeleton-loader type="table-row" />
          </template>
        </v-data-table> -->
        <v-card-text class="mt-2"
          ><v-row
            ><v-col
              ><b>Expense Status</b>
              <div>{{ status }}</div></v-col
            ><v-col
              ><b>Before</b>
              <div>{{ before }}</div></v-col
            ><v-col
              ><b>After</b>
              <div>{{ after }}</div></v-col
            ></v-row
          ></v-card-text
        >
      </v-card>
    </div>
  </div>
</template>

<script setup>
import dayjs from 'dayjs';
import { onBeforeMount, reactive, ref, watch } from 'vue';
import { NotificationReason } from '../shared/models/audits/notifications';

const date = ref('');
const status = ref('');
const before = ref('');
const after = ref('');

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

let dummyData = ref([
  { date: '3/15/25', status: 'Created', id: 0 },
  { date: '4/28/25', status: 'Updated', id: 1 },
  { date: '4/29/25', status: 'Updated', id: 4 },
  { date: '4/30/25', status: 'Updated', id: 5 },
  { date: '4/31/25', status: 'Updated', id: 6 },
  { date: '5/13/25', status: 'Updated', id: 2 },
  { date: '5/30/25', status: 'Deleted', id: 3 }
]); //dummy data for the graph

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

// const headers = ref([
//   { title: 'Date', key: 'date' },
//   { title: 'Employee', key: 'name' },
//   { title: 'Expense Type', key: 'reason' },
//   { title: 'Status', key: 'status' }
// ]);

// *✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫*
// ❃                                                 ❃
// ❇                     METHODS                     ❇
// ❉                                                 ❉
// *✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫*

/**
 *
 *
 * @param data the data at that specific point in the expense
 */
function handleClick(data) {
  date.value = data.date;
  status.value = data.status;
  before.value = 'Expense data before';
  after.value = 'Expense data after';
}

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

.rotate {
  transform-origin: 50% 55%;
  transform: rotate(270deg);
}
</style>
