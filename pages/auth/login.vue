<template>
  <div class="flex justify-center">
    <div class="block w-2/5 m-5 bg-white shadow rounded px-8 pt-6 pb-8 flex flex-col">
      <Logo />
      <div class="mb-4">
        <label class="block text-grey-darker text-sm font-bold mb-2" for="username">
          Username
        </label>
        <input id="user" v-model="user.username" class="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker hover:border-2 hover:shadow-outline" type="text" placeholder="Username">
      </div>
      <div class="mb-6">
        <label class="block text-grey-darker text-sm font-bold mb-2" for="password">
          Password
        </label>
        <input id="password" v-model="user.password" class="shadow appearance-none border border-red rounded w-full py-2 px-3 text-grey-darker mb-3 hover:border-2 hover:shadow-outline" type="password" placeholder="******************">
      </div>
      <div class="flex items-center justify-between">
        <button class="m-1 p-1 rounded border shadow bg-teal-300 hover:font-bold hover:border-2 hover:shadow-outline" type="button" @click="login">
          Sign In
        </button>
        <a class="inline-block align-baseline font-bold text-sm text-blue hover:text-blue-darker" href="#">
          Forgot Password?
        </a>
      </div>
    </div>
  </div>
</template>

<script>
function b64ToUtf8 (str) {
  str = str.replace(/\s/g, '')
  return decodeURIComponent(escape(window.atob(str)))
}
export default {
  // TODO : import vuex for auth to work... store token and user info in vuex
  data () {
    return {
      user: {}
    }
  },
  auth: false,
  methods: {
    async login () {
      try {
        await this.$auth.loginWith('local', {
          data: this.user
          // todo : this is where I add user data to vuex
        })
          .then((response) => {
            const token = response.data.access
            const t0 = token.indexOf('.')
            // const slice1 = token.slice(0, t0)
            // console.log('slice1:', slice1)
            const remainder = token.slice(t0 + 1)

            const t1 = remainder.indexOf('.')
            const slice2 = remainder.slice(0, t1)
            // console.log('slice2:', slice2)

            const decoded = b64ToUtf8(slice2)
            const decodedObj = JSON.parse(decoded)

            this.$store.commit('user/setId', decodedObj.user_id)
            this.$store.commit('user/setUserName', this.user.username)
          })
        this.$router.push('/')
      } catch (err) {
        console.log('login failed')
      }
    }
  }
}
</script>
