<template>
  <base-info-modal title="Technologies and Skills">
    <v-card-text class="pt-0">
      <!-- Employee has Technology Experience -->
      <div v-if="!isEmpty(model.technologies)">
        <!--Tech Filters -->
        <div style="position: sticky; top: 45px; z-index: 1; background-color: white" class="pt-4">
          <fieldset class="filter_border">
            <legend class="legend_style">Sort By</legend>
            <v-row class="pl-3 pr-3">
              <v-col cols="5" class="pl-3 pt-6">
                <v-btn-toggle color="primary" v-model="filters" density="compact" multiple class="">
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
              <v-col>
                <v-text-field
                  id="techSearch"
                  v-model.trim="search"
                  append-inner-icon="mdi-magnify"
                  label="Search (comma separate terms)"
                  variant="underlined"
                  single-line
                />
              </v-col>
            </v-row>
          </fieldset>
        </div>
        <!-- End of Sort Filters -->
        <v-data-table
          :items-per-page="ITEMS_PER_PAGE"
          :search="search"
          :items="filteredList"
          item-key="filteredList.id"
          mobile-breakpoint="800"
        >
          <template #[`item.current`]="{ item }">
            <span v-if="item.current">
              <v-icon class="pl-6">mdi-check</v-icon>
              <v-tooltip activator="parent" location="left">Current Skill</v-tooltip>
            </span>
            <v-spacer v-else style="min-width: 24px"></v-spacer>
          </template>
        </v-data-table>
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

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const search = ref(null);
const ITEMS_PER_PAGE = 8;
const iteratees = {
  filter1current: (obj) => !obj.current,
  filter2years: (obj) => -obj.years,
  filter3name: (obj) => obj.name
};

const props = defineProps(['model']);
const filters = ref(['filter1current', 'filter2years']);

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const filteredList = computed(() => {
  if (!isEmpty(props.model.technologies)) {
    return sortByFilters(props.model.technologies, filters.value);
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
