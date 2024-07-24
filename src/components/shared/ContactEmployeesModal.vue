<!-- eslint-disable vue/no-v-model-argument -->
<template>
  <div>
    <!-- Modal Card -->
    <v-card>
      <!-- Modal Title -->
      <v-card-title class="d-flex align-center text-h5 header_style">Contact Employees</v-card-title>
      <!-- Modal Content -->
      <v-card-text class="mt-4">
        <v-alert v-if="getList().length >= listLimit" density="compact" type="info">
          Email list is too large for the default email client, please use the 'copy to clipboard' button and manually
          paste into the email client
        </v-alert>
        <v-autocomplete
          v-model="employees"
          :items="filteredEmployees"
          :custom-filter="employeeFilter"
          multiple
          chips
          clearable
          closable-chips
          variant="underlined"
          :label="employees.length == 1 ? `${employees.length} Employee` : `${employees.length} Employees`"
          v-model:search="employeeSearch"
          @update:model-value="employeeSearch = ''"
          item-title="employeeName"
          return-object
        >
          <template v-slot:chip="{ props, item }">
            <v-chip
              v-bind="props"
              class="mb-1"
              :size="isMobile() || employees.length > 40 ? 'x-small' : employees.length > 10 ? 'small' : 'default'"
              >{{ item.raw.employeeName }}</v-chip
            >
          </template>
        </v-autocomplete>
      </v-card-text>
      <!-- Action Button -->
      <v-card-actions>
        <v-btn @click="copyEmailList()" :size="isMobile() ? 'x-small' : 'small'" variant="text" color="grey-darken-1">
          Copy to Clipboard
          <v-icon v-if="copied" end color="green">mdi-check</v-icon>
          <v-icon v-else end>mdi-content-copy</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          @click="emailEmployees()"
          :size="isMobile() ? 'x-small' : 'default'"
          variant="text"
          color="light-blue"
          class="mr-1"
        >
          Group Email
          <v-icon end>mdi-email</v-icon>
        </v-btn>
        <v-btn
          color="grey-darken-3"
          variant="text"
          :size="isMobile() ? 'x-small' : 'default'"
          @click="
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

<script setup>
import _ from 'lodash';
import { computed, ref, onMounted, inject } from 'vue';
import { useStore } from 'vuex';
import { nicknameAndLastName } from '@/shared/employeeUtils';
import { employeeFilter } from '@/shared/filterUtils';
import { isMobile } from '@/utils/utils';
import { useDisplayCustom } from '@/components/shared/StatusSnackbar.vue';

// |--------------------------------------------------|
// |                                                  |
// |                       DATA                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['passedEmployees']);
const store = useStore();
const emitter = inject('emitter');
const activate = ref(false);
const copied = ref(false);
const employees = ref([]);
const employeeSearch = ref('');
const listLimit = ref(2000);

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const filteredEmployees = computed(() => {
  let employees = _.filter(store.getters.employees, (e) => {
    return e.workStatus > 0;
  });
  return _.map(employees, (e) => {
    return {
      ...e,
      employeeName: nicknameAndLastName(e)
    };
  });
});

/**
 * Mounted life cycle hook
 */
onMounted(() => {
  employees.value = _.cloneDeep(props.passedEmployees);
  employees.value = _.map(employees.value, (e) => {
    return { ...e, employeeName: nicknameAndLastName(e) };
  });
}); // mounted

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Copyies the list of employee emails to the user's clipboard.
 */
async function copyEmailList() {
  let list = getList();
  await navigator.clipboard.writeText(list);

  //display copied status
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 3000);
  useDisplayCustom('Copied email list to clipboard', 'CUSTOM', 3000, 'black', 'red', 'bottom');
} // copyEmailList

/**
 * Generate the list of emails and separate by comma for the mail service.
 */
function emailEmployees() {
  let list = 'mailto:' + getList();
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
    emitter.emit(msg, data);
  } else {
    // data does not exist
    emitter.emit(msg);
  }
} // emit

/**
 * Gets the formatted list of employee emails for the email client.
 */
function getList() {
  let list = '';
  _.forEach(employees.value, (e) => {
    if (e.employeeNumber < 90000) {
      // do not include fake employee emails
      list += e.email ? `${e.email},` : '';
    }
  });
  return list;
} // getList
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
