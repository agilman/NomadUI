<template>
  <div>
    <div id="map-wrap">
      <client-only>
        <l-map ref="myMap" :zoom="6" :center="[46.9464418,-121.1277591]" style="height:400px">
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
    const userData = await $axios.$get('/user/' + uname)
    console.log(userData)
  },
  async mounted () {
    await this.$nextTick()
    const mymap = this.$refs.myMap.mapObject

    if (this.$store.state.mapbox.accessToken) {
      this.$L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: this.$store.state.mapbox.accessToken
      }).addTo(mymap)
    } else {
      this.$L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(mymap)
    }
  },
  layout: 'viewer',
  auth: false
}
</script>
