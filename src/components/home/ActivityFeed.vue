<template>
  <div>
    <v-card class="overflow-y-hidden">
      <!-- Title -->
      <v-card-title class="header_style">
        <h3>Activity Feed</h3>
      </v-card-title>
      <v-spacer></v-spacer>
      <div v-if="loading" class="pa-8 pt-6">
        <v-progress-linear :indeterminate="true"></v-progress-linear>
      </div>
      <div v-else>
        <!-- Autocomplete filters -->
        <v-card-text class="pb-0">
          <!-- Loading Bar -->
          <v-autocomplete
            :items="filters"
            multiple
            v-model="activeFilters"
            chips
            deletable-chips
            clearable
            filled
            return-object
            :search-input.sync="searchString"
            @change="searchString = ''"
            class="elevate"
            append-icon=""
          >
            <template v-slot:selection="data">
              <v-chip
                v-bind="data.attrs"
                :input-value="data.selected"
                close
                @click="data.select"
                @click:close="remove(data.item)"
                small
              >
                <v-avatar :color="data.item.color" left>
                  <v-icon small color="white"> {{ data.item.icon }}</v-icon>
                </v-avatar>
                {{ data.item.type }}
              </v-chip>
            </template>
            <template v-slot:item="data">
              <v-list-item-avatar :color="data.item.color">
                <v-icon color="white"> {{ data.item.icon }}</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{ data.item.type }}</v-list-item-title>
              </v-list-item-content>
            </template>
          </v-autocomplete>
        </v-card-text>
        <v-timeline dense class="pt-0">
          <!-- Timeline -->
          <v-virtual-scroll :items="filterEvents()" :item-height="itemHeight" height="700" bench="2">
            <template v-slot="{ item }">
              <v-tooltip
                open-on-hover
                top
                max-width="400px"
                min-width="200px"
                :color="item.truncatedText ? 'grey darken-3' : 'rgba(0, 0, 0, 0)'"
                open-delay="200"
              >
                <template v-slot:activator="{ on, attrs }">
                  <span v-bind="attrs" v-on="on">
                    <v-timeline-item :color="item.color" :key="item.name">
                      <!-- Icon -->
                      <template v-slot:icon v-if="item.icon">
                        <v-tooltip
                          bottom
                          v-if="
                            item.newCampfire ||
                            item.congratulateCampfire ||
                            item.birthdayCampfire ||
                            item.campfire ||
                            item.eventScheduled
                          "
                        >
                          <template v-slot:activator="{ on }">
                            <v-btn v-on="on" text icon :href="getURL(item)" target="blank">
                              <v-icon class="white--text">{{ item.icon }}</v-icon>
                            </v-btn>
                          </template>
                          <!-- Icon Hover Text -->
                          <span v-if="item.newCampfire">Welcome to team</span>
                          <span v-else-if="item.congratulateCampfire">Congratulate</span>
                          <span v-else-if="item.birthdayCampfire">Say happy birthday</span>
                          <span v-else-if="item.campfire">Comment in campfire</span>
                          <span v-else-if="item.eventScheduled">See event</span>
                        </v-tooltip>

                        <v-icon class="white--text" v-else>{{ item.icon }}</v-icon>
                      </template>
                      <!-- End Icon -->

                      <!-- Item Title: Date -->
                      <h3>{{ item.date }}</h3>

                      <div v-if="item.type === 'Anniversary'" class="px-4">
                        <v-btn @click="openAnniversariesModal(item)" color="#bc3825" class="white--text" small
                          >View {{ item.events.length }}
                          {{ item.events.length > 1 ? 'Anniversaries' : 'Anniversary' }}</v-btn
                        >
                      </div>

                      <div v-else>
                        <!-- Event has a link -->
                        <v-list-item
                          class="ma-auto pa-auto activityFeedText"
                          v-if="item.link"
                          :href="item.link"
                          target="_blank"
                          :dense="true"
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
                  </span>
                </template>
                <!-- Expanded Event Description -->
                <span v-if="item.truncatedText" class="activityFeedText">{{ item.text }}</span>
              </v-tooltip>
            </template>
          </v-virtual-scroll>
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
  window.EventBus.$on('close-anniversaries-modal', () => {
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
  switch (this.$vuetify.breakpoint.name) {
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

.v-tooltip__content.menuable__content__active {
  opacity: 1 !important;
}

.v-timeline::before {
  top: -29px;
  height: calc(100% - -25px);
}
</style>
