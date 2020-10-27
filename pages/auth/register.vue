<template>
  <section class="registration">
    <h2
      class="title"
    >
      Register
    </h2>
    <div>
      <label for="username">nick</label>
      <input id="username" v-model="user.username" type="text">user</input>

      <label for="email">e-mail</label>
      <input id="email" v-model="user.email" type="text">email</input>

      <label for="password1">Password</label>
      <input id="password" v-model="user.password1" type="password">password</input>
      <label for="password2">Confirm Password</label>
      <input id="password2" v-model="user.password2" type="password">confirm password</input>
      <button
        class="is-primary"
        @click="register"
      >
        Register!
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
  data () {
    return {
      user: {}
    }
  },
  auth: false,
  methods: {
    async register () {
      // Strategy:
      // - Send registration request to backend
      // - Upon successful registration, send a login request
      // - Store token and authenticated used info to store
      try {
        /* TODO: verify data!!! */
        const userData = {
          username: this.user.username,
          email: this.user.email,
          password: this.user.password1
        }

        const registerResponse = await this.$axios.post('http://127.0.0.1:8000/auth/register/', userData)
        if (registerResponse.status === 200) {
          // pass
        }

        const loginResponse = await this.$auth.loginWith('local', {
          data: {
            username: userData.username,
            password: userData.password
          }
        })
        // //
        const token = loginResponse.data.access
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

        // //
        this.$router.push('/')
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>
