<template>
  <div class="restore__container">
    <slot/>
  </div>
</template>

<script>
export default {
name: "RestoreContainer"
}
</script>

<style lang="scss">
@import "@/assets/styling/colors.scss";
@import "@/assets/styling/layout.scss";
.restore {
  &__container {
    width: 100vw;
    height: 90vh;
    display: grid;
    grid-template-columns: 50% 50%;
    grid-template-rows: min-content auto;
    &__header {
      grid-column: 1 / span 2;
    }
  }
}
</style>