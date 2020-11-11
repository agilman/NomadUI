<template>
  <div>
    <div id="map-wrap">
      <client-only>
        <l-map :zoom="6" :center="[46.9464418,-121.1277591]" style="height:400px">
          <l-tile-layer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" />
          <l-marker :lat-lng="[48.73293,-122.50107]" />
        </l-map>
      </client-only>
    </div>
    Hi
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
  layout: 'viewer',
  auth: false
}
</script>
