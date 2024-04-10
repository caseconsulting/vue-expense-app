<template>
  <v-text-field
    v-model="model"
    autofocus
    class="power-edit-field"
    :rules="field.rules?.map((func) => func(model, item))"
    variant="underlined"
  >
    <template v-slot:append>
      <v-btn density="comfortable" :disabled="!valid" icon variant="text" @click.stop="save()">
        <v-icon>mdi-content-save</v-icon>
      </v-btn>
    </template>
  </v-text-field>
</template>

<script>
function save() {
  this.emitter.emit('save-item', { field: this.field, item: this.item, value: this.model });
}

export default {
  data() {
    return {
      model: this.item[this.field.key]
    };
  },
  methods: {
    save
  },
  props: ['field', 'item', 'valid']
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
