<template>
  <p :class="{inverse: inverse, small: small}">
    <slot />
  </p>
</template>

<script>
export default {
  name: "ComponentText",
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
p {
  @include base-text;
  &.inverse {
    color: $inverse-text-color;
  }
}
</style>