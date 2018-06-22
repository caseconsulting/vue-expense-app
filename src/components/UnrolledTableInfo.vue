<template>
<v-container fluid style="background:grey">
  <v-data-table hide-actions v-model="selected" :headers="headers" :items="expenses" select-all item-key="id">
    <template slot="headers" slot-scope="props">
    <tr>
      <th>
        <v-flex md2 class="text-xs-center">
          select
        </v-flex>
      </th>
      <th
        v-for="header in props.headers"
        :key="header.text"
        :class="['column sortable']"
        @click="changeSort(header.value)"
      >
        <v-icon small>arrow_upward</v-icon>
        {{ header.text }}
      </th>
    </tr>
  </template>
    <template slot="items" slot-scope="props">
    <tr v-if="!props.item.reimbursedDate" :active="props.selected" @click="props.selected = !props.selected">
      <td>
        <v-checkbox
          :input-value="props.selected"
          primary
          hide-details
        ></v-checkbox>
      </td>

      <td class="text-xs-center">{{ props.item.cost }}</td>
      <td class="text-xs-center">{{ props.item.purchaseDate }}</td>
      <td class="text-xs-center">{{ props.item.description }}</td>
    </tr>
  </template>
  </v-data-table>
</v-container>
</template>

<script>
import UnrolledTableInfo from './UnrolledTableInfo.vue';

export default {
  props: ['expenses'],
  components: {
    UnrolledTableInfo
  },
  data: () => ({
    pagination: {
      sortBy: 'cost'
    },
    selected: [],
    headers: [
      { text: 'Cost', value: 'cost' },
      { text: 'Purchase Date', value: 'purchaseDate' },
      { text: 'Description', value: 'description' }
    ]
  }),
  created() {

  },

  methods: {
    toggleAll() {
      if (this.selected.length) this.selected = [];
      else this.selected = this.filteredItems;
    },
    changeSort(column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending;
      } else {
        this.pagination.sortBy = column;
        this.pagination.descending = false;
      }
    }
  }
};
</script>
