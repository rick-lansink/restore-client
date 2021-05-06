<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <!-- Check that the SDK client is not currently loading before accessing is methods -->
    <div v-if="!$auth.loading">
      <!-- show login when not authenticated -->
      <button v-if="!$auth.isAuthenticated" @click="login">Log in</button>
      <!-- show logout when authenticated -->
      <button v-if="$auth.isAuthenticated" @click="logout">Log out</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home",
  methods: {
    login() {
      this.$store.dispatch('auth/login')
    },
    logout() {
      this.$store.dispatch('auth/logout')
    }
  },
  watch: {
    '$auth.isAuthenticated': function(authenticated) {
      if (authenticated) {
        this.$router.push('/projects')
      }
    }
  }
}
</script>

<style scoped>

</style>