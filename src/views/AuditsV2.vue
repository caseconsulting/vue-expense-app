<template>
  <div id="container">
    <div id="left-side">
      <!-- contains control panel and graphs -->

      <v-card id="control-panel">
        <v-card-title class="beta_header_style">
          <h2>Control Panel</h2>
        </v-card-title>

        <v-card-text id="search-filters">
          <span>This contains the search filters</span>
          <h3>Type:</h3>
          <v-autocomplete
            v-model="filters.selectedType"
            :items="auditTypes"
            variant="outlined"
            hide-details="auto"
            style="width: 80%"
          />

          <div style="width: 80%"><v-divider /></div>
          <span>Other settings specific to audit type</span>

          <div id="control-panel-settings">
            <v-checkbox hide-details="auto" label="Checkbox" />
            <v-checkbox hide-details="auto" label="Checkbox" />
            <v-checkbox hide-details="auto" label="Checkbox" />
            <v-text-field style="width: 80%" label="Some text" hide-details="auto" />
          </div>
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
        <span>Loads some recent audits by default, otherwise contains search results</span>

        <v-data-table :headers="headers" :items="audits" :search="tableSearch" :loading="loading.audits" multi-sort>
          <template #loading>
            <v-skeleton-loader type="table-row" />
          </template>
        </v-data-table>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import dayjs from 'dayjs';
import { onMounted, reactive, ref } from 'vue';
import { Notification, NotificationReason } from '../shared/models/audits/notifications';

/**
 * A row in the data table that represents a notification audit
 * @typedef {Notification & { name: string, date: string }} NotificationRow
 */

const auditTypes = ['Profile', 'Expense', 'Notification', 'Error'];
const filters = reactive({
  selectedType: 'Notification',

  // The table will apply this search as a filter, but doesn't create a field to enter text
  // That must be done manually, but it can be placed anywhere as long as it v-models this ref
  search: ''
});
const loading = reactive({
  audits: true,
  graph: true
});

const headers = ref([
  { title: 'Date', key: 'date' },
  { title: 'Employee', key: 'name' },
  {
    title: 'Type',
    key: 'reason',
    value: (/** @type {NotificationRow} */ notif) => {
      switch (notif.reason) {
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
  },
  { title: 'Sent to', key: 'sentTo' }
]);

/** @type {NotificationRow[]} */
const audits = [];

// for demonstration: filing in dummy data
for (let i = 0; i < 10; i++) {
  const now = dayjs();
  // for demonstration: random time between now and a month ago
  const time = new Date(now.valueOf() - Math.random() * 7 * 24 * 60 * 60 * 1000);

  const sentTo = Math.random() < 0.5 ? 'really-really-long-email@consultwithcase.com' : '555-555-5555';

  /** @type NotificationRow */
  const audit = new Notification(0, time, 'uuid', sentTo, NotificationReason.WEEKLY_TIME_REMINDER);
  audit.name = 'Really Really Long Name';
  audit.date = dayjs(audit.createdAt).format('MM/DD/YYYY HH:mm');

  audits.push(audit);
}

onMounted(async () => {
  // for demonstration: wait a bit then stop loading
  await new Promise((resolve) => setTimeout(resolve, 500));
  loading.audits = false;
  loading.graph = false;
});
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
