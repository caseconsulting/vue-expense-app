<template>
  <div v-if="item">
    <v-card>
      <v-card-title class="header_style">
        <span class="text-h5">{{ item.date }}</span>
      </v-card-title>
      <v-card-text>
        <v-list-group>
          <v-list-item
            v-for="event in item.events"
            :key="event.text"
            :ripple="false"
            inactive
            :lines="isMobile ? 'three' : 'one'"
          >
            <template v-slot:prepend>
              <v-btn :color="item.color" :icon="item.icon"></v-btn>
            </template>
            <v-list-item-title>{{ event.date }}</v-list-item-title>
            <v-list-item-subtitle>{{ event.text }}</v-list-item-subtitle>
          </v-list-item>
        </v-list-group>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="gray darken-1" variant="text" @click="emit('close-anniversaries-modal')"> Close </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import { format } from '@/shared/dateUtils';
import { isMobile } from '../../utils/utils';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits a message.
 *
 * @param msg - Message to emit
 */
function emit(msg) {
  this.emitter.emit(msg);
} // emit

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  computed: {
    isMobile
  },
  methods: {
    emit,
    format
  },
  props: [
    'item' // the passed event item
  ]
};
</script>
