<template>
  <v-container id="employee-container" class="px-1 pt-3" fluid>
    <v-card id="employee-info-card" class="ma-1" elevation="2">
      <v-card-title class="header_style d-flex align-center">
        <!-- title -->
        <v-row no-gutters class="fit-content align-center">
          <v-col>
            <h3 class="text-white" :class="isMobile() ? 'text-h6' : ''">{{ employeeTitle }}</h3>
          </v-col>
        </v-row>
        <v-spacer></v-spacer>
        <!-- action buttons -->
        <v-row no-gutters class="fit-content d-flex align-center justify-start">
          <v-col cols="auto">
            <div class="d-flex flex-row align-center fit-content ml-1">
              <resume-card v-model="model" :editing="editing" :loading="loading"></resume-card>
            </div>
          </v-col>
          <v-col :class="isMobile() ? '' : 'ml-2'" cols="auto">
            <span class="border-e-thin ml-1 mr-2"></span>
            <v-btn
              v-if="isAdmin"
              @click="toggleEmployeeNotes()"
              density="comfortable"
              variant="text"
              class="px-1"
              icon=""
            >
              <v-tooltip activator="parent" location="top">
                {{ notesTooltip }}
              </v-tooltip>
              <v-icon color="white"> mdi-notebook </v-icon>
            </v-btn>
            <convert-employee-to-csv
              v-if="isAdmin"
              class="px-1"
              :contracts="contracts"
              :employee="model"
              :filename="`${model.nickname || model.firstName} ${model.lastName}`"
              :tags="store.getters.tags"
              color="white"
            />
            <v-btn
              v-if="isAdmin || isUser"
              @click="toggleEdit()"
              density="comfortable"
              variant="text"
              class="px-1"
              icon=""
            >
              <v-tooltip activator="parent" location="top"> Edit {{ menuBtn }} </v-tooltip>
              <v-icon id="edit" color="white"> mdi-pencil </v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text :class="useDropDown ? 'pa-0' : ''">
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
                <v-col>
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
                        <v-list-item @click="selectTab('personal')">Personal</v-list-item>
                        <v-list-item @click="selectTab('certifications+awards')">Certifications & Awards</v-list-item>
                        <v-list-item @click="selectTab('tech+skills+languages')">Tech, Skills, & Languages</v-list-item>
                        <v-list-item @click="selectTab('experience+education')">Job Experience & Education</v-list-item>
                        <v-list-item @click="selectTab('customer+orgs')">Customer Orgs</v-list-item>
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
                      <v-tab value="personal" @click="selectTab('personal')">
                        <div class="tab-content"><span>Personal</span><span>Info</span></div>
                      </v-tab>
                      <v-tab value="certifications+awards" @click="selectTab('certifications+awards')">
                        <div class="tab-content">
                          <span>Certifications</span>
                          <span>& Awards</span>
                        </div>
                      </v-tab>
                      <v-tab value="tech+skills+languages" @click="selectTab('tech+skills+languages')">
                        <div class="tab-content">
                          <span>Tech, Skills,</span>
                          <span>& Languages</span>
                        </div>
                      </v-tab>
                      <v-tab value="experience+education" @click="selectTab('experience+education')">
                        <div class="tab-content">
                          <span>Job Experience</span>
                          <span>& Education</span>
                        </div>
                      </v-tab>
                      <v-tab value="customer+orgs" @click="selectTab('customer+orgs')">
                        <div class="tab-content">
                          <span>Customer</span>
                          <span>Orgs</span>
                        </div></v-tab
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
                    <v-row class="my-2 mx-1">
                      <v-col>
                        <personal-info-card style="padding-bottom: 10px" :model="model"></personal-info-card>
                      </v-col>
                      <v-col v-if="isUser || isAdmin">
                        <other-info-card style="padding-bottom: 10px" :model="model"></other-info-card>
                      </v-col>
                      <v-col v-if="isUser || isAdmin">
                        <clearance-card style="padding-bottom: 10px" :model="model"></clearance-card>
                      </v-col>
                    </v-row>
                  </v-tabs-window-item>
                  <v-tabs-window-item value="certifications+awards">
                    <!-- certifications and awards -->
                    <v-row class="my-2 mx-1">
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
                    <v-row class="my-2 mx-1">
                      <v-col>
                        <technologies-card :model="model"></technologies-card>
                      </v-col>
                      <v-col>
                        <languages-card :model="model"></languages-card>
                      </v-col>
                    </v-row>
                  </v-tabs-window-item>
                  <v-tabs-window-item value="experience+education">
                    <v-row class="my-2 mx-1">
                      <!-- past experience -->
                      <v-col cols="12">
                        <job-experience-info-card
                          :model="model"
                          :isAdmin="isAdmin"
                          :isUser="isUser"
                        ></job-experience-info-card>
                      </v-col>
                      <!-- education and past experience -->
                      <v-col cols="12">
                        <education-info-card :model="model" :isAdmin="isAdmin" :isUser="isUser"></education-info-card>
                      </v-col>
                    </v-row>
                  </v-tabs-window-item>
                  <v-tabs-window-item value="customer+orgs">
                    <v-row class="my-2 mx-1">
                      <v-col>
                        <customer-orgs-card :model="model"></customer-orgs-card>
                      </v-col>
                    </v-row>
                  </v-tabs-window-item>
                </v-tabs-window>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <employee-form v-model="editing" :employee="model" :contracts="contracts"></employee-form>
        <employee-notes v-model="showEmployeeNotes" :employee="model" :key="model"></employee-notes>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { isMobile } from '@/utils/utils';
