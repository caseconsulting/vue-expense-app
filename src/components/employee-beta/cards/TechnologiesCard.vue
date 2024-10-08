<template>
  <div>
    <base-card title="Technologies and Skills">
      <template #title>
        <v-row no-gutters>
          <v-col class="mr-1">
            <h3 class="text-white">Tech and Skills</h3>
          </v-col>
          <v-col v-if="!isMobile()">
            <v-tooltip activator="parent" location="right">
              Sorting by current skills, then by years of experience
            </v-tooltip>
            <v-icon class="nudge-up" color="white" size="15">mdi-information</v-icon>
          </v-col>
        </v-row>
      </template>
      <template #default>
        <!-- Employee has Technology Experience -->
        <div v-if="!isEmpty(model.technologies)">
          <technologies-list :list="filteredList" :isModal="false"></technologies-list>
          <div v-if="!isEmpty(model.technologies)" class="text-center">
            <v-card-actions class="d-flex justify-center">
              <v-btn variant="flat" color="#F3F3F3" @click="toggleTechnologiesModal()"
                >View All {{ model.technologies.length }} Skills</v-btn
              >
            </v-card-actions>
          </div>
        </div>
        <!-- Employee does not have Technology Experience -->
        <p v-else class="mt-6 ml-6">No Technologies or Skills Information</p>
      </template>
    </base-card>
    <technologies-modal v-model="toggleModal" :model="model"></technologies-modal>
  </div>
</template>

<script setup>
import _ from 'lodash';
import { computed, ref } from 'vue';
import { isEmpty } from '@/utils/utils';
import BaseCard from './BaseCard.vue';
import TechnologiesList from '../lists/TechnologiesList.vue';
import TechnologiesModal from '@/components/employee-beta/modals/TechnologiesModal.vue';
import { isMobile } from '../../../utils/utils';

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
  if (!isEmpty(props.model.technologies)) {
    return sortUserTechnologies(props.model.technologies).slice(0, 5);
  }
  return [];
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Sorts a user's tech and skills by:
 * 1. whether the skill is current
 * 2. the duration of the skill
 *
 * @param {Array} technologies the list of technologies to sort
 * @return {Array} A new sorted list
 */
function sortUserTechnologies(technologies) {
  const currentIteratee = _.iteratee({ current: true });
  const yearsIteratee = (obj) => -obj.years;
  return _.orderBy(technologies, [currentIteratee, yearsIteratee], ['desc', 'asc']); // needs to sort by ascending negative years to work
}

function toggleTechnologiesModal() {
  toggleModal.value = !toggleModal.value;
}
</script>

<style scoped>
p {
  margin-bottom: 12px;
}
</style>
