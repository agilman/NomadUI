<template>
  <div>
    <div class="flex justify-center p-6 ml-6 mr-6">
      <div class="flex">
        <div>
          <h1>Adventures:</h1>
          <div id="advList" class="flex-col">
            <div
              v-for="(adv, index) in adventures"
              :key="adv.id"
              :class="{active: index == activeAdvIndex}"
              class="flex border rounded mt-1 mb-1 py-2 px-2 justify-between cursor-pointer"
              @click="setActiveAdv(index)"
            >
              <span class="py-2 px-2">
                {{ adv.name }}
              </span>
              <span>
                <button
                  class="border rounded py-2 px-2 hover:shadow-outline"
                  @click="deleteAdv(adv.id, index)"
                  @click.stop
                >
                  delete
                </button>
              </span>
            </div>
          </div>
          <br>
          <div>
            <h1>New Adventure:</h1>
            <input v-model="advName" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" placeholder="New Adventure Name">
            <br>
            <div class="flex">
              <div class="inline-block relative w-full">
                <select v-model="advType" class="block mt-1 mb-1 appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                  <option value="1">
                    Bicycle Touring
                  </option>
                  <option value="2">
                    Backpacking
                  </option>
                  <option value="3">
                    Car Trip
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
            </div>
            <div class="inline-block relative w-full">
              <select v-model="advStatus" class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                <option value="1">
                  In Planning
                </option>
                <option value="2">
                  In Progress
                </option>
                <option value="3">
                  Completed
                </option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
              </div>
            </div>
            <button
              v-if="advName.length"
              class="flex mt-1 w-full border rounded px-2 py-2 bg-teal-300 font-medium justify-center hover:font-bold hover:border-2 hover:shadow-outline"
              @click="createAdv"
            >
              Create!
            </button>
          </div>
        </div>
      </div> <!-- Left -->
      <div class="flex ml-10">
        <div class="flex-col px-2">
          <div>
            <h1>Profile photo:</h1>
            <img :src="makeImgUrl()" width="200px" height="350px"></img>
          </div>
          <div>
            <button
              class="flex mt-1 px-2 py-2 w-full border rounded bg-teal-300 font-medium justify-center hover:font-bold hover:border-2 hover:shadow-outline"
              @click="$refs.imgUpload.click()"
            >
              Upload Photo
            </button>
            <input ref="imgUpload" hidden type="file" accept="image/jpeg" @change="onFileChange">
          </div>
        </div> <!-- Right -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  async fetch () {
    if (!this.$store.state.editor.adventures.length) {
      const res = await this.$axios.$get('/me/' + this.$store.state.user.user_id)
      this.$store.commit('editor/setAdventures', res.adventures)
      this.$store.commit('editor/setActiveAdv', 0)
      this.$store.commit('editor/setProfilePhotos', res.profilePhotos)
    } else {
      // pass
    }
  },
  data () {
    return {
      advName: '',
      advType: 1,
      advStatus: 1
    }
  },
  computed: {
    adventures () {
      return this.$store.state.editor.adventures
    },
    activeAdvIndex () {
      return this.$store.state.editor.activeAdvIndex
    },
    profilePhotos () {
      return this.$store.state.editor.profilePhotos
    }
  },
  methods: {
    setActiveAdv (n) {
      // unload maps if there are any in store...
      this.$store.commit('editor/setMaps', [])
      this.$store.commit('editor/setActiveMap', 0)
      // set in store
      this.$store.commit('editor/setActiveAdv', n)
    },
    async createAdv () {
      const newAdv = {
        user: this.$store.state.user.user_id,
        advName: this.advName,
        advType: this.advType,
        advStatus: this.advStatus
      }
      const response = await this.$axios.$post('/adventures/', newAdv)
      // Add new data to adventure list
      this.$store.commit('editor/addAdventure', response)
      // clear maps from Store
      this.$store.commit('editor/setMaps', [])
      this.$store.commit('editor/setActiveMap', 0)
      // reset adventure creation options
      this.advName = ''
      this.advType = 1
      this.advStatus = 1
    },
    async deleteAdv (advId, advIndex) {
      await this.$axios.$delete('/adventures/' + advId)
      this.$store.commit('editor/removeAdventure', advIndex)
    },
    async onFileChange (e) {
      const files = e.target.files

      const myData = new FormData()
      myData.append('file', files[0])
      const uid = this.$store.state.user.user_id
      myData.append('userId', uid)

      const photo = await this.$axios.post('/photos/profilePhotoUpload',
        myData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      this.$store.commit('editor/addProfilePhoto', photo.data)
    },
    makeImgUrl () {
      let url = ''
      if (!this.profilePhotos.length) {
        url = '/_nuxt/static/Portrait_Placeholder.png'
      } else {
        const uid = this.$store.state.user.user_id
        url = process.env.baseUrl + '/user_media/' + uid + '/profile_pictures/' + this.profilePhotos[this.profilePhotos.length - 1].id + '.jpg'
      }
      return url
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
