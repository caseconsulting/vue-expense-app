<template>
  <v-container>
    <v-row>
      <v-col>
        <v-row v-for="i in [0]" :key="i">
          <!-- Start high school name -->
          <v-col :cols="isMobile() ? '12' : ''">
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
          <v-col :cols="isMobile() ? '12' : ''">
            <v-text-field
              :model-value="format(editedEducation[schoolIndex].gradDate, null, 'MM/YYYY')"
              ref="formFields"
              :rules="getDateMonthYearOptionalRules()"
              label="Graduation Date"
              hint="MM/YYYY format"
              v-mask="'##/####'"
              persistent-hint
              clearable
              prepend-inner-icon="mdi-calendar"
              autocomplete="off"
              @update:focused="editedEducation[schoolIndex].gradDate = parseEventDate()"
              @keypress="editedEducation[schoolIndex].showReceivedMenu = false"
            >
              <v-menu
                activator="parent"
                v-model="editedEducation[schoolIndex].showReceivedMenu"
                :close-on-content-click="false"
                :attach="isAttached"
                location="start center"
              >
                <v-date-picker
                  v-model="editedEducation[schoolIndex].gradDate"
                  @update:model-value="editedEducation[schoolIndex].showReceivedMenu = false"
                  show-adjacent-months
                  hide-actions
                  keyboard-icon=""
                  color="#bc3825"
                  title="Graduation Date"
                ></v-date-picker>
              </v-menu>
            </v-text-field>
          </v-col>
          <!-- End graduation date -->
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { format } from '@/shared/dateUtils';
import { getDateMonthYearOptionalRules, getRequiredRules } from '@/shared/validationUtils';
import { isMobile } from '@/utils/utils';
import { computed } from 'vue';
import { mask } from 'vue-the-mask';

// |--------------------------------------------------|
// |                                                  |
// |                     SETUP                        |
// |                                                  |
// |--------------------------------------------------|

const editedEducation = defineModel({ required: true });
const props = defineProps(['schoolIndex', 'attach']);
const vMask = mask; // custom directive

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
