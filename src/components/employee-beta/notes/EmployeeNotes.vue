<template>
  <v-dialog v-model="toggleModal" max-width="1000">
    <v-card class="w-100" min-height="600">
      <!-- header -->
      <v-card-title class="header_style d-flex align-center justify-space-between py-2 pt-2">
        <v-row>
          <v-col :cols="isMobile() ? '12' : '6'">
            <h3 class="text-white">
              <v-icon icon="mdi-shield-lock" size="30" class="mb-1 mr-1" />
              <span v-if="!isMobile()">Admin Notes:</span>
              {{ empName }}
            </h3>
          </v-col>
          <v-col v-if="!isMobile()" cols="6" class="d-flex text-right align-end justify-end pb-0">
            <p v-if="getLastUpdatedText" align-end class="font-italic text-caption ma-0">
              {{ getLastUpdatedText }}
            </p>
          </v-col>
        </v-row>
      </v-card-title>

      <v-row class="mt-1">
        <!-- left-side: nav and save -->
        <v-col class="border-e-thin pl-5 pt-4 d-flex flex-column flex-nowrap">
          <!-- nav -->
          <v-row>
            <!-- mobile -->
            <v-menu v-if="isMobile()">
              <template #activator="{ props }">
                <v-btn variant="text" theme="dark" class="mx-auto font-weight-bold" v-bind="props">
                  {{ menuItems[menuIndex].name }}
                  <v-icon>mdi-chevron-down</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item v-for="(page, i) of menuItems" :key="i" @click="menuIndex = i">
                  {{ page.name }}
                </v-list-item>
              </v-list>
            </v-menu>
            <!-- desktop -->
            <v-list v-else density="compact" nav id="edit-navigation" class="flex-1-1-100">
              <v-list-item
                v-for="(page, i) of menuItems"
                :key="page.name"
                @click="menuIndex = i"
                :title="page.name"
                link
              ></v-list-item>
            </v-list>
          </v-row>
          <!-- discard button -->
          <v-btn
            v-if="!isMobile()"
            style="margin-top: auto"
            variant="outlined"
            class="ma-2"
            color="grey-darken-1"
            type="submit"
            @click="discard()"
          >
            <v-icon class="mr-1">mdi-undo</v-icon>
            Discard
          </v-btn>
          <!-- manual save -->
          <v-btn
            v-if="!isMobile()"
            :disabled="saving"
            style="margin-top: auto"
            variant="outlined"
            class="ma-2"
            color="success"
            type="submit"
            @click="save(true)"
          >
            <v-icon class="mr-1">mdi-content-save</v-icon>
            {{ saveButtonText }}
          </v-btn>
        </v-col>

        <!-- right-side: notes-->
        <v-col :cols="isMobile() ? '12' : '9'" :class="isMobile() ? 'pl-6 pr-6' : 'pr-10'">
          <h2 class="my-4">{{ menuItems[menuIndex].name }} Notes</h2>
          <component
            :is="menuItems[menuIndex].component"
            :user="employee"
            :key="notes"
            v-model="notes.pages[getPageName(menuIndex)]"
            class="overflow-auto"
          />
        </v-col>

        <!-- bottom: mobile save -->
        <v-col v-if="isMobile()" class="border-e-thin pl-5 pt-4 d-flex flex-column flex-nowrap">
          <!-- Discard button -->
          <v-btn
            style="margin-top: auto"
            variant="outlined"
            class="ma-2"
            color="grey-darken-1"
            type="submit"
            @click="discard()"
          >
            <v-icon class="mr-1">mdi-undo</v-icon>
            Discard
          </v-btn>
          <!-- manual save -->
          <v-btn
            :disabled="saving"
            style="margin-top: auto"
            variant="outlined"
            class="ma-2"
            color="success"
            type="submit"
            @click="save(true)"
          >
            <v-icon class="mr-1">mdi-content-save</v-icon>
            {{ saveButtonText }}
          </v-btn>
          <p v-if="getLastUpdatedText" align-end class="font-italic text-caption my-0 mx-2">
            {{ getLastUpdatedText }}
          </p>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script setup>
