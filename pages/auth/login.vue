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
export default {
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
