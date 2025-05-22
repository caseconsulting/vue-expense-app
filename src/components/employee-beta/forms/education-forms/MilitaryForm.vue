<template>
  <v-container>
    <v-row v-for="i in [0]" :key="i">
      <!-- Start military branch -->
      <v-col :cols="smAndDown ? '12' : ''">
        <v-autocomplete
          ref="formFields"
          :items="dodForces"
          v-model="editedEducation[militaryIndex].branch"
          :rules="getRequiredRules()"
          label="Military Branch"
          auto-select-first
          clearable
        ></v-autocomplete>
      </v-col>
      <!-- End military branch -->

      <!-- Start military start date -->
      <v-col :cols="smAndDown ? '12' : ''">
        <v-text-field
          ref="formFields"
          :model-value="format(editedEducation[militaryIndex].startDate, null, 'MM/YYYY')"
          :rules="getDateMonthYearRules()"
          label="Starting Date"
          hint="MM/YYYY format"
          v-mask="'##/####'"
          prepend-inner-icon="mdi-calendar"
          clearable
          persistent-hint
          autocomplete="off"
          @update:focused="editedEducation[militaryIndex].startDate = parseEventDate($event)"
          @keypress="editedEducation[militaryIndex].showStartMenu = false"
        >
          <v-menu
            activator="parent"
            v-model="editedEducation[militaryIndex].showStartMenu"
            :close-on-content-click="false"
            :attach="isAttached"
            location="start center"
          >
            <v-date-picker
              v-model="editedEducation[militaryIndex].startDate"
              @update:model-value="editedEducation[militaryIndex].showStartMenu = false"
              show-adjacent-months
              hide-actions
              keyboard-icon=""
              color="#bc3825"
              title="Starting Date"
            ></v-date-picker>
          </v-menu>
        </v-text-field>
      </v-col>
      <!-- End military start date -->

      <!-- Start military end date -->
      <v-col :cols="smAndDown ? '12' : ''">
        <v-text-field
          ref="formFields"
          :model-value="format(editedEducation[militaryIndex].completeDate, null, 'MM/YYYY')"
          :rules="getDateMonthYearOptionalRules()"
          label="Completion Date"
          hint="MM/YYYY format"
          v-mask="'##/####'"
          prepend-inner-icon="mdi-calendar"
          clearable
          persistent-hint
          autocomplete="off"
          @update:focused="editedEducation[militaryIndex].completeDate = parseEventDate()"
          @keypress="editedEducation[militaryIndex].showCompleteMenu = false"
        >
          <v-menu
            activator="parent"
            v-model="editedEducation[militaryIndex].showCompleteMenu"
            :close-on-content-click="false"
            :attach="isAttached"
            location="start center"
          >
            <v-date-picker
              v-model="editedEducation[militaryIndex].completeDate"
              @update:model-value="editedEducation[militaryIndex].showCompleteMenu = false"
              show-adjacent-months
              hide-actions
              keyboard-icon=""
              color="#bc3825"
              title="Completion Date"
            ></v-date-picker>
          </v-menu>
        </v-text-field>
      </v-col>
      <!-- End military end date -->
      <v-divider v-if="smAndDown" :thickness="3"></v-divider>
    </v-row>
  </v-container>
</template>

<script setup>
import { format } from '@/shared/dateUtils';
import { getDateMonthYearOptionalRules, getRequiredRules, getDateMonthYearRules } from '@/shared/validationUtils';
import { computed } from 'vue';
import { mask } from 'vue-the-mask';
import { useDisplay } from 'vuetify/lib/framework.mjs';

// |--------------------------------------------------|
// |                                                  |
// |                     SETUP                        |
// |                                                  |
// |--------------------------------------------------|

const editedEducation = defineModel({ required: true });
const props = defineProps(['militaryIndex', 'attach']);
const vMask = mask; // custom directive
const { smAndDown } = useDisplay();

const dodForces = ['Army', 'Marine Corps', 'Navy', 'Air Force', 'Space Force', 'Coast Guard', 'National Guard']; // subject to change per Paul

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * Determines if the fields are in modals and should be assign the attached prop.
 */
const isAttached = computed(() => {
  return props.attach;
}); // isAttached

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM format
 */
function parseEventDate() {
  return format(event.target.value, 'MM/YYYY', 'YYYY-MM');
} // parseEventDate
</script>
