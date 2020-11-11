<template>
  <div>
    <nav
      class="flex items-center justify-netween px-4 bg-teal-500 border-b border-black"
    >
      <div class="flex mr-2 py-2 text-white">
        <nuxt-link to="/" class="font-semibold text-xl tracking-tight">
          NOMADUI
        </nuxt-link>
      </div>
      <div class="flex py-2 flex-grow justify-between">
        <div class="flex items-center">
          <div
            class="flex"
            :class="{active: routeName === 'editor'}"
          >
            <nuxt-link to="/editor" class="text-white">
              Adventure Editor
            </nuxt-link>
          </div>
          <div class="text-gray-800">
            |   {{ activeAdvName }}
          </div>
        </div>
        <div class="text-white">
          <nuxt-link :to="`/users/${userName}`">
            View Profile
          </nuxt-link>
        </div>
      </div>
    </nav>

    <!-- Second Nav Bar -->
    <nav
      v-if="adventures.length"
      class="flex items-center px-4 bg-teal-500"
    >
      <div
        class="flex items-center mr-6 py-3 text-white"
        :class="{active: routeName === 'editor-maps'}"
      >
        <nuxt-link to="/editor/maps" class="tracking-tight">
          Map Editor
        </nuxt-link>
      </div>
      <div
        class="flex items-center mr-6 py-3 text-white"
        :class="{active: routeName === 'editor-photos'}"
      >
        <nuxt-link to="/editor/photos" class="tracking-tight">
          Photos Editor
        </nuxt-link>
      </div>
      <div
        class="flex items-center mr-6 py-3 text-white"
        :class="{active: routeName === 'editor-blogs'}"
      >
        <nuxt-link to="/editor/blogs" class="tracking-tight">
          Blog Editor
        </nuxt-link>
      </div>
      <div
        class="flex items-center mr-6 py-3 text-white"
        :class="{active: routeName === 'editor-gear'}"
      >
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
    routeName () {
      return this.$nuxt.$route.name
    },
    activeAdvName () {
      if (this.$store.state.editor.adventures[this.$store.state.editor.activeAdvIndex]) {
        return this.$store.state.editor.adventures[this.$store.state.editor.activeAdvIndex].name
      } else {
        return ''
      }
    },
    adventures () {
      return this.$store.state.editor.adventures
    }
  },
  mounted () {
    // pass
  }
}
</script>
<style>
  @apply bg-white;
</style>
