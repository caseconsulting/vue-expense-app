<template>
  <div>
    <span>
      <v-tooltip activator="parent" location="top">{{ tooltipText }}</v-tooltip>
      <v-btn
        size="small"
        variant="text"
        icon
        :disabled="!gcInfo"
        @click.stop="toggleModal()"
      >
        <v-icon size="x-large" :class="`${iconColor}`" :icon="giftCardIcon" />
      </v-btn>
    </span>

    <!-- Modal to view images -->
    <v-dialog v-model="showModal" class="w-sm-100 w-md-50 w-lg-25">
      <v-card>
        <v-card-text class="pb-0">
          <p><strong>Amazon GC ID:</strong> {{ gcInfo.gcId }}</p>
          <p><strong>Created:</strong> {{ format(gcInfo.creationDate, 'YYYY-MM-DD[T]HH:mm:ss-04:00[Z]', 'MM/DD/YYYY h:mA') }}</p>
          <p><strong>Email sent:</strong> {{ gcInfo.emailSent ? 'Yes' : 'No' }}</p>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="toggleModal()">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { format } from '@/shared/dateUtils'
import { EXPENSE_STATES } from '@/shared/expenseUtils';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps([
  'expense', // attachment expense
  'gcInfo', // info of gift card
]);

/**
 * Changeable UI based on gift card status
 */
const tooltipText = computed(() => {
  return props.gcInfo ? 'Gift card created' : 'No gift card found';
});
const giftCardIcon = computed(() => {
  return props.gcInfo ? 'mdi-credit-card-check' : 'mdi-credit-card-remove';
});
const iconColor = computed(() => {
  return !props.gcInfo && props.expense.state === EXPENSE_STATES.REIMBURSED ? 'text-red' : 'case-gray';
})

/**
 * Info viewer modal
 */
const showModal = ref(false);
function toggleModal() {
  console.log(props.gcInfo);
  showModal.value = !showModal.value;
}
</script>
