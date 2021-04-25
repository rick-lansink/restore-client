<template>
  <b-container fluid class="restore__main--top">
    <slot/>
  </b-container>
</template>

<script>
export default {
name: "RestoreTopMain"
}
</script>

<style lang="scss">
.restore {
  &__main {
    &--top {
      justify-content: center;
      flex: 1;
      display: flex;
      flex-direction: column;
      > div {
        height: 100%;
        overflow: hidden;
      }
    }
  }
}
</style>