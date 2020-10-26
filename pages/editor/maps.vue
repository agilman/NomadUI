<template>
  <div>
    <div class="flex justify-between">
      <div class="flex-grow my-2 mx-3">
        <div>
          <h1>Maps:</h1>
          <div id="mapList" class="flex-col">
            <div
              v-for="map in maps"
              :key="map.id"
              class="flex border rounded py-2 px-2 justify-between cursor-pointer"
            >
              <span class="py-2 px-2">
                {{ map.name }}
              </span>
              <span>
                <button
                  class="flex border rounded py-2 px-2 hover:shadow-outline"
                  @click="deleteMap(map.id)"
                  @click.stop
                >
                  delete
                </button>
              </span>
            </div>
          </div>
          <h1>New Map:</h1>
          <input
            id="mapName"
            v-model="newMapName"
            type="text"
            class="w-full shadow border rounded py-2 px-2 focus:shadow-outline"
            placeholder="Map Name"
          ></input>
          <button
            class=" flex mt-1 w-full border rounded px-2 py-2 bg-teal-300 font-medium justify-center hover:font-bold hover:border-2 hover:shadow-outline"
            @click="createNewMap"
          >
            Create!
          </button>
        </div>
      </div>
      <div class="flex w-9/12">
        <no-ssr>
          <l-map :zoom="6" :center="[46.9464418,-121.1277591]" style="height:475px">
            <l-tile-layer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" />
            <l-marker :lat-lng="[48.73293,-122.50107]" />
          </l-map>
        </no-ssr>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  async fetch () {
    const advId = this.$store.state.editor.adventures[this.$store.state.editor.activeAdvIndex].id
    const res = await this.$axios.$get('http://localhost:8000/api/rest/advMaps/' + advId)
    // this.$store.commit('editor/setAdventures', res.adventures)
    // this.$store.commit('editor/setActiveAdv', 0)
    this.maps = res
  },
  data () {
    return {
      newMapName: '',
      maps: []
    }
  },
  methods: {
    async createNewMap () {
      const advIndex = this.$store.state.editor.activeAdvIndex
      const advId = this.$store.state.editor.adventures[advIndex].id
      const newMap = {
        adv: advId,
        name: this.newMapName
      }
      const response = await this.$axios.$post('http://localhost:8000/api/rest/maps/', newMap)
      // Add new data to adventure list
      this.maps.push(response)

      // clear name field
      this.newMapName = ''
    },
    async deleteMap (mapId) {
      await this.$axios.$delete('http://localhost:8000/api/rest/maps/' + mapId)
      // TODO this should be done in a then() clause wtih exception handling...
      // this.$store.commit('editor/removeAdventure', advId)
      for (let i = 0; i < this.maps.length; i++) {
        if (this.maps[i].id === mapId) {
          this.maps.splice(i, 1)
          break
        }
      }
    }
  },
  layout: 'editor'
}
</script>
