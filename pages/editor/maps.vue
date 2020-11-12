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
            <div>
              <VueCtkDateTimePicker v-model="startTime" position="top" />
            </div>
          </div>
          <div
            :class="isEndSet()"
          >
            End Set
            <div>
              <VueCtkDateTimePicker v-model="endTime" />
            </div>
          </div>
          Segment Distance: {{ (segmentDistance/1000).toFixed(1) }} km
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
        <client-only>
          <l-map ref="myMap" :zoom="6" style="height:475px" @click="mapClick">
            <l-tile-layer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" />
            <l-geo-json ref="pathLayer" :geojson="geojson" />
            <l-layer-group ref="startLayer" />
            <l-layer-group ref="endLayer" />
            <l-layer-group ref="newSegmentLayer" />
          </l-map>
        </client-only>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  async asyncData ({ store, $axios, $moment }) {
    // if maps is not in store... do axios request and save to store
    if (!store.state.editor.maps.length) {
      const advId = store.state.editor.adventures[store.state.editor.activeAdvIndex].id
      const res = await $axios.$get('http://localhost:8000/api/rest/advMaps2/' + advId)
      store.commit('editor/setMaps', res)
    }
    // load from store
    const maps = store.state.editor.maps
    let activeMapIndex = 0
    let path = {
      type: 'FeatureCollection',
      features: []
    }
    let startPoint = []
    let startTime = null

    if (maps.length) {
      activeMapIndex = maps.length - 1
      path = maps[activeMapIndex].geojson
      if (path.features.length) {
        const coords = path.features[path.features.length - 1].geometry.coordinates
        const last = coords[coords.length - 1]
        startPoint = [last[1], last[0]]
        // set start time to be 8am on the following day from last point.
        if (path.features.length) {
          const myp = path.features[path.features.length - 1].properties.endTime
          if (myp) {
            const lastTime = $moment(myp, 'YYYY-MM-DD h:mm A')
            const nextMorning = lastTime.add(1, 'days').hours(8).startOf('hour')
            startTime = nextMorning.format('YYYY-MM-DD h:mm A')
          }
        }
      }
    }

    return { maps, activeMapIndex, geojson: path, startPoint, startTime }
  },
  data () {
    return {
      newMapName: '',
      maps: [],
      activeMapIndex: 0,
      startPoint: [],
      startTime: null,
      endPoint: [],
      endTime: null,
      geojson: {
        type: 'FeatureCollection',
        features: []
      },
      segmentDistance: 0
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
      // TODO : Restrict map creation only after previous map has data
      const advIndex = this.$store.state.editor.activeAdvIndex
      const advId = this.$store.state.editor.adventures[advIndex].id
      const newMap = {
        adv: advId,
        name: this.newMapName
      }
      const response = await this.$axios.$post('http://localhost:8000/api/rest/maps/', newMap)
      this.maps.push(response)
      // TODO: add new map to store

      // clear name field
      this.newMapName = ''
      this.activeMapIndex = this.maps.length - 1
      // set start time to be 8am on the day after last endTime
      let myTempTime = null
      if (this.geojson.features.length) {
        const lastTime = this.geojson.features[this.geojson.features.length - 1].properties.endTime
        const tmp = this.$moment(lastTime, 'YYYY-MM-DD h:mm A').startOf('day').add(1, 'days').hours(8).startOf('hour')
        myTempTime = tmp.format('YYYY-MM-DD h:mm A')
      }
      this.startTime = myTempTime
      this.endTime = null
      // clear map
      this.geojson = {
        type: 'FeatureCollection',
        features: []
      }
      this.$refs.newSegmentLayer.mapObject.clearLayers()
      // this.$refs.startLayer.mapObject.clearLayers()
      this.$refs.endLayer.mapObject.clearLayers()
      // TODO: Clear endPoint
      this.segmentDistance = 0
    },
    async deleteMap (mapId) {
      await this.$axios.$delete('http://localhost:8000/api/rest/maps/' + mapId)
      for (let i = 0; i < this.maps.length; i++) {
        if (this.maps[i].id === mapId) {
          this.maps.splice(i, 1)
          break
        }
      }
      // TODO: remove map from store
    },
    async setActiveMap (n) { // this should be renamed to changeActiveMap
      if (n !== this.activeMapIndex) {
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

        path = this.maps[this.activeMapIndex].geojson
        // set last coordinates as startPoint for new segments
        let myTempTime = null
        if (path.features.length) {
          const coords = path.features[path.features.length - 1].geometry.coordinates
          if (coords) {
            const last = coords[coords.length - 1]
            startPoint = [last[1], last[0]]
          }
          const lastTime = path.features[path.features.length - 1].properties.endTime
          if (lastTime) {
            const tmp = this.$moment(lastTime, 'YYYY-MM-DD h:mm A').startOf('day').add(1, 'days').hours(8).startOf('hour')
            myTempTime = tmp.format('YYYY-MM-DD h:mm A')
          }
        }
        this.geojson = path
        this.startPoint = startPoint
        this.startTime = myTempTime
        this.endPoint = []
        this.segmentDistance = 0
        this.endTime = null
        // set map zoom to fit newly loaded geoJSON
        await this.$nextTick()
        if (this.startPoint.length) {
          this.boundMap()
          const layer = this.$refs.startLayer.mapObject
          this.$L.circle(this.startPoint, { radius: 100, color: 'green' }).addTo(layer)
        }
      }
    },
    async createNewSegment () {
      const mapId = this.maps[this.activeMapIndex].id
      let stime = null
      let ftime = null
      if (this.startTime) {
        stime = this.$moment(this.startTime.toUpperCase(), ['YYYY-MM-DD h:mm A']).format()
      }
      if (this.endTime) {
        ftime = this.$moment(this.endTime.toUpperCase(), ['YYYY-MM-DD h:mm A']).format()
      }

      const newSegment = {
        map: mapId,
        distance: this.segmentDistance,
        startTime: stime,
        endTime: ftime,
        waypoints: [this.startPoint, this.endPoint]
      }

      const response = await this.$axios.$post('http://localhost:8000/api/rest/segments/' + mapId, newSegment)
      this.geojson.features.push(response)
      // TODO: add to store
      // clear layers...
      this.$refs.startLayer.mapObject.clearLayers()
      this.$refs.endLayer.mapObject.clearLayers()
      this.$refs.newSegmentLayer.mapObject.clearLayers()
      // unset endSegment
      this.startPoint = this.endPoint
      this.endPoint = []
      this.segmentDistance = 0
      // Set Start time to be 8 am on the next day from end time
      let myTempTime = null
      if (this.endTime) {
        const tmp = this.$moment(this.endTime, 'YYYY-MM-DD h:mm A').startOf('day').add(1, 'days').hours(8).startOf('hour')
        myTempTime = tmp.format('YYYY-MM-DD h:mm A')
      }
      this.startTime = myTempTime
      this.endTime = null
      // draw new startPoint
      const layer = this.$refs.startLayer.mapObject
      this.$L.circle(this.startPoint, { radius: 100, color: 'green' }).addTo(layer)
    },
    mapClick (event) {
      if (this.maps.length) {
        if (!this.startPoint.length) { // if start point is not set, set it
          this.startPoint = [event.latlng.lat, event.latlng.lng]
          const layer = this.$refs.startLayer.mapObject
          this.$L.circle(this.startPoint, { radius: 100, color: 'green' }).addTo(layer)
          // if start time is not set, set it to 8 am today
          if (!this.startTime) {
            this.startTime = this.$moment().startOf('day').add(8, 'hours').startOf('hour').format('YYYY-MM-DD h:mm A')
          }
        } else { // if start point is already set, set end point
          // clear previous
          const layer = this.$refs.endLayer.mapObject
          const segmentLayer = this.$refs.newSegmentLayer.mapObject
          layer.clearLayers()
          segmentLayer.clearLayers()
          this.endPoint = [event.latlng.lat, event.latlng.lng]
          this.$L.circle(this.endPoint, { radius: 100, color: 'red' }).addTo(layer)

          const segment = [this.startPoint, this.endPoint]
          this.$L.polyline(segment).addTo(segmentLayer)

          // if endTime is not yet set, set it to 8pm on the same day as startTime
          if (!this.endTime) {
            if (this.startTime) {
              const st = this.$moment(this.startTime, 'YYYY-MM-DD h:mm A')
              const newEndTime = st.startOf('day').add(0, 'days').hours(20).startOf('hour')
              this.endTime = newEndTime.format('YYYY-MM-DD h:mm A')
            }
          }

          // calculate distance from start to end
          const dist = this.$refs.myMap.mapObject.distance(this.startPoint, this.endPoint)
          this.segmentDistance = Math.trunc(dist)
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
