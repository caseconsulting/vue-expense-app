<template>
  <v-card @click="toggleInfo" variant="elevated" width="170px" style="margin: 40px" rounded="1">
    <span style="background-color: red"></span>
    <div class="font-weight-black" style="position: relative; padding-top: 5px; padding-left: 10px">Hire date</div>
    <div style="position: relative; padding-left: 10px; padding-bottom: 5px">{{ hireDate }}</div>
    <div v-if="wasIntern && moreInfo" class="font-weight-black" style="position: relative; padding-left: 10px">
      Internship date
    </div>
    <div v-if="wasIntern && moreInfo" style="position: relative; padding-left: 10px; padding-bottom: 5px">
      {{ internshipDate }}
    </div>
    <div v-if="moreInfo" class="font-weight-black" style="position: relative; padding-left: 10px">Time with CASE</div>
    <div v-if="moreInfo" style="position: relative; padding-bottom: 5px; padding-left: 10px">
      {{ durationWithCase }}
    </div>
  </v-card>
</template>

<script setup>
import { ref, onBeforeMount } from 'vue';
import { format } from '@/shared/dateUtils';

// |--------------------------------------------------|
// |                                                  |
// |                      SETUP                       |
// |                                                  |
// |--------------------------------------------------|

const props = defineProps(['model']);
const hireDate = ref(null);
const wasIntern = ref(false);
const internshipDate = ref(null);
const durationWithCase = ref(null);
const moreInfo = ref(false);

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

onBeforeMount(() => {
  hireDate.value = format(props.model.hireDate, null, 'LL');
});

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function toggleInfo() {
  wasIntern.value = !wasIntern.value;
  moreInfo.value = !moreInfo.value;
  internshipDate.value = 'March 14th, 2015';
  durationWithCase.value = '1900 days or 5 years';
}
</script>
