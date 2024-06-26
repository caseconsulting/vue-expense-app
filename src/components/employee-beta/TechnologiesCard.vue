<template>
  <v-card>
    <v-card-title class="d-flex align-center justify-space-between header_style">
      <div class="d-flex align-center">
        <h3 class="text-white px-2">Technologies and Skills</h3>
        <div>
          <v-tooltip activator="parent" location="right"> Showing current with most years </v-tooltip>
          <v-icon id="information" color="white" size="x-small">mdi-information</v-icon>
        </div>
      </div>
      <v-btn v-if="isAdmin || isUser" density="comfortable" variant="text" icon="">
        <v-tooltip activator="parent" location="top"> Edit Profile </v-tooltip>
        <v-icon id="edit" color="white"> mdi-pencil </v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text>
      <!-- Employee has Technology Experience -->
      <div v-if="!isEmpty(model.technologies)">
        <v-list>
          <!-- Loop Technologies -->
          <v-list-item v-for="(technology, index) in filteredList" :key="technology.name + index">
            <v-list-item-title class="d-flex align-center pb-4">
              <div class="mx-3">
                <span v-if="technology.current">
                  <v-icon>mdi-check</v-icon>
                  <v-tooltip activator="parent" location="left">Current Skill</v-tooltip>
                </span>
              </div>
              <p class="ma-3">
                <b>{{ technology.name }}</b>
              </p>
            </v-list-item-title>
            <v-row class="pl-10">
              <p><b>Experience: </b>{{ Number(technology.years).toFixed(1) }} years</p>
            </v-row>
            <hr v-if="index < filteredList.length - 1" class="my-3" />
          </v-list-item>
          <!-- End Loop Technologies -->
        </v-list>
        <div v-if="!isEmpty(model.technologies) && Math.ceil(model.technologies.length / 5) != 1" class="text-center">
          <v-card-actions class="d-flex justify-center">
            <v-btn>Click To See More</v-btn>
          </v-card-actions>
        </div>
      </div>
      <!-- Employee does not have Technology Experience -->
      <p v-else>No Technologies or Skills Information</p>
    </v-card-text>
  </v-card>
</template>

<script setup>
import _ from 'lodash';
import { computed, inject } from 'vue';
import { isEmpty } from '@/utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['model']);

const isAdmin = inject('isAdmin');
const isUser = inject('isUser');

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const filteredList = computed(() => {
  if (!isEmpty(props.model.technologies)) {
    return sortByCurrentAndYears(props.model.technologies).slice(0, 5);
  }
  return [];
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |---------------------------------------------------

/**
 * Helper function to sort technologies by current then by number of years
 * @param {Array} technologies - List of technologies
 * return filteredList - A list of technologies sorted by current and most years
 */
function sortByCurrentAndYears(technologies) {
  const currentIteratee = _.iteratee({ current: true });
  const yearsIteratee = (obj) => -obj.years;
  const sortedByCurrentAndYears = _.orderBy(technologies, [currentIteratee, yearsIteratee], ['desc', 'asc']); //needs to sort by ascending negative years to work
  return sortedByCurrentAndYears;
}
</script>

<style scoped>
p {
  margin-bottom: 12px;
}
</style>
