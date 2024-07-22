<template>
  <v-container>
    <!-- Military Branch -->
    <v-row v-for="i in [0]" :key="i">
      <v-col>
        <v-autocomplete
          ref="formFields"
          :items="dodForces"
          v-model="military.branch"
          :rules="getRequiredRules()"
          label="Military Branch"
          variant="underlined"
          auto-select-first
          clearable
        ></v-autocomplete>
      </v-col>
      <v-col>
        <v-text-field
          ref="formFields"
          :model-value="format(military.startDate, null, 'MM/YYYY')"
          :rules="getDateMonthYearOptionalRules()"
          label="Starting Date"
          hint="MM/YYYY format"
          v-mask="'##/####'"
          variant="underlined"
          prepend-icon="mdi-calendar"
          @update:focused="military.startDate = parseEventDate($event)"
          @click:prepend="military.showStartMenu = true"
          @keypress="military.showStartMenu = false"
          clearable
          persistent-hint
          autocomplete="off"
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

      <v-col>
        <v-text-field
          ref="formFields"
          :model-value="format(military.completeDate, null, 'MM/YYYY')"
          :rules="getDateMonthYearOptionalRules()"
          label="Completion Date"
          hint="MM/YYYY format"
          v-mask="'##/####'"
          variant="underlined"
          prepend-icon="mdi-calendar"
          @update:focused="military.completeDate = parseEventDate($event)"
          @click:prepend="military.showCompleteMenu = true"
          @keypress="military.showCompleteMenu = false"
          clearable
          persistent-hint
          autocomplete="off"
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
    </v-row>
  </v-container>
</template>

<script setup>
import _ from 'lodash';
import { ref } from 'vue';
import { getDateMonthYearOptionalRules, getRequiredRules } from '../../../../shared/validationUtils';
import { mask } from 'vue-the-mask';
import { format } from '../../../../shared/dateUtils';
import { computed } from 'vue';

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

/**
 * Parse the date after losing focus.
 *
 * @return String - The date in YYYY-MM format
 */
function parseEventDate() {
  return format(event.target.value, 'MM/YYYY', 'YYYY-MM');
} // parseEventDate
</script>
