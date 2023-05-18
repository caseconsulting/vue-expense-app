<template>
  <div>
    <v-card>
      <v-card-title class="headline header_style">Tag Manager</v-card-title>
      <v-card-text class="mt-4">
        <tags-table></tags-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey darken-3"
          text
          @click.native="
            emit(`close-tag-manager`);
            activate = false;
          "
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import TagsTable from '@/components/employees/tags/TagsTable.vue';

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Emits a message and data if it exists.
 *
 * @param msg - Message to emit
 * @param data - Data to emit
 */
function emit(msg, data) {
  if (data) {
    // data exists
    window.EventBus.$emit(msg, data);
  } else {
    // data does not exist
    window.EventBus.$emit(msg);
  }
} // emit

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  components: {
    TagsTable
  },
  data() {
    return {
      activate: false, // dialog activator
      creatingTag: false
    };
  },
  methods: {
    emit
  }
};
</script>
