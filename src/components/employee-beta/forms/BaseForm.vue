<template>
  <v-expansion-panel :value="title">
    <v-expansion-panel-title class="bg-grey-lighten-4 form-title">
      <h3 class="text-subtitle-1" :class="{ invalid: valid === false }">{{ title }}</h3>
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <v-container>
        <v-form ref="form" v-model="validModel" validate-on="input">
          <slot :props="{ editedEmployee, stopPrepare, validate }"></slot>
        </v-form>
      </v-container>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<script setup>
import { inject, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const emitter = inject('emitter');

const props = defineProps({
  tabId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  // this doesn't use a v-model because sometimes the validation gets set to null, and we want to prevent that
  valid: {
    type: Boolean,
    required: true
  }
});

const editedEmployee = defineModel({ required: true });
const validModel = ref(props.valid);
const form = ref(null);

const stopPrepare = ref(false);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

onBeforeMount(() => {
  emitter.on('discard-edits', onDiscardEdits);
});

onMounted(async () => {
  await validate();
});

onBeforeUnmount(() => {
  emitter.off('discard-edits', onDiscardEdits);
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

async function validate() {
  if (form.value) {
    const result = await form.value.validate();
    emitValidation(result.valid);
    return result;
  }
  return null;
}

/**
 * Emits the 'validating' event if the provided validation status isn't null
 * @param valid The status of the validation
 */
function emitValidation(valid) {
  if (valid === null) validate();
  else emitter.emit('validating', { tab: props.tabId, valid: valid });
}

/**
 * Event handler for the 'discard-edits' event
 * @param employee The unedited employee object
 */
function onDiscardEdits(employee) {
  stopPrepare.value = true;
  editedEmployee.value = employee;
}

// |--------------------------------------------------|
// |                                                  |
// |                     WATCHERS                     |
// |                                                  |
// |--------------------------------------------------|

// note that this implicitly passes the new value into `emitValidation`
watch(validModel, emitValidation);
</script>

<style scoped>
.form-title {
  position: sticky;
  top: 45px;
  z-index: 2;
}

.invalid {
  color: #b00020;
}
</style>
