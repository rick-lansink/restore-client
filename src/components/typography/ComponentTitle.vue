<template>
  <h2 :class="{inverse: inverse, small: small}">
    <slot />
  </h2>
</template>

<script>
export default {
  name: "ComponentTitle",
  props: {
    inverse: {
      type: Boolean,
      default: false
    },
    small: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styling/typography";
h2 {
  @include secondary-heading;
  &.inverse {
    color: $inverse-text-color;
  }
}
</style>