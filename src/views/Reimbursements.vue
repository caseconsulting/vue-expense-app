<template>
  <v-card :elevation="3" class="">
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
        <div>PTO Cash Outs</div>
      </v-tab-item>
    </v-tabs>
  </v-card>
</template>

<script>
import UnreimbursedExpenses from '@/components/reimbursements/UnreimbursedExpenses.vue';
import { isMobile } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    UnreimbursedExpenses
  },
  computed: {
    isMobile
  },
  data() {
    return {
      currentTab: 'expenses'
    };
  }
};
</script>
