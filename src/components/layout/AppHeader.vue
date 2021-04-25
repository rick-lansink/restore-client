<template>
  <div class="app-header">
    <h1>restore</h1>
    <b-avatar variant="primary" :text="userAvatarText"></b-avatar>
  </div>
</template>

<script>
export default {
  name: "AppHeader",
  computed: {
    userAvatarText() {
      return this.$auth.user.given_name.charAt(0) + this.$auth.user.family_name.charAt(0);
    }
  }
}
</script>

<style lang="scss">
  .app-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    h1 {
      display: inline-block;
      font-weight: 800;
      font-size: 28px;
    }
  }
</style>