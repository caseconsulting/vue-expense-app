<template>
  <v-form v-model="valid" class="w-100 h-100">
    <v-text-field
      ref="formFields"
      :model-value="format(model, null, 'MM/DD/YYYY')"
      :label="field.title"
      class="power-edit-field"
      hint="MM/DD/YYYY format"
      v-mask="'##/##/####'"
      variant="underlined"
      @update:focused="model = parseEventDate()"
      @click="showMenu = true"
      @keypress="showMenu = false"
    >
      <v-menu activator="parent" v-model="showMenu" :close-on-content-click="false" location="start center">
        <v-date-picker
          v-model="model"
          @update:model-value="showMenu = false"
          show-adjacent-months
          hide-actions
          keyboard-icon=""
          color="#bc3825"
          :title="field.title"
        ></v-date-picker>
      </v-menu>
      <template v-slot:append>
        <v-btn density="comfortable" icon variant="text" @click.stop="cancel()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-btn density="comfortable" :disabled="!valid" icon variant="text" @click.stop="save()">
          <v-icon>mdi-content-save</v-icon>
        </v-btn>
      </template>
    </v-text-field>
  </v-form>
</template>

<script>
import { format } from '@/shared/dateUtils';
import { mask } from 'vue-the-mask';

function save() {
  this.emitter.emit('save-item', { field: this.field, item: this.item, value: this.model });
}

function cancel() {
  this.emitter.emit('cancel-item');
}

/**
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM-DD format
 */
function parseEventDate() {
  return this.format(event.target.value, 'MM/DD/YYYY', 'YYYY-MM-DD');
} //parseEventDate

export default {
  data() {
    return {
      model: this.item[this.field.key],
      showMenu: false,
      valid: true
    };
  },
  directives: { mask },
  methods: {
    cancel,
    format,
    parseEventDate,
    save
  },
  props: ['field', 'item']
};
</script>
