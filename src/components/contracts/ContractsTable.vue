<template>
  <div>
    <v-card class="mt-3">
      <v-container fluid>
        <!-- START CONTRACTS DATA TABLE -->
        <v-data-table
          @click:row="clickedRow"
          :loading="loading"
          :expanded.sync="expanded"
          :headers="contractHeaders"
          :items="$store.getters.contracts"
        >
          <template v-slot:[`item.contractName`]="{ item }">
            <v-text-field v-if="editingItemID == item.id" v-model="item.contractName"></v-text-field>
            <span v-else>{{ item.contractName }}</span>
          </template>

          <template v-slot:[`item.primeName`]="{ item }">
            <v-text-field v-if="editingItemID == item.id" v-model="item.primeName"></v-text-field>
            <span v-else>{{ item.primeName }}</span>
          </template>

          <template v-slot:[`item.costType`]="{ item }">
            <v-text-field v-if="editingItemID == item.id" v-model="item.costType"></v-text-field>
            <span v-else>{{ item.costType }}</span>
          </template>

          <template v-slot:[`item.popStartDate`]="{ item }">
            <v-text-field v-if="editingItemID == item.id" v-model="item.popStartDate"></v-text-field>
            <span v-else>{{ item.popStartDate }}</span>
          </template>

          <template v-slot:[`item.popEndDate`]="{ item }"
            ><v-text-field v-if="editingItemID == item.id" v-model="item.popEndDate"></v-text-field>
            <span v-else>{{ item.popEndDate }}</span>
          </template>

          <!-- Expanded Row Slot -->
          <template v-slot:expanded-item="{ item }"
            ><td :colspan="contractHeaders.length" class="pa-0">
              <v-container fluid class="grey-background">
                <!-- START EXPANDED PROJECTS DATA TABLE-->
                <v-data-table :headers="projectHeaders" :items="item.projects" hide-default-footer>
                  <template v-slot:[`item.actions`]="{}">
                    <!-- Edit Contract -->
                    <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <v-btn icon text v-on="on">
                          <v-icon class="case-gray">edit</v-icon>
                        </v-btn>
                      </template>
                      <span>Edit</span>
                    </v-tooltip>

                    <!-- Delete Contract -->
                    <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <v-btn icon text v-on="on">
                          <v-icon class="case-gray">delete</v-icon>
                        </v-btn>
                      </template>
                      <span>Delete</span>
                    </v-tooltip>
                  </template>
                </v-data-table>
              </v-container>
            </td>
          </template>
          <!-- Actions Slot -->
          <template v-slot:[`item.actions`]="{ item }">
            <div v-if="editingItemID != item.id">
              <!-- Add Project -->
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn :disabled="editingItemID != null" icon text v-on="on">
                    <v-icon class="case-gray">mdi-file-document-plus</v-icon>
                  </v-btn>
                </template>
                <span>Add Project</span>
              </v-tooltip>

              <!-- Edit Contract -->
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn
                    icon
                    text
                    :disabled="editingItemID != null"
                    v-on="on"
                    @click="
                      () => {
                        editingItemID = item.id;
                      }
                    "
                  >
                    <v-icon class="case-gray">edit</v-icon>
                  </v-btn>
                </template>
                <span>Edit</span>
              </v-tooltip>

              <!-- Delete Contract -->
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn :disabled="editingItemID != null" icon text v-on="on">
                    <v-icon class="case-gray">delete</v-icon>
                  </v-btn>
                </template>
                <span>Delete</span>
              </v-tooltip>
            </div>

            <!-- IS EDITING ROW -->
            <div v-else>
              <!-- Save Contract -->
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn icon text v-on="on">
                    <v-icon class="case-gray">save</v-icon>
                  </v-btn>
                </template>
                <span>Save</span>
              </v-tooltip>

              <!-- Cancel Contract -->
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn
                    icon
                    text
                    @click="
                      () => {
                        editingItemID = null;
                      }
                    "
                    v-on="on"
                  >
                    <v-icon class="case-gray">cancel</v-icon>
                  </v-btn>
                </template>
                <span>Cancel</span>
              </v-tooltip>
            </div>
          </template>
        </v-data-table>
      </v-container>
    </v-card>
  </div>
</template>
<script>
import _ from 'lodash';
import { updateStoreContracts } from '@/utils/storeUtils';

// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

/**
 * created life cycle hook
 */
async function created() {
  this.loading = true;
  this.loading = false;
} // created

// |--------------------------------------------------|
// |                                                  |
// |                     METHODS                      |
// |                                                  |
// |--------------------------------------------------|

function clickedRow(contractObj) {
  if (_.isEmpty(this.expanded) || this.expanded[0].id != contractObj.id) {
    this.expanded = [];
    this.expanded.push(contractObj);
  } else {
    this.expanded = [];
  }
}

// |--------------------------------------------------|
// |                                                  |
// |                      EXPORT                      |
// |                                                  |
// |--------------------------------------------------|

export default {
  beforeDestroy,
  watch: {
    editingItemID: function (val) {
      console.log(val);
    }
  },
  created,
  methods: {
    clickedRow,
    updateStoreContracts
  },
  data() {
    return {
      editingItemID: null,
      loading: false,
      expanded: [],
      projectHeaders: [
        {
          text: 'Project',
          value: 'projectName',
          align: 'center'
        },
        {
          value: 'actions',
          sortable: false
        }
      ],
      contractHeaders: [
        {
          text: 'Contract',
          value: 'contractName',
          align: 'center'
        },
        {
          text: 'Prime',
          value: 'primeName',
          align: 'center'
        },
        {
          text: 'Cost Type',
          value: 'costType',
          align: 'center'
        },
        {
          text: 'PoP-Start Date',
          value: 'popStartDate',
          align: 'center'
        },
        {
          text: 'PoP-End Date',
          value: 'popEndDate',
          align: 'center'
        },
        {
          value: 'actions',
          sortable: false
        }
      ]
    };
  }
};
</script>
