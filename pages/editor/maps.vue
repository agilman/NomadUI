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
                  @click="deleteMap(map.id, index)"
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
          <span>
            New Segment:
          </span>
          <span v-if="mapboxToken != null">
            <span>
              <button :class="{active: navType == 1}" class="border rounded my-1 p-2" @click="navType=1">
                <font-awesome-icon icon="arrow-right" />
              </button>
            </span>
            <span>
              <button :class="{active: navType == 2}" class="border rounded my-1 p-2" @click="navType=2">
                <font-awesome-icon icon="bicycle" />
              </button>
            </span>
            <span>
              <button :class="{active: navType == 3}" class="border rounded my-1 p-2" @click="navType=3">
                <font-awesome-icon icon="car-side" />
              </button>
            </span>
          </span>
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
const polyline = require('@mapbox/polyline')
export default {
  async asyncData ({ store, $axios, $moment }) {
    // if maps is not in store... do axios request and save to store
    let startPoint = []
    let startTime = null

    if (!store.state.editor.maps.length) {
      const advId = store.state.editor.adventures[store.state.editor.activeAdvIndex].id
      const res = await $axios.$get('/advMaps2/' + advId)
      store.commit('editor/setMaps', res)
      if (res.length) {
        store.commit('editor/setActiveMap', res.length - 1)
      }
    }

    if (store.state.editor.maps.length) {
      // load startPoint and startTime from
      const path = store.state.editor.maps[store.state.editor.activeMapIndex].geojson
      if (path.features.length) {
        const coords = path.features[path.features.length - 1].geometry.coordinates
        const last = coords[coords.length - 1]
        startPoint = [last[1], last[0]]

        // set start time to be 8am on the following day from last point.
        const lastTime = path.features[path.features.length - 1].properties.endTime
        if (lastTime) {
          const lastTimeL = $moment(lastTime, 'YYYY-MM-DD h:mm A')
          const nextMorning = lastTimeL.add(1, 'days').hours(8).startOf('hour')
          startTime = nextMorning.format('YYYY-MM-DD h:mm A')
        }
      }
    }
    return { startPoint, startTime }
  },
  data () {
    return {
      newMapName: '',
      startPoint: [],
      startTime: null,
      endPoint: [],
      endTime: null,
      newSegment: [],
      segmentDistance: 0,
      navType: 1
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
    },
    mapboxToken () {
      return this.$store.state.mapbox.accessToken
    }
  },
  async mounted () {
    await this.$nextTick()
    const mymap = this.$refs.myMap.mapObject

    if (this.mapboxToken) {
      this.$L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: this.mapboxToken
      }).addTo(mymap)
    } else {
      this.$L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(mymap)
    }

    if (this.geojson.features.length) {
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
        user: this.$store.state.user.user_id,
        adv: advId,
        name: this.newMapName
      }
      const response = await this.$axios.$post('/maps/', newMap)
      this.$store.commit('editor/addMap', response)

      // clear name field
      this.newMapName = ''
      // set start time to be 8am on the day after last endTime
      let myTempTime = null

      // get last timestamp from previous map in store
      if (this.$store.state.editor.maps.length > 1) {
        const previousMap = this.$store.state.editor.maps[this.$store.state.editor.maps.length - 2]

        if (previousMap.geojson.features.length) {
          const lastTime = previousMap.geojson.features[previousMap.geojson.features.length - 1].properties.endTime
          const tmp = this.$moment(lastTime, 'YYYY-MM-DD h:mm A').startOf('day').add(1, 'days').hours(8).startOf('hour')
          myTempTime = tmp.format('YYYY-MM-DD h:mm A')
        }
      }
      this.startTime = myTempTime
      this.endTime = null

      this.$refs.newSegmentLayer.mapObject.clearLayers()
      this.$refs.endLayer.mapObject.clearLayers()
      this.segmentDistance = 0
    },
    async deleteMap (mapId, delIndex) {
      await this.$axios.$delete('/maps/' + mapId)
      // if deleting currently selected
      if (this.$store.state.editor.activeMapIndex === delIndex) {
        this.$refs.startLayer.mapObject.clearLayers()
        // unset startTime, endtime
        this.startPoint = []
        this.startTime = null
        this.endPoint = []
        this.endTime = null
        this.segmentDistance = 0
        // TODO: set start
      }
      this.$store.commit('editor/removeMap', delIndex)
    },
    async setActiveMap (n) {
      if (n !== this.$store.state.editor.activeMapIndex) {
        this.$store.commit('editor/setActiveMap', n)

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
        waypoints: this.newSegment
      }

      const response = await this.$axios.$post('/segments/' + mapId, newSegment)
      this.$store.commit('editor/addSegment', response)
      // clear layers...
      this.$refs.startLayer.mapObject.clearLayers()
      this.$refs.endLayer.mapObject.clearLayers()
      this.$refs.newSegmentLayer.mapObject.clearLayers()
      // unset endSegment
      this.startPoint = this.endPoint
      this.endPoint = []
      this.segmentDistance = 0
      this.newSegment = []
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
    async mapClick (event) {
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
          this.endPoint = [event.latlng.lat, event.latlng.lng]
          // clear previous
          const layer = this.$refs.endLayer.mapObject
          const segmentLayer = this.$refs.newSegmentLayer.mapObject
          layer.clearLayers()
          segmentLayer.clearLayers()

          // TODO: get segment depending on nav navType
          let segment = []
          if (this.navType === 1) {
            segment = [this.startPoint, this.endPoint]
          } else if (this.navType === 2) {
            const s1lat = this.startPoint[1]
            const s1lng = this.startPoint[0]
            const s2lat = this.endPoint[1]
            const s2lng = this.endPoint[0]
            const waypoints = s1lat.toString() + ',' + s1lng.toString() + ';' + s2lat.toString() + ',' + s2lng.toString()

            const mburl = 'https://api.mapbox.com/directions/v5/mapbox/cycling/' + waypoints + '?access_token=' + this.$store.state.mapbox.accessToken
            const response = await this.$axios.get(mburl)

            const encodedPolyline = response.data.routes[0].geometry
            segment = polyline.decode(encodedPolyline)
            // add first and last waypoints
            segment.splice(0, 0, this.startPoint)
            segment.push(this.endPoint)
          } else if (this.navType === 3) {
            const s1lat = this.startPoint[1]
            const s1lng = this.startPoint[0]
            const s2lat = this.endPoint[1]
            const s2lng = this.endPoint[0]
            const waypoints = s1lat.toString() + ',' + s1lng.toString() + ';' + s2lat.toString() + ',' + s2lng.toString()

            const mburl = 'https://api.mapbox.com/directions/v5/mapbox/driving/' + waypoints + '?access_token=' + this.$store.state.mapbox.accessToken
            const response = await this.$axios.get(mburl)

            const encodedPolyline = response.data.routes[0].geometry
            segment = polyline.decode(encodedPolyline)
            // add first and last waypoints
            segment.splice(0, 0, this.startPoint)
            segment.push(this.endPoint)
          }

          this.$L.polyline(segment).addTo(segmentLayer)
          this.$L.circle(this.endPoint, { radius: 100, color: 'red' }).addTo(layer)
          this.newSegment = segment

          // if endTime is not yet set, set it to 8pm on the same day as startTime
          if (!this.endTime) {
            if (this.startTime) {
              const st = this.$moment(this.startTime, 'YYYY-MM-DD h:mm A')
              const newEndTime = st.startOf('day').add(0, 'days').hours(20).startOf('hour')
              this.endTime = newEndTime.format('YYYY-MM-DD h:mm A')
            }
          }

          //  TODO : FIX THIS::: calculate distance of segment
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
