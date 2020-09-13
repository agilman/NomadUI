<template>
  <section class="login">
    <h1
      class="title"
    >
      Authentication
    </h1>
    <div class="auth-form">
      <field label="User">
        <input v-model="user.username" type="text">user</input>
      </field>
      <field label="Password">
        <input v-model="user.password" type="password">password</input>
      </field>
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
  methods: {
    async login () {
      try {
        await this.$auth.loginWith('local', {
          data: this.user
        })
        console.log('login success')
      } catch (err) {
        console.log('login failed')
      }
    }
  }
}
</script>
