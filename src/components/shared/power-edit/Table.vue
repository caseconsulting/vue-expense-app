<template>
  <div>
    <v-form v-model="valid">
      <v-data-table
        :expanded="expanded"
        :items="props.items"
        :headers="props.fields"
        :search="props.search"
        density="comfortable"
        fixed-header
        fixed-footer
        items-per-page="-1"
        @click:row="handleRowClick"
        class="power-edit-table mt-1"
      >
        <template v-for="field in props.fields" v-slot:[`item.${field.key}`]="{ item }">
          <edit-item
            v-if="editItem?.item?.id === item.id && editItem?.field?.key === field.key"
            :key="field"
            :field="field"
            :item="item"
            :showInfo="field.group"
            :valid="valid"
            :CustomEditItem="props.CustomEditItem"
          ></edit-item>
          <info-item
            v-else-if="field.infoType"
            :key="field + 1"
            @click="handleItemClick(item, field)"
            :class="saveColor(item, field)"
            :field="field"
            :item="item"
            class="d-flex align-center w-100 h-100"
            :CustomInfoItem="props.CustomInfoItem"
          ></info-item>
        </template>
        <template v-slot:expanded-row>
          <tr v-if="editItem?.field && editItem?.item">
            <td colspan="12">
              <div>
                <edit-item
                  :field="editItem.field"
                  :item="editItem.item"
                  :valid="valid"
                  :CustomEditItem="props.CustomEditItem"
                ></edit-item>
              </div>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-form>
  </div>
</template>

<script setup>
import InfoItem from '@/components/shared/power-edit/InfoItem.vue';
import EditItem from '@/components/shared/power-edit/EditItem.vue';
import { ref, inject, watch } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['items', 'fields', 'search', 'CustomEditItem', 'CustomInfoItem']);
const emitter = inject('emitter');
const editItem = ref(null);
const expanded = ref([]);
const valid = ref(true);

emitter.on('save-item', async ({ item, field }) => {
  emitter.emit('save-edit-item', { item, editItem, field });
});

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

watch(
  () => props.fields,
  () => {
    if (!props.fields.find((f) => f.key === editItem.value?.field?.key)) {
      expanded.value = [];
      editItem.value = null;
    }
  }
);

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function handleItemClick(item, field) {
  console.log('handleItemClick', item, field);
  emitter.emit('click-item', { item, editItem, field });
}

function handleRowClick() {
  expanded.value = [];
  if (editItem.value?.field?.group) {
    if (!expanded.value.includes(editItem.value?.item?.id)) expanded.value.push(editItem.value?.item?.id);
  }
}

function saveColor(item, field) {
  let itemClass = '';
  let itemSaving = item[field.key + 'tmp'];
  if (itemSaving?.saving && field.key === itemSaving?.field?.key) itemClass = 'item-saving';
  else if (itemSaving?.success && field.key === itemSaving?.field?.key) itemClass = 'item-success';
  else if (itemSaving?.fail && field.key === itemSaving?.field?.key) itemClass = 'item-fail';
  return itemClass;
}
</script>

<style scoped>
.item-saving {
  font-weight: bold;
  color: darkgray;
}
.item-success {
  font-weight: bold;
  color: green !important;
  transition: color 1s ease-in !important;
  -webkit-transition: color 1s ease-in !important;
}
.item-fail {
  font-weight: bold;
  color: red !important;
  transition: color 1s ease-out !important;
  -webkit-transition: color 1s ease-out !important;
}
.power-edit-table {
  max-height: 80vh;
}
</style>