import { computed, ref, inject, onMounted } from 'vue';
import { useDisplay } from 'vuetify';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import AwardsCard from '@/components/employee-beta/cards/AwardsCard.vue';
import CaseExperienceInfoCard from '@/components/employee-beta/cards/CaseExperienceInfoCard.vue';
import CertificationsCard from '@/components/employee-beta/cards/CertificationsCard.vue';
import ClearanceCard from '@/components/employee-beta/cards/personal/ClearanceCard.vue';
import ContractInfoCard from '@/components/employee-beta/cards/ContractInfoCard.vue';
import ConvertEmployeeToCsv from '@/components/employees/csv/ConvertEmployeeToCsv.vue';
import EducationInfoCard from '@/components/employee-beta/cards/EducationInfoCard.vue';
import EmployeeForm from '@/components/employee-beta/forms/EmployeeForm.vue';
import EmployeeInfoCard from '@/components/employee-beta/cards/EmployeeInfoCard.vue';
import EmployeeNotes from '@/components/employee-beta/notes/EmployeeNotes.vue';
import LanguagesCard from '@/components/employee-beta/cards/LanguagesCard.vue';
import OtherInfoCard from '@/components/employee-beta/cards/personal/OtherInfoCard.vue';
import JobExperienceInfoCard from '@/components/employee-beta/cards/JobExperienceInfoCard.vue';
import PersonalInfoCard from '@/components/employee-beta/cards/personal/PersonalInfoCard.vue';
import ResumeCard from '@/components/employee-beta/cards/ResumeCard.vue';
import TechnologiesCard from '@/components/employee-beta/cards/TechnologiesCard.vue';
import CustomerOrgsCard from '@/components/employee-beta/cards/CustomerOrgsCard.vue';

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
const emitter = inject('emitter');
const isAdmin = inject('isAdmin');
const isUser = inject('isUser');

const editing = ref(false);
const infoTab = ref(route.hash.substring(1)); // currently active tab
const showEmployeeNotes = ref(false);

onMounted(() => {
  emitter.on('close-notes', () => {
    showEmployeeNotes.value = false;
  });
});

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
    case 'tech+skills+languages':
      return 'Tech, Skills, & Languages';
    case 'experience+education':
      return 'Job Experience & Education';
    case 'customer+orgs':
      return 'Customer Orgs';
    default:
      return 'Select Info';
  }
});

const notesTooltip = computed(() => {
  let maxChars = 40;
  let miscNotes = model.value.notes?.pages?.general?.misc;
  if (!miscNotes) return 'Employee Notes';
  let tooltip = miscNotes.substring(0, maxChars);
  if (miscNotes.length > maxChars) tooltip += '...';
  return tooltip;
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
  const scrollOffset = document.querySelector('.container')?.scrollTop;
  router.replace({ hash: '#' + name });
  window.scroll(scrollOffset);
} // selectTab

function toggleEdit() {
  emitter.emit('editing', menuBtn.value);
}

function toggleEmployeeNotes() {
  showEmployeeNotes.value = true;
}
</script>

<style scoped>
.tab-content span {
  display: block;
  text-align: start;
}
</style>
