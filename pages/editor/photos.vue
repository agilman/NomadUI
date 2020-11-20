<template>
  <div>
    <div>
      <h1>Maps:</h1>
      <div class="flex-row my-2 mx-2">
        <span
          v-for="(map, index) in maps"
          :key="map.id"
          :class="{active: index == activeMapIndex}"
          class="border rounded mr-1 px-2 py-2 hover:font-bold hover:border-2 hover:shadow-outline cursor-pointer"
        >
          {{ map.name }}
        </span>
      </div>
    </div>
    <div class="my-5">
      <button
        class="flex py-2 px-2 m-2 border rounded bg-teal-300 font-medium justify-center hover:font-bold hover:border-2 hover:shadow-outline"
        @click="$refs.imgUpload.click()"
      >
        Upload
      </button>
      <input ref="imgUpload" hidden type="file" accept="image/jpeg" @change="onFileChange">
    </div>
    <div>
      {{ photos.length }} Images
    </div>
    <div>
      <swiper ref="mySwiper" :options="swiperOptions">
        <swiper-slide>Slide 1</swiper-slide>
        <swiper-slide>Slide 2</swiper-slide>
        <swiper-slide>Slide 3</swiper-slide>
        <swiper-slide>Slide 4</swiper-slide>
        <swiper-slide>Slide 5</swiper-slide>
        <div slot="pagination" class="swiper-pagination" />
      </swiper>
    </div>
  </div>
</template>

<script>
export default {
  async asyncData ({ store, $axios }) {
    const mid = store.state.editor.maps[store.state.editor.activeMapIndex].id
    const apiPath = '/api/rest/photos/' + mid

    const results = await $axios.get(apiPath)
    const photos = results.data
    return { photos }
  },
  data () {
    return {
      photos: [],
      swiperOptions: {
        pagination: {
          el: '.swiper-pagination'
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
    }
  },
  layout: 'editor'
}
</script>

<style>
.active{
  @apply bg-teal-600;
}
</style>
