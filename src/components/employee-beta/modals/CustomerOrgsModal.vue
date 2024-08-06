<template>
  <base-info-modal title="Customer Orgs">
    <v-card-text>
      <!-- Employee has Customer Orgs -->
      <div v-if="!isEmpty(filteredList)">
        <!-- Loop Customer Orgs -->
        <customer-orgs-list :list="filteredList"></customer-orgs-list>
        <!-- End Loop Customer Orgs -->
      </div>
      <!-- Employee does not have Awards -->
      <p v-else class="pt-6 pl-6">No Customer Organization Experience</p>
      <!-- Pagination -->
      <div v-if="!isEmpty(model.customerOrgExp) && Math.ceil(model.customerOrgExp.length / 5) != 1" class="text-center">
        <v-pagination
          v-model="page"
          :length="Math.ceil(model.customerOrgExp.length / 5)"
          :total-visible="8"
        ></v-pagination>
      </div>
    </v-card-text>
  </base-info-modal>
</template>

<script setup>
import { ref, computed } from 'vue';
import { isEmpty } from '@/utils/utils';
import { orderBy } from 'lodash';
import BaseInfoModal from '@/components/employee-beta/modals/BaseInfoModal.vue';
import CustomerOrgsList from '@/components/employee-beta/lists/CustomerOrgsList.vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['model']);
const page = ref(1);

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const filteredList = computed(() => {
  const startIndex = 5 * (page.value - 1); //each page contains 5 award entries
  const endIndex = startIndex + 5;
  if (!isEmpty(props.model.customerOrgExp)) {
    return orderBy(props.model.customerOrgExp.slice(startIndex, endIndex), ['current', 'years'], ['desc', 'desc']);
  }
  return [];
});
</script>
