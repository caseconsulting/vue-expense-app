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
            <v-timeline-item v-for="audit in displayAudits" :key="audit.id">
              <template v-slot:opposite>
                <h4 class="rotate">{{ determineStatus(audit) }}</h4>
              </template>
              <div>{{ audit.date }}</div>
              <template v-slot:icon>
                <v-btn @click="handleClick(audit)" density="compact" variant="text" icon="mdi-abacus">
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
              <div v-for="data in before" :key="data.purchaseDate">{{ data }}</div></v-col
            ><v-col
              ><b>After</b>
              <div v-for="data in after" :key="data.purchaseDate">{{ data }}</div></v-col
            ></v-row
          ></v-card-text
        >
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { onBeforeMount, onMounted, reactive, ref, watch } from 'vue';
import { useStore } from 'vuex';
import api from '../shared/api';
import { updateStoreEmployees } from '../utils/storeUtils';
import { getEmployeeByID } from '../shared/employeeUtils';
import _reverse from 'lodash/reverse';

const store = useStore();
const date = ref(null);
const status = ref(null);
const before = ref(null);
const after = ref(null);
const expenseId = ref(null);

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
function handleClick(audit) {
  date.value = audit.date;
  status.value = determineStatus(audit);
  let oldImage = audit.oldImage;
  let newImage = audit.newImage;
  before.value = [
    oldImage?.cost || '',
    oldImage?.description || '',
    oldImage?.purchaseDate || '',
    oldImage?.showOnFeed || ''
  ];
  after.value = [
    newImage?.cost || '',
    newImage?.description || '',
    newImage?.purchaseDate || '',
    newImage?.showOnFeed || ''
  ];
}

/**
 * Queries the database based on the current filters
 */
async function query() {
  loading.audits = true;

  // convert string audit type to database compatible type
  //let realType = AuditType.CRUD;

  const res = await api.getCrudAudits({
    startDate: filters.startDate,
    endDate: filters.endDate
  });

  if (res instanceof AxiosError) {
    console.error('Server responded with error:', res);
  } else {
    try {
      if (res) {
        loadedAudits.value = res;
      }
      let employees = store.getters.employees;
      while (!employees) {
        await updateStoreEmployees();
        employees = store.getters.employees;
      }

      loadedAudits.value = loadedAudits.value.map((audit) => {
        const empId = audit.actorId;
        const emp = getEmployeeByID(empId, employees);

        return {
          ...audit,
          name: `${emp.firstName} ${emp.lastName}`,
          date: dayjs(audit.createdAt).format('MM/DD/YYYY HH:mm')
        };
      });

      expenseId.value = loadedAudits.value[0].tableItemId;

      filterDisplayAudits();
    } catch (err) {
      console.error('Error handling resposne:', err);
    }
  }

  loading.audits = false;
}

function filterDisplayAudits() {
  displayAudits.value = loadedAudits.value.filter((audit) => {
    let valid = true;

    if (audit.tableItemId !== expenseId.value) {
      valid = false;
    }

    return valid;
  });
  displayAudits.value = _reverse(displayAudits.value);
}

/**
 * Function to determine the status of expense at each audit
 *
 * @param audit - audit being checked for its status
 */
function determineStatus(audit) {
  if (!audit.oldImage) {
    return 'Created';
  }
  if (!audit.newImage) {
    return 'Deleted';
  }
  return 'Updated';
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

onMounted(() => {
  date.value = loadedAudits.value[0];
  status.value = loadedAudits.value[0];
  before.value = ['Before'];
  after.value = ['After'];
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
