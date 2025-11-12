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
        <date-picker
          v-model="editedEducation[militaryIndex].startDate"
          :rules="getDateMonthYearRules()"
          variant="filled"
          label="Starting Date"
          return-format="YYYY-MM"
          display-format="MM/YYYY"
          persistent-hint
          show-adjacent-months
          hide-actions
          clearable
          ref="formFields"
        />
      </v-col>
      <!-- End military start date -->

      <!-- Start military end date -->
      <v-col :cols="smAndDown ? '12' : ''">
        <date-picker
          v-model="editedEducation[militaryIndex].completeDate"
          :rules="getDateMonthYearOptionalRules()"
          variant="filled"
          label="Completion Date"
          return-format="YYYY-MM"
          display-format="MM/YYYY"
          show-adjacent-months
          persistent-hint
          hide-actions
          clearable
          ref="formFields"
        />
      </v-col>
      <!-- End military end date -->
      <v-divider v-if="smAndDown" :thickness="3"></v-divider>
    </v-row>
  </v-container>
</template>

<script setup>
import DatePicker from '@/components/shared/DatePicker.vue';
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
