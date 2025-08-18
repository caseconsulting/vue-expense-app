<template>
  <div>
    <v-container fluid class="px-1 px-md-4">
      <v-row>
        <v-col cols="6" xl="3" lg="3" md="3" sm="6">
          <v-autocomplete
            v-model="employeeSearch"
            :custom-filter="employeeFilter"
            :items="remindedEmployees"
            label="Search Employees"
            variant="underlined"
            auto-select-first
            hide-details
            clearable
            :item-title="(item) => formatEmployeeName(item)"
            @click:clear="
              search = null;
              refreshDropdownItems();
            "
          />
        </v-col>
        <v-col cols="2">
          <date-picker
            v-tooltip="{ text: 'Untoggle Only Latest to use date filters', 'z-index': disableDates ? 9999 : -1 }"
            :disabled="disableDates"
            v-model="startDate"
            clearable
            label="Start Date"
          />
        </v-col>
        <v-col cols="2">
          <date-picker
            :disabled="disableDates"
            v-tooltip="{ text: 'Untoggle Only Latest to use date filters', 'z-index': disableDates ? 9999 : -1 }"
            v-model="endDate"
            clearable
            label="End Date"
          />
        </v-col>
        <v-col cols="4">
          <v-switch
            :disabled="disableOnlyLatest"
            v-tooltip="{ text: 'Remove date filters to use this toggle', 'z-index': disableOnlyLatest ? 9999 : -1 }"
            v-model="onlyLatest"
            color="primary"
            label="Only Latest Reminder"
          />
        </v-col>
      </v-row>

      <div class="italics mb-4 ml-2">
        <v-icon icon="mdi-information-outline" class="mb-1" size="small" />
        {{ includedText }}
      </div>

      <v-data-table
        :search="employeeSearch"
        :headers="headers"
        :items="filteredReminders"
        :items-per-page="50"
        :sort-by="sortBy"
        @click:row="handleClick"
        class="elevation-1"
      />
    </v-container>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { format, isSameOrAfter, isSameOrBefore } from '@/shared/dateUtils';
// import { userRoleIsAdmin, userRoleIsManager } from '@/utils/utils';
import { employeeFilter } from '@/shared/filterUtils';
// import TagsFilter from '@/components/shared/TagsFilter.vue';
import DatePicker from '@/components/shared/DatePicker.vue';
const store = useStore();
const router = useRouter();

// |--------------------------------------------------|
// |                                                  |
// |                       DATA                       |
// |                                                  |
// |--------------------------------------------------|

const headers = ref([
  {
    title: 'Employee',
    key: 'employee.name',
    value: (item) => formatEmployeeName(item.employee)
  },
  {
    title: 'Phone Number',
    key: 'phoneNumber',
    value: (item) => formatPhoneNumber(item.phoneNumber)
  },
  {
    title: 'Date/time',
    key: 'timestamp',
    value: (item) => format(item.timestamp, null, 'MMM DD YYYY HH:mm')
  },
  {
    title: `Total Reminders`,
    key: 'reminderCount',
    value: (item) => reminderCounts.value[item.employee.id][onlyLatest.value ? 'total' : 'filtered']
  }
]); // datatable headers
const employeeSearch = ref(null); // query text for datatable search field
const startDate = ref(null);
const endDate = ref(null);
const onlyLatest = ref(false);
const sortBy = ref([{ key: 'timestamp', order: 'desc' }]); // sort datatable items

const reminders = ref([]); // all reminders
const remindedEmployees = ref(new Set()); // all employees who have been reminded at least once
const reminderCounts = ref({}); // all employees who have been reminded at least once
const latestReminder = ref({}); // quick reference for an employee's latest reminder

// |--------------------------------------------------|
// |                                                  |
// |                LIFECYCLE HOOKS                   |
// |                                                  |
// |--------------------------------------------------|

/**
 * The created lifecycle hook.
 */
