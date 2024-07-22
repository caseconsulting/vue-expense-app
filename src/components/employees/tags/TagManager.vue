<template>
  <!-- Modal Card -->
  <v-card>
    <!-- Modal Title -->
    <v-card-title class="d-flex align-center text-h5 header_style">Tag Manager</v-card-title>
    <!-- Modal Content -->
    <v-card-text class="pa-1 pa-md-4 mt-4">
      <tags-table></tags-table>
    </v-card-text>
    <!-- Action Button -->
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        color="grey-darken-3"
        variant="text"
        @click="
          emit(`close-tag-manager`);
          activate = false;
        "
      >
        Close
      </v-btn>
    </v-card-actions>
  </v-card>
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
    this.emitter.emit(msg, data);
  } else {
    // data does not exist
    this.emitter.emit(msg);
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
      creatingTag: false,
      status: {
        statusType: undefined,
        statusMessage: '',
        color: ''
      }
    };
  },
  methods: {
    emit
  }
};
</script>
