<template>
  <div>
    <v-card class="overflow-y-hidden">
      <!-- Title -->
      <v-card-title class="d-flex align-center header_style">
        <h3>Activity Feed</h3>
      </v-card-title>
      <v-spacer></v-spacer>
      <div v-if="loading" class="pa-8 pt-6">
        <v-progress-linear :indeterminate="true"></v-progress-linear>
      </div>
      <div v-else>
        <!-- Autocomplete filters -->
        <v-card-text class="mb-0 pb-0">
          <!-- Loading Bar -->
          <v-autocomplete
            v-model="activeFilters"
            :items="filters"
            multiple
            chips
            closable-chips
            hide-details
            variant="filled"
            density="compact"
            return-object
            item-title="type"
            item-value="type"
            :search.sync="searchString"
            @update:model-value="searchString = ''"
            class="elevate"
            append-icon=""
          >
            <template v-slot:chip="{ props, item }">
              <v-chip v-bind="props" class="pl-2">
                <v-avatar :color="item.raw.color" size="23" class="mr-1">
                  <v-icon color="white" close>{{ item.raw.icon }}</v-icon>
                </v-avatar>
                <span class="text-black">
                  {{ item.raw.type }}
                </span>
              </v-chip>
            </template>
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props" :title="item.raw.type">
                <template v-slot:prepend>
                  <v-avatar :color="item.raw.color" size="30" class="mr-1">
                    <v-icon color="white" close>{{ item.raw.icon }}</v-icon>
                  </v-avatar>
                </template>
              </v-list-item>
            </template>
          </v-autocomplete>
        </v-card-text>
        <v-timeline side="end" density="compact" class="timeline ml-9">
          <!-- Timeline -->
          <v-timeline-item v-for="item in filterEvents()" density="compact" :dot-color="item.color" :key="item.name">
            <!-- Expanded Event Description -->
            <v-tooltip
              v-if="item.truncatedText"
              activator="parent"
              location="top"
              max-width="400px"
              min-width="200px"
              :color="item.truncatedText ? 'grey-darken-3' : 'rgba(0, 0, 0, 0)'"
              open-delay="200"
            >
              <span class="activityFeedText">{{ item.text }}</span>
            </v-tooltip>
            <!-- Icon -->
            <template v-slot:icon v-if="item.icon">
              <v-btn variant="text" icon :href="getURL(item)" target="blank">
                <v-tooltip
                  v-if="
                    item.newCampfire ||
                    item.congratulateCampfire ||
                    item.birthdayCampfire ||
                    item.campfire ||
                    item.eventScheduled
                  "
                  activator="parent"
                  location="bottom"
                >
                  <span v-if="item.newCampfire">Welcome to team</span>
                  <span v-else-if="item.congratulateCampfire">Congratulate</span>
                  <span v-else-if="item.birthdayCampfire">Say happy birthday</span>
                  <span v-else-if="item.campfire">Comment in campfire</span>
                  <span v-else-if="item.eventScheduled">See event</span>
                </v-tooltip>
                <v-icon class="text-white">{{ item.icon }}</v-icon>
              </v-btn>
            </template>
            <!-- End Icon -->

            <!-- Item Title: Date -->
            <h3>{{ item.date }}</h3>

            <div v-if="item.type === 'Anniversary'" class="px-4">
              <v-btn @click="openAnniversariesModal(item)" color="#bc3825" class="text-white" size="small"
                >View {{ item.events.length }} {{ item.events.length > 1 ? 'Anniversaries' : 'Anniversary' }}</v-btn
              >
            </div>

            <div v-else>
              <!-- Event has a link -->
              <v-list-item
                class="ma-auto pa-auto activityFeedText"
                v-if="item.link"
                :href="item.link"
                target="_blank"
                :density="true && 'compact'"
              >
                <v-row dense>
                  <v-col cols="11">{{ item.truncatedText ? item.truncatedText : item.text }}&nbsp;</v-col>
                  <v-col cols="1">
                    <v-icon height="12" width="12" color="blue">open-in-new</v-icon>
                  </v-col>
                </v-row>
              </v-list-item>
              <!-- Event does not have a link -->
              <div class="px-4 activityFeedText" v-else>
                {{ item.truncatedText ? item.truncatedText : item.text }}
              </div>
            </div>
          </v-timeline-item>
        </v-timeline>
      </div>
    </v-card>
    <v-dialog v-model="toggleAnniversariesModal" max-width="700">
      <AnniversariesModal :item="item" />
    </v-dialog>
  </div>
