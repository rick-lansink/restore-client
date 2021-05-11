<template>
  <div class="home">
    <!-- Check that the SDK client is not currently loading before accessing is methods -->
    <b-container>
      <b-row>
        <b-col
          class="home-card"
          cols="4"
          offset="4"
        >
          <b-card>
            <b-card-title style="margin-bottom: 30px;">
              <h1>restore</h1>
            </b-card-title>
            <div v-if="!$auth.loading">
              <!-- show login when not authenticated -->
              <b-btn
                  v-if="!$auth.isAuthenticated"
                  @click="login"
                  variant="outline-dark"
              >Log in</b-btn>
              <!-- show logout when authenticated -->
              <b-btn
                  v-if="$auth.isAuthenticated"
                  @click="logout"
                  variant="outline-dark"
              >Log out</b-btn>
            </div>
          </b-card>
        </b-col>
      </b-row>
    </b-container>

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

<style lang="scss" scoped>
.home {
  position: absolute;
  top: 0;
  right: 0;
  width: 100vw;
  height: 100vh;
  background-image: url('~@/assets/home-background.jpg');
  background-size: cover;
  background-position: center center;
  &-card {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    display: flex;
    justify-content: center;
    flex-direction: column;
    h1 {
      font-weight: 800;
      font-size: 28px;
    }
  }
}
</style>