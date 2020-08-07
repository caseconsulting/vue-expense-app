<template>
  <div>
    <!-- title -->
    <v-card class="white--text" color="#bc3825">
      <v-card-title class="header_style">
        <h3>Activity Feed</h3>
      </v-card-title>
    </v-card>
    <!-- loading bar -->
    <v-card class="overflow-y-auto" max-height="850px">
      <div v-if="this.loading" class="py-4">
        <v-progress-linear :indeterminate="true"></v-progress-linear>
      </div>
      <!-- timeline -->
      <v-timeline v-else dense class="pt-0">
        <v-virtual-scroll :items="events" :item-height="this.itemHeight" height="850" bench="2">
          <template v-slot="{ item }">
            <div class="pa-4"></div>
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
                    <template v-slot:icon v-if="item.icon">
                      <icon class="white--text" :name="item.icon"></icon>
                    </template>
                    <h3>{{ item.date }}</h3>
                    <v-list-item
                      class="ma-auto pa-auto activityFeedText"
                      v-if="item.link"
                      :href="item.link"
                      target="_blank"
                      :dense="true"
                    >
                      <v-row class="ma-1" dense>
                        <v-col cols="11">{{ item.truncatedText ? item.truncatedText : item.text }}&nbsp;</v-col>
                        <v-col cols="1">
                          <icon height="12" width="12" name="external-link-alt" color="blue"></icon>
                        </v-col>
                      </v-row>
                    </v-list-item>
                    <div class="px-4 activityFeedText" v-else>
                      {{ item.truncatedText ? item.truncatedText : item.text }}
                    </div>
                  </v-timeline-item>
                </span>
              </template>
              <span v-if="item.truncatedText">{{ item.text }}</span>
            </v-tooltip>
          </template>
        </v-virtual-scroll>
      </v-timeline>
    </v-card>
  </div>
</template>

<script>
/**
 * itemHeight - determines the height of each item in the activity feed.
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
export default {
  data() {
    return {
      dense: false
    };
  },
  computed: {
    itemHeight
  },
  props: ['events', 'loading']
};
</script>
<style lang="scss">
.activityFeedText {
  font-weight: normal;
}

.v-tooltip__content.menuable__content__active {
  opacity: 1 !important;
}
</style>
