<template>
  <v-card :elevation="3" class="">
    <!-- Status Alert -->
    <v-snackbar
      v-model="status.statusType"
      :color="status.color"
      :multi-line="true"
      :right="true"
      :timeout="5000"
      :top="true"
      :vertical="true"
    >
      <v-card-title headline color="white">
        <span class="headline">{{ status.statusMessage }}</span>
      </v-card-title>
      <v-btn color="white" text @click="clearStatus"> Close </v-btn>
    </v-snackbar>
    <v-card color="#bc3825">
      <v-card-title headline v-bind:class="{ 'justify-center': isMobile }">
        <h2 class="text-center white--text">Reimbursements</h2>
      </v-card-title>
    </v-card>
    <v-tabs v-model="currentTab">
      <v-tab class="ml-5" href="#expenses">Expenses</v-tab>
      <v-tab href="#ptoCashOuts">PTO Cash Outs</v-tab>
      <v-tab-item id="expenses" class="mx-2 mb-6">
        <UnreimbursedExpenses />
      </v-tab-item>
      <v-tab-item id="ptoCashOuts" class="mx-2 my-6">
        <p-t-o-cash-outs-table :unapprovedOnly="true" />
      </v-tab-item>
    </v-tabs>
  </v-card>
</template>

<script>
import UnreimbursedExpenses from '@/components/reimbursements/UnreimbursedExpenses.vue';
import { isMobile } from '@/utils/utils';
import PTOCashOutsTable from '../components/shared/PTOCashOutsTable.vue';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * Created lifecycle hook
 */
function created() {
  window.EventBus.$on('status-alert', (status) => {
    this.$set(this.status, 'statusType', status.statusType);
    this.$set(this.status, 'statusMessage', status.statusMessage);
    this.$set(this.status, 'color', status.color);
  });
} // created

/**
 * before destroy lifecycle hook
 */
function beforeDestroy() {
  window.EventBus.$off('status-alert');
} // beforeDestroy

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Clear the action status that is displayed in the snackbar.
 */
function clearStatus() {
  this.$set(this.status, 'statusType', undefined);
  this.$set(this.status, 'statusMessage', '');
  this.$set(this.status, 'color', '');
} // clearStatus

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  created,
  beforeDestroy,
  components: {
    UnreimbursedExpenses,
    PTOCashOutsTable
  },
  computed: {
    isMobile
  },
  methods: {
    clearStatus
  },
  data() {
    return {
      currentTab: 'expenses',
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      }
    };
  }
};
</script>
