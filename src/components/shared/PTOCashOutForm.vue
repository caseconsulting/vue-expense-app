<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-card>
      <v-card-title class="d-flex align-center header_style text-h6">
        <h6 class="subtitle" v-if="employee && (userRoleIsAdmin() || userRoleIsManager())">
          Employee: {{ nicknameAndLastName(employee) }}
        </h6>
        <h3>Cash Out PTO</h3>
      </v-card-title>
      <div v-if="!isSubmitting && store.getters.ptoCashOuts && pto">
        <v-card-text v-if="employee">
          <p>
            <span v-if="pto">
              <b>PTO:</b> {{ pto }}h
              <br />
            </span>
            <span v-else>PTO: Loading... <br /></span>
            <span v-if="Number(getPendingPtoCashoutAmount(employee.id)) > 0">
              <b>Pending PTO Cash Out:</b> {{ Number(getPendingPtoCashoutAmount(employee.id)) }}h
            </span>
          </p>
          <div>
            <!-- PTO Cash Out Amount -->
            <v-text-field
              prepend-icon="mdi-clock-outline"
              variant="underlined"
              class="py-2"
              :rules="[
                (v) => !!v || 'Field is required',
                ...getNumberRules(),
                ...getPTOCashOutRules(ptoData.ptoBalance, employee.id, item ? Number(item.amount) : null)
              ]"
              :hint="cashOutHint()"
              v-model.number="ptoCashOutObj.amount"
              label="Number of Hours Requested to be Paid Out"
              required
            ></v-text-field>

            <!-- Approved Date for PTO Cash Out (Optional) -->
            <v-menu
              v-if="userRoleIsAdmin() || userRoleIsManager()"
              :close-on-content-click="false"
              v-model="approvedDateMenu"
              location="start center"
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-model="approvedDateFormatted"
                  id="approvedDate"
                  :rules="getDateOptionalRules()"
                  v-mask="'##/##/####'"
                  variant="underlined"
                  label="Approved Date (optional)"
                  hint="MM/DD/YYYY format"
                  class="mb-4"
                  persistent-hint
                  v-bind="props"
                  @update:focused="
                    ptoCashOutObj.approvedDate = format(approvedDateFormatted, 'MM/DD/YYYY', 'YYYY-MM-DD')
                  "
                  @click:prepend="approvedDateMenu = true"
                  @keypress="approvedDateMenu = false"
                >
                  <template v-slot:prepend>
                    <div class="pointer">
                      <v-icon color="grey-darken-1">mdi-calendar</v-icon>
                    </div>
                  </template>
                </v-text-field>
              </template>
              <v-date-picker
                v-model="ptoCashOutObj.approvedDate"
                @update:model-value="approvedDateMenu = false"
                hide-actions
                show-adjacent-months
                keyboard-icon=""
                color="#bc3825"
                title="Approved Date"
              >
              </v-date-picker>
            </v-menu>
          </div>
          <small>
            *cash outs are paid during the normal payroll period
            <v-avatar
              @click="openLink('https://3.basecamp.com/3097063/buckets/179119/messages/6950289713')"
              class="mb-3"
              size="small"
            >
              <v-tooltip activator="parent" location="top">Click for more information</v-tooltip>
              <v-icon color="#3f51b5">mdi-information</v-icon>
            </v-avatar>
          </small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <!-- Cancel Button -->
          <v-btn color="black" @click="cancel()" variant="text" class="mx-2"> Cancel </v-btn>
          <!-- Submit Button -->
          <v-btn variant="text" class="mx-2" color="success" :disabled="!valid" @click="submit()">
            <template v-slot:prepend>
              <v-icon>mdi-content-save</v-icon>
            </template>
            Submit
          </v-btn>
        </v-card-actions>
      </div>
      <div v-else class="py-10 px-6">
        <v-progress-linear :indeterminate="true"></v-progress-linear>
      </div>
    </v-card>
  </v-form>
</template>

<script setup>
import { getNumberRules, getPTOCashOutRules, getDateOptionalRules } from '@/shared/validationUtils.js';
import api from '@/shared/api.js';
import dateUtils from '@/shared/dateUtils.js';
import { generateUUID, openLink, userRoleIsAdmin, userRoleIsManager } from '../../utils/utils';
import { updateStoreEmployees, updateStorePtoCashOuts } from '../../utils/storeUtils';
import { format } from '../../shared/dateUtils';
import { mask } from 'vue-the-mask';
import { nicknameAndLastName } from '../../shared/employeeUtils';
import _ from 'lodash';
import { computed, onBeforeMount, inject, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useDisplayError, useDisplaySuccess } from '@/components/shared/StatusSnackbar.vue';
// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|
const props = defineProps(['item', 'employeeId', 'pto', 'editing']);
const store = useStore();
const emitter = inject('emitter');

const approvedDateMenu = ref(false);
const approvedDateFormatted = ref(null);
const employee = ref(null);
const form = ref(null);
const isSubmitting = ref(false);
const ptoCashOutObj = ref({ approvedDate: null });
const valid = ref(false);

const vMask = mask; //v-mask directive

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Created lifecycle hook
 */
onBeforeMount(async () => {
  await Promise.all([
    !store.getters.employees ? updateStoreEmployees() : '',
    !store.getters.ptoCashOuts ? updateStorePtoCashOuts() : ''
  ]);
  employee.value = _.find(store.getters.employees, (e) => e.id === props.employeeId);
  if (props.item) {
    let editingItem = _.cloneDeep(props.item);
    ptoCashOutObj.value['id'] = editingItem.id;
    ptoCashOutObj.value['employeeId'] = editingItem.employeeId;
    ptoCashOutObj.value['amount'] = Number(editingItem.amount);
    ptoCashOutObj.value['creationDate'] = editingItem.creationDate;
    ptoCashOutObj.value['approvedDate'] = editingItem.approvedDate;
  }
}); // created

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const ptoData = computed(() => {
  return {
    pendingPtoCashOutAmount: getPendingPtoCashoutAmount(employee.value.id),
    ptoBalance: props.pto
  };
}); //ptoData

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Watcher for ptoCashOutObj.approvedDate - format date.
 */
