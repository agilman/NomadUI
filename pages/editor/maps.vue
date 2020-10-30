<template>
  <div>
    <div class="flex justify-between">
      <div class="flex-grow my-2 mx-3">
        <div>
          <h1>Maps:</h1>
          <div id="mapList" class="flex-col">
            <div
              v-for="(map, index) in maps"
              :key="map.id"
              :class="{active: index == activeMapIndex}"
              class="flex border rounded py-2 px-2 mb-1 justify-between cursor-pointer"
              @click="setActiveMap(index)"
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
        </div>
        <div>
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
        <div>
          <h1>New Segment:</h1>
          <div
            :class="isStartSet()"
          >
            Start Set
          </div>
          <div
            :class="isEndSet()"
          >
            End Set
          </div>
          <button
            class=" flex mt-1 w-full border rounded px-2 py-2 bg-teal-300 font-medium justify-center hover:font-bold hover:border-2 hover:shadow-outline"
            @click="createNewSegment"
          >
            Save Segment
          </button>
        </div>
      </div>
      <div class="flex w-9/12">
        <no-ssr>
          <l-map ref="myMap" :zoom="6" :center="[46.9464418,-121.1277591]" style="height:475px" @click="mapClick">
            <l-tile-layer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" />
            <l-marker :lat-lng="[48.73293,-122.50107]" />
            <l-layer-group ref="previousPathLayer" />
            <l-layer-group ref="startLayer" />
            <l-layer-group ref="endLayer" />
            <l-layer-group ref="newSegmentLayer" />
          </l-map>
        </no-ssr>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  async fetch () {
    // TODO : Consolidate these 2 axios fetches into a single api point
    const advId = this.$store.state.editor.adventures[this.$store.state.editor.activeAdvIndex].id
    const res = await this.$axios.$get('http://localhost:8000/api/rest/advMaps/' + advId)
    this.maps = res
    this.activeMapIndex = res.length - 1

    const mapId = this.maps[this.activeMapIndex].id
    const path = await this.$axios.$get('http://localhost:8000/api/rest/segments/' + mapId)

    // const pathLayer = this.$refs.previousPathLayer.mapObject
    const pathLayer = this.$refs.previousPathLayer.mapObject
    // const mygeojson = this.$L.GeoJSON().addTo(pathLayer)
    const mygeojson = this.$L.geoJson().addData(path)
    mygeojson.addTo(pathLayer)
    // mygeojson.addData(path)

    // console.log('test')
    console.log(mygeojson)
    console.log(pathLayer)
  },
  data () {
    return {
      newMapName: '',
      maps: [],
      activeMapIndex: 0,
      startPoint: [],
      endPoint: []
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
      this.maps.push(response)

      // clear name field
      this.newMapName = ''
      this.activeMapIndex = this.maps.length - 1
    },
    async deleteMap (mapId) {
      await this.$axios.$delete('http://localhost:8000/api/rest/maps/' + mapId)
      for (let i = 0; i < this.maps.length; i++) {
        if (this.maps[i].id === mapId) {
          this.maps.splice(i, 1)
          break
        }
      }
    },
    setActiveMap (n) {
      this.activeMapIndex = n
    },
    async createNewSegment () {
      const mapId = this.maps[this.activeMapIndex].id
      const newSegment = {
        map: mapId,
        distance: 40, // meters
        waypoints: [this.startPoint, this.endPoint]
      }

      const response = await this.$axios.$post('http://localhost:8000/api/rest/segments/' + mapId, newSegment)
      console.log(response)
      // const segment = [this.startPoint, this.endPoint]
      // const layer = this.$refs.startLayer.mapObject
      // const myLine = this.$L.polyline(segment)
      // myLine.addTo(layer)
    },
    mapClick (event) {
      if (!this.startPoint.length) {
        this.startPoint = [event.latlng.lat, event.latlng.lng]
        const layer = this.$refs.startLayer.mapObject
        this.$L.circle(this.startPoint, { radius: 4000, color: 'green' }).addTo(layer)
      } else {
        // clear previous
        const layer = this.$refs.endLayer.mapObject
        const segmentLayer = this.$refs.newSegmentLayer.mapObject
        layer.clearLayers()
        segmentLayer.clearLayers()
        this.endPoint = [event.latlng.lat, event.latlng.lng]
        this.$L.circle(this.endPoint, { radius: 4000, color: 'red' }).addTo(layer)

        const segment = [this.startPoint, this.endPoint]
        this.$L.polyline(segment).addTo(segmentLayer)
      }
    },
    isStartSet () {
      if (!this.startPoint.length) {
        return 'bg-red-300'
      } else {
        return 'bg-teal-300'
      }
    },
    isEndSet () {
      if (!this.endPoint.length) {
        return 'bg-red-300'
      } else {
        return 'bg-teal-300'
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
