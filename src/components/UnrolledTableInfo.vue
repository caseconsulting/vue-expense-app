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
    <tr v-if="!props.item.reimbursedDate" :active="props.item.selected" @click="props.selected = !props.selected">
      <td>
        <v-checkbox
          @click="$emit('expensePicked',props.item)"
          v-model="props.item.selected"
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
import _ from 'lodash';

export default {
  props: ['expenses', 'allSelected'],
  components: {
    UnrolledTableInfo
  },
  data: () => ({
    pagination: {
      sortBy: 'cost'
    },
    headers: [
      { text: 'Cost', value: 'cost' },
      { text: 'Purchase Date', value: 'purchaseDate' },
      { text: 'Description', value: 'description' }
    ],
    selected: [],

  }),
  beforeUpdate() {
    this.checkAllSelected();
  },
  created() {
    if (this.allSelected) {
      this.selected = this.expenses;
    }
  },
  methods: {
    theyPickedMe(item) {
      this.$emit('expensePicked', item);
    },
    checkAllSelected() {
      let calc = 0
      let nonSelected = _.filter(this.expenses, (expense) => {
        if (expense.selected === false) {
          return true;
        } else {
          return false;
        }
      });
      if (nonSelected.length > 0) {
        this.$emit('changedAllSelected', false);
      } else {
        this.$emit('changedAllSelected', true);
      }

    },
    changeSort(column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending;
      } else {
        this.pagination.sortBy = column;
        this.pagination.descending = false;
      }
    }
  },

};
</script>
