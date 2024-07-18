<template>
  <base-info-modal title="Technologies and Skills">
    <v-card-text class="pt-0">
      <!-- Employee has Technology Experience -->
      <div v-if="!isEmpty(model.technologies)">
        <!--Tech Filters -->
        <div style="position: sticky; top: 45px; z-index: 1; background-color: white" class="pt-4">
          <fieldset class="filter_border">
            <legend class="legend_style">Sort By</legend>
            <v-col cols="12">
              <v-btn-toggle color="primary" v-model="filters" density="compact" multiple>
                <v-btn value="filter1current">
                  <v-tooltip activator="parent" location="top">Current</v-tooltip>
                  <v-icon size="x-large">mdi-check{{ filters.includes('filter1current') ? '-bold' : '' }}</v-icon>
                </v-btn>

                <v-btn value="filter2years">
                  <v-tooltip activator="parent" location="top">Years of Experience</v-tooltip>
                  <v-icon size="x-large"
                    >mdi-calendar-multiple{{ filters.includes('filter2years') ? '-check' : '' }}</v-icon
                  >
                </v-btn>

                <v-btn value="filter3name">
                  <v-tooltip activator="parent" location="top">Alphabetical</v-tooltip>
                  <v-icon size="x-large">mdi-sort-alphabetical-descending-variant</v-icon>
                </v-btn>
              </v-btn-toggle>
            </v-col>
          </fieldset>
        </div>
        <!-- End of Sort Filters -->
        <technologies-list :list="filteredList" :isModal="true"></technologies-list>
        <div
          v-if="!isEmpty(model.technologies) && Math.ceil(model.technologies.length / ITEMS_PER_PAGE) != 1"
          class="text-center"
        >
          <v-pagination
            v-model="page"
            :length="Math.ceil(model.technologies.length / ITEMS_PER_PAGE)"
            :total-visible="8"
          ></v-pagination>
        </div>
      </div>
      <!-- Employee does not have Technology Experience -->
      <p v-else>No Technologies or Skills Information</p>
    </v-card-text>
  </base-info-modal>
</template>

<script setup>
import _ from 'lodash';
import { ref, computed } from 'vue';
import { isEmpty } from '@/utils/utils';
import BaseInfoModal from '@/components/employee-beta/modals/BaseInfoModal.vue';
import TechnologiesList from '../lists/TechnologiesList.vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const ITEMS_PER_PAGE = 8;
const iteratees = {
  filter1current: (obj) => !obj.current,
  filter2years: (obj) => -obj.years,
  filter3name: (obj) => obj.name
};

const props = defineProps(['model']);
const page = ref(1);
const filters = ref(['filter1current', 'filter2years']);

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const filteredList = computed(() => {
  const startIndex = (page.value - 1) * ITEMS_PER_PAGE; //each page contains 5 technologies entries
  const endIndex = startIndex + ITEMS_PER_PAGE;
  if (!isEmpty(props.model.technologies)) {
    return sortByFilters(props.model.technologies, filters.value).slice(startIndex, endIndex);
  }
  return [];
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Helper function to sort technologies by filters
 * @param {Array} technologies - List of technologies
 * @param {Array} filters - List of applied filters
 * @return filteredList - A list of technologies sorted by filters
 */
function sortByFilters(technologies, filters) {
  const sorted = _.sortBy(
    technologies,
    filters.sort().map((filter) => iteratees[filter]) //sort filters so order by current, years, name
  );
  return sorted;
}
</script>
