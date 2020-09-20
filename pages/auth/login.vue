<template>
  <section class="login">
    <h2
      class="title"
    >
      Login
    </h2>
    <div>
      <label for="user">nick</label>
      <input v-model="user.username" type="text">user</input>

      <label for="password">Password</label>
      <input id="password" v-model="user.password" type="password">password</input>
      <button
        class="is-primary"
        @click="login"
      >
        Login
      </button>
    </div>
  </section>
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
            console.log('token:', token)
            const t0 = token.indexOf('.')
            // const slice1 = token.slice(0, t0)
            // console.log('slice1:', slice1)
            const remainder = token.slice(t0 + 1)

            const t2 = remainder.indexOf('.')
            const slice2 = remainder.slice(0, t2)
            // console.log('slice2:', slice2)

            const decoded = b64ToUtf8(slice2)
            const decodedObj = JSON.parse(decoded)
            console.log(decodedObj)
            // TODO : add to username and decodedObj.user_id to vuex

            this.$store.commit('user/setId', decodedObj.user_id)
            this.$store.commit('user/setUserName', this.user.username)
          })
        console.log('login success')
        this.$router.push('/')
      } catch (err) {
        console.log('login failed')
      }
    }
  }
}
</script>
