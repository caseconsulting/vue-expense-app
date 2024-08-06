<template>
  <v-container>
    <v-row v-for="i in [0]" :key="i">
      <!-- Start military branch -->
      <v-col :cols="isMobile() ? '12' : ''">
        <v-autocomplete
          ref="formFields"
          :items="dodForces"
          v-model="military.branch"
          :rules="getRequiredRules()"
          label="Military Branch"
          auto-select-first
          clearable
        ></v-autocomplete>
      </v-col>
      <!-- End military branch -->

      <!-- Start military start date -->
      <v-col :cols="isMobile() ? '12' : ''">
        <v-text-field
          ref="formFields"
          :model-value="format(military.startDate, null, 'MM/YYYY')"
          :rules="getDateMonthYearOptionalRules()"
          label="Starting Date"
          hint="MM/YYYY format"
          v-mask="'##/####'"
          variant="underlined"
          prepend-inner-icon="mdi-calendar"
          clearable
          persistent-hint
          autocomplete="off"
          @update:focused="military.startDate = parseEventDate($event)"
          @keypress="military.showStartMenu = false"
        >
          <v-menu
            activator="parent"
            v-model="military.showStartMenu"
            :close-on-content-click="false"
            :attach="isAttached"
            location="start center"
          >
            <v-date-picker
              v-model="military.startDate"
              @update:model-value="military.showStartMenu = false"
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
      <v-col :cols="isMobile() ? '12' : ''">
        <v-text-field
          ref="formFields"
          :model-value="format(military.completeDate, null, 'MM/YYYY')"
          :rules="getDateMonthYearOptionalRules()"
          label="Completion Date"
          hint="MM/YYYY format"
          v-mask="'##/####'"
          variant="underlined"
          prepend-inner-icon="mdi-calendar"
          clearable
          persistent-hint
          autocomplete="off"
          @update:focused="military.completeDate = parseEventDate($event)"
          @keypress="military.showCompleteMenu = false"
        >
          <v-menu
            activator="parent"
            v-model="military.showCompleteMenu"
            :close-on-content-click="false"
            :attach="isAttached"
            location="start center"
          >
            <v-date-picker
              v-model="military.completeDate"
              @update:model-value="military.showCompleteMenu = false"
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
      <v-divider v-if="isMobile()" :thickness="3"></v-divider>
    </v-row>
  </v-container>
</template>

<script setup>
import { format } from '@/shared/dateUtils';
import { getDateMonthYearOptionalRules, getRequiredRules } from '@/shared/validationUtils';
import { isMobile } from '@/utils/utils';
import _ from 'lodash';
import { computed, ref } from 'vue';
import { mask } from 'vue-the-mask';

// |--------------------------------------------------|
// |                                                  |
// |                     SETUP                        |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['service', 'militaryIndex', 'validating', 'attach', 'index']);
const vMask = mask; // custom directive

const dodForces = ['Army', 'Marine Corps', 'Navy', 'Air Force', 'Space Force', 'Coast Guard', 'National Guard']; // subject to change per Paul
const military = ref({ ..._.cloneDeep(props.service), showStartMenu: false, showCompleteMenu: false });

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
