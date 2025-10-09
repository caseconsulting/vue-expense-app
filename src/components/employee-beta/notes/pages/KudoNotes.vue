<template>
  <v-col>
    <v-row>
      <v-col class="pl-0" :cols="isMobile() ? '12' : '7'" :class="isMobile() ? 'pb-0' : ''">
        <v-text-field v-model="customKudo.title" variant="outlined" label="Record kudo"></v-text-field>
      </v-col>
      <v-col :cols="isMobile() ? '9' : '4'" :class="isMobile() ? 'pt-0 pl-0' : ''">
        <v-text-field
          :model-value="format(customKudo.date, null, 'MM/DD/YYYY')"
          :class="isMobile() ? 'pt-0' : ''"
          label="Date"
          hint="MM/DD/YYYY format"
          v-mask="'##/##/####'"
          prepend-inner-icon="mdi-calendar"
          @update:focused="customKudo.date = parseEventDate($event)"
          clearable
          @click:prepend="showDateMenu = true"
          @keypress="showDateMenu = false"
          autocomplete="off"
          variant="outlined"
        >
          <v-menu activator="parent" v-model="showDateMenu" :close-on-content-click="false" location="start center">
            <v-date-picker
              v-model="customKudo.date"
              @update:model-value="showDateMenu = false"
              show-adjacent-months
              hide-actions
              keyboard-icon=""
              color="#bc3825"
              title="Date"
            ></v-date-picker>
          </v-menu>
        </v-text-field>
      </v-col>
      <v-col class="pr-0" :cols="isMobile() ? '3' : '1'" :class="isMobile() ? 'pt-0 pr-0' : ''">
        <v-btn icon="mdi-plus" :class="isMobile() ? 'pt-0' : ''" @click="addCustomKudo()"></v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="pl-6">
        <v-row v-if="kudosLoading">
          <v-progress-linear indeterminate></v-progress-linear>
        </v-row>
        <v-row v-else v-for="kudo in kudos" :key="kudo.desc" class="my-2">
          <div class="mb-1">
            <span class="text-grey font-italic">{{ format(kudo.date, 'YYYY-MM-DD', 'MM/DD/YYYY') }}</span>
            <v-icon
              :icon="kudosIcons[kudo.type]"
              :class="`rounded-circle mx-2 mb-1 pa-3 ${kudo.type}-icon`"
              :size="kudosIconSizes[kudo.type] ?? 'small'"
            />
            <br v-if="isMobile()" />
            <span class="cursor-default">{{ kudoText(kudo) }}</span>
            <span v-if="kudo.type === 'custom'">
              <v-icon
                icon="mdi-pencil"
                class="rounded-circle ml-2 mb-1 pa-3"
                size="small"
                @click="editKudo(kudo.index)"
              />
              <v-icon
                icon="mdi-delete"
                class="rounded-circle mx-2 mb-1 pa-3"
                size="small"
                @click="deleteKudo(kudo.index)"
              />
            </span>
            <v-avatar v-else :class="kudo.desc ? 'pointer' : ''" density="compact">
              <v-tooltip v-if="kudo.desc" activator="parent" location="top" max-width="600">{{ kudo.desc }}</v-tooltip>
              <v-icon v-if="kudo.desc" size="x-small">mdi-text</v-icon>
            </v-avatar>
          </div>
        </v-row>
      </v-col>
    </v-row>
  </v-col>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { startOf, format, getTodaysDate } from '@/shared/dateUtils';
import { updateStoreEmployees, updateStoreExpenseTypes } from '@/utils/storeUtils';
import api from '@/shared/api';
import { useStore } from 'vuex';
import { isMobile } from '@/utils/utils';
import _orderBy from 'lodash/orderBy';

const store = useStore();
const props = defineProps(['modelValue', 'user']);
const notes = ref(props.modelValue);

const kudos = ref([]);
const customKudo = ref({ date: getTodaysDate('YYYY-MM-DD') });
const showDateMenu = ref(false);
const kudosLoading = ref(false);

onMounted(async () => {
  buildKudos();
});

/**
 * All kudos should have a `date` (YYYY-MM-DD) and a `type`.
 * Adding a `desc` will add the little note thing with hover.
 */
async function buildKudos() {
  kudosLoading.value = true;
  kudos.value = [];

  // fetch data while doing other things
  let expenseTypes = store.getters.expenseTypes ?? updateStoreExpenseTypes();
  let employees = store.getters.employees ?? updateStoreEmployees();

  // build awards
  for (let award of props.user.awards ?? []) {
    kudos.value.push({
      type: 'award',
      title: award.name,
      date: format(startOf(award.dateReceived, 'month'), null, 'YYYY-MM-DD')
    });
  }

  // build custom kudos
  notes.value.custom.forEach((c, index) => {
    kudos.value.push({
      type: 'custom',
      title: c.title,
      date: format(c.date, null, 'YYYY-MM-DD'),
      index: index
    });
  });

  // build high fives
  // get all high fives
  (await expenseTypes, employees);
  let highFiveET = expenseTypes.find((et) => et.budgetName === 'High Five');
  let highFives = await api.getAllExpenseTypeExpenses(highFiveET.id);
  // filter down to only ones the user received
  highFives = highFives.filter((hf) => hf.recipient === props.user.id);
  let from;
  for (let hf of highFives ?? []) {
    from = employees.find((e) => e.id === hf.employeeId);
    kudos.value.push({
      type: 'high-five',
      from: `${from.nickname || from.firstName} ${from.lastName}`,
      desc: hf.note,
      date: format(hf.reimbursedDate, null, 'YYYY-MM-DD')
    });
  }

  // sort everything based on date (desc)
  kudos.value.sort((a, b) => {
    return a.date < b.date;
  });

  kudos.value = _orderBy(kudos.value, 'date', 'desc');

  kudosLoading.value = false;
}

/**
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM-DD format
 */
function parseEventDate() {
  return format(event.target.value, 'MM/DD/YYYY', 'YYYY-MM-DD');
} // parseEventDate

let kudosIcons = {
  'high-five': 'mdi-hands-pray',
  award: 'mdi-trophy-award',
  custom: 'mdi-hand-heart'
};

// default is small
let kudosIconSizes = {
  custom: 'x-small'
};

function kudoText(kudo) {
  switch (kudo.type) {
    case 'high-five':
      return `High-Five from ${kudo.from}`;
    case 'award':
      return `Received award: ${kudo.title}`;
    case 'custom':
      return `Kudo: ${kudo.title}`;
    default:
      return '';
  }
}

function addCustomKudo() {
  if (customKudo.value.title) {
    notes.value.custom.push({
      type: 'custom',
      date: customKudo.value.date || getTodaysDate('YYYY-MM-DD'),
      title: customKudo.value.title
    });
    customKudo.value = { date: getTodaysDate('YYYY-MM-DD') };
    buildKudos();
  }
}

function deleteKudo(index) {
  notes.value.custom.splice(index, 1);
  buildKudos();
}

function editKudo(index) {
  let kudo = notes.value.custom[index];
  customKudo.value = { ...kudo };
  notes.value.custom.splice(index, 1);
  buildKudos();
}
</script>

<style scoped>
.high-five-icon {
  background: #328b8f;
  color: white;
}
.award-icon {
  background: #f9c64e;
  color: white;
}
.custom-icon {
  background: #f53b3b;
  color: white;
}
</style>
