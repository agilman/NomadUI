<template>
  <!-- NAV BAR -->
  <div>
    <nav class="flex flex-wrap bg-teal-500 p-6">
      <div class="flex text-white mr-6">
        <span class="font-semibold text-xl tracking-tight">
          <nuxt-link to="/">
            Nomad UI
          </nuxt-link>
        </span>
      </div>

      <div class="w-full flex lg:w-auto">
        <div class="text-sm lg:flex-grow">
          <a href="#responsive-header" class="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
            Adventures
          </a>
          <a href="#responsive-header" class="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
            Blog
          </a>
          <a href="#responsive-header" class="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white">
            Gear
          </a>
        </div>
      </div>

      <div class="block w-auto justify-end">
        <span v-if="loggedIn">
          Logged in as
        </span>
      </div>
    </nav>

    <div class="container">
      prize win!
      <nuxt />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState('auth', ['loggedIn'])
  },
  mounted () {
    // console.log('hi')
  },
  auth: false
}
</script>
