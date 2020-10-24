<template>
  <div>
    <!-- NAV BAR -->
    <nav class="nav flex flex-wrap items-center justify-between px-4 py-3 bg-teal-500 border-b border-black">
      <!-- BRANDKING -->
      <div class="flex items-center text-white mr-2">
        <nuxt-link to="/" class="font-semibold text-xl tracking-tight">
          NOMADUI
        </nuxt-link>
      </div>
      <!-- adv editor -->
      <div class="flex flex-grow justify-between ml-2 px-2">
        <div>
          <nuxt-link to="/editor" class="text-teal-200">
            Adventure editor | {{ activeAdvName }}
          </nuxt-link>
        </div>
        <!-- AUTH -->

        <span>
          <div class="flex flex-wrap items-center">
            <div class="text-teal-200">
              <nuxt-link :to="`/users/${userName}`">View Profile</nuxt-link>
            </div>
          </div>
        </span>
      </div>
    </nav>

    <!-- Second Nav Bar -->
    <nav
      class="nav flex flex-wrap items-center jusitify-between px-4 bg-teal-500"
    >
      <div class="flex items-center mr-6 py-3 text-white">
        <nuxt-link to="/editor/maps" class="tracking-tight">
          Map Editor
        </nuxt-link>
      </div>
      <div class="flex items-center mr-6 py-3 text-white">
        <nuxt-link to="/editor/blogs" class="tracking-tight">
          Blog Editor
        </nuxt-link>
      </div>
      <div class="flex items-center mr-6 py-3 text-white">
        <nuxt-link to="/editor/gear" class="tracking-tight">
          Gear Editor
        </nuxt-link>
      </div>
    </nav>
    <!-- END NAV BAR -->

    <!-- NUXT -->
    <nuxt />
    <!-- END NUXT -->
  </div>
</template>

<script>
// TODO :
//   - Store adventures in Store
//   - Get adventures in store
//   - Hide second bar based on length of adventures in Store
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState('auth', ['loggedIn']),
    userId () {
      return this.$store.state.user.user_id
    },
    userName () {
      return this.$store.state.user.username
    },
    activeAdvName () {
      if (this.$store.state.editor.adventures[this.$store.state.editor.activeAdvIndex]) {
        return this.$store.state.editor.adventures[this.$store.state.editor.activeAdvIndex].name
      } else {
        return ''
      }
    }
  },
  mounted () {
    // console.log('hi')
  }
}
</script>
