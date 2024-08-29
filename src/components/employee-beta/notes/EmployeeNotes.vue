<template>
  <v-dialog v-model="toggleModal" max-width="1000">
    <v-card class="w-100" min-height="600">
      <!-- header -->
      <v-card-title class="header_style d-flex align-center justify-space-between py-0 pt-2">
        <h3 class="text-white">
          <v-icon icon="mdi-shield-lock" size="30" class="mb-1"> </v-icon>
          Admin Notes: {{ empName }}
        </h3>
        <v-spacer></v-spacer>
        <span v-if="getLastUpdatedText" class="last-updated font-italic text-caption mr-4">{{
          getLastUpdatedText
        }}</span>
      </v-card-title>

      <v-row>
        <!-- left-side: nav and save -->
        <v-col class="border-e-thin pl-5 pt-4 d-flex flex-column flex-nowrap">
          <!-- nav -->
          <v-list density="compact" nav id="edit-navigation" class="flex-1-1-100">
            <v-list-item
              v-for="(page, i) of pages"
              :key="page.name"
              @click="pageIndex = i"
              :title="page.name"
              link
            ></v-list-item>
          </v-list>
          <!-- auto-save option -->
          <v-row>
            <v-checkbox-btn hide-details v-model="autoSave" label="Auto-save" class="shrink mr-0 mt-0 pl-4" />
          </v-row>
          <!-- manual save -->
          <v-btn
            style="margin-top: auto"
            id="employeeSubmitBtn"
            variant="outlined"
            class="ma-2"
            :color="invalidButton ? 'error' : 'success'"
            type="submit"
          >
            <v-icon class="mr-1">mdi-content-save</v-icon>
            Save
          </v-btn>
        </v-col>

        <!-- right-side: notes-->
        <v-col cols="9" class="pr-10">
          <h2 class="my-4">{{ pages[pageIndex].name }} Notes</h2>
          <component
            :is="pages[pageIndex].component"
            :user="employee"
            :notesModel="notes.pages[pages[pageIndex].key]"
          />
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script setup>
/**
 * TODO
 * - make backend
 *   - only visible to admins, even in `network` tab
 * - make save functionality
 * - make auto-save functionality
 * - make mobile friendly
 * - rollups (reports page? new page?)
 *   - what employees want to move
 *   - what people haven't been contacted in a while (break up into quarters)
 *   - whose PoP is ending soon
 */

// general imports
import { ref, computed, inject, onMounted } from 'vue';
import { format } from '@/shared/dateUtils';
import { useStore } from 'vuex';

const store = useStore();
const emitter = inject('emitter');

// import note pages
import GeneralNotes from './pages/GeneralNotes.vue';
import PersonalNotes from './pages/PersonalNotes.vue';
import CareerNotes from './pages/CareerNotes.vue';
import KudoNotes from './pages/KudoNotes.vue';

let props = defineProps(['employee']);

// TODO: make a real prop and such
let notes = {
  updated: {
    author: '42832a16-d933-44b3-bee5-14d21678c99b',
    date: '2024-02-05T09:05:35'
  },
  pages: {
    general: {
      misc: ''
    },
    career: {
      desireToMove: false,
      moveTo: '',
      moveReason: '',
      jobDescription: '',
      misc: ''
    },
    personal: {
      familial: '',
      medical: '',
      misc: ''
    },
    kudos: {
      misc: ''
    }
  }
};

const empName = `${props.employee.nickname || props.employee.firstName} ${props.employee.lastName}`;
const autoSave = ref(true);
const pageIndex = ref(0);
const pages = ref([
  {
    name: 'General',
    key: 'general',
    component: GeneralNotes
  },
  {
    name: 'Career',
    key: 'career',
    component: CareerNotes
  },
  {
    name: 'Personal',
    key: 'personal',
    component: PersonalNotes
  },
  {
    name: 'Kudos',
    key: 'kudos',
    component: KudoNotes
  }
]);

const getLastUpdatedText = computed(() => {
  let author = store.getters.employees.find((e) => e.id === notes.updated.author);
  author = `${author.nickname || author.firstName} ${author.lastName}`;
  let date = format(notes.updated.date, null, 'MM/DD/YYYY H:mm');
  return `Last updated ${date} by ${author}`;
});

onMounted(() => {
  emitter.on('save-notes', (data) => {
    notes.pages[data.from] = data.notes;
  });
});
</script>

<style scoped>
.last-updated {
  position: absolute !important;
  font-size: 10px;
  bottom: 0px;
  right: 0px;
  margin-right: 10px;
}
</style>
