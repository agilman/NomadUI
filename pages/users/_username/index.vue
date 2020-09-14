<template>
  <div>
    <p>
      Hello World!
    </p>
  </div>
</template>

<script>
export default {
  async asyncData ({ $axios, params }) {
    const uname = params.username
    const userData = await $axios.$get('http://localhost:8000/api/rest/user/' + uname)
    console.log(userData)
  },
  mounted () {
  },
  auth: false
}
</script>
