<template>
  <div>{{ item.city ? `${item.city}, ` : '' }} {{ item.st ? `${item.st}, ` : '' }} {{ item.country }}</div>
</template>

<script>
export default {
  props: ['field', 'item']
};
</script>
