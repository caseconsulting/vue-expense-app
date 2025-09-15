<template>
  <v-dialog
    persistent
    scrollable
  >
    <v-card id="employee-card">
      <v-card-title
        class="header-slim"
        style="position: sticky; top: 0; z-index: 2"
      >Add new Setting</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation>
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
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { generateUUID } from '@/utils/utils';

const formData = ref({id: generateUUID()});

const valid = ref(false);
</script>