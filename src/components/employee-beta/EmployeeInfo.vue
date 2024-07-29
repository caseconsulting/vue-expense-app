<template>
  <v-container id="employee-container" class="px-1 pt-3" fluid>
    <base-card title="Employee" elevation="2">
      <template #title>
        <div class="d-flex justify-lg-space-between align-center">
          <h3 class="text-white">{{ employeeTitle }}</h3>
        </div>
      </template>
      <template #actions>
        <div class="d-flex flex-row align-center">
          <resume-card v-model="model" :editing="editing" :loading="loading"></resume-card>
          <convert-employee-to-csv
            v-if="isAdmin"
            :contracts="contracts"
            :employee="model"
            :filename="`${model.nickname || model.firstName} ${model.lastName}`"
            :tags="store.getters.tags"
            color="white"
          />
        </div>
      </template>
      <v-row justify="center">
        <v-col cols="12" lg="5" class="px-1">
          <div class="d-flex flex-column justify-center align-center">
            <employee-info-card :model="model"></employee-info-card>
            <!-- hire and contract info -->
            <v-row class="ma-2">
              <!-- case info -->
              <v-col>
                <case-experience-info-card :model="model"></case-experience-info-card>
              </v-col>
              <v-col style="max-width: fit-content">
                <contract-info-card :contracts="contracts" :model="model"></contract-info-card>
              </v-col>
            </v-row>
          </div>
        </v-col>
        <v-col cols="12" lg="7" class="px-0 pb-0">
          <v-card class="ma-2" elevation="0">
            <v-card-title>
              <v-row>
                <v-col cols="12" align="center" class="px-0">
                  <v-menu v-if="useDropDown">
                    <template v-slot:activator="{ props }">
                      <v-btn variant="text" size="large" class="text-subtitle-1 font-weight-bold" v-bind="props"
                        >{{ menuBtn }} <v-icon size="large">mdi-chevron-down</v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item v-if="isUser || isAdmin" @click="selectTab('personal')">Personal</v-list-item>
                      <v-list-item @click="selectTab('certifications+awards')">Certifications & Awards</v-list-item>
                      <v-list-item @click="selectTab('tech+skills+languages')">Tech, Skills, & Languages</v-list-item>
                      <v-list-item @click="selectTab('experience+education')">Job Experience & Education</v-list-item>
                    </v-list>
                  </v-menu>
                  <v-tabs
                    v-else
                    v-model="infoTab"
                    center-active
                    show-arrows
                    align-tabs="center"
                    color="blue"
                    class="mx-4"
                  >
                    <v-tab v-if="isUser || isAdmin" value="personal" @click="selectTab('personal')">Personal</v-tab>
                    <v-tab value="certifications+awards" @click="selectTab('certifications+awards')"
                      >Certifications & Awards</v-tab
                    >
                    <v-tab value="tech+skills+languages" @click="selectTab('tech+skills+languages')"
                      >Tech, Skills, & Languages</v-tab
                    >
                    <v-tab value="experience+education" @click="selectTab('experience+education')"
                      >Job Experience & Education</v-tab
                    >
                  </v-tabs>
                  <v-divider></v-divider>
                </v-col>
              </v-row>
            </v-card-title>
            <v-card-text class="px-2 pb-2">
              <v-tabs-window v-model="infoTab">
                <v-tabs-window-item value="personal">
                  <!-- personal info -->
                  <v-row class="my-2" v-if="isUser || isAdmin">
                    <v-col>
                      <personal-info-card style="padding-bottom: 10px" :model="model"></personal-info-card>
                    </v-col>
                    <v-col>
                      <other-info-card style="padding-bottom: 10px" :model="model"></other-info-card>
                    </v-col>
                    <v-col v-if="isUser || isAdmin">
                      <clearance-card style="padding-bottom: 10px" :model="model"></clearance-card>
                    </v-col>
                  </v-row>
                </v-tabs-window-item>
                <v-tabs-window-item value="certifications+awards">
                  <!-- certifications and awards -->
                  <v-row class="my-2">
                    <v-col>
                      <certifications-card :model="model"></certifications-card>
                    </v-col>
                    <v-col>
                      <awards-card :model="model"></awards-card>
                    </v-col>
                  </v-row>
                </v-tabs-window-item>
                <v-tabs-window-item value="tech+skills+languages">
                  <!-- tech, skills, languages -->
                  <v-row class="my-2">
                    <v-col>
                      <technologies-card :model="model"></technologies-card>
                    </v-col>
                    <v-col>
                      <languages-card :model="model"></languages-card>
                    </v-col>
                  </v-row>
                </v-tabs-window-item>
                <v-tabs-window-item value="experience+education">
                  <v-row class="my-2">
                    <!-- past experience -->
                    <v-col cols="12">
                      <past-job-experience-info-card
                        :model="model"
                        :isAdmin="isAdmin"
                        :isUser="isUser"
                      ></past-job-experience-info-card>
                    </v-col>
                    <!-- education and past experience -->
                    <v-col cols="12">
                      <education-info-card :model="model" :isAdmin="isAdmin" :isUser="isUser"></education-info-card>
                    </v-col>
                  </v-row>
                </v-tabs-window-item>
              </v-tabs-window>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <employee-form v-model="editing" :employee="model" :contracts="contracts"></employee-form>
    </base-card>
  </v-container>
