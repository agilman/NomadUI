<template>
  <div class="wrapper">
    <!-- NAV BAR -->
    <nav class="nav flex flex-wrap items-center justify-between px-4 bg-teal-500">
      <!-- BRANDKING -->
      <div class="flex items-center mr-6 py-3 text-white">
        <nuxt-link to="/" class="font-semibold text-xl tracking-tight">
          NOMADUI
        </nuxt-link>
      </div>
      <!-- AUTH -->
      <span v-if="loggedIn">
        <div class="flex flex-wrap items-center p-2 items-center">
          <div class="text-teal-200 hover:text-white">
            <span> Logged in as [{{ userName }}]</span>
          </div>
          <button id="nav-toggle" class="flex items-center px-3 py-2 border-2 rounded border-black hover:text-white hover:border-white">
            <svg class="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <title>Menu</title>
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
            </svg>
          </button>
        </div>
        <div id="nav-content" class="w-0 flex-shrink hidden sm:block pt-6 lg:pt-0">
          <ul class="list-reset lg:flex justify-end flex-1 items-center">
            <li class="mr-3">
              <nuxt-link to="/auth/logout" class="flex py-2 px-4 text-white no-underline">
                Log out
              </nuxt-link>
            </li>
            <li class="mr-3">
              <nuxt-link class="flex py-2 px-4 text-white no-underline" to="/editor">Edit Profile</nuxt-link>
            </li>
            <li class="mr-3">
              <a class="flex py-2 px-4 text-white no-underline" href="#">link</a>
            </li>
          </ul>
        </div>
      </span>
      <span v-else>
        <div class="flex flex-wrap items-center p-2 items-center">
          <div class="text-teal-200">
            <nuxt-link to="/auth/login" class="hover:text-white">
              Log In
            </nuxt-link>|
            <nuxt-link to="/auth/register" class="hover:text-white">
              Register
            </nuxt-link>
          </div>
        </div>
      </span>
    </nav>
    <!-- END NAV BAR -->

    <!-- body -->
    <nuxt />
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState('auth', ['loggedIn']),
    userId () {
      return this.$store.state.user.user_id
    },
    userName () {
      return this.$store.state.user.username
    }
  },
  mounted () {
    // console.log('hi')
  },
  auth: false
}
</script>
