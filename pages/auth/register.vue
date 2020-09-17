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
export default {
  data () {
    return {
      user: {}
    }
  },
  auth: false,
  methods: {
    async register () {
      try {
        /* TODO: verify data!!! */
        const userData = {
          username: this.user.username,
          email: this.user.email,
          password: this.user.password1
        }

        console.log('about to send registration request')

        const registerResponse = await this.$axios.post('http://127.0.0.1:8000/auth/register/', userData)

        console.log('GOT HERE', registerResponse)

        const loginResponse = await this.$auth.loginWith('local', {
          data: {
            username: userData.username,
            password: userData.password
          }
        })

        console.log('SHOULD HAVE RECEIVED A  TOKEN BY NOW!', loginResponse)

        this.$router.push('/')
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>
