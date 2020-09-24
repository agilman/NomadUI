<template>
  <div>
    <!-- NAV BAR -->
    <nav class="nav flex flex-wrap items-center justify-between px-4 bg-teal-500">
      <!-- BRANDKING -->
      <div class="flex items-center mr-6 py-3 text-white">
        <nuxt-link to="/" class="font-semibold text-xl tracking-tight">
          NOMADUI
        </nuxt-link>
      </div>
      <!-- AUTH -->

      <span>
        <div class="flex flex-wrap items-center p-2 items-center">
          <div class="text-teal-200">
            <nuxt-link :to="`/users/${userName}`">View Profile</nuxt-link>
          </div>
        </div>
      </span>
    </nav>
    <!-- END NAV BAR -->

    <!-- NUXT -->
    <nuxt />
    <!-- END NUXT -->
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
  }
}
</script>
