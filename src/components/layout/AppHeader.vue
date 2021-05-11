<template>
  <div class="app-header">
    <h1>restore</h1>
    <div>
      <b-avatar variant="primary" :text="userAvatarText"></b-avatar>
      <b-dropdown right variant="link">
        <b-dropdown-item
            @click="$store.dispatch('auth/logout')"
        >Logout</b-dropdown-item>
      </b-dropdown>
    </div>

  </div>
</template>

<script>
export default {
  name: "AppHeader",
  computed: {
    userAvatarText() {
      if (this.$auth.user.give_name && this.$auth.user.family_name) {
        return this.$auth.user.given_name.charAt(0) + this.$auth.user.family_name.charAt(0);
      } else {
        return 'RS'
      }
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
    margin-top: -20px;
    width: 102%;
    margin-left: -1%;
    h1 {
      display: inline-block;
      font-weight: 800;
      font-size: 28px;
    }
  }
</style>