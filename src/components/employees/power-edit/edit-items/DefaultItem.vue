<template>
  <v-form v-model="valid" class="w-100 h-100">
    <v-text-field v-model="model" autofocus class="power-edit-field" :rules="field.rules" variant="underlined">
      <template v-slot:append>
        <v-btn density="comfortable" :disabled="!valid" icon variant="text" @click.stop="save()">
          <v-icon>mdi-content-save</v-icon>
        </v-btn>
      </template>
    </v-text-field>
  </v-form>
</template>

<script>
function save() {
  this.emitter.emit('save-item', { field: this.field, item: this.item, value: this.model });
}

export default {
  data() {
    return {
      model: this.item[this.field.key],
      valid: true
    };
  },
  methods: {
    save
  },
  props: ['field', 'item']
};
</script>

<style>
.power-edit-field .v-input__append {
  padding: 0px !important;
  margin: 0px !important;
  margin-left: 5px !important;
  margin-top: 15px !important;
}
</style>
