<template>
  <div class="restore__main">
    <slot />
  </div>
</template>

<script>
export default {
name: "RestoreMainView"
}
</script>

<style lang="scss">
.restore {
  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    > * {
      height: 50%;
      overflow: hidden;
    }
  }
}
</style>