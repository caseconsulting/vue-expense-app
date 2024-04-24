<template>
  <div>
    <div v-if="props.showInfo" class="d-flex align-center">
      <power-edit-table-info-item
        :field="props.field"
        :item="props.item"
        class="text-blue"
      ></power-edit-table-info-item>
      <v-btn density="comfortable" :disabled="!props.valid" icon variant="text" @click.stop="save()">
        <v-tooltip activator="parent">Save {{ props.field.title }}</v-tooltip>
        <v-icon>mdi-content-save</v-icon>
      </v-btn>
    </div>
    <v-row v-else class="d-flex align-center py-4">
      <default-edit-item
        v-if="props.field.editType === TYPES.DEFAULT"
        :field="props.field"
        :item="props.item"
        :valid="props.valid"
        class="single-field"
      ></default-edit-item>
      <date-edit-item
        v-else-if="props.field.editType === TYPES.DATE_MMYYYY || props.field.infoType === TYPES.DATE_MMDDYYYY"
        :field="props.field"
        :item="props.item"
        :valid="props.valid"
        class="single-field"
      ></date-edit-item>
      <custom-edit-item
        v-else
        :field="props.field"
        :item="props.item"
        :valid="props.valid"
        :class="field.group ? 'group-row py-2' : 'single-field'"
      ></custom-edit-item>
      <v-btn
        v-if="!props.field.group"
        density="comfortable"
        :disabled="!props.valid"
        icon
        variant="text"
        @click.stop="save()"
      >
        <v-tooltip activator="parent">Save {{ props.field.title }}</v-tooltip>
        <v-icon>mdi-content-save</v-icon>
      </v-btn>
    </v-row>
  </div>
</template>

<script setup>
import DefaultEditItem from '@/components/employees/power-edit/edit-items/DefaultItem.vue';
import DateEditItem from '@/components/employees/power-edit/edit-items/DateItem.vue';
import CustomEditItem from '@/components/employees/power-edit/edit-items/CustomItem.vue';
import PowerEditTableInfoItem from '@/components/employees/power-edit/PowerEditTableInfoItem.vue';
import _ from 'lodash';
import { inject, ref, onBeforeUnmount, onMounted } from 'vue';
import { TYPES } from '@/components/employees/power-edit/js/fieldTypes.js';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['field', 'item', 'showInfo', 'valid']);
const emitter = inject('emitter');
const clonedItem = ref(props.item);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

onMounted(() => {
  // setting timeout prevents bug with turning off emitter before unmounting component
  window.setTimeout(() => {
    emitter.on('update-item', ({ item, field }) => {
      if (field.group && field.subkeys) {
        _.forEach(field.subkeys, (key) => {
          clonedItem.value[key] = item[key];
        });
      } else {
        clonedItem.value[field.key] = item[field.key];
      }
    });
  }, 1);
});

onBeforeUnmount(() => {
  emitter.off('update-item');
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function save() {
  emitter.emit('save-item', { item: clonedItem.value, field: props.field });
}
</script>

<style>
.group-row {
  margin-left: 195px;
}
.single-field {
  min-width: 105px !important;
  width: 105px !important;
  max-width: 105px !important;
}
</style>
