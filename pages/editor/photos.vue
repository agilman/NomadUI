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
      <div class="mt-1 mb-1">
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
      <div class="mb-1 px-1">
        {{ photos.length }} Images
      </div>
    </div>
    <div>
      <div class="px-1">
        <swiper ref="mySwiper" :options="swiperOptions">
          <swiper-slide v-for="photo in photos" :key="photo.id" class="border rounded p-2 shadow !important bg-teal-100" :class="[selectedImgs.includes(photo.id) ? 'selectedImg': '']">
            <img :src="makeImgURL(photo.id)" @click="imgClick(photo.id)"></img>
          </swiper-slide>
          <div slot="pagination" class="swiper-pagination" />
        </swiper>
      </div>
    </div>
    <div>
      <button class="border rounded mb-1 mx-1 px-1 py-1 bg-teal-300">
        Save Geotag
      </button>
    </div>
    <div class="flex">
      <client-only>
        <l-map ref="myMap" :zoom="6" style="height:275px" @click="mapClick">
          <l-tile-layer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" />
          <l-layer-group ref="newGeotagLayer" />
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
      const res = await $axios.$get('http://localhost:8000/api/rest/advMaps2/' + advId)
      store.commit('editor/setMaps', res)
      if (res.length) {
        store.commit('editor/setActiveMap', res.length - 1)
      }
    }
    if (store.state.editor.maps.length) {
      const mid = store.state.editor.maps[store.state.editor.activeMapIndex].id
      const apiPath = '/api/rest/photos/' + mid

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
      swiperOptions: {
        slidesPerView: 7,
        spaceBetween: 20,
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

        const photo = await this.$axios.post('http://localhost:8000/api/rest/photos/photoUpload',
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

        // fetch data for newly selected maps
        const mid = this.$store.state.editor.maps[this.$store.state.editor.activeMapIndex].id
        const apiPath = '/api/rest/photos/' + mid

        const results = await this.$axios.get(apiPath)
        this.photos = results.data
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
      const newTag = [event.latlng.lat, event.latlng.lng]

      this.$L.circle(newTag, { radius: 100, color: 'green' }).addTo(newlayer)
    },
    imgClick (imgId) {
      if (this.selectedImgs.includes(imgId)) {
        this.selectedImgs.pop(imgId)
      } else {
        this.selectedImgs.push(imgId)
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
