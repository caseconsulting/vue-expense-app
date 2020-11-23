<template>
  <div class="infoTab">
    <!-- Employee has Degrees -->
    <div v-if="!isEmpty(model.degrees)">
      <!-- Loop Degrees -->
      <div v-for="(degree, index) in model.degrees" :key="degree.name">
        <p><b>Degree: </b>{{ degree.name }}</p>
        <p><b>School: </b>{{ degree.school }}</p>
        <p><b>Completion Date: </b>{{ degree.date | monthDayYearFormat }}</p>

        <!-- Majors -->
        <p class="mb-2"><b>Majors: </b></p>
        <ul class="mb-4">
          <li v-for="(major, majorIndex) in degree.majors" :key="majorIndex">
            {{ major }}
          </li>
        </ul>

        <!-- Minors -->
        <p v-if="degree.minors.length > 0" class="mb-2"><b>Minors: </b></p>
        <ul v-if="degree.minors.length > 0" class="mb-4">
          <li v-for="(minor, minorIndex) in degree.minors" :key="minorIndex">
            {{ minor }}
          </li>
        </ul>

        <!-- Concentrations -->
        <p v-if="degree.concentrations.length > 0" class="mb-2"><b>Concentrations: </b></p>
        <ul v-if="degree.concentrations.length > 0" class="mb-4">
          <li v-for="(concentration, concentrationsIndex) in degree.concentrations" :key="concentrationsIndex">
            {{ concentration }}
          </li>
        </ul>
        <hr v-if="index < model.degrees.length - 1" class="mb-3" />
      </div>
      <!-- End Loop Degrees -->
    </div>
    <!-- Employee does not have Degrees -->
    <p v-else>No Education information</p>
  </div>
</template>

<script>
import { isEmpty, monthDayYearFormat } from '@/utils/utils';

export default {
  filters: {
    monthDayYearFormat
  },
  methods: {
    isEmpty
  },
  props: ['model']
};
</script>
