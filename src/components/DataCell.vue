<template>
    <td class="text-xs-right">{{ name }}</td>
</template>

<script>
import api from '@/shared/api.js';
export default {
  data() {
    return {
      name: 'Loading...'
    };
  },
  props: ['APIType', 'id'],
  async created() {
    console.log(this.APIType);
    console.log(this.id);
    let objectName = await api.getItem(this.APIType, this.id);
    if (this.APIType === api.EMPLOYEES) {
      this.name = await `${objectName.firstName} ${objectName.middleName} ${
        objectName.lastName
      }`;
    } else {
      this.name = await objectName.budgetName;
    }
  }
};
</script>
