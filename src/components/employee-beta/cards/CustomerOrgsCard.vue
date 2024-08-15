<template>
  <div>
    <base-card :title="isMobile() ? 'Customer Org Exp' : 'Customer Org Experience'">
      <div class="text-black">
        <div :class="isMobile() ? 'mx-4' : 'mx-8'" v-if="!isEmpty(filteredList)">
          <customer-orgs-list :list="filteredList"></customer-orgs-list>
        </div>
        <div class="mt-2 text-align: center" v-else>No Customer Organization Experience</div>
        <div v-if="!isEmpty(model.customerOrgExp)" class="text-center">
          <v-card-actions class="d-flex justify-center">
            <v-btn variant="flat" color="#F3F3F3" @click="toggleModal = !toggleModal"
              >View all {{ model.customerOrgExp.length }} Customer Orgs
            </v-btn>
          </v-card-actions>
        </div>
      </div>
      <customer-orgs-modal v-model="toggleModal" :model="model"></customer-orgs-modal>
    </base-card>
  </div>
</template>

<script setup>
import BaseCard from './BaseCard.vue';
import { computed, ref } from 'vue';
import CustomerOrgsList from '@/components/employee-beta/lists/CustomerOrgsList.vue';
import CustomerOrgsModal from '@/components/employee-beta/modals/CustomerOrgsModal.vue';
import { orderBy } from 'lodash';
import { isEmpty, isMobile } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['model']);
const toggleModal = ref(false);

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const filteredList = computed(() => {
  const startIndex = 0;
  const endIndex = 3;
  if (!isEmpty(props.model.customerOrgExp)) {
    return orderBy(props.model.customerOrgExp.slice(startIndex, endIndex), ['current', 'years'], ['desc', 'desc']);
  }
  return [];
});
</script>
