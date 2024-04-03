<template>
  <div>{{ item[field.key] }}</div>
</template>

<script>
export default {
  props: ['field', 'item']
};
</script>
