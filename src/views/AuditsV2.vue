<template>
  <div id="container">
    <div id="left-side">
      <!-- contains control panel and graphs -->

      <v-card id="control-panel">
        <v-card-title class="beta_header_style">
          <h2>Control Panel</h2>
        </v-card-title>

        <v-card-text id="search-filters">
          <span>General filters</span>

          <v-text-field
            v-model="filters.search"
            label="Search"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details="auto"
            style="width: 80%"
          />

          <v-autocomplete
            id="audit-type-filter"
            v-model="filters.auditType"
            :items="auditTypes"
            label="Audit Type"
            variant="outlined"
            density="compact"
            hide-details="auto"
            style="width: 80%"
          />

          <div id="audit-date-filter">
            <date-picker
              v-model="filters.startDate"
              label="Start Date"
              variant="outlined"
              density="compact"
              hide-details="auto"
              clearable
              style="flex-grow: 1"
            />

            <date-picker
              v-model="filters.endDate"
              label="End Date"
              variant="outlined"
              density="compact"
              hide-details="auto"
              clearable
              style="flex-grow: 1"
            />
          </div>

          <div style="width: 80%"><v-divider /></div>
          <span> {{ filters.auditType }} filters </span>

          <div id="control-panel-settings">
            <v-autocomplete
              v-model="filters.notifType"
              :items="displayNotifTypes"
              item-value=""
              variant="outlined"
              density="compact"
              hide-details="auto"
              style="grid-column: span 2; width: 80%"
            />

            <v-checkbox hide-details="auto" label="Checkbox" />
            <v-checkbox hide-details="auto" label="Checkbox" />
            <v-checkbox hide-details="auto" label="Checkbox" />
          </div>

          <div style="width: 80%"><v-divider /></div>
          <v-btn onclick="query()" :disabled="loading.audits"> Search </v-btn>
        </v-card-text>
      </v-card>

      <v-card id="graphs">
        <v-card-title class="beta_header_style">
          <h2>Statistics</h2>
        </v-card-title>

        <v-card-text>
          <span>Contains graphs of some data, maybe general trends, maybe related to current search, idk</span>

          <v-skeleton-loader v-if="loading.graph" type="image" style="border-radius: 8px" />
          <div
            v-else
            style="width: 100%; height: 300px; background-color: lightgray; border-radius: 8px; align-content: center"
          >
            Graph
          </div>
        </v-card-text>
      </v-card>
    </div>

    <div id="right-side">
      <!-- contains table -->
      <v-card id="table">
        <v-card-title class="beta_header_style">
          <h2>Audits</h2>
        </v-card-title>
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
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { onBeforeMount, reactive, ref, watch } from 'vue';
import DatePicker from '../components/shared/DatePicker.vue';
import api from '../shared/api';
// import { AuditType } from '../shared/models/audits/audts';
import { useStore } from 'vuex';
import { getEmployeeByID } from '../shared/employeeUtils';
import { NotificationReason } from '../shared/models/audits/notifications';
const store = useStore();

/**
 * A row in the data table that represents a notification audit
 * @typedef {Notification & { name: string, date: string }} NotificationRow
 */

// *✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫*
// ❃                                                  ❃
// ❇                    CONSTANTS                     ❇
// ❉                                                  ❉
// *✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫*

const auditTypes = ['Profile', 'Expense', 'Login', 'Notification', 'Error'];
const displayNotifTypes = [
  'Expense Rejection',
  'Expense Revisal',
  'Timesheet (weekly)',
  'Timesheet (monthly)',
  'Training Hours',
  'High Five',
  'None'
];

// *✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫*
// ❃                                                  ❃
// ❇                      STATE                       ❇
// ❉                                                  ❉
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
// ❃                                                  ❃
// ❇                     DISPLAY                      ❇
// ❉                                                  ❉
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

// datatable header config
const headers = ref([
  { title: 'Date', key: 'date' },
  { title: 'Employee', key: 'name' },
  {
    title: 'Type',
    key: 'reason',
    value: (notif) => notifTypeMap(notif.reason)
  },
  { title: 'Sent to', key: 'sentTo' }
]);

// *✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫*
// ❃                                                  ❃
// ❇                     METHODS                      ❇
// ❉                                                  ❉
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

  const res = await api.getAudits({
    startDate: filters.startDate,
    endDate: filters.endDate,
    notifReason: notifTypeMap(filters.notifType)
  });

  if (res instanceof AxiosError) {
    console.error('Server responded with error:', res);
  } else {
    try {
      loadedAudits.value = res;
      const employees = store.getters.employees;

      loadedAudits.value = loadedAudits.value.map((audit) => {
        const empId = audit.receiverId;
        const emp = getEmployeeByID(empId, employees);

        return {
          ...audit,
          name: `${emp.firstName} ${emp.lastName}`,
          date: dayjs(audit.createdAt).format('MM/DD/YYYY HH:mm')
        };
      });

      filterDisplayAudits();
    } catch (err) {
      console.error("Couldn't parse response:", res);
    }
  }

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
// ❃                                                  ❃
// ❇                 LIFECYCLE HOOKS                  ❇
// ❉                                                  ❉
// *✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫*

onBeforeMount(async () => {
  query(); // load table data
  loading.graph = false; // TODO: load graph
});

// *✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫*
// ❃                                                  ❃
// ❇                    WATCHERS                      ❇
// ❉                                                  ❉
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

/* vuetify's md breakpoint */
@media (max-width: 960px) {
  #container {
    flex-direction: column;
    align-items: center;
  }

  #left-side {
    flex: 1 1 auto;
    flex-flow: row nowrap;
    align-items: start;
  }

  #right-side {
    width: 100%;
  }

  #control-panel-settings {
    width: 100%;

    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
  }
}

/* vuetify's sm breakpoint */
@media (max-width: 600px) {
  #left-side {
    flex-flow: column nowrap;
  }
}
</style>