/**
 * TODO
 * - rollups (reports page? new page?)
 *   - what employees want to move
 *   - what people haven't been contacted in a while (break up into quarters)
 *   - whose PoP is ending soon
 */

// general imports
import { ref, computed, inject, onMounted, watch } from 'vue';
import { format, getTodaysDate } from '@/shared/dateUtils';
import { useStore } from 'vuex';
import api from '@/shared/api';
import { isMobile } from '@/utils/utils';
import _cloneDeep from 'lodash/cloneDeep';
import _isEqual from 'lodash/isEqual';

const store = useStore();
const emitter = inject('emitter');

// import note pages
import GeneralNotes from './pages/GeneralNotes.vue';
import PersonalNotes from './pages/PersonalNotes.vue';
import CareerNotes from './pages/CareerNotes.vue';
import KudoNotes from './pages/KudoNotes.vue';

let props = defineProps(['employee']);
const saving = ref(false);
const saveButtonText = ref('Save');

// blank notes template
let notes = ref({
  updated: {
    author: '',
    date: ''
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
      misc: '',
      custom: []
    }
  }
});
// save old version of notes for the ability to discard
let oldNotes = null;

const empName = `${props.employee.nickname || props.employee.firstName} ${props.employee.lastName}`;
const menuIndex = ref(0);
const menuItems = ref([
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

/**
 * Gets text to answer who last updated the notes, and when
 */
const getLastUpdatedText = computed(() => {
  if (!notes.value.updated?.author) return '';
  let author = store.getters.employees.find((e) => e.id === notes.value.updated.author);
  author = `${author.nickname || author.firstName} ${author.lastName}`;
  let date = format(notes.value.updated.date, null, 'MM/DD/YYYY H:mm');
  return `Last updated ${date} by ${author}`;
});

/**
 * Discards current changes and resets them
 */
function discard() {
  notes.value = _cloneDeep(oldNotes);
  emitter.emit('close-notes');
}

/**
 * Saves the current content of the notes variable to the database
 *
 * @param manual whether or not the save was initiated manually
 */
async function save(manual = false) {
  // if no changes, do nothing
  if (oldNotes && _isEqual(notes.value, oldNotes)) return;

  if (manual)
    // set saving state
    saving.value = true;

  // set new value
  let value = {
    id: props.employee.id,
    notes: {
      ...notes.value,
      updated: { date: getTodaysDate('YYYY-MM-DD[T]HH:mm:ss'), author: store.getters.user.id }
    }
  };

  // api call to update database
  await api.updateAttribute(api.EMPLOYEES, value, 'notes');

  // also update the notes variable with the new updated value
  notes.value.updated = value.notes.updated;

  // emit for anything that needs it
  emitter.emit('saved-notes', { empId: props.employee.id, notes: notes.value });

  // inform user that plan was saved successfully
  saving.value = false;
  saveButtonText.value = 'Saved!';
  setTimeout(() => {
    saveButtonText.value = 'Save';
  }, 2500);
}

// fetch notes from the database, if existing
onMounted(async () => {
  if (props.employee.notes?.updated) {
    notes.value = props.employee.notes;
    oldNotes = _cloneDeep(props.employee.notes);
  }
});

/**
 * Converts index from `pages` var to name in `notes` var
 *
 * @param pageIndex index in `pages` variable to get name for
 */
function getPageName(pageIndex) {
  return menuItems.value[pageIndex].key;
}

/**
 * Autosaves the notes. Default is to set a timer of 5 seconds and save after the timer is up,
 * but setting `saveNow` to true will skip this timer.
 */
var saveTimer = null;
function autosave() {
  // set timeout duration
  const bufferTime = 5000;

  // stop any old saves, make a new one
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    save();
  }, bufferTime);
}

watch(() => notes.value.pages, autosave, { deep: true });
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
