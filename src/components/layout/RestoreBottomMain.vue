<template>
  <div class="restore__main--bottom">
    <slot />
  </div>
</template>

<script>

export default {
name: "RestoreBottomMain"
}
</script>

<style lang="scss">
@import "@/assets/styling/colors.scss";
.restore {
  &__main {
    &--bottom {
      width: 110%;
      margin-left: -10%;
      background-color: $background-color;
      z-index: 10;
    }
  }
}
</style>