onMounted(() => {
  // index datasets for easy searching
  for (let employee of store.getters.employees) {
    reminderCounts.value[employee.id] = { total: 0, filtered: 0 };
    let basicEmployee = {
      id: employee.id,
      nickname: employee.nickname,
      firstName: employee.firstName,
      lastName: employee.lastName,
      employeeNumber: employee.employeeNumber
    };
    // add to array of employees who have been reminded
    if (employee.timesheetReminders?.length > 0) remindedEmployees.value.add(basicEmployee);
    // add their reminders to array of all reminders
    for (let reminder of employee.timesheetReminders ?? []) {
      let extendedReminder = { ...reminder, employee: basicEmployee, reminderCount: -1 };
      reminders.value.push(extendedReminder);
      addLatestReminder(extendedReminder);
      incrementReminderCount(employee.id, 'total');
    }
  }
}); // created

// format employee name for display
function formatEmployeeName(employee) {
  return `${employee.nickname || employee.firstName} ${employee.lastName}`;
}

// format phone numbers to be visualy friendly
function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return;
  let numbers = phoneNumber.replace(/\D/g, '');
  if (numbers.length === 10) {
    // format (xxx) xxx-xxxx
    let a = numbers.substring(0, 3);
    let b = numbers.substring(3, 6);
    let c = numbers.substring(6, 10);
    return `(${a}) ${b}-${c}`;
  } else if (numbers.length === 11) {
    // format +x (xxx) xxx-xxxx
    let a = numbers.substring(0, 1);
    let b = numbers.substring(1, 4);
    let c = numbers.substring(4, 7);
    let d = numbers.substring(7, 11);
    return `+${a} (${b}) ${c}-${d}`;
  }
  // if nothing else returned then the format is uncertain,
  // just return the orginal phone number
  return phoneNumber;
}

// helper to compare and potentially add a reminder as the most recent one for an employee
function addLatestReminder(rem) {
  // if this is the employee's first reminder, just set it
  if (!latestReminder.value[rem.employee.id]) {
    latestReminder.value[rem.employee.id] = rem;
    return;
  }

  // compare to currently stored reminder to the new one and replace if needed
  let curr = latestReminder.value[rem.employee.id];
  if (isSameOrAfter(rem.timestamp, curr.timestamp, 'hour')) {
    latestReminder.value[rem.employee.id] = rem;
  }
}

// resets reminder count for given employee, defaulting to filtered
function resetReminderCount(eId, type = 'filtered') {
  reminderCounts.value[eId][type] = 0;
}

// increments reminder count for given employee, defaulting to filtered as type
function incrementReminderCount(eId, type = 'filtered') {
  reminderCounts.value[eId][type]++;
}

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const filteredReminders = computed(() => {
  let data = [];

  let rawData = onlyLatest.value ? Object.values(latestReminder.value) : reminders.value;

  // each item must pass through all filters to be added to returning data
  let seenEmployees = new Set();
  for (let reminder of rawData) {
    // filter by start and end date
    if (startDate.value && !isSameOrAfter(reminder.timestamp, startDate.value, 'day')) continue;
    if (endDate.value && !isSameOrBefore(reminder.timestamp, endDate.value, 'day')) continue;

    // handle reminder count summation
    if (!seenEmployees.has(reminder.employee.id)) {
      resetReminderCount(reminder.employee.id);
      seenEmployees.add(reminder.employee.id);
    }
    incrementReminderCount(reminder.employee.id);

    // add to returned data
    data.push(reminder);
  }

  return data;
});

const includedText = computed(() => {
  if (onlyLatest.value) {
    return 'Only the most recent reminder sent to an employee is shown, but "Total Reminders" includes all reminders sent.';
  } else if (startDate.value || endDate.value) {
    return 'Only reminders within the selected start and end date are shown, and "Total Reminders" is the tally of these.';
  } else {
    return 'All reminders are shown, and "Total Reminders" is the total amount of reminders sent to the employee.';
  }
});

const disableDates = computed(() => {
  return onlyLatest.value;
});

const disableOnlyLatest = computed(() => {
  let dateEmpty = (d) => !d || d === '';
  return !dateEmpty(startDate.value) || !dateEmpty(endDate.value);
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * handles click event of the employee table entry
 *
 * @param item - the employee
 */
function handleClick(_, { item }) {
  router.push(`/employee/${item.employee.employeeNumber}`);
} //handleClick
</script>

<style lang="css" scoped>
.row-pointer :deep(tbody tr :hover) {
  cursor: pointer;
}
</style>

<style lang="scss" scoped>
@use 'src/assets/styles/styles' as *;
.inactive {
  color: $case-red;
}
</style>
