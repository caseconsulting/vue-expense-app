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
    <div v-show="oldImage || newImage">
      <v-card>
        <v-card-title class="beta_header_style">Expense {{ status }} at {{ date }}</v-card-title>
        <v-card-text class="mt-2"
          ><v-row v-if="!oldImage"
            ><v-col
              ><b>Original Expense Details</b>
              <div v-for="data in after" :key="data.purchaseDate">{{ data }}</div></v-col
            ></v-row
          >
          <v-row v-else-if="!newImage"
            ><v-col
              ><b>Final Expense Details</b>
              <div v-for="data in before" :key="data.purchaseDate">{{ data }}</div></v-col
            ></v-row
          >
          <v-row v-else
            ><v-col
              ><b>Old Expense Details</b>
              <div v-for="data in before" :key="data.purchaseDate">{{ data }}</div></v-col
            ><v-col
              ><b>Expense Detail Changes</b>
              <div
                :style="change.includes(data) ? 'background-color: yellow' : ''"
                v-for="data in after"
                :key="data.purchaseDate"
              >
                {{ data }}
              </div></v-col
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
import { onBeforeMount, reactive, ref, watch } from 'vue';
import { useStore } from 'vuex';
import api from '../shared/api';
import { updateStoreEmployees } from '../utils/storeUtils';
import { getEmployeeByID } from '../shared/employeeUtils';
import _reverse from 'lodash/reverse';

const store = useStore();
const date = ref(null);
const status = ref(null);
const before = ref(null);
const change = ref([]);
const after = ref(null);
const expenseId = ref(null);
const oldImage = ref(null);
const newImage = ref(null);

// *✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫*
// ❃                                                 ❃
// ❇                      STATE                      ❇
// ❉                                                 ❉
// *✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫*

// Filters in the control panel. these filters are reactive, but by default only filter the currently loaded data.
// To load more data, the user must click the search button, which queries the database based on these filters.
const filters = reactive({
  search: '',
  auditType: 'crud',
  startDate: null,
  endDate: null
});

const loadedAudits = ref([]);

// *✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫*
// ❃                                                 ❃
// ❇                     DISPLAY                     ❇
// ❉                                                 ❉
// *✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫✮❆✦✯✿✧✩❄✬✭❀✫*

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
 * Finds the changes from audit to audit and store them
 */
function findChanges(beforeAudit, afterAudit) {
  change.value = [];
  beforeAudit.forEach((detail, index) => {
    if (!(detail === afterAudit[index])) {
      change.value.push(afterAudit[index]);
    }
  });
}

/**
 * Handles the audit details view based on what kind of audit it is
 *
 * @param audit the audit at that specific point in the expense
 */
function handleClick(audit) {
  date.value = audit.date;
  status.value = determineStatus(audit).toLowerCase();
  oldImage.value = audit.oldImage;
  newImage.value = audit.newImage;
  if (!oldImage.value) {
    //for created expense audits
    let employee = getEmployeeByID(newImage.value.employeeId, store.getters.employees);
    after.value = [
      'Expense Owner: ' + employee.firstName + ' ' + employee.lastName,
      'Expense Creator: ' + audit.name,
      'Category: ' + newImage.value.category,
      'Cost: $' + newImage.value.cost,
      'Purchase Date: ' + dayjs(newImage.value.purchaseDate).format('MM/DD/YYYY'),
      'Description: ' + newImage.value.description,
      'Show On Feed: ' + newImage.value.showOnFeed
    ];
  } else if (!newImage.value) {
    //for deleted expense audits
    let employee = getEmployeeByID(oldImage.value.employeeId, store.getters.employees);
    before.value = [
      'Expense Owner: ' + employee.firstName + ' ' + employee.lastName,
      'Expense Deleter: ' + audit.name,
      'Category: ' + oldImage.value.category,
      'Cost: $' + oldImage.value.cost,
      'Purchase Date: ' + dayjs(oldImage.value.purchaseDate).format('MM/DD/YYYY'),
      'Description: ' + oldImage.value.description,
      'Show On Feed: ' + oldImage.value.showOnFeed
    ];
  } else {
    //for updated expense audits
    let employee = getEmployeeByID(oldImage.value.employeeId, store.getters.employees);
    before.value = [
      'Expense Owner: ' + employee.firstName + ' ' + employee.lastName,
      'Expense Updater: ' + audit.name,
      'Category: ' + oldImage.value.category,
      'Cost: $' + oldImage.value.cost,
      'Purchase Date: ' + dayjs(oldImage.value.purchaseDate).format('MM/DD/YYYY'),
      'Description: ' + oldImage.value.description,
      'Show On Feed: ' + oldImage.value.showOnFeed
    ];
    after.value = [
      'Expense Owner: ' + employee.firstName + ' ' + employee.lastName,
      'Expense Updater: ' + audit.name,
      'Category: ' + newImage.value.category,
      'Cost: $' + newImage.value.cost,
      'Purchase Date: ' + dayjs(newImage.value.purchaseDate).format('MM/DD/YYYY'),
      'Description: ' + newImage.value.description,
      'Show On Feed: ' + newImage.value.showOnFeed
    ];
    findChanges(before.value, after.value);
  }
}

/**
 * Queries the database based on the current filters
 * (TEMP) currently only grabs the most recent expense audit and any audits relating to that expense
 */
async function query() {
  loading.audits = true;

  // convert string audit type to database compatible type

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
          date: dayjs(audit.createdAt).format('MM/DD/YYYY')
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

    if (audit?.tableItemId !== expenseId.value) {
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
  await query(); // load table data
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

#table {
  width: 100%;
  padding: 0px;

  display: flex;
  flex-flow: column nowrap;
  place-content: center space-around;
  place-items: center;
  gap: 8px;
}

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
