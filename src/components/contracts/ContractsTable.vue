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
          :items="contracts"
        >
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
          <template v-slot:[`item.actions`]="{}">
            <!-- Add Project -->
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn icon text v-on="on">
                  <v-icon class="case-gray">mdi-file-document-plus</v-icon>
                </v-btn>
              </template>
              <span>Add Project</span>
            </v-tooltip>

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
    </v-card>
  </div>
</template>
<script>
import _ from 'lodash';
import api from '../../shared/api';
// |--------------------------------------------------|
// |                                                  |
// |                 LIFECYCLE HOOKS                  |
// |                                                  |
// |--------------------------------------------------|

async function created() {
  this.loading = true;
  this.contracts = await api.getItems(api.CONTRACTS);
  this.loading = false;
}

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

export default {
  created,
  methods: {
    clickedRow
  },
  data() {
    return {
      loading: false,
      contracts: [],
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
