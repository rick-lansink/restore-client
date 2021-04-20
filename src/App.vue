<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="scss">
@import "@/assets/styling/typography";
#app {
  @include base-text;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 5vh 2vw;
}
body {
  overflow: hidden;
  width: 100%;
  height: 100%;
  background-color: $background-color !important;
}


</style>
