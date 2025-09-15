<template>
  <v-dialog>
    <v-card id="employee-card">
      <v-card-title
        class="header-slim"
        style="position: sticky; top: 0; z-index: 2"
      >Add new Setting</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" @submit.prevent="submit()">
          <v-container>
            <v-row>
              <v-col>
                <v-text-field
                  v-model="formData.id"
                  label="ID"
                  disabled
                ></v-text-field>
              </v-col>
              <v-col>
                <v-text-field
                  v-model="formData.key"
                  label="Key"
                  required
                ></v-text-field> 
              </v-col>
              <v-col>
                <v-text-field
                  v-model="formData.setting"
                  label="Setting"
                  required
                ></v-text-field> 
              </v-col>
            </v-row>
          </v-container>
        <v-card-actions>
          <submit-button :valid="valid"></submit-button>
        </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { inject, ref } from 'vue';
import { generateUUID } from '@/utils/utils';
import api from '@/shared/api.js';
import SubmitButton from '@/components/shared/buttons/SubmitButton.vue';

const emitter = inject('emitter');

const formData = ref({id: generateUUID()});

const valid = ref(false);

async function submit() {
  if (valid.value) {
    await api.createItem(api.SETTINGS, formData.value);
    formData.value = {id: generateUUID()};
    emitter.emit('add-settings');
  }
}
</script>