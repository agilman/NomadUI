<template>
  <div>
    Hi
  </div>
</template>

<script>
export default {
  // TODO: get logged in userID... if not logged in redirect to login page.
  // if logged in, get users adventures
  // if user nas adventures, display a list of them
  //  async asyncData ({ $axios, params }) {
  //  const uname = params.username
  //  const userData = await $axios.$get('http://localhost:8000/api/rest/adventures/' + uname)
  // },
  mounted () {
  },
  layout: 'editor'
}
</script>
