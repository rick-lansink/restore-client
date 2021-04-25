<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>


export default {
  name: 'App',
}
</script>

<style lang="scss">
@import "@/assets/styling/typography";
#app {
  @include base-text;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 3vh 2vw;
}
body {
  overflow: hidden;
  width: 100%;
  height: 100%;
  background-color: $background-color !important;
}
.btn-primary {
  background-color: $primary-color !important;
  border-color: $primary-color !important;
}

</style>
