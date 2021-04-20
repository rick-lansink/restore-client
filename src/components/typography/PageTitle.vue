<template>
  <h1 :class="{inverse: inverse}">
    <slot />
  </h1>
</template>

<script>
export default {
  name: "PageTitle",
  props: {
    inverse: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/assets/styling/typography";
h1 {
  @include primary-heading;
  &.inverse {
    color: $inverse-text-color;
  }
}
</style>