<template>
  <section class="registration">
    <h2
      class="title"
    >
      Register
    </h2>
    <div class="auth-form">
      <field label="User">
        <input v-model="user.username" type="text">user</input>
      </field>
      <field label="email">
        <input v-model="user.email" type="text">email</input>
      </field>
      <field label="Password">
        <input v-model="user.password1" type="password">password</input>
      </field>
      <field label="Confirm Password">
        <input v-model="user.password2" type="password">confirm password</input>
      </field>
      <button
        class="is-primary"
        @click="register"
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
    async register () {
      try {
        const exampleData = {
          username: this.user.username,
          email: this.user.email,
          password1: this.user.password1,
          password2: this.user.password2
        }
        console.log(exampleData)
        await this.$axios.post('http://127.0.0.1:8000/auth/register/', exampleData)

        /*
        // This should only fire if the registration is successful
        */
        /*
        await this.$auth.loginWith('local', {
          data: {
            username: this.username,
            password: this.password
          }
        })
        */

        this.$router.push('/')
      } catch (e) {
        console.log(e.response.data.message)
      }
    }
  }
}
</script>
