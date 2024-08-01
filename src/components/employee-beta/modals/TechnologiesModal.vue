<template>
  <base-info-modal :title="isMobile() ? 'Tech and Skills' : 'Technologies and Skills'">
    <v-card-text class="pt-0">
      <!-- Employee has Technology Experience -->
      <div v-if="!isEmpty(model.technologies)">
        <!--Tech Filters -->
        <div style="position: sticky; top: 45px; z-index: 1; background-color: white" class="pt-4">
          <v-row class="pl-3 pr-3">
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
        </div>
        <v-data-table
          :items-per-page="ITEMS_PER_PAGE"
          :search="search"
          :items="filteredList"
          item-key="filteredList.id"
          mobile-breakpoint="800"
          :sort-by="[
            { key: 'current', order: 'desc' },
            { key: 'years', order: 'desc' }
          ]"
          multi-sort
        >
          <template #item="{ item }">
            <tr>
              <td align="start">{{ item.name }}</td>
              <td align="center">{{ item.years }}</td>
              <td align="start">
                <span v-if="item.current">
                  <v-icon class="pl-6">mdi-check</v-icon>
                  <v-tooltip activator="parent" location="left">Current Skill</v-tooltip>
                </span>
                <v-spacer v-else style="min-width: 24px"></v-spacer>
              </td>
            </tr>
          </template>
        </v-data-table>
      </div>
      <!-- Employee does not have Technology Experience -->
      <p v-else>No Technologies or Skills Information</p>
    </v-card-text>
  </base-info-modal>
</template>

<script setup>
import { ref, computed } from 'vue';
import { isEmpty, isMobile } from '@/utils/utils';
import BaseInfoModal from '@/components/employee-beta/modals/BaseInfoModal.vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const search = ref(null);
const ITEMS_PER_PAGE = 10;

const props = defineProps(['model']);

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

const filteredList = computed(() => {
  if (!isEmpty(props.model.technologies)) {
    return props.model.technologies;
  }
  return [];
});
</script>
