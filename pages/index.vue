<template>
  <div class="container">
    <div>
      <Logo />
      <h1 class="title">
        Welcome to nomadui
      </h1>

      <div class="links">
        <span v-if="loggedIn">
          You are logged in!
          <br>
          <nuxt-link :to="`/users/${userName}`">View Profile</nuxt-link>
          |
          <nuxt-link to="/editor">Edit Profile</nuxt-link>
        </span>
        <span v-else>
          <nuxt-link to="/auth/login">
            Login
          </nuxt-link> |
          <nuxt-link to="/auth/register">
            Register
          </nuxt-link>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState('auth', ['loggedIn']),
    userName () {
      return this.$store.state.user.username
    }
  },
  auth: false
}
</script>

<style>
/* Sample `apply` at-rules with Tailwind CSS
.container {
@apply min-h-screen flex justify-center items-center text-center mx-auto;
}
*/
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family:
    'Quicksand',
    'Source Sans Pro',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
