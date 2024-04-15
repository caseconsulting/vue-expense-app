<template>
  <div>
    <div v-if="props.showInfo">
      <power-edit-table-info-item
        :field="props.field"
        :item="props.item"
        class="text-blue"
      ></power-edit-table-info-item>
    </div>
    <v-row v-else class="d-flex align-center">
      <v-col cols="10">
        <default-edit-item
          v-if="props.field.editType === TYPES.DEFAULT"
          :field="props.field"
          :item="props.item"
        ></default-edit-item>
        <date-edit-item
          v-else-if="props.field.editType === TYPES.DATE_MMYYYY || props.field.infoType === TYPES.DATE_MMDDYYYY"
          :field="props.field"
          :item="props.item"
        ></date-edit-item>
        <custom-edit-item v-else :field="props.field" :item="props.item"></custom-edit-item>
      </v-col>
      <v-col cols="1">
        <v-btn density="comfortable" :disabled="!props.valid" icon variant="text" @click.stop="save()">
          <v-icon>mdi-content-save</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import DefaultEditItem from '@/components/employees/power-edit/edit-items/DefaultItem.vue';
import DateEditItem from '@/components/employees/power-edit/edit-items/DateItem.vue';
import CustomEditItem from '@/components/employees/power-edit/edit-items/CustomItem.vue';
import PowerEditTableInfoItem from '@/components/employees/power-edit/PowerEditTableInfoItem.vue';
import { inject } from 'vue';
import { TYPES } from '@/components/employees/power-edit/js/fieldTypes.js';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['field', 'item', 'showInfo', 'valid']);
const emitter = inject('emitter');

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function save() {
  emitter.emit('save-item', { item: props.item, field: props.field });
}
</script>