</template>

<script>
import _ from 'lodash';
import AnniversariesModal from './AnniversariesModal.vue';

// |--------------------------------------------------|
// |                                                  |
// |               LIFECYCLE HOOKS                    |
// |                                                  |
// |--------------------------------------------------|

/**
 * created lifecycle hook
 */
function created() {
  this.emitter.on('close-anniversaries-modal', () => {
    this.toggleAnniversariesModal = false;
  });

  this.filterEvents();
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     COMPUTED                     |
// |                                                  |
// |--------------------------------------------------|

/**
 * itemHeight - determines the height of each item in the activity feed.
 *
 * @return int - height for activity feed item
 */
function itemHeight() {
  switch (this.$vuetify.display.name) {
    case 'xs':
      return 115;
    case 'sm':
      return 115;
    case 'md':
      return 100;
    case 'lg':
      return 100;
    case 'xl':
      return 100;
  }
} // itemHeight

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Used to remove events that the user has filtered out,
 * then the remaining events will be displayed in the
 * activity feed.
 *
 * @return array - filtered events array
 */
function filterEvents() {
  this.events.forEach((event) => {
    if (!this.filters.some((f) => f.type === event.type)) {
      this.filters.push(event);
      this.activeFilters.push(event);
    }
  });
  var filteredEvents = _.filter(this.events, (event) => this.activeFilters.some((f) => f.type === event.type));
  return filteredEvents;
} // filterEvents

/**
 * Gets the URL to basecamp for an activity feed event.
 *
 * @param item - activity feed event
 * @return String - basecamp url
 */
function getURL(item) {
  if (!_.isNil(item.newCampfire)) {
    return item.newCampfire;
  } else if (!_.isNil(item.congratulateCampfire)) {
    return item.congratulateCampfire;
  } else if (!_.isNil(item.birthdayCampfire)) {
    return item.birthdayCampfire;
  } else if (!_.isNil(item.campfire)) {
    return item.campfire;
  } else if (!_.isNil(item.eventScheduled)) {
    return item.eventScheduled;
  }
} // getURL

/**
 * Opens the modal for employees with anniversaries in a certain month.
 *
 * @param item Object - The month's anniversariese
 */
function openAnniversariesModal(item) {
  this.toggleAnniversariesModal = true;
  item.events.sort((a, b) => new Date(a.anniversary) - new Date(b.anniversary));
  this.item = item;
} // openAnniversariesModal

/**
 * Removes an item from the activity feed's active filters
 *
 * @param item - The filter to remove
 */
function remove(item) {
  const index = this.activeFilters.findIndex((f) => f.type === item.type);
  if (index >= 0) {
    this.activeFilters.splice(index, 1);
  }
} // remove

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    AnniversariesModal
  },
  data() {
    return {
      dense: false,
      filters: [],
      item: null,
      activeFilters: [],
      searchString: '',
      toggleAnniversariesModal: false
    };
  },
  computed: {
    itemHeight
  },
  methods: {
    filterEvents,
    getURL,
    openAnniversariesModal,
    remove
  },
  created,
  props: ['events', 'loading']
};
</script>

<style lang="scss" scoped>
.activityFeedText {
  font-weight: normal;
}

.timeline {
  height: 600px;
  max-height: 600px;
  overflow-y: scroll;
}

.v-tooltip__content.menuable__content__active {
  opacity: 1 !important;
}
</style>
