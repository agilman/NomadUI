<template>
  <div>
    <div class="flex justify-between">
      <div class="flex-grow my-2 mx-3">
        <div>
          <h1>Maps:</h1>
          <div id="mapList" class="flex-col">
            <div class="flex border rounded py-2 px-2 justify-between cursor-pointer">
              <span class="py-2 px-2">
                Map1
              </span>
              <span>
                <button
                  class="flex border rounded py-2 px-2 hover:shadow-outline"
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
            type="text"
            class="w-full shadow border rounded py-2 px-2 focus:shadow-outline"
            placeholder="Map Name"
            v-bind="newMapName"
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
  data () {
    return {
      newMapName: ''
    }
  },
  methods: {
    async createNewMap () {
      console.log('got click')
      const newMap = {
        adv: this.$store.state.editor.adventures[this.$store.state.editor.activeAdvIndex].id,
        mapName: this.newMapName
      }
      const response = await this.$axios.$post('http://localhost:8000/api/rest/maps/', newMap)
      // Add new data to adventure list
      console.log(response)
    }

  },
  layout: 'editor'
}
</script>
