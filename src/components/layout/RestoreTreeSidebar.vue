<template>
  <div class="restore__sidebar">
    <b-container class="restore__sidebar__container" fluid>
      <slot />
    </b-container>
  </div>
</template>

<script>
export default {
name: "RestoreTreeSidebar"
}
</script>

<style lang="scss">
@import "@/assets/styling/colors.scss";
@import "@/assets/styling/layout.scss";

.restore {
  &__sidebar {
    background-color: $primary-color;
    flex: 1;
    padding: 10px 0;
    height: 100%;
    overflow: hidden;
    &__container {
      height: 100%;
      > div {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
      }
    }
  }
}
</style>