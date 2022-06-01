<template>
  <div>
    <!-- Title -->
    <v-card class="white--text" color="#bc3825">
      <v-card-title class="header_style">
        <h3>Activity Feed</h3>
      </v-card-title>
    </v-card>
    <v-card class="overflow-y-hidden" max-height="850px">
      <v-card-text class="pb-0">
        <v-autocomplete
          :items="filters"
          multiple
          v-model="activeFilters"
          filled
          chips
          deletable-chips
          clearable
          :search-input.sync="searchString"
          @change="searchString = ''"
        >
        </v-autocomplete>
      </v-card-text>
      <!-- Loading Bar -->
      <div v-if="this.loading" class="py-4">
        <v-progress-linear :indeterminate="true"></v-progress-linear>
      </div>
      <v-timeline v-else dense class="pt-0">
        <!-- Timeline -->
        <v-virtual-scroll :items="filterEvents()" :item-height="this.itemHeight" height="700" bench="2">
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
                            <icon class="white--text" :name="item.icon"></icon>
                          </v-btn>
                        </template>
                        <!-- Icon Hover Text -->
                        <span v-if="item.newCampfire">welcome to team</span>
                        <span v-else-if="item.congratulateCampfire">congratulate</span>
                        <span v-else-if="item.birthdayCampfire">say happy birthday</span>
                        <span v-else-if="item.campfire">comment in campfire</span>
                        <span v-else-if="item.eventScheduled">see event</span>
                      </v-tooltip>

                      <icon class="white--text" :name="item.icon" v-else></icon>
                    </template>
                    <!-- End Icon -->

                    <h3>{{ item.date }}</h3>
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
                          <icon height="12" width="12" name="external-link-alt" color="blue"></icon>
                        </v-col>
                      </v-row>
                    </v-list-item>
                    <!-- Event does not have a link -->
                    <div class="px-4 activityFeedText" v-else>
                      {{ item.truncatedText ? item.truncatedText : item.text }}
                    </div>
                  </v-timeline-item>
                </span>
              </template>
              <!-- Expanded Event Description -->
              <span v-if="item.truncatedText">{{ item.text }}</span>
            </v-tooltip>
          </template>
        </v-virtual-scroll>
      </v-timeline>
    </v-card>
  </div>
</template>

<script>
import _ from 'lodash';

// |--------------------------------------------------|
// |                                                  |
// |               LIFECYCLE HOOKS                    |
// |                                                  |
// |--------------------------------------------------|

/**
 * created lifecycle hook
 */
function created() {
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
      return 200;
    case 'sm':
      return 200;
    case 'md':
      return 100;
    case 'lg':
      return 100;
    case 'xl':
      return 100;
  }
} // itemHeight

/**
 * Used to remove events that the user has filtered out,
 * then the remaining events will be displayed in the
 * activity feed
 *
 * @return array - filtered events array
 */
function filterEvents() {
  this.events.forEach((event) => {
    if (!this.filters.includes(event.type)) {
      this.filters.push(event.type);
      this.activeFilters.push(event.type);
    }
  });
  var filteredEvents = _.filter(this.events, (event) => {
    if (this.activeFilters.includes(event.type)) {
      return true;
    }
  });
  return filteredEvents;
} // filterEvents

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

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

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  data() {
    return {
      dense: false,
      filters: [],
      activeFilters: [],
      searchString: ''
    };
  },
  computed: {
    itemHeight
  },
  methods: {
    getURL,
    filterEvents
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