watch(
  () => ptoCashOutObj.value.approvedDate,
  () => {
    approvedDateFormatted.value =
      format(ptoCashOutObj.value.approvedDate, null, 'MM/DD/YYYY') || approvedDateFormatted.value;
    if (ptoCashOutObj.value.approvedDate !== null && !format(ptoCashOutObj.value.approvedDate, null, 'MM/DD/YYYY')) {
      ptoCashOutObj.value.approvedDate = null;
    }
  }
); // watchApprovedDate

/**
 * Watcher for item prop.
 */
watch(
  () => props.item,
  () => {
    if (props.item) {
      let editingItem = _.cloneDeep(props.item);
      ptoCashOutObj.value['employeeId'] = editingItem.employeeId;
      ptoCashOutObj.value['id'] = editingItem.id;
      ptoCashOutObj.value['amount'] = Number(editingItem.amount);
      ptoCashOutObj.value['creationDate'] = editingItem.creationDate;
      ptoCashOutObj.value['approvedDate'] = editingItem.approvedDate;
    }
  },
  { deep: true }
); // watchEditPTOCashOutItem

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Submit event handler. Validates form and creates a PTO Cash Out record
 * in the database.
 */
async function submit() {
  try {
    const validResponse = await form.value.validate();
    valid.value = validResponse.valid;
    if (valid.value) {
      isSubmitting.value = true;
      if (props.item) {
        await updatePTOCashOutRequest();
      } else {
        await createPTOCashOutRequest();
      }
      emitCloseForm();
      clearForm();
      isSubmitting.value = false;
      if (props.item) {
        useDisplaySuccess('Successfully edited PTO Cash Out request!');
      } else {
        useDisplaySuccess('Successfully created PTO Cash Out request!');
      }
    }
  } catch (err) {
    emitCloseForm();
    clearForm();
    isSubmitting.value = false;
    useDisplayError(err);
  }
} // submit

/**
 * Cancel event handler
 */
function cancel() {
  emitCloseForm();
  clearForm();
} // cancel

/**
 * Clears form and resets validation.
 */
function clearForm() {
  ptoCashOutObj.value['id'] = null;
  ptoCashOutObj.value['employeeId'] = null;
  ptoCashOutObj.value['amount'] = null;
  ptoCashOutObj.value['creationDate'] = null;
  ptoCashOutObj.value['approvedDate'] = null;
  approvedDateFormatted.value = null;
  form.value.reset();
  form.value.resetValidation();
} // clearForm

/**
 * Emits close form events
 */
function emitCloseForm() {
  emitter.emit('close-pto-cash-out-form-table');
  emitter.emit('close-pto-cash-out-form-hours');
}

/**
 * Gets the user's pending PTO cash out amount
 *
 * @param employeeId employee's employee ID to get PTO balances for
 * @returns Number - The pending cash out amount
 */
function getPendingPtoCashoutAmount(employeeId) {
  let pendingPtoCashOuts = store.getters.ptoCashOuts.filter((p) => !p.approvedDate && employeeId === p.employeeId);
  return pendingPtoCashOuts.reduce((n, { amount }) => n + amount, 0);
} // getPendingPtoCashoutAmount

/**
 * Shows the PTO available after the requested cash out amount.
 *
 * @returns String - The hint text
 */
function cashOutHint() {
  if (ptoCashOutObj.value.amount) {
    let amount = props.editing ? ptoCashOutObj.value.amount - props.item.amount : Number(ptoCashOutObj.value.amount);
    return `Balance after cash out: ${(props.pto - getPendingPtoCashoutAmount(employee.value.id) - amount).toFixed(2)}h`;
  }
} // cashOutHint

/**
 * Creates a PTO Cash Out record in the database.
 */
async function createPTOCashOutRequest() {
  let newItem = _.cloneDeep(ptoCashOutObj.value);
  let ptoCashOut = await api.createItem(api.PTO_CASH_OUTS, {
    id: generateUUID(),
    amount: Number(newItem.amount),
    employeeId: employee.value.id,
    creationDate: dateUtils.getTodaysDate(),
    approvedDate: newItem.approvedDate ? newItem.approvedDate : null
  });
  store.dispatch('setPtoCashOuts', { ptoCashOuts: [...store.getters.ptoCashOuts, ptoCashOut] });
} // createPTOCashOutRequest

/**
 * Update PTO Cash Out record in the database.
 */
async function updatePTOCashOutRequest() {
  let ptoCashOuts = _.cloneDeep(store.getters.ptoCashOuts);
  let editedItem = _.cloneDeep(ptoCashOutObj.value);
  let index = ptoCashOuts.findIndex((p) => p.id == editedItem.id);
  ptoCashOuts[index] = editedItem;
  await api.updateItem(api.PTO_CASH_OUTS, {
    ...editedItem
  });
  store.dispatch('setPtoCashOuts', { ptoCashOuts: ptoCashOuts });
} // updatePTOCashOutRequest
</script>
<style scoped>
h3 {
  line-height: 20px;
}
h5 {
  line-height: 14px;
}
.title {
  position: relative;
}
.subtitle {
  position: absolute;
  top: 8px;
  line-height: 12px;
  font-size: 12px;
}
</style>
