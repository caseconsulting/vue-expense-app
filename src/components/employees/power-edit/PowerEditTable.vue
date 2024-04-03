<template>
  <v-data-table
    :items="employees"
    :headers="fields"
    :search="search"
    fixed-header
    fixed-footer
    height="80vh"
    width="100%"
    items-per-page="-1"
    class="sticky-columns mt-1"
  >
    <template v-for="field in fields" v-slot:[`item.${field.key}`]="{ item }">
      <power-edit-table-item
        :key="field"
        @click="editItem = { item, field }"
        class="d-flex align-center w-100 h-100 pointer"
        :editing="editItem?.item.id === item.id && editItem?.field.key === field.key"
        :field="field"
        :item="item"
      ></power-edit-table-item>
    </template>
  </v-data-table>
</template>

<script>
import PowerEditTableItem from '@/components/employees/power-edit/PowerEditTableItem.vue';

function employees() {
  return this.$store.getters.employees;
}

function watchEmployees() {
  this.editItem = null;
}

export default {
  components: { PowerEditTableItem },
  computed: {
    employees
  },
  data() {
    return {
      editItem: null
    };
  },
  props: ['fields', 'search'],
  watch: {
    employees: {
      handler: watchEmployees,
      deep: true
    }
  }
};
</script>

<style>
.sticky-columns tbody > tr > td:nth-child(1),
.sticky-columns thead > tr > th:nth-child(1) {
  position: sticky !important;
  position: -webkit-sticky !important;
  left: 0;
  top: 0;
  z-index: 9998;
  background-color: white;
}
.sticky-columns thead > tr > th:nth-child(1) {
  z-index: 9999;
}
</style>
