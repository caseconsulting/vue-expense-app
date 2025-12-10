<template>
  <v-container>
    <v-row>
      <v-col>
        <v-row v-for="i in [0]" :key="i">
          <!-- Start high school name -->
          <v-col :cols="smAndDown ? '12' : ''">
            <v-text-field
              ref="formFields"
              v-model="editedEducation[schoolIndex].name"
              :rules="getRequiredRules()"
              label="High School"
              clearable
            ></v-text-field>
          </v-col>
          <!-- End high school name -->

          <!-- Start graduation date -->
          <v-col :cols="smAndDown ? '12' : ''">
            <date-picker
              :model-value="format(editedEducation[schoolIndex].gradDate, null, 'MM/YYYY')"
              :rules="getDateMonthYearOptionalRules()"
              label="Graduation Date"
              return-format="YYYY-MM"
              display-format="MM/YYYY"
              show-adjacent-months
              persistent-hint
              clearable
              hide-actions
              ref="formFields"
            />
          </v-col>
          <!-- End graduation date -->
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import DatePicker from '@/components/shared/DatePicker.vue';
import { format } from '@/shared/dateUtils';
import { getDateMonthYearOptionalRules, getRequiredRules } from '@/shared/validationUtils';
import { computed } from 'vue';
import { mask } from 'vue-the-mask';
import { useDisplay } from 'vuetify/lib/framework.mjs';

// |--------------------------------------------------|
// |                                                  |
// |                     SETUP                        |
// |                                                  |
// |--------------------------------------------------|

const editedEducation = defineModel({ required: true });
const props = defineProps(['schoolIndex', 'attach']);
const vMask = mask; // custom directive
const { smAndDown } = useDisplay();

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

/**
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM format
 */
function parseEventDate() {
  return format(event.target.value, 'MM/YYYY', 'YYYY-MM');
} // parseEventDate
</script>
