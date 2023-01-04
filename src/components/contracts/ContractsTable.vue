<template>
  <div>
    <v-card class="mt-3">
      <v-container fluid>
        <!-- START CONTRACTS DATA TABLE -->
        <v-data-table @click:row="clickedRow" :expanded.sync="expanded" :headers="contractHeaders" :items="data">
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
  methods: {
    clickedRow
  },
  data() {
    return {
      expanded: [],
      data: [
        {
          id: 1,
          contractName: 'AI',
          costType: 'costTypeTest',
          popEndDate: '07/07/2022',
          popStartDate: '07/08/2019',
          primeName: 'Case Consulting',
          projects: [
            {
              name: 'Bippy'
            }
          ]
        },
        {
          id: 2,
          contractName: 'Gemini',
          costType: 'costTypeTest',
          popEndDate: '04/07/2022',
          popStartDate: '04/08/2019',
          primeName: 'Lockheed Martin',
          projects: [
            {
              name: 'GMN-2122'
            },
            { name: 'GMN-2123' }
          ]
        },
        {
          id: 3,
          contractName: 'Delphi',
          costType: 'costTypeTest',
          popEndDate: '07/07/2022',
          popStartDate: '07/08/2019',
          primeName: 'Case Consulting',
          projects: [{ name: 'Pythia' }, { name: 'Delphi' }]
        },
        {
          id: 4,
          contractName: 'Hawkeye',
          costType: 'costTypeTest',
          popEndDate: '02/07/2022',
          popStartDate: '02/05/2019',
          primeName: 'Lockheed Martin',
          projects: [
            {
              name: 'HWK-2344'
            },
            {
              name: 'HWK-2345'
            }
          ]
        }
      ],
      projectHeaders: [
        {
          text: 'Project',
          value: 'name',
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
