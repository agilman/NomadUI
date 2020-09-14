<template>
  <section class="login">
    <h2
      class="title"
    >
      Login
    </h2>
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
