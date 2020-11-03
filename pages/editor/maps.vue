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
            v-if="newMapName"
            class="flex mt-1 w-full border rounded px-2 py-2 bg-teal-300 font-medium justify-center hover:font-bold hover:border-2 hover:shadow-outline"
            @click="createNewMap"
          >
            Create!
          </button>
        </div>
        <div v-if="maps.length" class="pt-4">
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
            v-if="startPoint.length && endPoint.length"
            class=" flex mt-1 w-full border rounded px-2 py-2 bg-teal-300 font-medium justify-center hover:font-bold hover:border-2 hover:shadow-outline"
            @click="createNewSegment"
          >
            Save Segment
          </button>
        </div>
      </div>
      <div class="flex w-9/12">
        <no-ssr>
          <l-map ref="myMap" :zoom="6" style="height:475px" @click="mapClick">
            <l-tile-layer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" />
            <l-geo-json ref="pathLayer" :geojson="geojson" />
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
  async asyncData ({ store, $axios }) {
    // TODO : Consolidate these 2 axios fetches into a single api point
    const advId = store.state.editor.adventures[store.state.editor.activeAdvIndex].id
    const res = await $axios.$get('http://localhost:8000/api/rest/advMaps/' + advId)
    const maps = res
    const activeMapIndex = res.length - 1
    let path = {
      type: 'FeatureCollection',
      features: []
    }
    let startPoint = []

    if (res.length) {
      const mapId = maps[activeMapIndex].id
      path = await $axios.$get('http://localhost:8000/api/rest/segments/' + mapId)
      // set last coordinates as startPoint for new segments
      if (path.features.length) {
        const coords = path.features[path.features.length - 1].geometry.coordinates
        const last = coords[coords.length - 1]
        startPoint = [last[1], last[0]]
      }
    }
    return { maps, activeMapIndex, geojson: path, startPoint }
  },
  data () {
    return {
      newMapName: '',
      maps: [],
      activeMapIndex: 0,
      startPoint: [],
      endPoint: [],
      geojson: {
        type: 'FeatureCollection',
        features: []
      }
    }
  },
  async mounted () {
    await this.$nextTick()
    if (this.startPoint.length) {
      this.boundMap()
      const layer = this.$refs.startLayer.mapObject
      this.$L.circle(this.startPoint, { radius: 100, color: 'green' }).addTo(layer)
    } else {
      // if there are no coordinates, set map center to pacific northwest
      this.$refs.myMap.mapObject.setView([46.9464418, -121.1277591], 6)
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
    async setActiveMap (n) {
      this.activeMapIndex = n

      // clear layers
      this.$refs.newSegmentLayer.mapObject.clearLayers()
      this.$refs.startLayer.mapObject.clearLayers()
      this.$refs.endLayer.mapObject.clearLayers()
      let path = {
        type: 'FeatureCollection',
        features: []
      }
      let startPoint = []

      const mapId = this.maps[this.activeMapIndex].id
      path = await this.$axios.$get('http://localhost:8000/api/rest/segments/' + mapId)
      // set last coordinates as startPoint for new segments
      if (path.features.length) {
        const coords = path.features[path.features.length - 1].geometry.coordinates
        if (coords) {
          const last = coords[coords.length - 1]
          startPoint = [last[1], last[0]]
        }
      }
      this.geojson = path
      this.startPoint = startPoint
      this.endPoint = []
      // set map zoom to fit newly loaded geoJSON
      await this.$nextTick()
      if (this.startPoint.length) {
        this.boundMap()
        const layer = this.$refs.startLayer.mapObject
        this.$L.circle(this.startPoint, { radius: 100, color: 'green' }).addTo(layer)
      }
    },
    async createNewSegment () {
      const mapId = this.maps[this.activeMapIndex].id
      const newSegment = {
        map: mapId,
        distance: 40, // meters
        waypoints: [this.startPoint, this.endPoint]
      }

      const response = await this.$axios.$post('http://localhost:8000/api/rest/segments/' + mapId, newSegment)
      this.geojson.features.push(response)
      // clear layers...
      this.$refs.startLayer.mapObject.clearLayers()
      this.$refs.endLayer.mapObject.clearLayers()
      this.$refs.newSegmentLayer.mapObject.clearLayers()
      // unset endSegment
      this.startPoint = this.endPoint
      this.endPoint = []
      // draw new startPoint
      const layer = this.$refs.startLayer.mapObject
      this.$L.circle(this.startPoint, { radius: 100, color: 'green' }).addTo(layer)
    },
    mapClick (event) {
      if (this.maps.length) {
        if (!this.startPoint.length) {
          this.startPoint = [event.latlng.lat, event.latlng.lng]
          const layer = this.$refs.startLayer.mapObject
          this.$L.circle(this.startPoint, { radius: 100, color: 'green' }).addTo(layer)
        } else {
          // clear previous
          const layer = this.$refs.endLayer.mapObject
          const segmentLayer = this.$refs.newSegmentLayer.mapObject
          layer.clearLayers()
          segmentLayer.clearLayers()
          this.endPoint = [event.latlng.lat, event.latlng.lng]
          this.$L.circle(this.endPoint, { radius: 100, color: 'red' }).addTo(layer)

          const segment = [this.startPoint, this.endPoint]
          this.$L.polyline(segment).addTo(segmentLayer)
        }
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
</style>