</template>

<script setup>
import { computed, ref, inject } from 'vue';
import { useDisplay } from 'vuetify';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import AwardsCard from '@/components/employee-beta/cards/AwardsCard.vue';
import BaseCard from '@/components/employee-beta/cards/BaseCard.vue';
import CaseExperienceInfoCard from '@/components/employee-beta/cards/CaseExperienceInfoCard.vue';
import CertificationsCard from '@/components/employee-beta/cards/CertificationsCard.vue';
import ClearanceCard from '@/components/employee-beta/cards/personal/ClearanceCard.vue';
import ContractInfoCard from '@/components/employee-beta/cards/ContractInfoCard.vue';
import ConvertEmployeeToCsv from '@/components/employees/csv/ConvertEmployeeToCsv.vue';
import EducationInfoCard from '@/components/employee-beta/cards/EducationInfoCard.vue';
import EmployeeForm from '@/components/employee-beta/forms/EmployeeForm.vue';
import EmployeeInfoCard from '@/components/employee-beta/cards/EmployeeInfoCard.vue';
import LanguagesCard from '@/components/employee-beta/cards/LanguagesCard.vue';
import OtherInfoCard from '@/components/employee-beta/cards/personal/OtherInfoCard.vue';
import PastJobExperienceInfoCard from '@/components/employee-beta/cards/PastJobExperienceInfoCard.vue';
import PersonalInfoCard from '@/components/employee-beta/cards/personal/PersonalInfoCard.vue';
import ResumeCard from '@/components/employee-beta/cards/ResumeCard.vue';
import TechnologiesCard from '@/components/employee-beta/cards/TechnologiesCard.vue';

// |--------------------------------------------------|
// |                                                  |
// |                       SETUP                      |
// |                                                  |
// |--------------------------------------------------|

const display = useDisplay();
const store = useStore();
const route = useRoute();
const router = useRouter();

const model = defineModel();
defineProps(['contracts', 'loading']);
const isAdmin = inject('isAdmin');
const isUser = inject('isUser');

const editing = ref(false);
const infoTab = ref(route.hash.substring(1)); //currently active tab

// |--------------------------------------------------|
// |                                                  |
// |                    COMPUTED                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * menu button title for mobile interface.
 */
const menuBtn = computed(() => {
  switch (infoTab.value) {
    case 'personal':
      return 'Personal';
    case 'certifications+awards':
      return 'Certifications & Awards';
    case 'tech+skill+languages':
      return 'Tech, Skills, & Languages';
    case 'experience+education':
      return 'Job Experience & Education';
    default:
      return 'Select Info';
  }
});

/**
 * computed title for employee header
 *
 * @return {string} employee name or My Profile if current user
 */
const employeeTitle = computed(() => {
  return isUser.value ? 'My Profile' : (model.value.nickname || model.value.firstName) + "'s Profile";
});

/**
 * computed boolean to decide whether or not to use dropdown.
 *
 * @return boolean - returns true for small screens
 */
const useDropDown = computed(() => {
  switch (display.name.value) {
    case 'xs':
      return true;
    default:
      return false;
  }
}); // useDropDown

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * This is used to select the correct tab on mobile devices.
 */
function selectTab(name) {
  infoTab.value = name;
  router.replace({ hash: '#' + name });
} // selectTab
</script>
