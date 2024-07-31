<template>
  <v-container>
    <v-row>
      <v-col>
        <v-row v-for="i in [0]" :key="i">
          <!-- Start high school name -->
          <v-col :cols="isMobile() ? '12' : ''">
            <v-text-field
              ref="formFields"
              v-model="highSchool.name"
              :rules="getRequiredRules()"
              label="High School"
              clearable
            ></v-text-field>
          </v-col>
          <!-- End high school name -->

          <!-- Start graduation date -->
          <v-col :cols="isMobile() ? '12' : ''">
            <v-text-field
              :model-value="format(highSchool.gradDate, null, 'MM/YYYY')"
              ref="formFields"
              :rules="getDateMonthYearOptionalRules()"
              label="Graduation Date"
              hint="MM/YYYY format"
              v-mask="'##/####'"
              persistent-hint
              @update:focused="highSchool.gradDate = parseEventDate($event)"
              clearable
              prepend-inner-icon="mdi-calendar"
              @click:prepend="highSchool.showReceivedMenu = true"
              @keypress="highSchool.showReceivedMenu = false"
              autocomplete="off"
            >
              <v-menu
                activator="parent"
                v-model="highSchool.showReceivedMenu"
                :close-on-content-click="false"
                :attach="isAttached"
                location="start center"
              >
                <v-date-picker
                  v-model="highSchool.gradDate"
                  @update:model-value="highSchool.showReceivedMenu = false"
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
import _ from 'lodash';
import { getDateMonthYearOptionalRules, getRequiredRules } from '../../../../shared/validationUtils';
import { ref } from 'vue';
import { format } from '../../../../shared/dateUtils';
import { computed } from 'vue';
import { mask } from 'vue-the-mask';
import { isMobile } from '../../../../utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                     SETUP                        |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['school', 'schoolIndex', 'validating', 'attach']);
const vMask = mask; // custom directive

const highSchool = ref({ ..._.cloneDeep(props.school), showRecievedMenu: false });

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
