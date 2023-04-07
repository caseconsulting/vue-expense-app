<template>
  <v-row>
    <v-col>
      <v-card class="mt-3">
        <v-container fluid>
          <!-- Title -->
          <v-card-title v-if="!isMobile()">
            <h3 v-if="userRoleIsAdmin() && !loading">All PTO Cash Outs</h3>
            <h3 v-else-if="!loading">My PTO Cash Outs</h3>
            <h3 v-else>Loading...</h3>
            <v-spacer></v-spacer>

            <!-- Filter -->
            <v-autocomplete
              v-if="userRoleIsAdmin()"
              hide-details
              :items="employees"
              :filter="customFilter"
              v-model="employee"
              item-text="text"
              id="employeeIdFilter"
              class="mr-3"
              label="Filter by Employee"
              clearable
            ></v-autocomplete>
          </v-card-title>
          <div v-else>
            <v-card-title class="px-0">
              <h3 v-if="userRoleIsAdmin() && !loading">All Expenses</h3>
              <h3 v-else-if="!loading">My Expenses</h3>
              <h3 v-else>Loading...</h3>
            </v-card-title>
            <v-row class="mb-5">
              <v-col v-if="userRoleIsAdmin()">
                <!-- Employee Filter -->
                <v-autocomplete
                  hide-details
                  :items="employees"
                  :filter="customFilter"
                  v-model="employee"
                  item-text="text"
                  id="employeeIdFilter"
                  label="Filter by Employee"
                  clearable
                ></v-autocomplete>
              </v-col>
              <v-col>
                <!-- Search Bar -->
                <v-text-field
                  v-model="search"
                  append-icon="search"
                  id="search"
                  label="Search"
                  single-line
                  hide-details
                ></v-text-field>
              </v-col>
            </v-row>
          </div>

          <!-- Filters -->
          <fieldset class="filter_border">
            <legend class="legend_style">Filters</legend>

            <!-- Approved Filter -->
            <div class="flagFilter">
              <h4>Approved:</h4>
              <v-btn-toggle class="filter_color" v-model="filter.reimbursed" text mandatory>
                <!-- Show Reimbursed -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="approved" v-on="on" text>
                      <v-icon id="showApproved" class="mr-1">mdi-check-circle-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>Show Approved</span>
                </v-tooltip>

                <!-- Show Pending -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn value="notApproved" v-on="on" text>
                      <v-icon id="showPending">mdi-close-circle-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>Show Pending</span>
                </v-tooltip>

                <!-- Show Reimbursed and Pending -->
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn id="bothApproved" value="both" v-on="on" text> BOTH </v-btn>
                  </template>
                  <span>Show All</span>
                </v-tooltip>
              </v-btn-toggle>
            </div>
            <!-- End Reimbursed Filter -->
            <div class="flagFilter"></div>
          </fieldset>
          <br />
          <!-- End Filters -->
          <!-- PTO Cash Outs Data Table -->
          <v-data-table :headers="headers" :items="ptoCashOuts" class="elevation-4">
            <!-- Creation Date slot -->
            <template v-slot:[`item.creationDate`]="{ item }">
              {{ monthDayYearFormat(item.approvedDate) }}
            </template>
            <!-- Amount slot-->
            <template v-slot:[`item.amount`]="{ item }">
              {{ item.amount + (item.amount > 1 ? ' hrs' : 'hr') }}
            </template>

            <!-- Approved Date slot -->
            <template v-slot:[`item.approvedDate`]="{ item }">
              {{ monthDayYearFormat(item.approvedDate) }}
            </template>
          </v-data-table>
        </v-container>
      </v-card>
    </v-col>
  </v-row>
</template>
<script>
import { isMobile, userRoleIsAdmin, monthDayYearFormat, isEmpty } from '@/utils/utils';
import api from '@/shared/api.js';

async function created() {
  this.ptoCashOuts = await api.getEmployeePtoCashOuts(this.$store.getters.user.id);
  this.loading = false;
}

export default {
  created,
  data() {
    return {
      ptoCashOuts: [],
      loading: true,
      filter: {
        approved: this.$route.params.defaultFilterReimbursed || 'notReimbursed' //default only shows cash outs that are not approved
      }, // data table filters
      headers: [
        { text: 'Creation Date', value: 'creationDate' },
        { text: 'Amount', value: 'amount' },
        { text: 'Approved Date', value: 'approvedDate' }
      ]
    };
  },
  methods: {
    isMobile,
    userRoleIsAdmin,
    monthDayYearFormat,
    isEmpty
  }
};
</script>
