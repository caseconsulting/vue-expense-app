<template>
  <!-- Modal Card -->
  <v-card>
    <!-- Status Alert -->
    <v-snackbar
      v-model="status.statusType"
      :color="status.color"
      multi-line
      :timeout="5000"
      location="top right"
      vertical
    >
      <v-card-text color="white">
        <span class="text-h6 font-weight-medium">{{ status.statusMessage }}</span>
      </v-card-text>
      <v-btn color="white" variant="text" @click="clearStatus"> Close </v-btn>
    </v-snackbar>
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
        @click.native="
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

/**
 * beforeUnmount life cycle hook
 */
function beforeUnmount() {
  this.emitter.off('status-alert');
} // beforeUnmount

/**
 * Mounted life cycle hook
 */
function mounted() {
  this.emitter.on('status-alert', (status) => {
    this.status['statusType'] = status.statusType;
    this.status['statusMessage'] = status.statusMessage;
    this.status['color'] = status.color;
  });
} // mounted

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

/**
 * Clear the action status that is displayed in the snackbar.
 */
function clearStatus() {
  this.status['statusType'] = undefined;
  this.status['statusMessage'] = '';
  this.status['color'] = '';
} // clearStatus

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
  beforeUnmount,
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
    clearStatus,
    emit
  },
  mounted
};
</script>
