<template>
  <div>
    <div>
      <div class="flex-row px-1 py-1">
        <span>Maps:</span>
        <span
          v-for="(map, index) in maps"
          :key="map.id"
          :class="{active: index == activeMapIndex}"
          class="border rounded my-1 py-1 px-2 hover:font-bold hover:border-2 hover:shadow-outline cursor-pointer"
          @click="setActiveMap(index)"
        >
          {{ map.name }}
        </span>
      </div>
    </div>
    <div>
      <div class="mt-1">
        <button
          class="flex py-1 px-2 mx-2 border rounded bg-teal-300 font-medium justify-center hover:font-bold hover:border-2 hover:shadow-outline"
          @click="$refs.imgUpload.click()"
        >
          Upload
        </button>
        <input ref="imgUpload" hidden type="file" accept="image/jpeg" @change="onFileChange">
      </div>
    </div>
    <div>
      <div class="p-1">
        <swiper ref="mySwiper" :options="swiperOptions">
          <swiper-slide v-for="photo in photos" :key="photo.id" class="border rounded p-2 shadow !important bg-teal-100" :class="[selectedImgs.includes(photo.id) ? 'selectedImg': '']">
            <img :src="makeImgURL(photo.id)" @click="imgClick(photo.id)"></img>
          </swiper-slide>
          <div slot="pagination" class="swiper-pagination" />
        </swiper>
      </div>
    </div>
    <div>
      <button v-if="selectedImgs.length && newGeotag.length" class="border rounded mb-1 mx-1 px-1 py-1 bg-teal-300" @click="saveGeotag()">
        Save Geotag
      </button>
    </div>
    <div class="flex">
      <client-only>
        <l-map ref="myMap" :zoom="6" style="height:275px" @click="mapClick">
          <l-geo-json ref="pathLayer" :geojson="geojson" />
          <l-layer-group ref="newGeotagLayer" />
          <l-layer-group ref="markersLayer" />
        </l-map>
      </client-only>
    </div>
  </div>
</template>

<script>
export default {
  async asyncData ({ store, $axios }) {
    // if maps is not in store... do axios request and save to store
    if (!store.state.editor.maps.length) {
      const advId = store.state.editor.adventures[store.state.editor.activeAdvIndex].id
      const res = await $axios.$get('/advMaps2/' + advId)
      store.commit('editor/setMaps', res)
      if (res.length) {
        store.commit('editor/setActiveMap', res.length - 1)
      }
    }
    if (store.state.editor.maps.length) {
      const mid = store.state.editor.maps[store.state.editor.activeMapIndex].id
      const apiPath = '/photos/' + mid

      const results = await $axios.get(apiPath)
      const photos = results.data
      return { photos }
    } else {
      return { photos: [] }
    }
  },
  data () {
    return {
      photos: [],
      selectedImgs: [],
      newGeotag: [],
      swiperOptions: {
        slidesPerView: 7,
        spaceBetween: 15,
        pagination: {
          el: '.swiper-pagination',
          clickable: true
        }
      }
    }
  },
  computed: {
    maps () {
      return this.$store.state.editor.maps
    },
    activeMapIndex () {
      return this.$store.state.editor.activeMapIndex
    },
    geojson () {
      let tmp = {
        type: 'FeatureCollection',
        features: []
      }
      if (this.$store.state.editor.maps.length) {
        tmp = this.$store.state.editor.maps[this.$store.state.editor.activeMapIndex].geojson
      }
      return tmp
    }
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

    if (this.geojson.features.length) {
      this.boundMap()
    } else {
      // if there are no coordinates, set map center to pacific northwest
      this.$refs.myMap.mapObject.setView([46.9464418, -121.1277591], 6)
    }
  },
  methods: {
    async onFileChange (e) {
      const files = e.target.files

      for (let i = 0; i < files.length; i++) {
        const fd = new FormData()
        fd.append('file', files[i])
        const uid = this.$store.state.user.user_id
        fd.append('userId', uid)
        const advId = this.$store.state.editor.adventures[this.$store.state.editor.activeAdvIndex].id
        fd.append('advId', advId)
        const mapId = this.$store.state.editor.maps[this.$store.state.editor.activeMapIndex].id
        fd.append('mapId', mapId)

        const photo = await this.$axios.post('/photos/photoUpload',
          fd, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
        this.photos.push(photo.data)
      }
    },
    async setActiveMap (index) {
      if (index !== this.$store.state.editor.activeMapIndex) {
        this.$store.commit('editor/setActiveMap', index)

        // unset photos
        this.photos = []
        // unsete photo selection
        this.selectedImgs = []
        this.newGeotag = []

        // clear newGeotagLayer
        this.$refs.newGeotagLayer.mapObject.clearLayers()
        this.$refs.markersLayer.mapObject.clearLayers()

        // fetch data for newly selected maps
        const mid = this.$store.state.editor.maps[this.$store.state.editor.activeMapIndex].id
        const apiPath = '/photos/' + mid

        const results = await this.$axios.get(apiPath)
        this.photos = results.data

        // set map bounds
        await this.$nextTick()
        if (this.geojson.features.length) {
          this.boundMap()
        }
      }
    },
    makeImgURL (pid) {
      const uid = this.$store.state.user.user_id
      const aid = this.$store.state.editor.adventures[this.$store.state.editor.activeAdvIndex].id
      if (this.$store.state.editor.maps.length) {
        const mid = this.$store.state.editor.maps[this.$store.state.editor.activeMapIndex].id
        const url = 'http://localhost:8000/user_media/' + uid + '/' + aid + '/' + mid + '/.th/' + pid + '.jpg'
        return url
      } else {
        return ''
      }
    },
    mapClick (event) {
      const newlayer = this.$refs.newGeotagLayer.mapObject
      // clear previous tag ...
      newlayer.clearLayers()

      // add new marker
      this.newGeotag = [event.latlng.lat, event.latlng.lng]

      this.$L.circle(this.newGeotag, { radius: 100, color: 'green' }).addTo(newlayer)
    },
    imgClick (imgId) {
      if (this.selectedImgs.includes(imgId)) {
        this.selectedImgs.splice(this.selectedImgs.indexOf(imgId), 1)
      } else {
        this.selectedImgs.push(imgId)
      }
    },
    async saveGeotag () {
      const payload = {
        photos: this.selectedImgs,
        geotag: this.newGeotag
      }

      const response = await this.$axios.post('/photos/geotag', payload)

      // clear layer
      this.$refs.newGeotagLayer.mapObject.clearLayers()
      this.newGeotag = []

      // add to permenant layer
      const markerLayer = this.$refs.markersLayer.mapObject
      const mrk = { lat: response.data[0].lat, lng: response.data[0].lng }
      this.$L.marker(mrk).addTo(markerLayer)
    },
    boundMap () {
      const bounds = this.$refs.pathLayer.mapObject.getBounds()
      if ('_southWest' in bounds) {
        this.$refs.myMap.mapObject.fitBounds(bounds)
      }
    }
  },
  layout: 'editor'
}
</script>

<style>
.active{
  @apply bg-teal-600;
}
.selectedImg{
  @apply !important;
  @apply bg-teal-400;
}
</style>
